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
import { generateObjectNvidia } from '../../lib/nvidia.js';

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || ''
});

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
});

const nvidia = createOpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY || ''
});

const getAiModels = () => {
    const models = [];
    // Prioridade 1: API Oficial da NVIDIA via NIM
    if (process.env.NVIDIA_API_KEY) {
        models.push(nvidia.chat('google/diffusiongemma-26b-a4b-it'));
    }
    // Prioridade 2: Gemini nativo gratuito (Google AI Studio)
    if (process.env.GEMINI_API_KEY) {
        models.push(googleProvider.chat('gemini-1.5-flash-latest'));
    }
    // Prioridade 3: Modelo gratuito via OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free)
    if (process.env.OPENROUTER_API_KEY) {
        models.push(openrouter.chat('nvidia/nemotron-3-ultra-550b-a55b:free'));
    }
    if (process.env.OPENROUTER_API_KEY) {
        models.push(openrouter.chat('google/gemini-2.5-flash'));
    }
    // Prioridade 4: OpenAI nativo (só se a chave for real — começa com 'sk-')
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
        models.push(openai.chat('gpt-4o-mini'));
    }
    if (models.length === 0) {
        throw new Error('Nenhuma chave de API (NVIDIA_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY ou OPENAI_API_KEY) configurada.');
    }
    return models;
};
export const TIMEOUT_SIMPLE_MS = 30000;   // 30s para tarefas simples (ex: extração de tópicos)
export const TIMEOUT_COMPLEX_MS = 300000; // 5 minutos de timeout para o Llama ler o edital inteiros (ex: localização de páginas, filtragem)

export async function generateObjectWithFallback(options: any & { timeoutMs?: number }) {
    const timeout = options.timeoutMs ?? TIMEOUT_COMPLEX_MS;

    // Desativando os fallbacks: usar estritamente o modelo configurado via OpenRouter
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY não configurada no ambiente. Não é possível rodar o modelo obrigatório.');
    }

    // openrouter/free roteia automaticamente para o melhor modelo gratuito disponível e que não esteja sobrecarregado
    const model = openrouter.chat('openrouter/free');

    try {
        console.log(`[AI] Iniciando extração com OpenRouter Automático (openrouter/free)...`);
        const result = await Promise.race([
            generateObject({
                ...options,
                model
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout de ${timeout / 1000}s atingido pela API do OpenRouter.`)), timeout)
            )
        ]);
        return result;
    } catch (err: any) {
        console.error(`[AI] Falha crítica na geração com OpenRouter Gemini:`, err);
        throw new Error(`Falha na API de Inteligência Artificial: ${err.message}`);
    }
}

export async function generateFastObjectWithFallback(options: any & { timeoutMs?: number }) {
    const timeout = options.timeoutMs ?? 30000; // Fast extraction should be quick (30s)

    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY não configurada no ambiente. Não é possível rodar o modelo obrigatório.');
    }

    const model = openrouter.chat('openrouter/free');

    try {
        console.log(`[AI] Iniciando extração RÁPIDA com OpenRouter Automático...`);
        const result = await Promise.race([
            generateObject({
                ...options,
                model
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout Rápido de ${timeout / 1000}s atingido pela API do OpenRouter.`)), timeout)
            )
        ]);
        return result;
    } catch (err: any) {
        console.error(`[AI] Falha crítica na geração rápida com OpenRouter:`, err);
        throw new Error(`Falha na API de IA (Fast): ${err.message}`);
    }
}

