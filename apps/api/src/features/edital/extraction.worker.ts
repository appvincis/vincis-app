import { boss } from '../../lib/queue.service.js';
import { prisma } from '../../lib/prisma.js';
import { 
    locateSyllabusPages, 
    generateObjectWithFallback, 
    extractPages, 
    smartExtractSyllabusChunk,
    filterDisciplinesByCargoWithAi
} from './edital.controller.js';
import { z } from 'zod';
import { segmentByDiscipline, SyllabusSegment } from './edital.segmenter.js';

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
        console.log(`[Worker] Iniciando processamento do Edital #${editalId} para o usuário #${userId}`);

        try {
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

            // ── OBTENÇÃO DOS SEGMENTOS ───────────────────────────────────────────
            let segments: SyllabusSegment[] = [];

            let candidateSyllabusChunk = '';

            // 1. Usuário forneceu pageRange manualmente → mais preciso
            if (edital.pageRange && /^\d+-\d+$/.test(edital.pageRange)) {
                const [startStr, endStr] = edital.pageRange.split('-');
                candidateSyllabusChunk = extractPages(parsedContent, parseInt(startStr), parseInt(endStr));
                console.log(`[Worker] Usando pageRange manual: ${edital.pageRange}`);
            }

            // 2. Tentar localização por IA como 2º recurso (com ou sem cargo)
            if (!candidateSyllabusChunk) {
                try {
                    console.log(`[Worker] Tentando localização por IA (cargo: ${cargo || 'Nenhum'})...`);
                    const pages = await locateSyllabusPages(parsedContent, cargo || undefined);
                    
                    let generalStart = pages.geral.startPage;
                    let generalEnd = pages.geral.endPage;
                    let especificoStart = pages.especifico.startPage;
                    let especificoEnd = pages.especifico.endPage;

                    // Fallback mútuo inteligente: se a IA não localizou a página do conteúdo básico/comum,
                    // mas sabe onde começam as específicas, assume que as comuns estão nas páginas anteriores.
                    if (!generalStart && especificoStart && especificoStart > 1) {
                        generalStart = Math.max(1, especificoStart - 12);
                        generalEnd = especificoStart - 1;
                        console.log(`[Worker] Comuns não localizadas. Usando fallback de páginas anteriores: ${generalStart}-${generalEnd}`);
                    }

                    // Se a IA não localizou as específicas, mas localizou as comuns, assume que as específicas vêm logo depois.
                    if (!especificoStart && generalEnd) {
                        especificoStart = generalEnd + 1;
                        especificoEnd = especificoStart + 15;
                        console.log(`[Worker] Específicas não localizadas. Usando fallback de páginas seguintes: ${especificoStart}-${especificoEnd}`);
                    }

                    let generalChunk = '';
                    let specificChunk = '';

                    if (generalStart && generalEnd) {
                        generalChunk = extractPages(parsedContent, generalStart, generalEnd);
                    }
                    if (especificoStart && especificoEnd) {
                        specificChunk = extractPages(parsedContent, especificoStart, especificoEnd);
                    }

                    if (generalChunk || specificChunk) {
                        candidateSyllabusChunk = [
                            generalChunk ? `--- SEÇÃO CONHECIMENTOS BÁSICOS/GERAIS ---\n${generalChunk}` : '',
                            specificChunk ? `--- SEÇÃO CONHECIMENTOS ESPECÍFICOS (${cargo}) ---\n${specificChunk}` : ''
                        ].filter(Boolean).join('\n\n');
                    }
                } catch (err) {
                    console.error('[Worker] Falha na localização por IA, usando heurística:', err);
                }
            }

            // 3. Fallback: heurística inteligente de texto puro (smartExtractSyllabusChunk)
            if (!candidateSyllabusChunk) {
                console.log('[Worker] Usando heurística smartExtractSyllabusChunk...');
                candidateSyllabusChunk = smartExtractSyllabusChunk(parsedContent);
            }

            // ── SALVAR CACHE E SEGMENTAR ──────────────────────────────────────
            if (candidateSyllabusChunk) {
                segments = segmentByDiscipline(candidateSyllabusChunk, cargo);
                console.log(`[Worker] Segmentação gerou ${segments.length} disciplinas.`);

                try {
                    await prisma.edital.update({
                        where: { id: editalId },
                        data: {
                            syllabusChunk: candidateSyllabusChunk,
                            syllabusChunkCargo: cargoKey,
                            syllabusSegments: segments as any
                        }
                    });
                    console.log(`[Worker] syllabusChunk e syllabusSegments salvos no banco para uso futuro.`);
                } catch (cacheErr) {
                    console.warn('[Worker] Não foi possível salvar caches no banco:', cacheErr);
                }
            }

            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionError: 'Iniciando extração estrutural da grade...'
                }
            });

            // Se o cargo foi informado, realizar a filtragem por IA para extrair apenas as disciplinas básicas/comuns e as específicas deste cargo
            if (cargo) {
                try {
                    console.log(`[Worker] Filtrando disciplinas para o cargo "${cargo}" usando IA...`);
                    await prisma.edital.update({
                        where: { id: editalId },
                        data: { extractionError: `Filtrando matérias do cargo: ${cargo}...` }
                    });

                    const disciplineNames = segments.map(s => s.name);
                    const classifications = await filterDisciplinesByCargoWithAi(disciplineNames, cargo);

                    const beforeCount = segments.length;
                    segments = segments.filter(seg => {
                        const classification = classifications.find(c => c.name === seg.name);
                        // Mantém se for COMMON ou SPECIFIC, ou se a IA não classificou (fallback seguro)
                        return classification ? (classification.category === 'COMMON' || classification.category === 'SPECIFIC') : true;
                    });
                    console.log(`[Worker] Filtragem por cargo concluída. Reduzido de ${beforeCount} para ${segments.length} disciplinas.`);
                } catch (filterErr) {
                    console.error('[Worker] Erro ao aplicar filtro de cargo via IA:', filterErr);
                }
            }

            if (segments.length === 0) {
                throw new Error('Nenhuma disciplina/segmento relevante pôde ser detectado para o cargo selecionado.');
            }

            const updateExtractionStatus = async (message: string) => {
                try {
                    await prisma.edital.update({
                        where: { id: editalId },
                        data: { extractionError: message }
                    });
                } catch (dbErr) {
                    // ignore
                }
            };

            let completedCount = 0;
            const totalCount = segments.length;

            // Processamento sequencial dos segmentos para respeitar quotas e evitar erros 429 (Rate Limits)
            const extractedDisciplines = [];
            for (const seg of segments) {
                // Checar se a extração foi cancelada pelo usuário durante a execução
                const checkEdital = await prisma.edital.findUnique({
                    where: { id: editalId },
                    select: { extractionStatus: true }
                });
                if (!checkEdital || checkEdital.extractionStatus !== 'PROCESSING') {
                    console.log(`[Worker] Extração do Edital #${editalId} foi interrompida ou cancelada no banco. Abortando processamento.`);
                    return;
                }

                // Extração via IA para garantir máxima qualidade dos tópicos de estudo
                console.log(`[Worker] Iniciando extração via IA para a disciplina: ${seg.name}...`);
                await updateExtractionStatus(`[${completedCount + 1}/${totalCount}] Extraindo: ${seg.name}...`);

                try {
                    // Pequena pausa (1.2s) para não sobrecarregar requisições por minuto (RPM) das cotas gratuitas
                    await new Promise(resolve => setTimeout(resolve, 1200));

                    const response = await generateObjectWithFallback({
                        schema: z.object({
                            topics: z.array(z.string().describe('Tópico/assunto de estudo extraído idêntico ao texto do edital, corrigindo apenas a caixa das letras.'))
                        }),
                        prompt: `Você é um estruturador de editais de concursos públicos.\n` +
                                `Sua tarefa é ler a ementa/conteúdo programático da disciplina "${seg.name}" e extrair a lista de tópicos exatamente como constam no texto original do edital.\n\n` +
                                `REGRAS OBRIGATÓRIAS:\n` +
                                `1. **Fidelidade ao Texto:** Mantenha os tópicos IDENTICOS ao texto do edital. Não resuma, não divida em múltiplos itens, não simplifique, não parafraseie, não remova e não adicione palavras. O conteúdo e redação originais do edital de cada tópico devem ser preservados integralmente.\n` +
                                `2. **Correção de Caixa (Maiúsculas/Minúsculas):** Ajuste apenas a capitalização das letras para torná-las legíveis. Textos inteiros em maiúsculas (ALL CAPS) devem ser convertidos para Capitalização de Sentença (apenas a primeira letra da frase e nomes próprios em maiúsculas).\n` +
                                `3. **Idioma:** Responda obrigatoriamente em português brasileiro.\n\n` +
                                `--- EXEMPLO: ---\n` +
                                `Entrada: "1. ORTOGRAFIA OFICIAL. 2. Acentuação gráfica. 3. CRASE; CONCORDÂNCIA VERBAL E NOMINAL."\n` +
                                `Saída esperada no array JSON:\n` +
                                `[\n` +
                                `  "1. Ortografia oficial.",\n` +
                                `  "2. Acentuação gráfica.",\n` +
                                `  "3. Crase; concordância verbal e nominal."\n` +
                                `]\n\n` +
                                `--- CONTEÚDO PROGRAMÁTICO DE ${seg.name.toUpperCase()} (TEXTO BRUTO) ---\n` +
                                seg.rawText,
                        temperature: 0.1,
                        maxTokens: 1000
                    }) as any;

                    const extractedObj = response.object;
                    completedCount++;
                    await updateExtractionStatus(`[${completedCount}/${totalCount}] Extraindo: ${seg.name}...`);
                    extractedDisciplines.push({
                        name: seg.name,
                        topics: extractedObj.topics || []
                    });
                } catch (aiErr) {
                    console.error(`[Worker] Falha ao extrair via IA para "${seg.name}":`, aiErr);
                    completedCount++;
                    await updateExtractionStatus(`[${completedCount}/${totalCount}] Extraindo: ${seg.name}...`);
                    extractedDisciplines.push({
                        name: seg.name,
                        topics: []
                    });
                }
            }

            // Filtra disciplinas que acabaram vindo vazias por qualquer erro extremo
            const disciplinesToSave = extractedDisciplines.filter(d => d.topics.length > 0);
            if (disciplinesToSave.length === 0) {
                throw new Error('Nenhuma disciplina com tópicos pôde ser extraída do texto do edital.');
            }

            const extracted = {
                disciplines: disciplinesToSave
            };

            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionError: 'Salvando disciplinas no banco...'
                }
            });

            const presetColors = [
                '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
                '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#735c00'
            ];

            let disciplinesCreatedCount = 0;
            let topicsCreatedCount = 0;

            // G8 fix: substitui o loop N+1 por 2 queries em batch
            await prisma.$transaction(async (tx) => {
                // 1ª query: cria todas as disciplinas de uma vez e retorna os IDs
                const createdDisciplines = await (tx.discipline as any).createManyAndReturn({
                    data: extracted.disciplines.map((disc: any, i: number) => ({
                        name: disc.name,
                        color: presetColors[i % presetColors.length],
                        weight: 1.0,
                        studyPlanId
                    }))
                });
                disciplinesCreatedCount = createdDisciplines.length;

                // 2ª query: monta todos os tópicos em memória e insere em um único createMany
                const allTopicsData: any[] = [];
                for (let i = 0; i < extracted.disciplines.length; i++) {
                    const discData = extracted.disciplines[i];
                    const discipline = createdDisciplines[i];
                    if (!discipline || !discData.topics || discData.topics.length === 0) continue;

                    for (const t of discData.topics) {
                        allTopicsData.push({
                            name: typeof t === 'string' ? t : (t.name ?? String(t)),
                            description: null,
                            disciplineId: discipline.id,
                            isCompleted: false
                        });
                    }
                }

                if (allTopicsData.length > 0) {
                    await tx.topic.createMany({ data: allTopicsData });
                    topicsCreatedCount = allTopicsData.length;
                }
            });

            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionStatus: 'SUCCESS',
                    extractionError: null,
                    disciplinesCreated: disciplinesCreatedCount,
                    topicsCreated: topicsCreatedCount
                }
            });

            console.log(`[Worker] Edital #${editalId} processado com sucesso.`);
        } catch (bgError: any) {
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
