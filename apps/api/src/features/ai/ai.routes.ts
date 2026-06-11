import { Router, Request, Response } from 'express'
import { streamText, convertToModelMessages, generateObject } from 'ai'
import { z } from 'zod'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { requireAuth, AuthenticatedRequest } from '../auth/auth.middleware.js'
import { prisma } from '../../lib/prisma.js'
import { supabaseAdmin } from '../../lib/supabase.js'
import { nvidiaClient, generateObjectNvidia } from '../../lib/nvidia.js'

export const aiRouter = Router()

aiRouter.use(requireAuth)

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || ''
})

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
})

const nvidia = createOpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY || ''
})

// List all sessions for the logged-in user
aiRouter.get('/sessions', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).dbUser!.id
    const sessions = await prisma.aiSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true }
    })
    res.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// Get a specific session with messages
aiRouter.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).dbUser!.id
    const { id } = req.params
    const session = await prisma.aiSession.findFirst({
      where: { id: id as string, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, role: true, content: true, tokens: true, createdAt: true }
        }
      }
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json(session)
  } catch (error) {
    console.error('Error fetching session:', error)
    res.status(500).json({ error: 'Failed to fetch session' })
  }
})

// Delete a specific session
aiRouter.delete('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).dbUser!.id
    const { id } = req.params

    // Check if session exists and belongs to user
    const session = await prisma.aiSession.findFirst({
      where: { id: id as string, userId }
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    await prisma.aiSession.delete({
      where: { id: id as string }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    res.status(500).json({ error: 'Failed to delete session' })
  }
})

aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).dbUser!.id
    const { messages } = req.body

    // Explicitly use sessionId from data to avoid conflict with AI SDK's auto-generated req.body.id
    let sessionId = req.body.data?.sessionId
    const provider = req.body.provider || req.body.data?.provider || 'openai'
    const payloadEditalId = req.body.data?.editalId ? parseInt(req.body.data?.editalId) : null
    let activeEditalId = payloadEditalId

    const lastUserMessage = messages[messages.length - 1]

    // Create a new session if one doesn't exist (sessionId is empty string or undefined)
    if (!sessionId) {
      const newSession = await prisma.aiSession.create({
        data: {
          userId,
          title: (lastUserMessage.content || (lastUserMessage.parts && lastUserMessage.parts[0]?.text) || 'Nova conversa').substring(0, 40) + '...',
          editalId: payloadEditalId
        }
      })
      sessionId = newSession.id
    } else {
      // Verify session belongs to user
      const session = await prisma.aiSession.findFirst({
        where: { id: sessionId, userId }
      })
      if (!session) {
        return res.status(404).json({ error: 'Session not found' })
      }
      // Se a sessão antiga tem um edital salvo, use ele
      if (session.editalId) {
        activeEditalId = session.editalId
      }
    }

    const userContent = lastUserMessage.content || (lastUserMessage.parts && lastUserMessage.parts[0]?.text) || ''

    // Save the incoming user message
    await prisma.aiMessage.create({
      data: {
        sessionId,
        role: lastUserMessage.role,
        content: userContent
      }
    })

    const systemInstruction = `
        ATUAÇÃO: Você é um Mentor de Elite para Concursos Públicos.
        CONTEXTO: O aluno está em uma sessão de estudo focado (tempo cronometrado) e lendo editais. Ele precisa de respostas precisas e rápidas.
        
        REGRAS RÍGIDAS DE RESPOSTA:
        1. SEJA CIRÚRGICO: Vá direto à resposta.
        2. FOCO NA PROVA: Explique o conceito focando em como as bancas cobram.
        3. PEGADINHAS: Se houver uma "pegadinha" clássica, alerte com ⚠️.
        4. LEI SECA: Se for jurídico, cite o Artigo/Lei.
        5. FORMATAÇÃO: Use Bullet Points e NEGRITO nas palavras-chave.
    `

    let model: any
    let fallbackModel: any
    if (process.env.NVIDIA_API_KEY) {
      model = nvidia('openai/gpt-oss-120b')
      fallbackModel = nvidia('openai/gpt-oss-20b')
    } else if (process.env.OPENROUTER_API_KEY) {
      model = openrouter('nvidia/nemotron-3-ultra-550b-a55b:free')
      fallbackModel = process.env.GEMINI_API_KEY 
        ? google('gemini-2.5-flash') 
        : (process.env.OPENAI_API_KEY 
            ? openai('gpt-4o-mini') 
            : openrouter('google/gemini-2.5-flash'))
    } else if (process.env.GEMINI_API_KEY) {
      model = google('gemini-2.5-flash')
      fallbackModel = process.env.OPENAI_API_KEY ? openai('gpt-4o-mini') : openrouter('google/gemini-2.5-flash')
    } else if (process.env.OPENAI_API_KEY) {
      model = openai('gpt-4o-mini')
      fallbackModel = google('gemini-2.5-flash')
    } else {
      throw new Error('Nenhuma chave de API (NVIDIA_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY ou OPENAI_API_KEY) configurada.')
    }

    let finalSystemPrompt = systemInstruction;

    if (activeEditalId) {
      // Find edital
      let edital = await prisma.edital.findFirst({
        where: { id: activeEditalId, userId }
      });

      if (edital && !edital.parsedContent) {
        // Fallback para editais antigos que não foram processados no upload
        try {
          const bucketName = process.env.SUPABASE_BUCKET_EDITAIS || 'editais';
          const { data: fileData } = await supabaseAdmin.storage
            .from(bucketName)
            .download(edital.fileUrl);

          if (fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const { createRequire } = await import('module');
            const require = createRequire(import.meta.url);
            const pdfParse = require('pdf-parse');

            const pdfData = await pdfParse(buffer);
            edital.parsedContent = pdfData.text;

            // Salva no banco para não processar de novo
            await prisma.edital.update({
              where: { id: edital.id },
              data: { parsedContent: pdfData.text }
            });
          }
        } catch (error) {
          console.error('Erro no fallback de extração de PDF do Supabase:', error);
        }
      }

      if (edital && edital.parsedContent) {
        finalSystemPrompt += `\n\nCONTEXTO DO EDITAL:\nO usuário selecionou o edital "${edital.title}". Aqui está o conteúdo extraído:\n--------------------------------------------------\n${edital.parsedContent}\n--------------------------------------------------\nResponda às dúvidas do usuário com base nas informações deste edital. Se a informação não estiver no edital, avise o usuário.`;
      }
    }

    const streamOptions = {
      system: finalSystemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.5,
      maxOutputTokens: 500,
      async onFinish({ text, usage }: any) {
        // Save the assistant's response when the stream finishes
        const tokens = usage?.totalTokens || null;
        await prisma.aiMessage.create({
          data: {
            sessionId,
            role: 'assistant',
            content: text,
            tokens
          }
        })

        // Update the session's updatedAt timestamp
        await prisma.aiSession.update({
          where: { id: sessionId },
          data: { updatedAt: new Date() }
        })
      }
    };

    if (process.env.NVIDIA_API_KEY) {
      try {
        console.log(`[AI] Tentando NVIDIA NIM Oficial (nvidia/nemotron-3-nano-omni-30b-a3b-reasoning) via OpenAI SDK...`);
        const converted = await convertToModelMessages(messages);
        
        const completionStream = (await nvidiaClient.chat.completions.create({
          model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
          messages: [
            { role: 'system', content: finalSystemPrompt },
            ...converted
          ] as any,
          temperature: 0.6,
          top_p: 0.95,
          max_tokens: 4096,
          extra_body: {
            chat_template_kwargs: { enable_thinking: true },
            reasoning_budget: 16384
          },
          stream: true
        } as any)) as any;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('x-session-id', sessionId);

        let fullText = '';
        let fullReasoning = '';

        for await (const chunk of completionStream) {
          const delta = chunk.choices[0]?.delta;
          if (delta) {
            const reasoning = (delta as any).reasoning_content;
            if (reasoning) {
              fullReasoning += reasoning;
              process.stdout.write(reasoning);
            }
            const content = delta.content;
            if (content) {
              fullText += content;
              res.write(`0:${JSON.stringify(content)}\n`);
            }
          }
        }

        console.log("\n=== CONTENT ===");
        console.log(fullText);

        await prisma.aiMessage.create({
          data: {
            sessionId,
            role: 'assistant',
            content: fullText,
            tokens: null
          }
        });
        await prisma.aiSession.update({
          where: { id: sessionId },
          data: { updatedAt: new Date() }
        });

        res.end();
        return;
      } catch (err) {
        console.warn("NVIDIA NIM streaming via OpenAI SDK failed, falling back to other models...", err);
      }
    }

    let result: any;
    try {
      result = await streamText({
        model: model,
        ...streamOptions
      })
    } catch (err) {
      console.warn("Primary AI model failed, falling back to secondary model...", err);
      result = await streamText({
        model: fallbackModel,
        ...streamOptions
      })
    }

    // Send sessionId in headers so the client knows it (for new sessions)
    res.setHeader('x-session-id', sessionId)
    result.pipeUIMessageStreamToResponse(res)
  } catch (error) {
    console.error('Error generating AI response:', error)
    res.status(500).json({ error: 'Failed to generate response' })
  }
})

