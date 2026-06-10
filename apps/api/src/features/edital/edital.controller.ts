import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { prisma } from '../../lib/prisma.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { boss } from '../../lib/queue.service.js';
import crypto from 'crypto';
import { PDFParse } from 'pdf-parse';
import { generateObject, generateText, streamObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { segmentByDiscipline } from './edital.segmenter.js';

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
    // Prioridade 1: OpenRouter com Gemini 2.5 Flash (boa relação custo/velocidade)
    if (process.env.OPENROUTER_API_KEY) {
        models.push(openrouter.chat('google/gemini-2.5-flash'));
    }
    // Prioridade 2: Gemini nativo
    if (process.env.GEMINI_API_KEY) {
        models.push(google('gemini-2.5-flash'));
    }
    // Prioridade 3: OpenAI nativo (só se a chave for real — começa com 'sk-')
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
        models.push(openai.chat('gpt-4o-mini'));
    }
    // Prioridade 4: Modelo gratuito via OpenRouter (último recurso)
    if (process.env.OPENROUTER_API_KEY) {
        models.push(openrouter.chat('nvidia/nemotron-3-ultra-550b-a55b:free'));
    }
    if (models.length === 0) {
        throw new Error('Nenhuma chave de API (OPENROUTER_API_KEY, GEMINI_API_KEY ou OPENAI_API_KEY) configurada.');
    }
    return models;
};

export async function generateObjectWithFallback(options: any) {
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
    throw lastError || new Error("Todos os modelos falharam na geração de objeto.");
}

const MODEL_TIMEOUT_MS = 45000; // 45s por modelo antes de tentar o próximo

export async function streamObjectWithFallback(options: any) {
    const models = getAiModels();
    let lastError: any;
    for (const model of models) {
        try {
            console.log(`[AI] Tentando modelo: ${model.modelId || 'unknown'}`);
            // Race entre a chamada real e um timeout por modelo
            const result = await Promise.race([
                streamObject({ ...options, model }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error(`Timeout de ${MODEL_TIMEOUT_MS / 1000}s atingido para o modelo ${model.modelId || 'unknown'}`)), MODEL_TIMEOUT_MS)
                )
            ]);
            console.log(`[AI] Modelo ${model.modelId || 'unknown'} respondeu com sucesso.`);
            return result;
        } catch (err: any) {
            console.warn(`[AI] streamObject falhou para ${model.modelId || 'model'}: ${err.message}. Tentando próximo fallback...`);
            lastError = err;
        }
    }
    throw lastError || new Error("Todos os modelos falharam no streaming de objeto.");
}

const normalizeText = (text: string): string => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

export const extractPages = (fullText: string, startPage: number, endPage: number): string => {
    if (!fullText) return '';
    const lines = fullText.split('\n');
    let output = '';
    // G5 fix: startPage <= 1 já começa dentro do range desde o início do texto
    let isInsideRange = startPage <= 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^--- PÁGINA (\d+) ---$/);
        if (match) {
            const pageNum = parseInt(match[1]);
            // Entra no range quando vê o marcador da página ANTERIOR ao início
            if (pageNum === startPage - 1 && !isInsideRange) {
                isInsideRange = true;
                continue;
            }
            // Também abre no marcador exato do início (caso o marcador seja a própria página)
            if (pageNum === startPage && !isInsideRange) {
                isInsideRange = true;
            }
            // Sai do range ao atingir a página final
            if (isInsideRange && pageNum > endPage) {
                break;
            }
        }
        if (isInsideRange) {
            output += line + '\n';
        }
    }
    return output.trim();
};

/**
 * Encontra o trecho mais provável de conteúdo programático usando heurísticas de texto puro,
 * sem nenhuma chamada de IA. Retorna uma janela compacta (~40k chars) a partir do início detectado.
 *
 * Estratégia:
 *  1. Busca TODAS as ocorrências das keywords (não só a primeira)
 *  2. Descarta ocorrências nos primeiros 25% do documento (sumário/índice)
 *  3. Prefere ocorrências cercadas por padrões típicos de listas de disciplinas
 *  4. Fallback: posição de 40% do documento
 */
