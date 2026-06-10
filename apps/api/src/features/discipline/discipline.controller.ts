import { disciplineService } from "./discipline.service.js";
import { Request, Response } from "express";
import { CreateDisciplineInput, UpdateDisciplineInput } from "./discipline.schema.js";
import { StudyPlanInjectedRequest } from "../study-plan/study-plan.middleware.js";
import { generateObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { prisma } from "../../lib/prisma.js";

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || ''
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

const getAiModels = () => {
    const models = [];
    if (process.env.OPENROUTER_API_KEY) {
        models.push(openrouter('nvidia/nemotron-3-ultra-550b-a55b:free'));
    }
    if (process.env.GEMINI_API_KEY) {
        models.push(google('gemini-2.5-flash'));
    }
    if (process.env.OPENAI_API_KEY) {
        models.push(openai('gpt-4o-mini'));
    }
    if (process.env.OPENROUTER_API_KEY) {
        models.push(openrouter('google/gemini-2.5-flash'));
    }
    if (models.length === 0) {
        throw new Error('Nenhuma chave de API (OPENROUTER_API_KEY, GEMINI_API_KEY ou OPENAI_API_KEY) configurada.');
    }
    return models;
};

async function generateObjectWithFallback(options: any) {
    const models = getAiModels();
    let lastError: any;
    for (const model of models) {
        try {
            return await generateObject({
                ...options,
                model
            });
        } catch (err) {
            console.warn(`generateObject failed for ${model.modelId || 'model'}, trying next fallback...`, err);
            lastError = err;
        }
    }
    throw lastError || new Error("Todos os modelos falharam na geração estruturada.");
}

const parseId = (raw: string | string[] | undefined) => Number(raw);

export async function createDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const { name, description, color, weight } = req.body as CreateDisciplineInput;
        const studyPlanId = injectedReq.studyPlan!.id;

        const discipline = await disciplineService.createDiscipline({ name, description, color, weight }, studyPlanId);

        return res.status(201).json({
            message: "Disciplina criada com sucesso.",
            discipline
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message || "Erro interno durante a criação da disciplina." });
    }
}

export async function getDisciplines(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const studyPlanId = injectedReq.studyPlan!.id;
        const disciplines = await disciplineService.getDisciplines(studyPlanId);
        return res.status(200).json(disciplines);
    } catch (err: any) {
        return res.status(500).json({ message: "Erro interno ao buscar disciplinas." });
    }
}

export async function getDisciplineById(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });

        const studyPlanId = injectedReq.studyPlan!.id;
        const discipline = await disciplineService.getDisciplineById(id, studyPlanId);
        
        if (!discipline) {
            return res.status(404).json({ message: "Disciplina não encontrada." });
        }
        
        return res.status(200).json(discipline);
    } catch (err: any) {
        return res.status(500).json({ message: "Erro interno." });
    }
}

export async function updateDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });

        const studyPlanId = injectedReq.studyPlan!.id;
        const { name, color, weight, isActive } = req.body as UpdateDisciplineInput & { isActive?: boolean };

        const discipline = await disciplineService.updateDiscipline(id, studyPlanId, { name, color, weight, isActive });
        
        return res.status(200).json({
            message: "Disciplina atualizada com sucesso.",
            discipline
        });
    } catch (err: any) {
        if (err.message.includes("não encontrada")) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: "Erro interno durante a atualização da disciplina." });
    }
}

export async function deleteDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });

        const studyPlanId = injectedReq.studyPlan!.id;

        await disciplineService.deleteDiscipline(id, studyPlanId);
        
        return res.status(204).send();
    } catch (err: any) {
        if (err.message.includes("não encontrada")) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: "Erro interno durante a deleção da disciplina." });
    }
}

