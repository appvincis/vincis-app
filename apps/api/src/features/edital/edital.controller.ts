import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { prisma } from '../../lib/prisma.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import crypto from 'crypto';
import { PDFParse } from 'pdf-parse';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

const getAiModel = () => {
    if (process.env.GEMINI_API_KEY) {
        return google('gemini-2.5-flash');
    }
    if (process.env.OPENAI_API_KEY) {
        return openai('gpt-4o-mini');
    }
    throw new Error('Nenhuma chave de API (GEMINI_API_KEY ou OPENAI_API_KEY) configurada.');
};

const extractSyllabusText = (fullText: string): string => {
    if (!fullText) return '';
    const textLower = fullText.toLowerCase();
    const keywords = [
        'conteúdo programático',
        'conteúdos programáticos',
        'anexo de disciplinas',
        'anexo das disciplinas',
        'anexo ii',
        'objeto de avaliação',
        'conhecimentos específicos',
        'língua portuguesa'
    ];
    
    let startIndex = -1;
    for (const kw of keywords) {
        startIndex = textLower.indexOf(kw);
        if (startIndex !== -1) {
            break;
        }
    }
    
    if (startIndex === -1) {
        startIndex = Math.floor(fullText.length * 0.4);
    }
    
    const windowSize = 100000;
    return fullText.substring(startIndex, startIndex + windowSize);
};

