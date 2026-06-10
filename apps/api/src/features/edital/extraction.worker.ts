import { boss } from '../../lib/queue.service.js';
import { prisma } from '../../lib/prisma.js';
import { 
    locateSyllabusPages, 
    streamObjectWithFallback, 
    extractPages, 
    smartExtractSyllabusChunk
} from './edital.controller.js';
import { z } from 'zod';
import { segmentByDiscipline, tryParseTopics, SyllabusSegment } from './edital.segmenter.js';

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

            if (edital.syllabusSegments && Array.isArray(edital.syllabusSegments) && edital.syllabusSegments.length > 0) {
                segments = edital.syllabusSegments as any[];
                console.log(`[Worker] Cache hit! Usando ${segments.length} syllabusSegments salvos.`);
            } else {
                console.log(`[Worker] Cache miss para syllabusSegments. Iniciando localização e segmentação...`);
                let candidateSyllabusChunk = '';

                // 1. Usuário forneceu pageRange manualmente → mais preciso
                if (edital.pageRange && /^\d+-\d+$/.test(edital.pageRange)) {
                    const [startStr, endStr] = edital.pageRange.split('-');
                    candidateSyllabusChunk = extractPages(parsedContent, parseInt(startStr), parseInt(endStr));
                    console.log(`[Worker] Usando pageRange manual: ${edital.pageRange}`);
                }

                // 2. Cargo informado → tentar localização por IA como 2º recurso
                if (!candidateSyllabusChunk && cargo) {
                    try {
                        console.log(`[Worker] Tentando localização por IA para o cargo: ${cargo}`);
                        const pages = await locateSyllabusPages(parsedContent, cargo);
                        let generalChunk = '';
                        let specificChunk = '';

                        if (pages.geral.startPage && pages.geral.endPage) {
                            generalChunk = extractPages(parsedContent, pages.geral.startPage, pages.geral.endPage);
                        }
                        if (pages.especifico.startPage && pages.especifico.endPage) {
                            specificChunk = extractPages(parsedContent, pages.especifico.startPage, pages.especifico.endPage);
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
            }

            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionError: 'Iniciando extração estrutural da grade...'
                }
            });

            if (segments.length === 0) {
                throw new Error('Nenhuma disciplina/segmento pôde ser detectado no conteúdo programático.');
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

            // Processamento em paralelo dos segmentos para extrair os tópicos (regex + fallback IA)
            const extractedDisciplines = await Promise.all(
                segments.map(async (seg) => {
                    // 1. Tentar parsear via Regex (gratuito, instantâneo)
                    const parsedTopics = tryParseTopics(seg.rawText);
                    if (parsedTopics && parsedTopics.length > 0) {
                        console.log(`[Worker] Disciplina "${seg.name}" extraída via Regex. Encontrados ${parsedTopics.length} tópicos.`);
                        return {
                            name: seg.name,
                            topics: parsedTopics
                        };
                    }

                    // 2. Fallback para IA se não for uma lista numerada/separada simples
                    console.log(`[Worker] Disciplina "${seg.name}" requer IA. Iniciando chamada de extração...`);
                    await updateExtractionStatus(`Extraindo: ${seg.name}...`);

                    try {
                        const response = await streamObjectWithFallback({
                            schema: z.object({
                                topics: z.array(z.string().describe('Nome curto e objetivo do tópico/assunto (máx 10 palavras)'))
                            }),
                            prompt: `Analise a ementa/conteúdo programático da disciplina "${seg.name}" do edital e retorne seus tópicos de estudo estruturados.\n\n` +
                                    `REGRAS OBRIGATÓRIAS:\n` +
                                    `1. Extraia APENAS tópicos de estudo e conteúdos programáticos reais. Ignore datas, pesos de prova ou outros textos administrativos.\n` +
                                    `2. Retorne os tópicos de forma curta e direta (máximo 10 palavras por tópico).\n` +
                                    `3. Responda em português.\n\n` +
                                    `--- CONTEÚDO PROGRAMÁTICO DE ${seg.name.toUpperCase()} ---\n` +
                                    seg.rawText,
                            temperature: 0.1,
                            maxTokens: 1000
                        }) as any;

                        const extractedObj = await response.object;
                        return {
                            name: seg.name,
                            topics: extractedObj.topics || []
                        };
                    } catch (aiErr) {
                        console.error(`[Worker] Falha ao extrair via IA para "${seg.name}":`, aiErr);
                        return {
                            name: seg.name,
                            topics: []
                        };
                    }
                })
            );

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