export async function generateTopicsForDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        if (injectedReq.dbUser?.plan !== 'PREMIUM') {
            return res.status(403).json({ message: "Recurso exclusivo do plano Premium. Por favor, assine o plano Premium para gerar tópicos por IA." });
        }

        const disciplineId = parseId(req.params.id);
        if (Number.isNaN(disciplineId)) return res.status(400).json({ message: "ID inválido." });

        const studyPlanId = injectedReq.studyPlan!.id;
        const { syllabusText } = req.body;
        if (!syllabusText || !syllabusText.trim()) {
            return res.status(400).json({ message: "O texto do conteúdo programático é obrigatório." });
        }

        // Check if discipline exists and belongs to study plan
        const discipline = await prisma.discipline.findFirst({
            where: { id: disciplineId, studyPlanId }
        });
        if (!discipline) {
            return res.status(404).json({ message: "Disciplina não encontrada." });
        }

        const response = await generateObjectWithFallback({
            schema: z.object({
                topics: z.array(z.object({
                    name: z.string().describe('Nome curto e objetivo do tópico, ex: Crase'),
                    description: z.string().optional().describe('Descrição ou subtópicos')
                }))
            }),
            prompt: `Analise o texto fornecido e extraia uma lista de tópicos/conteúdos programáticos individuais.\n\n` +
                    `REGRAS IMPORTANTES:\n` +
                    `1. Quebre blocos longos de texto em tópicos curtos e objetivos.\n` +
                    `2. Use o idioma português.\n\n` +
                    `--- CONTEÚDO PROGRAMÁTICO ---\n` +
                    syllabusText,
            temperature: 0.1,
        });

        const extracted = response.object as { topics: { name: string; description?: string }[] };
        if (!extracted.topics || extracted.topics.length === 0) {
            return res.status(422).json({ message: "Nenhum tópico pôde ser extraído." });
        }

        let topicsCreated = 0;
        await prisma.$transaction(async (tx) => {
            await tx.topic.createMany({
                data: extracted.topics.map(t => ({
                    name: t.name,
                    description: t.description || null,
                    disciplineId,
                    isCompleted: false
                }))
            });
            topicsCreated = extracted.topics.length;
        });

        return res.status(200).json({
            message: "Tópicos gerados e adicionados com sucesso.",
            topicsCreated,
            tokensSpent: response.usage?.totalTokens || 0
        });

    } catch (err: any) {
        console.error("Erro na geração de tópicos por IA:", err);
        return res.status(500).json({ message: err.message || "Erro interno ao gerar tópicos." });
    }
}

export async function bulkCreateDisciplines(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const studyPlanId = injectedReq.studyPlan!.id;
        const { disciplines } = req.body;

        if (!Array.isArray(disciplines) || disciplines.length === 0) {
            return res.status(400).json({ message: "Formato inválido ou lista vazia." });
        }

        const presetColors = [
            '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
            '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#735c00'
        ];

        let disciplinesCreated = 0;
        let topicsCreated = 0;

        await prisma.$transaction(async (tx) => {
            for (let i = 0; i < disciplines.length; i++) {
                const disc = disciplines[i];
                const color = disc.color || presetColors[i % presetColors.length];

                const createdDisc = await tx.discipline.create({
                    data: {
                        name: disc.name,
                        description: disc.description || null,
                        color,
                        weight: disc.weight ?? 1.0,
                        studyPlanId
                    }
                });
                disciplinesCreated++;

                if (Array.isArray(disc.topics) && disc.topics.length > 0) {
                    await tx.topic.createMany({
                        data: disc.topics.map((t: any) => ({
                            name: typeof t === 'string' ? t : t.name,
                            description: t.description || null,
                            disciplineId: createdDisc.id,
                            isCompleted: false
                        }))
                    });
                    topicsCreated += disc.topics.length;
                }
            }
        });

        return res.status(201).json({
            message: "Importação em lote concluída com sucesso.",
            disciplinesCreated,
            topicsCreated
        });

    } catch (err: any) {
        console.error("Erro na importação em lote:", err);
        return res.status(500).json({ message: err.message || "Erro interno durante a importação em lote." });
    }
}

export async function bulkDeleteDisciplines(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const studyPlanId = injectedReq.studyPlan!.id;
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Formato inválido ou lista vazia." });
        }

        const validIds = ids.map(Number).filter(id => !isNaN(id));
        if (validIds.length === 0) {
            return res.status(400).json({ message: "Nenhum ID válido fornecido." });
        }

        // Delete in transaction
        await prisma.$transaction(async (tx) => {
            // Verify ownership first
            const count = await tx.discipline.count({
                where: {
                    id: { in: validIds },
                    studyPlanId
                }
            });

            if (count !== validIds.length) {
                throw new Error("Uma ou mais disciplinas não foram encontradas ou não pertencem ao plano ativo.");
            }

            await tx.discipline.deleteMany({
                where: {
                    id: { in: validIds },
                    studyPlanId
                }
            });
        });

        return res.status(200).json({ message: `${validIds.length} disciplinas excluídas com sucesso.` });

    } catch (err: any) {
        console.error("Erro na exclusão em lote:", err);
        return res.status(500).json({ message: err.message || "Erro interno durante a exclusão em lote." });
    }
}

