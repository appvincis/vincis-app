import { boss } from '../../lib/queue.service.js';
import { prisma } from '../../lib/prisma.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import {
    extractNativePDFWithGemini,
    smartExtractSyllabusChunk,
    locateSyllabusPages,
    extractPages
} from './edital.controller.js';
import { z } from 'zod';
import { validateExtractedTopics } from './extraction.validator.js';

export interface ExtractionJobPayload {
    editalId: number;
    userId: number;
    studyPlanId: number;
    cargo?: string | null;
}

export function registerExtractionWorker() {
    console.log('[Worker] Registrando worker de extração de edital...');

    // Inscrever-se na fila com concorrência máxima de 2 jobs por instância do worker
    // Isso evita esgotar limites de cota de IA (Gemini/OpenRouter) e CPU do servidor
    boss.work('edital-extraction', { teamSize: 2 } as any, async ([job]: any) => {
        const { editalId, userId, studyPlanId, cargo } = job.data as ExtractionJobPayload;
        const perfPrefix = `[Worker-Perf] Edital #${editalId}`;
        console.time(`${perfPrefix} - Total`);
        console.log(`[Worker] Iniciando processamento do Edital #${editalId} para o usuário #${userId}`);

        try {
            console.time(`${perfPrefix} - DB Fetch & Status Update`);
            const edital = await prisma.edital.findFirst({ where: { id: editalId, userId } });
            if (!edital || !edital.parsedContent) {
                throw new Error('Edital ou conteúdo textual não encontrado no banco.');
            }

            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionStatus: 'PROCESSING',
                    extractionError: 'Analisando o edital...'
                }
            });

            const parsedContent = edital.parsedContent;
            const cargoKey = cargo ?? null;

            await prisma.edital.update({
                where: { id: editalId },
                data: { extractionError: 'Baixando PDF do armazenamento...' }
            });

            // Não precisamos mais baixar o PDF nativo do Supabase!
            // O Tutor IA provou que enviar o parsedContent (texto extraído) direto pro Gemini
            // é muito mais rápido, barato e extremamente preciso.
            
            await prisma.edital.update({
                where: { id: editalId },
                data: { extractionError: 'Lendo Edital com Inteligência Artificial (Gemini)...' }
            });

            // 2. Extração em Tiro Único com o texto
            const prompt = `Você é um Extrator de Editais Profissional. O texto abaixo é o conteúdo completo de um Edital de Concurso.
Seu objetivo é ler o edital inteiro e extrair rigorosamente TODOS OS TÓPICOS do CONTEÚDO PROGRAMÁTICO (Matérias que caem na prova).

CRITÉRIOS OBRIGATÓRIOS:
1. FOCO NO CARGO: ${cargo || 'Extraia tudo o que for geral se o cargo não for especificado.'}
2. Identifique quais são as Disciplinas/Matérias (ex: Língua Portuguesa, Direito Constitucional).
3. ORDEM E SEQUÊNCIA: Extraia os tópicos na exata ordem em que aparecem no texto, para não quebrar a lógica de estudo do candidato.
4. PRESERVAR CONTEXTO: Agrupe tópicos que possuam o mesmo contexto. NÃO fragmente ou pique conceitos compostos de forma excessiva.
5. FIDELIDADE ABSOLUTA (ZERO ALUCINAÇÃO): Você está PROIBIDO de inventar palavras, adicionar textos ou presumir tópicos. Mantenha as frases, a nomenclatura e os agrupamentos EXATAMENTE como estão escritos no edital.
6. FORMATAÇÃO CLARA: Corrija quebras de linha acidentais, elimine caracteres estranhos e mantenha a primeira letra de cada tópico em maiúscula.
7. Se não houver Conteúdo Programático explícito, retorne um array vazio de disciplinas.`;

            const extractionSchema = z.object({
                disciplines: z.array(z.object({
                    nome: z.string().describe("Nome da Disciplina (Ex: Língua Portuguesa)"),
                    topicos: z.array(z.string()).describe("Lista de tópicos individuais cobrados")
                }))
            });

            let extractedDisciplines: { nome: string; topicos: string[] }[] = [];

            try {
                console.timeEnd(`${perfPrefix} - DB Fetch & Status Update`);
                
                // Pré-filtro inteligente: Usar a IA para ler o sumário e achar as páginas exatas
                console.time(`${perfPrefix} - Locating Syllabus Pages`);
                const pages = await locateSyllabusPages(parsedContent, cargoKey || undefined);
                
                let minStartPage = 99999;
                let maxEndPage = -1;
                
                if (pages.geral && pages.geral.startPage !== null && pages.geral.endPage !== null) {
                    minStartPage = Math.min(minStartPage, pages.geral.startPage);
                    maxEndPage = Math.max(maxEndPage, pages.geral.endPage);
                }
                
                if (pages.especifico && pages.especifico.startPage !== null && pages.especifico.endPage !== null) {
                    minStartPage = Math.min(minStartPage, pages.especifico.startPage);
                    maxEndPage = Math.max(maxEndPage, pages.especifico.endPage);
                }
                
                let finalContent = parsedContent;
                if (minStartPage !== 99999 && maxEndPage !== -1) {
                    // Margem de segurança de 1 página antes e depois para evitar cortes bruscos
                    const safeStart = Math.max(1, minStartPage - 1);
                    const safeEnd = maxEndPage + 1;
                    
                    const extracted = extractPages(parsedContent, safeStart, safeEnd);
                    if (extracted && extracted.length > 500) {
                        finalContent = extracted;
                        console.log(`[Worker] Pre-filtro de páginas aplicado: páginas ${safeStart} a ${safeEnd} (Tamanho: ${extracted.length} chars)`);
                    } else {
                        console.log(`[Worker] Pre-filtro extraiu pouco texto (${extracted?.length || 0} chars), fazendo fallback para o edital inteiro.`);
                    }
                } else {
                    console.log(`[Worker] Pre-filtro não encontrou mapeamento de páginas no sumário, fazendo fallback para o edital inteiro.`);
                }
                console.timeEnd(`${perfPrefix} - Locating Syllabus Pages`);

                console.time(`${perfPrefix} - AI API Call (Gemini)`);
                const response = await extractNativePDFWithGemini({
                    parsedContent: finalContent,
                    prompt,
                    schema: extractionSchema,
                    timeoutMs: 300000 // 5 Minutos de limite
                }) as any;

                extractedDisciplines = response.object?.disciplines || [];
                console.timeEnd(`${perfPrefix} - AI API Call (Gemini)`);
            } catch (err: any) {
                console.error('[Worker] Erro no Gemini Native PDF:', err.message);
                throw new Error(`Falha na extração nativa de PDF: ${err.message}`);
            }

            if (extractedDisciplines.length === 0) {
                throw new Error('A IA leu o PDF mas não encontrou nenhuma matéria ou conteúdo programático para este cargo.');
            }

            // Função auxiliar de normalização de caixa (Sentence Case para All Caps)
            const normalizeCasing = (text: string): string => {
                const trimmed = text.trim();
                if (!trimmed) return trimmed;
                if (trimmed === trimmed.toUpperCase() && trimmed.length > 5) {
                    const numberPrefixMatch = trimmed.match(/^((?:\\d+|[IVXLCivxlc]+)[\\.\\-\\]]\\s*)(.*)$/);
                    if (numberPrefixMatch) {
                        const prefix = numberPrefixMatch[1];
                        const content = numberPrefixMatch[2];
                        if (content) {
                            return prefix + content.charAt(0).toUpperCase() + content.slice(1).toLowerCase();
                        }
                    }
                    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
                }
                return trimmed;
            };

            // Passar pelo validador fuzzy para remover lixo alucinado
            console.time(`${perfPrefix} - Validation`);
            const validatedDisciplines: { name: string; topics: string[] }[] = [];
            for (const disc of extractedDisciplines as any[]) {
                if (!disc.topicos) continue;
                const normalized = disc.topicos.map((t: string) => normalizeCasing(t));
                const validation = validateExtractedTopics(normalized, disc.topicos.join(' '), disc.nome || '');

                if (validation.dropped.length > 0) {
                    console.warn(`[Worker] Tópicos descartados pelo validador para "${disc.nome}":`, validation.dropped);
                }

                if (validation.valid.length > 0) {
                    validatedDisciplines.push({
                        name: normalizeCasing(disc.nome || 'Sem Nome'),
                        topics: validation.valid
                    });
                }
            }

            const disciplinesToSave = validatedDisciplines;
            if (disciplinesToSave.length === 0) {
                throw new Error('Nenhuma disciplina com tópicos sobreviveu à validação (possível texto alucinado).');
            }

            const extracted = {
                disciplines: disciplinesToSave
            };
            console.timeEnd(`${perfPrefix} - Validation`);

            console.time(`${perfPrefix} - DB Save`);

            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionError: 'Salvando rascunho de extração...'
                }
            });

            const disciplinesCreatedCount = extracted.disciplines.length;
            const topicsCreatedCount = extracted.disciplines.reduce((acc, d) => acc + (d.topics?.length || 0), 0);

            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionStatus: 'READY_FOR_REVIEW',
                    extractionError: null,
                    disciplinesCreated: disciplinesCreatedCount,
                    topicsCreated: topicsCreatedCount,
                    syllabusSegments: extracted.disciplines as any,
                    studyPlanId: studyPlanId,
                    cargo: cargo || null
                }
            });

            console.log(`[Worker] Edital #${editalId} processado com sucesso.`);
            console.timeEnd(`${perfPrefix} - DB Save`);
            console.timeEnd(`${perfPrefix} - Total`);
        } catch (bgError: any) {
            console.timeEnd(`${perfPrefix} - Total`);
            console.error('[Worker] Erro no processamento de extração:', bgError);
            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionStatus: 'FAILED',
                    extractionError: bgError.message || 'Erro desconhecido durante o processamento com IA.'
                }
            });
            throw bgError;
        }
    });
}