// Generate performance diagnostic using AI
aiRouter.get('/diagnostic', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).dbUser!.id

    // Fetch the last 30 days of data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const focusSessions = await prisma.focusSession.findMany({
      where: { userId, startedAt: { gte: thirtyDaysAgo } },
      include: { Discipline: true }
    })

    const errorLogs = await prisma.errorLog.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      include: { topic: { include: { discipline: true } } }
    })

    if (focusSessions.length === 0 && errorLogs.length === 0) {
      return res.json({
        isEmpty: true
      })
    }

    // Summarize for the prompt
    let totalStudyTime = 0
    const disciplineTime: Record<string, number> = {}

    focusSessions.forEach((session: any) => {
      totalStudyTime += session.duration || 0
      const dName = session.Discipline?.name
      if (dName) {
        disciplineTime[dName] = (disciplineTime[dName] || 0) + (session.duration || 0)
      }
    })

    const errorsCount: Record<string, number> = {}
    const errorsType: Record<string, number> = {}

    errorLogs.forEach((err: any) => {
      const dName = err.topic?.discipline?.name
      if (dName) {
        errorsCount[dName] = (errorsCount[dName] || 0) + 1
      }
      const diag = err.diagnostico || 'Geral'
      errorsType[diag] = (errorsType[diag] || 0) + 1
    })

    const promptData = {
      totalStudyTimeMinutes: Math.round(totalStudyTime / 60),
      timeByDisciplineMinutes: Object.fromEntries(Object.entries(disciplineTime).map(([k, v]) => [k, Math.round(v / 60)])),
      errorsByDiscipline: errorsCount,
      errorsByType: errorsType,
      sessionsCount: focusSessions.length,
      errorsCount: errorLogs.length
    }

    const systemPrompt = `Você é um Mentor de Elite analisando o desempenho de um aluno nos últimos 30 dias.
Analise os dados fornecidos e gere um diagnóstico útil e acionável.
Regras:
1. Identifique a disciplina de destaque (maior tempo ou constância).
2. Estime a curva de retenção de forma otimista (ex: "85%", "Excelente", "Em crescimento").
3. Identifique, EXCLUSIVAMENTE, o NOME DA DISCIPLINA (matéria) onde houve mais fadiga ou repetição de erros. Se não houver erros, escolha a matéria com MENOS tempo de estudo. Nunca responda "Desconhecida" ou "Nenhuma", escolha uma matéria existente nos dados.
4. Escreva uma recomendação clara, prática e motivadora (1-2 frases). Na recomendação você pode citar os motivos dos erros, como "Falta de Atenção" ou "Lacuna Teórica", para direcionar o estudo.

Dados do aluno:
${JSON.stringify(promptData, null, 2)}`

    const objectOptions = {
      system: systemPrompt,
      schema: z.object({
        highlightDiscipline: z.string().describe('O NOME da disciplina onde o aluno foi melhor ou dedicou mais tempo.'),
        retentionRate: z.string().describe('Uma estimativa de retenção ou elogio (ex: "85%", "Excelente").'),
        fatigueDiscipline: z.string().describe('O NOME EXATO da disciplina (matéria) com mais erros ou fadiga. NUNCA retorne o diagnóstico do erro aqui.'),
        recommendationText: z.string().describe('Uma frase de recomendação baseada nos erros e acertos.')
      }),
      prompt: 'Gere o diagnóstico estruturado com base nestas estatísticas do aluno.'
    }

    if (process.env.NVIDIA_API_KEY) {
      try {
        console.log(`[AI-Diagnostic] Tentando NVIDIA NIM Oficial (nvidia/nemotron-3-nano-omni-30b-a3b-reasoning) via OpenAI SDK...`);
        const resObj = await generateObjectNvidia(objectOptions);
        return res.json({
          isEmpty: false,
          ...resObj.object
        });
      } catch (err) {
        console.warn("NVIDIA NIM generateObject via OpenAI SDK failed for diagnostic, trying fallback models...", err);
      }
    }

    let primaryModel: any
    let fallbackModel: any
    
    if (process.env.OPENROUTER_API_KEY) {
      primaryModel = openrouter('nvidia/nemotron-3-ultra-550b-a55b:free')
      fallbackModel = process.env.GEMINI_API_KEY 
        ? google('gemini-2.5-flash') 
        : (process.env.OPENAI_API_KEY 
            ? openai('gpt-4o-mini') 
            : openrouter('google/gemini-2.5-flash'))
    } else if (process.env.GEMINI_API_KEY) {
      primaryModel = google('gemini-2.5-flash')
      fallbackModel = process.env.OPENAI_API_KEY ? openai('gpt-4o-mini') : openrouter('google/gemini-2.5-flash')
    } else if (process.env.OPENAI_API_KEY) {
      primaryModel = openai('gpt-4o-mini')
      fallbackModel = google('gemini-2.5-flash')
    } else {
      throw new Error('Nenhuma chave de API (NVIDIA_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY ou OPENAI_API_KEY) configurada.')
    }

    let result: any;
    try {
      result = await generateObject({
        model: primaryModel,
        ...objectOptions
      })
    } catch (err) {
      console.warn("Primary AI model failed for diagnostic, falling back to secondary model...", err);
      result = await generateObject({
        model: fallbackModel,
        ...objectOptions
      })
    }

    return res.json({
      isEmpty: false,
      ...result.object
    })

  } catch (error) {
    console.error('Error generating diagnostic:', error)
    res.status(500).json({ error: 'Failed to generate diagnostic' })
  }
})