export async function bulkWeightUpdateDisciplines(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const studyPlanId = injectedReq.studyPlan!.id;
        const { ids, weight } = req.body;

        if (!Array.isArray(ids) || ids.length === 0 || typeof weight !== 'number') {
            return res.status(400).json({ message: "Formato inválido. 'ids' (array) e 'weight' (number) são obrigatórios." });
        }

        const validIds = ids.map(Number).filter(id => !isNaN(id));
        if (validIds.length === 0) {
            return res.status(400).json({ message: "Nenhum ID válido fornecido." });
        }

        await prisma.$transaction(async (tx) => {
            // Verify ownership
            const count = await tx.discipline.count({
                where: {
                    id: { in: validIds },
                    studyPlanId
                }
            });

            if (count !== validIds.length) {
                throw new Error("Uma ou mais disciplinas não foram encontradas ou não pertencem ao plano ativo.");
            }

        await tx.discipline.updateMany({
                where: {
                    id: { in: validIds },
                    studyPlanId
                },
                data: {
                    weight
                }
            });
        });

        return res.status(200).json({ message: "Pesos atualizados com sucesso." });

    } catch (err: any) {
        console.error("Erro na atualização de pesos em lote:", err);
        return res.status(500).json({ message: err.message || "Erro interno durante a atualização de pesos." });
    }
}

export async function bulkStatusUpdateDisciplines(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const studyPlanId = injectedReq.studyPlan!.id;
        const { ids, isActive } = req.body;

        if (!Array.isArray(ids) || ids.length === 0 || typeof isActive !== 'boolean') {
            return res.status(400).json({ message: "Formato inválido. 'ids' (array) e 'isActive' (boolean) são obrigatórios." });
        }

        const validIds = ids.map(Number).filter(id => !isNaN(id));
        if (validIds.length === 0) {
            return res.status(400).json({ message: "Nenhum ID válido fornecido." });
        }

        await prisma.$transaction(async (tx) => {
            // Verify ownership
            const count = await tx.discipline.count({
                where: {
                    id: { in: validIds },
                    studyPlanId
                }
            });

            if (count !== validIds.length) {
                throw new Error("Uma ou mais disciplinas não foram encontradas ou não pertencem ao plano ativo.");
            }

            await tx.discipline.updateMany({
                where: {
                    id: { in: validIds },
                    studyPlanId
                },
                data: {
                    isActive
                }
            });
        });

        return res.status(200).json({ message: "Status das disciplinas updated com sucesso." });

    } catch (err: any) {
        console.error("Erro na atualização de status em lote:", err);
        return res.status(500).json({ message: err.message || "Erro interno durante a atualização de status." });
    }
}

export async function exportDisciplines(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const userId = injectedReq.dbUser!.id;
        const { sourcePlanId, targetPlanId, disciplineIds } = req.body;

        if (typeof sourcePlanId !== 'number' || typeof targetPlanId !== 'number' || !Array.isArray(disciplineIds) || disciplineIds.length === 0) {
            return res.status(400).json({ message: "Formato inválido. 'sourcePlanId' (number), 'targetPlanId' (number) e 'disciplineIds' (array) são obrigatórios." });
        }

        const validIds = disciplineIds.map(Number).filter(id => !isNaN(id));
        if (validIds.length === 0) {
            return res.status(400).json({ message: "Nenhum ID de disciplina válido fornecido." });
        }

        // Verificar a propriedade de ambos os planos de estudo
        const sourcePlan = await prisma.studyPlan.findFirst({ where: { id: sourcePlanId, userId } });
        const targetPlan = await prisma.studyPlan.findFirst({ where: { id: targetPlanId, userId } });

        if (!sourcePlan || !targetPlan) {
            return res.status(403).json({ message: "Acesso negado a um ou ambos os planos de estudo selecionados." });
        }

        // Buscar disciplinas de origem com seus tópicos
        const disciplines = await prisma.discipline.findMany({
            where: {
                id: { in: validIds },
                studyPlanId: sourcePlanId
            },
            include: {
                topics: true
            }
        });

        if (disciplines.length === 0) {
            return res.status(404).json({ message: "Nenhuma disciplina correspondente encontrada no plano de origem." });
        }

        let disciplinesCreated = 0;
        let topicsCreated = 0;

        await prisma.$transaction(async (tx) => {
            for (const disc of disciplines) {
                const newDisc = await tx.discipline.create({
                    data: {
                        name: disc.name,
                        description: disc.description,
                        color: disc.color,
                        weight: disc.weight,
                        isActive: disc.isActive,
                        studyPlanId: targetPlanId
                    }
                });
                disciplinesCreated++;

                if (disc.topics && disc.topics.length > 0) {
                    await tx.topic.createMany({
                        data: disc.topics.map(t => ({
                            name: t.name,
                            description: t.description,
                            isCompleted: false, // O progresso zera no novo plano
                            disciplineId: newDisc.id
                        }))
                    });
                    topicsCreated += disc.topics.length;
                }
            }
        });

        return res.status(200).json({
            message: "Disciplinas exportadas com sucesso.",
            disciplinesCreated,
            topicsCreated
        });

    } catch (err: any) {
        console.error("Erro na exportação de disciplinas:", err);
        return res.status(500).json({ message: err.message || "Erro interno durante a exportação de disciplinas." });
    }
}