export const smartExtractSyllabusChunk = (fullText: string): string => {
    if (!fullText) return '';
    const totalLength = fullText.length;

    // Editais pequenos: processa tudo
    if (totalLength <= 40000) return fullText;

    const normalizedText = normalizeText(fullText);
    const minStartIndex = Math.floor(totalLength * 0.25); // ignora os primeiros 25% (sumário)

    const keywords = [
        'conteudo programatico',
        'conteudos programaticos',
        'anexo de disciplinas',
        'anexo das disciplinas',
        'programa das disciplinas',
        'quadro de disciplinas',
        'conteudos das provas',
        'objeto de avaliacao',
        'conhecimentos especificos',
        'conhecimentos basicos',
        'lingua portuguesa',
        'anexo ii',
        'anexo iii',
    ];

    // Coleta todos os índices válidos (fora do sumário)
    const candidates: number[] = [];
    for (const kw of keywords) {
        let searchFrom = 0;
        while (true) {
            const idx = normalizedText.indexOf(kw, searchFrom);
            if (idx === -1) break;
            if (idx >= minStartIndex) {
                candidates.push(idx);
            }
            searchFrom = idx + 1;
        }
    }

    if (candidates.length === 0) {
        // Fallback: a partir de 40% do documento
        const fallbackStart = Math.floor(totalLength * 0.40);
        console.log(`[smartExtract] Nenhuma keyword encontrada fora do sumário. Usando fallback 40% (idx=${fallbackStart}).`);
        return fullText.substring(fallbackStart, fallbackStart + 60000);
    }

    // Ordena por posição e pega o mais próximo do início real do CP
    candidates.sort((a, b) => a - b);

    // Verifica qual candidato tem mais "densidade de conteúdo programático" na vizinhança:
    // um bom início tem linhas curtas (tópicos) e muitas vírgulas/pontos
    let bestIdx = candidates[0];
    let bestScore = -1;
    for (const idx of candidates.slice(0, 5)) { // analisa os 5 primeiros candidatos
        const sample = fullText.substring(idx, idx + 3000);
        const lines = sample.split('\n').filter(l => l.trim().length > 0);
        const shortLines = lines.filter(l => l.trim().length < 80).length;
        const commasAndDots = (sample.match(/[,;.]/g) || []).length;
        const score = shortLines + commasAndDots * 0.3;
        if (score > bestScore) {
            bestScore = score;
            bestIdx = idx;
        }
    }

    // Recua até o início da linha para não cortar no meio de uma palavra
    while (bestIdx > 0 && fullText[bestIdx - 1] !== '\n') bestIdx--;

    const windowSize = 60000;
    console.log(`[smartExtract] Chunk selecionado a partir do índice ${bestIdx} (${(bestIdx / totalLength * 100).toFixed(1)}% do documento).`);
    return fullText.substring(bestIdx, bestIdx + windowSize);
};

/** @deprecated Use smartExtractSyllabusChunk. Mantido para compatibilidade. */
export const extractSyllabusText = smartExtractSyllabusChunk;

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
        let syllabusSegments = null;
        try {
            const parser = new PDFParse({ data: file.buffer });
            const pdfData = await parser.getText({
                pageJoiner: '--- PÁGINA page_number ---'
            });
            parsedContent = pdfData.text;

            // Pré-segmentar no upload para otimizar o fluxo e caching
            try {
                const chunk = smartExtractSyllabusChunk(parsedContent);
                if (chunk) {
                    const segments = segmentByDiscipline(chunk);
                    if (segments.length > 0) {
                        syllabusSegments = segments as any;
                    }
                }
            } catch (segError) {
                console.warn('Erro ao pré-segmentar edital no upload:', segError);
            }
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
                syllabusSegments,
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

        // G4 fix: exclui parsedContent e syllabusChunk da listagem (campos grandes, não necessários na lista)
        const editais = await prisma.edital.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                description: true,
                fileUrl: true,
                fileSize: true,
                pageRange: true,
                extractionStatus: true,
                extractionError: true,
                cargo: true,
                disciplinesCreated: true,
                topicsCreated: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
                // parsedContent e syllabusChunk excluídos intencionalmente (pesados, não usados na UI de lista)
            }
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

export const getEditalCargos = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.dbUser?.id;
        const editalId = parseInt(req.params.id as string);

        if (!userId) return res.status(401).json({ error: 'Não autorizado' });
        if (isNaN(editalId)) return res.status(400).json({ error: 'ID inválido' });

        const edital = await prisma.edital.findFirst({ where: { id: editalId, userId } });
        if (!edital) return res.status(404).json({ error: 'Edital não encontrado' });

        const parsedContent = edital.parsedContent;
        if (!parsedContent) {
            return res.status(400).json({ error: 'Este edital não possui conteúdo textual extraído para processamento.' });
        }

        // G1 fix: cargos estão sempre nas primeiras páginas — 30k chars (~8 páginas) é suficiente
        const candidateText = parsedContent.substring(0, 30000);
        const response = await generateObjectWithFallback({
            schema: z.object({
                cargos: z.array(z.string().describe('Nome curto e oficial do cargo encontrado no edital (ex: Analista de TI, Técnico Administrativo, Soldado)'))
            }),
            prompt: `Analise o texto do edital abaixo e extraia todos os cargos/vagas disponíveis listados no concurso.\n` +
                    `Retorne uma lista limpa apenas com os nomes oficiais dos cargos, sem salários, requisitos ou códigos.\n\n` +
                    `--- CONTEÚDO DO EDITAL ---\n` +
                    candidateText,
            temperature: 0.1,
            maxTokens: 500,
        });

        const cargos = (response.object as { cargos: string[] }).cargos || [];
        return res.json({ cargos });
    } catch (error: any) {
        console.error('Erro ao extrair cargos do edital:', error);
        return res.status(500).json({ error: error.message || 'Erro ao extrair cargos do edital.' });
    }
};