export async function streamObjectWithFallback(options: any) {
    const timeout = options.timeoutMs ?? TIMEOUT_COMPLEX_MS;

    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY não configurada no ambiente. Não é possível rodar o modelo obrigatório.');
    }

    const model = openrouter.chat('openrouter/free');

    try {
        console.log(`[AI] Iniciando Streaming com OpenRouter Automático...`);
        const result = await Promise.race([
            streamObject({ ...options, model }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout de ${timeout / 1000}s atingido pela API do OpenRouter no Streaming.`)), timeout)
            )
        ]);
        return result;
    } catch (err: any) {
        console.error(`[AI] Falha crítica no streaming com OpenRouter:`, err);
        throw new Error(`Falha na API de Inteligência Artificial (Streaming): ${err.message}`);
    }
}

export async function extractNativePDFWithGemini(options: {
    base64Pdf: string,
    prompt: string,
    schema: any,
    timeoutMs?: number
}) {
    const timeout = options.timeoutMs ?? TIMEOUT_COMPLEX_MS;

    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY não configurada no ambiente. Não é possível usar extração nativa de PDF.');
    }

    // Usamos o gemini-2.5-flash porque ele suporta até 1 Milhão de tokens, ideal para PDFs de editais
    const model = googleProvider('gemini-2.5-flash');

    try {
        console.log(`[AI] Iniciando leitura nativa de PDF com Gemini 2.5 Flash (Visão Computacional)...`);

        const result = await Promise.race([
            generateObject({
                model,
                schema: options.schema,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: options.prompt },
                            { type: 'file', data: options.base64Pdf, mediaType: 'application/pdf' }
                        ]
                    }
                ],
                temperature: 0.1, // Rigoroso para evitar alucinações em JSON
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout de ${timeout / 1000}s atingido pela API do Gemini.`)), timeout)
            )
        ]);

        return result;
    } catch (err: any) {
        console.error(`[AI] Falha crítica na leitura nativa com Gemini:`, err);
        throw new Error(`Falha no Google Gemini: ${err.message}`);
    }
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
    // Ignora apenas os primeiros ~3-4 páginas para evitar o sumário, sem pular matérias comuns
    const minStartIndex = Math.min(12000, Math.floor(totalLength * 0.1));

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

    const windowSize = 120000;
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
        let parsedPages: any = undefined;
        let syllabusSegments: any = undefined;
        try {
            const parser = new PDFParse({ data: file.buffer });
            const pageSeparator = '---_PAGE_SEPARATOR_---';
            const pdfData = await parser.getText({
                pageJoiner: pageSeparator
            });
            parsedContent = pdfData.text;

            // Construir o mapa Record<number, string>
            const pagesArray = parsedContent.split(pageSeparator);
            const pagesRecord: Record<number, string> = {};
            // Em geral, pdf-parse coloca um separador vazio no começo ou junta N páginas.
            // pagesArray terá tamanho = N ou N+1 (se tiver um extra no começo/fim).
            // Vamos filtrar ou tratar:
            let pageNum = 1;
            for (let i = 0; i < pagesArray.length; i++) {
                const text = pagesArray[i].trim();
                if (text) {
                    pagesRecord[pageNum] = text;
                    pageNum++;
                }
            }
            parsedPages = pagesRecord;

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
                parsedPages,
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
                syllabusSegments: true,
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
        // Limitar a 40k chars — o sumário e índice ficam sempre no início do documento
        const summaryText = parsedContent.substring(0, 40000);

        let cargoInstruction = '';
        if (cargo) {
            cargoInstruction = `e para a parte de Conhecimentos Específicos do cargo de "${cargo}".`;
        } else {
            cargoInstruction = `(como não foi informado um cargo específico, procure apenas pelas disciplinas gerais/básicas e retorne a parte específica como nula).`;
        }

        const prompt = `Você é um analista especialista em editais de concursos públicos.\n` +
            `Sua tarefa é ler as páginas iniciais do edital (sumário, índice ou introdução) e localizar os intervalos exatos de páginas onde estão descritos os conteúdos programáticos (ementas das disciplinas).\n\n` +
            `INSTRUÇÕES CRÍTICAS DE ANÁLISE:\n` +
            `1. **CONHECIMENTOS GERAIS/BÁSICOS (DISCIPLINAS COMUNS):** Encontre obrigatoriamente a faixa de páginas das matérias que são comuns a todos os cargos do concurso (ex: Língua Portuguesa, Raciocínio Lógico, Informática, Direito Constitucional, Direito Administrativo, Atualidades, etc.). Geralmente ficam no início do conteúdo programático. É fundamental identificar esta faixa para que as disciplinas comuns não sejam ignoradas.\n` +
            `2. **CONHECIMENTOS ESPECÍFICOS:** ${cargoInstruction}\n` +
            `3. **MAPEAMENTO DAS PÁGINAS:** Mapeie os números baseando-se estritamente nas marcações do texto que estão no formato "--- PÁGINA X ---". Por exemplo, se a ementa de Conhecimentos Básicos começa após o marcador "--- PÁGINA 15 ---" e termina antes do marcador "--- PÁGINA 19 ---", a página inicial é 15 e a final é 18.\n` +
            `4. **FORMATO DE PÁGINAS:** Se o conteúdo programático estiver em uma única página, a página inicial e a final serão iguais.\n\n` +
            `--- CONTEÚDO DE ANÁLISE DO EDITAL ---\n` +
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
            timeoutMs: TIMEOUT_COMPLEX_MS
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

export interface DisciplineClassification {
    name: string;
    category: 'COMMON' | 'SPECIFIC' | 'OTHER';
    reason: string;
}

export async function filterDisciplinesByCargoWithAi(
    disciplineNames: string[],
    cargo: string
): Promise<DisciplineClassification[]> {
    try {
        const prompt = `Você é um especialista em análise de editais de concursos públicos.\n` +
            `Recebemos uma lista de disciplinas extraídas de um edital e precisamos filtrar essa lista para manter apenas as disciplinas relevantes para o cargo de "${cargo}".\n\n` +
            `Classifique cada uma das seguintes disciplinas nas categorias abaixo:\n` +
            `- "COMMON": Disciplinas básicas/gerais comuns a todos os cargos do concurso (ex: Língua Portuguesa, Raciocínio Lógico, Informática, Direito Constitucional, Direito Administrativo, Redação, etc.).\n` +
            `- "SPECIFIC": Disciplinas específicas exclusivas para o cargo de "${cargo}".\n` +
            `- "OTHER": Disciplinas que pertencem especificamente a OUTROS cargos do edital (ex: se o cargo selecionado for 'Escrivão', e a disciplina for 'Conhecimentos Específicos de Delegado' ou 'Contabilidade Avançada para Auditor', classifique como OTHER).\n\n` +
            `ATENÇÃO: As disciplinas básicas e comuns (ex: Língua Portuguesa, Raciocínio Lógico, Informática, etc.) devem SEMPRE ser classificadas como "COMMON". Não as marque como "OTHER" sob nenhuma hipótese!\n\n` +
            `Disciplinas a serem classificadas:\n` +
            disciplineNames.map(name => `- ${name}`).join('\n') + `\n\n` +
            `Retorne um objeto JSON contendo a classificação para cada disciplina listada.`;

        const response = await generateObjectWithFallback({
            schema: z.object({
                classifications: z.array(z.object({
                    name: z.string().describe('Nome exato da disciplina da lista'),
                    category: z.enum(['COMMON', 'SPECIFIC', 'OTHER']).describe('Categoria da disciplina para o cargo analisado'),
                    reason: z.string().describe('Explicação rápida do motivo dessa classificação')
                }))
            }),
            prompt,
            temperature: 0.1,
            maxTokens: 800,
            timeoutMs: TIMEOUT_COMPLEX_MS
        });

        const obj = response.object as unknown as { classifications: DisciplineClassification[] };
        return obj.classifications || [];
    } catch (err) {
        console.error('Erro ao filtrar disciplinas por cargo via IA:', err);
        return [];
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

        const targetCargo = cargo || null;

        const shouldClearCache = edital.cargo !== targetCargo;

        // Atualizar status para QUEUED, limpar erros e limpar o cache APENAS se o cargo for alterado
        await (prisma.edital.update as any)({
            where: { id: editalId },
            data: {
                extractionStatus: 'QUEUED',
                extractionError: 'Aguardando na fila de processamento...',
                cargo: targetCargo,
                ...(shouldClearCache ? {
                    syllabusChunk: null,
                    syllabusChunkCargo: null,
                    syllabusSegments: null
                } : {})
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

export const cancelExtractEdital = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.dbUser?.id;
        const editalId = parseInt(req.params.id as string);

        if (!userId) return res.status(401).json({ error: 'Não autorizado' });
        if (isNaN(editalId)) return res.status(400).json({ error: 'ID inválido' });

        const edital = await prisma.edital.findFirst({ where: { id: editalId, userId } });
        if (!edital) return res.status(404).json({ error: 'Edital não encontrado' });

        if (edital.extractionStatus !== 'PROCESSING' && edital.extractionStatus !== 'QUEUED') {
            return res.status(400).json({ error: 'Esta extração não está ativa ou na fila para ser cancelada.' });
        }

        // 1. Procurar os jobs associados ao editalId na tabela do pg-boss
        const jobs = await prisma.$queryRawUnsafe<{ id: string }[]>(`
            SELECT id 
            FROM pgboss.job 
            WHERE name = 'edital-extraction' 
              AND (data->>'editalId')::int = $1 
              AND state IN ('created', 'retry', 'active')
        `, editalId);

        // 2. Cancelar cada job encontrado no pg-boss
        for (const job of jobs) {
            try {
                await boss.cancel('edital-extraction', job.id);
            } catch (bossErr) {
                console.warn(`[API] Não foi possível cancelar job ${job.id} no pg-boss:`, bossErr);
            }
        }

        // 3. Atualizar o status do edital para FAILED (com erro de cancelado) no banco
        await prisma.edital.update({
            where: { id: editalId },
            data: {
                extractionStatus: 'FAILED',
                extractionError: 'Cancelado pelo usuário.'
            }
        });

        console.log(`[API] Extração do Edital #${editalId} foi cancelada pelo usuário #${userId}.`);
        return res.json({ message: 'Extração cancelada com sucesso.' });

    } catch (error: any) {
        console.error('Erro ao cancelar extração de edital:', error);
        return res.status(500).json({ error: error.message || 'Erro interno ao cancelar extração.' });
    }
};
