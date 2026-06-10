import { boss } from '../../lib/queue.service.js';
import { prisma } from '../../lib/prisma.js';
import { 
    locateSyllabusPages, 
    streamObjectWithFallback, 
    extractPages, 
    extractSyllabusText 
} from './edital.controller.js';
import { z } from 'zod';

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
    boss.work('edital-extraction', { teamSize: 2 } as any, async (job: any) => {
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

            // Extrair páginas específicas se indicadas pelo usuário, ou usar heurística inteligente
            let candidateSyllabusChunk = '';
            if (edital.pageRange && /^\d+-\d+$/.test(edital.pageRange)) {
                const [startStr, endStr] = edital.pageRange.split('-');
                const startPage = parseInt(startStr);
                const endPage = parseInt(endStr);
                candidateSyllabusChunk = extractPages(parsedContent, startPage, endPage);
            } else if (cargo) {
                try {
                    console.log(`[Worker] Mapeando páginas para o cargo: ${cargo}`);
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
                    console.error('[Worker] Falha ao mapear páginas por cargo:', err);
                }
            }

            if (!candidateSyllabusChunk) {
                console.log('[Worker] Usando método tradicional de janela de texto...');
                candidateSyllabusChunk = extractSyllabusText(parsedContent);
            }

            await prisma.edital.update({
                where: { id: editalId },
                data: {
                    extractionError: 'Iniciando extração da grade...'
                }
            });
            
            let targetJobPrompt = '';
            if (cargo) {
                targetJobPrompt = `Você deve focar na extração das disciplinas pertinentes ao cargo "${cargo}". Extraia tanto as disciplinas de Conhecimentos Básicos/Gerais (comuns a todos os cargos) quanto as disciplinas de Conhecimentos Específicos exclusivas para o cargo "${cargo}". Ignore disciplinas de conhecimentos específicos destinadas a outros cargos.`;
            } else {
                targetJobPrompt = `Extraia todas as disciplinas e conteúdos programáticos gerais e específicos encontrados.`;
            }

            const response = (await streamObjectWithFallback({
                schema: z.object({
                    disciplines: z.array(z.object({
                        name: z.string().describe('Nome da disciplina, ex: Língua Portuguesa'),
                        topics: z.array(z.object({
                            name: z.string().describe('Nome curto do tópico/assunto'),
                            description: z.string().optional().describe('Descrição curta do tópico')
                        }))
                    }))
                }),
                prompt: `Analise o texto recortado do edital abaixo e extraia o conteúdo programático estruturado.\n\n` +
                        `CRITÉRIOS RIGOROSOS DE EXTRAÇÃO:\n` +
                        `1. Ignore regras de provas, inscrições, datas, taxas, atribuições de cargo, etc. Foque EXCLUSIVAMENTE nas disciplinas/matérias de estudo e seus respectivos tópicos/assuntos.\n` +
                        `2. ${targetJobPrompt}\n` +
                        `3. Separe todas as disciplinas encontradas (ex: Língua Portuguesa, Informática, Direito Constitucional, etc).\n` +
                        `4. DENTRO DE CADA DISCIPLINA: quebre blocos longos de texto em tópicos individuais curtos e objetivos (ex: "Crase", "Acentuação").\n` +
                        `5. Use o idioma português.\n\n` +
                        `--- CONTEÚDO DO EDITAL ---\n` +
                        candidateSyllabusChunk,
                temperature: 0.1,
            })) as any;

            let lastLoggedDiscipline = '';
            let lastUpdateTime = 0;

            for await (const partial of response.partialObjectStream) {
                const disciplines = partial.disciplines;
                if (disciplines && disciplines.length > 0) {
                    const lastDiscipline = disciplines[disciplines.length - 1];
                    if (lastDiscipline && lastDiscipline.name) {
                        const name = lastDiscipline.name;
                        const now = Date.now();
                        if (name !== lastLoggedDiscipline || now - lastUpdateTime > 1500) {
                            lastLoggedDiscipline = name;
                            lastUpdateTime = now;
                            try {
                                await prisma.edital.update({
                                    where: { id: editalId },
                                    data: {
                                        extractionError: `Extraindo: ${name}...`
                                    }
                                });
                            } catch (dbErr) {
                                // ignore
                            }
                        }
                    }
                }
            }

            const extracted = await response.object;
            if (!extracted.disciplines || extracted.disciplines.length === 0) {
                throw new Error('Nenhuma disciplina pôde ser extraída do texto do edital.');
            }

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

            await prisma.$transaction(async (tx) => {
                for (let i = 0; i < extracted.disciplines.length; i++) {
                    const discData = extracted.disciplines[i];
                    const color = presetColors[i % presetColors.length];

                    const discipline = await tx.discipline.create({
                        data: {
                            name: discData.name,
                            color,
                            weight: 1.0,
                            studyPlanId
                        }
                    });
                    disciplinesCreatedCount++;

                    if (discData.topics && discData.topics.length > 0) {
                        await tx.topic.createMany({
                            data: discData.topics.map((t: any) => ({
                                name: t.name,
                                description: t.description || null,
                                disciplineId: discipline.id,
                                isCompleted: false
                            }))
                        });
                        topicsCreatedCount += discData.topics.length;
                    }
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