interface SyllabusPageRange {
    geral: {
        startPage: number | null;
        endPage: number | null;
    };
    especifico: {
        startPage: number | null;
        endPage: number | null;
    };
}

export async function locateSyllabusPages(parsedContent: string, cargo?: string): Promise<SyllabusPageRange> {
    try {
        // Limitar a 80k chars — o sumário e índice ficam sempre no início do documento
        const summaryText = parsedContent.substring(0, 80000);
        
        let cargoInstruction = '';
        if (cargo) {
            cargoInstruction = `e também para a parte de Conhecimentos Específicos para o cargo de "${cargo}".`;
        } else {
            cargoInstruction = `(como não foi informado um cargo específico, procure apenas pelas disciplinas gerais/básicas e retorne a parte específica como nula).`;
        }

        const prompt = `Analise o texto inicial do edital (que inclui sumário e introdução) e identifique o número exato das páginas onde se localizam as disciplinas do conteúdo programático de estudo.\n\n` +
            `Você precisa identificar as páginas correspondentes para as disciplinas de Conhecimentos Gerais/Básicos (comum a todos os cargos) ${cargoInstruction}\n\n` +
            `Se as páginas não forem explicitadas ou você não puder identificar com certeza absoluta, retorne null para os campos.\n` +
            `Preste atenção aos marcadores "--- PÁGINA X ---" presentes no texto para mapear o número exato da página.\n\n` +
            `--- CONTEÚDO INICIAL DO EDITAL ---\n` +
            summaryText;

        const response = await generateObjectWithFallback({
            schema: z.object({
                geral: z.object({
                    startPage: z.number().nullable().describe('Página inicial de Conhecimentos Gerais (comum)'),
                    endPage: z.number().nullable().describe('Página final de Conhecimentos Gerais (comum)')
                }),
                especifico: z.object({
                    startPage: z.number().nullable().describe('Página inicial de Conhecimentos Específicos do cargo informado'),
                    endPage: z.number().nullable().describe('Página final de Conhecimentos Específicos do cargo informado')
                })
            }),
            prompt,
            temperature: 0.1,
            maxTokens: 300, // só precisa retornar números de página
        });

        const obj = response.object as any;
        // Validação básica dos intervalos
        if (obj.geral && obj.geral.startPage && obj.geral.endPage && obj.geral.startPage > obj.geral.endPage) {
            obj.geral.startPage = null;
            obj.geral.endPage = null;
        }
        if (obj.especifico && obj.especifico.startPage && obj.especifico.endPage && obj.especifico.startPage > obj.especifico.endPage) {
            obj.especifico.startPage = null;
            obj.especifico.endPage = null;
        }
        return obj;
    } catch (err) {
        console.error('Erro ao mapear páginas do edital por IA:', err);
        return {
            geral: { startPage: null, endPage: null },
            especifico: { startPage: null, endPage: null }
        };
    }
}

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
        if (edital.extractionStatus === 'PROCESSING' || edital.extractionStatus === 'QUEUED') {
            return res.status(409).json({ error: 'Uma extração para este edital já está em andamento ou aguardando na fila.' });
        }

        // Ler o cargo desejado se enviado no body
        const { cargo } = req.body;

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

        // Atualizar status para QUEUED e limpar erros anteriores no banco
        await (prisma.edital.update as any)({
            where: { id: editalId },
            data: {
                extractionStatus: 'QUEUED',
                extractionError: 'Aguardando na fila de processamento...',
                cargo: cargo || null
            }
        });

        // Responder imediatamente ao cliente com 202 Accepted
        res.status(202).json({
            message: 'Extração agendada com sucesso.',
            status: 'QUEUED'
        });

        // Publicar o job na fila para processamento em segundo plano pelo worker
        await boss.send('edital-extraction', {
            editalId,
            userId,
            studyPlanId,
            cargo: cargo || null
        });

    } catch (error: any) {
        console.error('Erro ao iniciar extração de edital:', error);
        return res.status(500).json({ error: error.message || 'Erro interno ao iniciar processamento do edital.' });
    }
};