export const uploadEdital = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.dbUser?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'O título é obrigatório' });
        }

        const file = req.file;
        if (file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Apenas arquivos PDF são permitidos' });
        }

        const bucketName = process.env.SUPABASE_BUCKET_EDITAIS || 'editais';
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error('Erro no upload para o Supabase:', uploadError);
            return res.status(500).json({ error: 'Falha ao fazer upload do arquivo' });
        }

        // Extrair texto do PDF
        let parsedContent = null;
        try {
            const parser = new PDFParse({ data: file.buffer });
            const pdfData = await parser.getText();
            parsedContent = pdfData.text;
        } catch (pdfError) {
            console.error('Erro ao extrair texto do PDF:', pdfError);
            // Continua mesmo se falhar a extração, mas o campo ficará null
        }

        const edital = await prisma.edital.create({
            data: {
                title,
                description,
                fileUrl: filePath,
                fileSize: file.size,
                parsedContent,
                userId
            }
        });

        return res.status(201).json(edital);
    } catch (error) {
        console.error('Erro no upload de edital:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

export const getEditais = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.dbUser?.id;
        if (!userId) return res.status(401).json({ error: 'Não autorizado' });

        const editais = await prisma.edital.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(editais);
    } catch (error) {
        console.error('Erro ao buscar editais:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

export const getEditalSignedUrl = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.dbUser?.id;
        const editalId = parseInt(req.params.id as string);

        if (!userId) return res.status(401).json({ error: 'Não autorizado' });
        if (isNaN(editalId)) return res.status(400).json({ error: 'ID inválido' });

        const edital = await prisma.edital.findUnique({ where: { id: editalId } });

        if (!edital) return res.status(404).json({ error: 'Edital não encontrado' });
        if (edital.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });

        const bucketName = process.env.SUPABASE_BUCKET_EDITAIS || 'editais';

        const { data, error } = await supabaseAdmin.storage
            .from(bucketName)
            .createSignedUrl(edital.fileUrl, 60); // 60 segundos de validade

        if (error || !data) {
            console.error('Erro ao gerar signed URL:', error);
            return res.status(500).json({ error: 'Erro ao gerar link de acesso' });
        }

        return res.json({ signedUrl: data.signedUrl });
    } catch (error) {
        console.error('Erro ao gerar signed URL de edital:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

export const deleteEdital = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.dbUser?.id;
        const editalId = parseInt(req.params.id as string);

        if (!userId) return res.status(401).json({ error: 'Não autorizado' });
        if (isNaN(editalId)) return res.status(400).json({ error: 'ID inválido' });

        const edital = await prisma.edital.findUnique({ where: { id: editalId } });

        if (!edital) return res.status(404).json({ error: 'Edital não encontrado' });
        if (edital.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });

        const bucketName = process.env.SUPABASE_BUCKET_EDITAIS || 'editais';

        // Remover do Supabase Storage
        const { error: deleteError } = await supabaseAdmin.storage
            .from(bucketName)
            .remove([edital.fileUrl]);

        if (deleteError) {
            console.error('Erro ao remover arquivo do Supabase:', deleteError);
            return res.status(500).json({ error: 'Erro ao remover o arquivo' });
        }

        // Remover do banco de dados
        await prisma.edital.delete({ where: { id: editalId } });

        return res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar edital:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

export const extractEdital = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.dbUser?.id;
        const editalId = parseInt(req.params.id as string);

        if (!userId) return res.status(401).json({ error: 'Não autorizado' });
        if (isNaN(editalId)) return res.status(400).json({ error: 'ID inválido' });

        const edital = await prisma.edital.findFirst({ where: { id: editalId, userId } });
        if (!edital) return res.status(404).json({ error: 'Edital não encontrado' });

        if (req.dbUser?.plan !== 'PREMIUM') {
            return res.status(403).json({ error: 'Recurso exclusivo do plano Premium. Por favor, assine o plano Premium para realizar a extração automática de disciplinas.' });
        }
        
        const parsedContent = edital.parsedContent;
        if (!parsedContent) {
            return res.status(400).json({ error: 'Este edital não possui conteúdo textual extraído para processamento.' });
        }

        // Resolvendo o plano de estudos ativo (cookie ou banco)
        let studyPlanId = req.cookies?.study_plan_id ? Number(req.cookies.study_plan_id) : null;
        if (!studyPlanId) {
            const activePlan = await prisma.studyPlan.findFirst({ where: { userId, is_active: true } });
            if (activePlan) {
                studyPlanId = activePlan.id;
            } else {
                const firstPlan = await prisma.studyPlan.findFirst({ where: { userId } });
                if (firstPlan) {
                    studyPlanId = firstPlan.id;
                }
            }
        }

        if (!studyPlanId) {
            return res.status(400).json({ error: 'Você precisa ter pelo menos um Plano de Estudo criado para realizar a extração.' });
        }

        // Pré-filtragem local do texto para otimizar tokens
        const candidateSyllabusChunk = extractSyllabusText(parsedContent);

        const model = getAiModel();

        // Etapa 1: Filtrar o texto para isolar apenas o conteúdo programático (reduzindo tokens redundantes)
        const filterResponse = await generateText({
            model,
            prompt: `Analise o texto do edital fornecido abaixo. Sua ÚNICA tarefa é identificar a seção de conteúdo programático (syllabus/disciplinas e assuntos) e retornar apenas o texto original correspondente a essa parte.\n\n` +
                    `REGRAS DE FILTRAGEM:\n` +
                    `1. Ignore totalmente as regras de inscrição, datas de provas, critérios de avaliação física, taxas, isenções, etc.\n` +
                    `2. Foque somente onde as matérias (ex: Português, Direito, Matemática) e seus respectivos assuntos estão listados.\n` +
                    `3. Retorne APENAS o texto bruto recortado dessa seção, sem introduções, resumos ou formatações extras.\n\n` +
                    `--- TEXTO DO EDITAL ---\n` +
                    candidateSyllabusChunk,
            temperature: 0.1
        });

        const filteredSyllabusText = filterResponse.text || candidateSyllabusChunk;
        
        // Etapa 2: Extração estruturada a partir do texto limpo do edital
        const response = await generateObject({
            model,
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
                    `1. Separe todas as disciplinas encontradas (ex: Língua Portuguesa, Informática, Direito Constitucional, etc).\n` +
                    `2. DENTRO DE CADA DISCIPLINA: quebre blocos longos de texto em tópicos individuais curtos e objetivos (ex: "Crase", "Acentuação").\n` +
                    `3. Use o idioma português.\n\n` +
                    `--- CONTEÚDO DO EDITAL ---\n` +
                    filteredSyllabusText,
            temperature: 0.1,
        });

        const extracted = response.object;
        if (!extracted.disciplines || extracted.disciplines.length === 0) {
            return res.status(422).json({ error: 'Nenhuma disciplina pôde ser extraída do texto do edital.' });
        }

        const presetColors = [
            '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
            '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#735c00'
        ];

        let disciplinesCreated = 0;
        let topicsCreated = 0;

        // Inserir no banco de dados em transação
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
                disciplinesCreated++;

                if (discData.topics && discData.topics.length > 0) {
                    await tx.topic.createMany({
                        data: discData.topics.map(t => ({
                            name: t.name,
                            description: t.description || null,
                            disciplineId: discipline.id,
                            isCompleted: false
                        }))
                    });
                    topicsCreated += discData.topics.length;
                }
            }
        });

        const totalTokensSpent = (filterResponse.usage?.totalTokens || 0) + (response.usage?.totalTokens || 0);

        return res.status(200).json({
            message: 'Extração concluída com sucesso.',
            disciplinesCreated,
            topicsCreated,
            tokensSpent: totalTokensSpent
        });

    } catch (error: any) {
        console.error('Erro na extração de edital:', error);
        return res.status(500).json({ error: error.message || 'Erro interno durante o processamento do edital.' });
    }
};
