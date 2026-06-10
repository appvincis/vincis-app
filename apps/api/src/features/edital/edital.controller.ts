import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { prisma } from '../../lib/prisma.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import crypto from 'crypto';
import { PDFParse } from 'pdf-parse';
import { generateObject, generateText, streamObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

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

const getAiModel = () => {
    if (process.env.OPENROUTER_API_KEY) {
        return openrouter('nvidia/nemotron-3-ultra-550b-a55b:free');
    }
    if (process.env.GEMINI_API_KEY) {
        return google('gemini-2.5-flash');
    }
    if (process.env.OPENAI_API_KEY) {
        return openai('gpt-4o-mini');
    }
    throw new Error('Nenhuma chave de API (OPENROUTER_API_KEY, GEMINI_API_KEY ou OPENAI_API_KEY) configurada.');
};

const normalizeText = (text: string): string => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

const extractPages = (fullText: string, startPage: number, endPage: number): string => {
    if (!fullText) return '';
    const lines = fullText.split('\n');
    let output = '';
    let isInsideRange = startPage === 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^--- PÁGINA (\d+) ---$/);
        if (match) {
            const pageNum = parseInt(match[1]);
            if (pageNum === startPage - 1) {
                isInsideRange = true;
                continue;
            }
            if (pageNum === endPage) {
                output += '\n' + line + '\n';
                break;
            }
        }
        if (isInsideRange) {
            output += line + '\n';
        }
    }
    return output.trim();
};

const extractSyllabusText = (fullText: string): string => {
    if (!fullText) return '';
    
    const totalLength = fullText.length;
    
    // Para editais pequenos (menos de 40.000 caracteres, ~10 páginas), processamos tudo
    if (totalLength <= 40000) {
        return fullText;
    }
    
    const normalizedText = normalizeText(fullText);
    const keywords = [
        'conteudo programatico',
        'conteudos programaticos',
        'anexo de disciplinas',
        'anexo das disciplinas',
        'anexo ii',
        'objeto de avaliacao',
        'conhecimentos especificos',
        'conhecimentos basicos',
        'programa das disciplinas',
        'quadro de disciplinas',
        'conteudos das provas',
        'lingua portuguesa'
    ];
    
    // Primeiro buscamos a palavra-chave em todo o documento
    let startIndex = -1;
    for (const kw of keywords) {
        startIndex = normalizedText.indexOf(kw);
        if (startIndex !== -1) {
            break;
        }
    }
    
    // Se não encontrou nenhuma palavra-chave, ou se a palavra-chave estava muito no início
    // (o que geralmente indica um falso positivo, como menção no sumário ou índice),
    // começamos a partir dos 40% do edital como estimativa padrão.
    const fortyPercentIndex = Math.floor(totalLength * 0.40);
    if (startIndex === -1 || startIndex < fortyPercentIndex) {
        startIndex = fortyPercentIndex;
    }
    
    const windowSize = 120000;
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

        const { title, description, pageRange } = req.body;
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

        // Extrair texto do PDF com delimitadores de página
        let parsedContent = null;
        try {
            const parser = new PDFParse({ data: file.buffer });
            const pdfData = await parser.getText({
                pageJoiner: '--- PÁGINA page_number ---'
            });
            parsedContent = pdfData.text;
        } catch (pdfError) {
            console.error('Erro ao extrair texto do PDF:', pdfError);
            // Continua mesmo se falhar a extração, mas o campo ficará null
        }

        const edital = await prisma.edital.create({
            data: {
                title,
                description,
                pageRange: pageRange || null,
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

        // Lock de concorrência: se já está rodando, impede nova chamada
        if (edital.extractionStatus === 'PROCESSING') {
            return res.status(409).json({ error: 'Uma extração para este edital já está em andamento.' });
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

        // Atualizar status para PROCESSING e limpar erros anteriores no banco
        await prisma.edital.update({
            where: { id: editalId },
            data: {
                extractionStatus: 'PROCESSING',
                extractionError: 'Limpando e preparando edital...'
            }
        });

        // Responder imediatamente ao cliente com 202 Accepted
        res.status(202).json({
            message: 'Extração iniciada em segundo plano.',
            status: 'PROCESSING'
        });

        // Inicia processamento assíncrono em segundo plano
        (async () => {
            try {
                // Extrair páginas específicas se indicadas pelo usuário, ou usar heurística inteligente
                let candidateSyllabusChunk = '';
                if (edital.pageRange && /^\d+-\d+$/.test(edital.pageRange)) {
                    const [startStr, endStr] = edital.pageRange.split('-');
                    const startPage = parseInt(startStr);
                    const endPage = parseInt(endStr);
                    candidateSyllabusChunk = extractPages(parsedContent, startPage, endPage);
                }

                if (!candidateSyllabusChunk) {
                    candidateSyllabusChunk = extractSyllabusText(parsedContent);
                }

                const model = getAiModel();

                await prisma.edital.update({
                    where: { id: editalId },
                    data: {
                        extractionError: 'Iniciando extração da grade...'
                    }
                });
                
                // Extração estruturada a partir do texto recortado do edital com progresso em streaming
                const response = await streamObject({
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
                            `1. Ignore regras de provas, inscrições, datas, taxas, atribuições de cargo, etc. Foque EXCLUSIVAMENTE nas disciplinas/matérias de estudo e seus respectivos tópicos/assuntos.\n` +
                            `2. Separe todas as disciplinas encontradas (ex: Língua Portuguesa, Informática, Direito Constitucional, etc).\n` +
                            `3. DENTRO DE CADA DISCIPLINA: quebre blocos longos de texto em tópicos individuais curtos e objetivos (ex: "Crase", "Acentuação").\n` +
                            `4. Use o idioma português.\n\n` +
                            `--- CONTEÚDO DO EDITAL ---\n` +
                            candidateSyllabusChunk,
                    temperature: 0.1,
                });

                let lastLoggedDiscipline = '';
                let lastUpdateTime = 0;

                for await (const partial of response.partialObjectStream) {
                    const disciplines = partial.disciplines;
                    if (disciplines && disciplines.length > 0) {
                        const lastDiscipline = disciplines[disciplines.length - 1];
                        if (lastDiscipline && lastDiscipline.name) {
                            const name = lastDiscipline.name;
                            const now = Date.now();
                            // throttled updates (every 1.5 seconds) to avoid overload
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
                                    // ignore intermittent db errors to avoid breaking execution
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
                        disciplinesCreatedCount++;

                        if (discData.topics && discData.topics.length > 0) {
                            await tx.topic.createMany({
                                data: discData.topics.map(t => ({
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

                // Atualizar status para sucesso com as métricas geradas e limpar logs temporários
                await prisma.edital.update({
                    where: { id: editalId },
                    data: {
                        extractionStatus: 'SUCCESS',
                        extractionError: null,
                        disciplinesCreated: disciplinesCreatedCount,
                        topicsCreated: topicsCreatedCount
                    }
                });

            } catch (bgError: any) {
                console.error('Erro na extração de edital em segundo plano:', bgError);
                await prisma.edital.update({
                    where: { id: editalId },
                    data: {
                        extractionStatus: 'FAILED',
                        extractionError: bgError.message || 'Erro desconhecido durante o processamento com IA.'
                    }
                });
            }
        })();

    } catch (error: any) {
        console.error('Erro ao iniciar extração de edital:', error);
        return res.status(500).json({ error: error.message || 'Erro interno ao iniciar processamento do edital.' });
    }
};
