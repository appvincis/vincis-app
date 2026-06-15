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
    let { messages } = req.body

    // Limpeza de segurança para histórico de conversas antigas corrompidas pelo frontend antigo:
    // Remove qualquer injeção do conteúdo do edital do histórico de mensagens para não gastar tokens.
    if (messages && Array.isArray(messages)) {
      messages = messages.map((m: any) => {
        if (m.content && typeof m.content === 'string' && m.content.includes('CONTEÚDO DO EDITAL DE REFERÊNCIA')) {
          return {
            ...m,
            content: m.content.split('CONTEÚDO DO EDITAL DE REFERÊNCIA')[0].trim()
          }
        }
        return m
      })
    }

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
      } else if (payloadEditalId) {
        // Se a sessão não tinha edital, mas o usuário anexou agora no meio do chat
        activeEditalId = payloadEditalId
        await prisma.aiSession.update({
          where: { id: sessionId },
          data: { editalId: payloadEditalId }
        })
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
    
    // Forçando Gemini 2.5 como principal conforme solicitado pelo usuário
    if (process.env.GEMINI_API_KEY) {
      model = google('gemini-2.5-flash')
      fallbackModel = process.env.OPENAI_API_KEY ? openai('gpt-4o-mini') : openrouter('google/gemini-2.5-flash')
    } else if (process.env.OPENROUTER_API_KEY) {
      model = openrouter('google/gemini-2.5-flash')
      fallbackModel = process.env.OPENAI_API_KEY ? openai('gpt-4o-mini') : openrouter('nvidia/nemotron-3-ultra-550b-a55b:free')
    } else if (process.env.OPENAI_API_KEY) {
      model = openai('gpt-4o-mini')
      fallbackModel = openai('gpt-4o')
    } else if (process.env.NVIDIA_API_KEY) {
      model = nvidia('openai/gpt-oss-120b')
      fallbackModel = nvidia('openai/gpt-oss-20b')
    } else {
      throw new Error('Nenhuma chave de API configurada.')
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
    } else {
      // Se não há edital selecionado, buscamos quais editais o usuário possui para o bot poder guiá-lo.
      const userEditais = await prisma.edital.findMany({
        where: { userId },
        select: { id: true, title: true }
      });

      if (userEditais.length > 0) {
        const editalNames = userEditais.map(e => `- ${e.title}`).join('\n');
        finalSystemPrompt += `\n\nATENÇÃO - INFORMAÇÃO IMPORTANTE DE CONTEXTO:
O usuário NÃO selecionou nenhum edital para esta conversa ainda. No entanto, ele possui os seguintes editais salvos no sistema:
${editalNames}

SE a pergunta do usuário for sobre o que estudar, bancas, disciplinas ou sobre algum concurso, VOCÊ DEVE agir da seguinte forma:
1. Verifique se o contexto da pergunta se encaixa em algum dos editais acima.
2. Pergunte ao usuário sobre qual edital ele está se referindo (liste as opções que ele tem).
3. Instrua o usuário claramente: "Para eu conseguir ler o edital completo e te responder com precisão, por favor, clique no botão de clipe de papel (anexar) ao lado da caixa de texto e selecione o edital desejado."
4. Não tente inventar o conteúdo do edital.`;
      }
    }

    const streamOptions = {
      system: finalSystemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.5,
      maxOutputTokens: 1000,
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

    // Find the active study plan
    const activePlan = await prisma.studyPlan.findFirst({
      where: { userId, is_active: true }
    })
    const studyPlanId = activePlan?.id || (await prisma.studyPlan.findFirst({ where: { userId } }))?.id

    // Fetch active disciplines in this study plan
    const disciplines = studyPlanId
      ? await prisma.discipline.findMany({
          where: { studyPlanId, isActive: true },
          include: { topics: true }
        })
      : []

    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        ...(studyPlanId ? { studyPlanId } : {}),
        startedAt: { gte: thirtyDaysAgo }
      },
      include: { Discipline: true }
    })

    const errorLogs = await prisma.errorLog.findMany({
      where: {
        userId,
        ...(studyPlanId ? { studyPlanId } : {}),
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        topic: {
          include: {
            discipline: true
          }
        }
      }
    })

    // Map stats by discipline
    const activeDisciplineIds = new Set(disciplines.map((d) => d.id))
    const extraDisciplineMap = new Map<number, { name: string; color?: string }>()

    focusSessions.forEach((s) => {
      if (s.disciplineId && !activeDisciplineIds.has(s.disciplineId)) {
        extraDisciplineMap.set(s.disciplineId, {
          name: s.Discipline?.name || 'Desconhecida',
          color: s.Discipline?.color || undefined
        })
      }
    })

    errorLogs.forEach((err) => {
      const discId = err.topic?.disciplineId
      if (discId && !activeDisciplineIds.has(discId)) {
        extraDisciplineMap.set(discId, {
          name: err.topic?.discipline?.name || 'Desconhecida',
          color: err.topic?.discipline?.color || undefined
        })
      }
    })

    const disciplineStatsList = disciplines.map((d) => {
      const dSessions = focusSessions.filter((s) => s.disciplineId === d.id)
      const dTimeSec = dSessions.reduce((sum, s) => sum + (s.focusTime || s.duration || 0), 0)
      const dQuestionsDone = dSessions.reduce((sum, s) => sum + (s.questionsDone || 0), 0)
      const dQuestionsCorrect = dSessions.reduce((sum, s) => sum + (s.questionsCorrect || 0), 0)

      const dErrorLogs = errorLogs.filter((err) => err.topic?.disciplineId === d.id)

      const topicErrors: Record<string, number> = {}
      const diagCounts: Record<string, number> = {}
      dErrorLogs.forEach((err) => {
        const topicName = err.topic?.name || err.topicText || 'Geral'
        topicErrors[topicName] = (topicErrors[topicName] || 0) + 1
        const diag = err.diagnostico || 'Geral'
        diagCounts[diag] = (diagCounts[diag] || 0) + 1
      })

      // Topics are considered studied if marked as completed OR if they have sessions/error logs
      const studiedTopicsList = d.topics.filter((t) => {
        const hasSession = focusSessions.some((s) => s.topicId === t.id)
        const hasError = errorLogs.some((err) => err.topicId === t.id)
        return t.isCompleted || hasSession || hasError
      }).map((t) => t.name)

      const notStudiedTopicsList = d.topics.filter((t) => {
        const hasSession = focusSessions.some((s) => s.topicId === t.id)
        const hasError = errorLogs.some((err) => err.topicId === t.id)
        return !t.isCompleted && !hasSession && !hasError
      }).map((t) => t.name)

      return {
        id: d.id,
        name: d.name,
        studyTimeMinutes: Math.round(dTimeSec / 60),
        sessionsCount: dSessions.length,
        questionsDone: dQuestionsDone,
        questionsCorrect: dQuestionsCorrect,
        accuracyPercent: dQuestionsDone > 0 ? Math.round((dQuestionsCorrect / dQuestionsDone) * 100) : 0,
        errorsCount: dErrorLogs.length,
        errorsByType: diagCounts,
        problematicTopics: Object.entries(topicErrors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => `${name} (${count} erros)`),
        studiedTopicsCount: studiedTopicsList.length,
        totalTopicsCount: d.topics.length,
        studiedTopicsList: studiedTopicsList.slice(0, 5),
        notStudiedTopicsCount: notStudiedTopicsList.length
      }
    })

    extraDisciplineMap.forEach((info, id) => {
      const dSessions = focusSessions.filter((s) => s.disciplineId === id)
      const dTimeSec = dSessions.reduce((sum, s) => sum + (s.focusTime || s.duration || 0), 0)
      const dQuestionsDone = dSessions.reduce((sum, s) => sum + (s.questionsDone || 0), 0)
      const dQuestionsCorrect = dSessions.reduce((sum, s) => sum + (s.questionsCorrect || 0), 0)

      const dErrorLogs = errorLogs.filter((err) => err.topic?.disciplineId === id)

      const topicErrors: Record<string, number> = {}
      const diagCounts: Record<string, number> = {}
      dErrorLogs.forEach((err) => {
        const topicName = err.topic?.name || err.topicText || 'Geral'
        topicErrors[topicName] = (topicErrors[topicName] || 0) + 1
        const diag = err.diagnostico || 'Geral'
        diagCounts[diag] = (diagCounts[diag] || 0) + 1
      })

      disciplineStatsList.push({
        id,
        name: info.name,
        studyTimeMinutes: Math.round(dTimeSec / 60),
        sessionsCount: dSessions.length,
        questionsDone: dQuestionsDone,
        questionsCorrect: dQuestionsCorrect,
        accuracyPercent: dQuestionsDone > 0 ? Math.round((dQuestionsCorrect / dQuestionsDone) * 100) : 0,
        errorsCount: dErrorLogs.length,
        errorsByType: diagCounts,
        problematicTopics: Object.entries(topicErrors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => `${name} (${count} erros)`),
        studiedTopicsCount: 0,
        totalTopicsCount: 0,
        studiedTopicsList: [],
        notStudiedTopicsCount: 0
      })
    })

    if (disciplineStatsList.length === 0 && focusSessions.length === 0 && errorLogs.length === 0) {
      return res.json({
        isEmpty: true
      })
    }

    const totalStudyTimeSec = focusSessions.reduce((sum, s) => sum + (s.focusTime || s.duration || 0), 0)
    const totalQuestionsDone = focusSessions.reduce((sum, s) => sum + (s.questionsDone || 0), 0)
    const totalQuestionsCorrect = focusSessions.reduce((sum, s) => sum + (s.questionsCorrect || 0), 0)
    const globalAccuracyPercent = totalQuestionsDone > 0 ? Math.round((totalQuestionsCorrect / totalQuestionsDone) * 100) : 0

    const globalErrorsByType: Record<string, number> = {}
    errorLogs.forEach((err) => {
      const diag = err.diagnostico || 'Geral'
      globalErrorsByType[diag] = (globalErrorsByType[diag] || 0) + 1
    })

    const promptData = {
      totalStudyTimeMinutes: Math.round(totalStudyTimeSec / 60),
      totalSessionsCount: focusSessions.length,
      totalErrorsCount: errorLogs.length,
      globalAccuracy: `${globalAccuracyPercent}% (Baseado em ${totalQuestionsDone} questões)`,
      errorsByTypeGlobally: globalErrorsByType,
      disciplines: disciplineStatsList.map((d) => ({
        materia: d.name,
        tempoEstudoMinutos: d.studyTimeMinutes,
        sessoesRealizadas: d.sessionsCount,
        questoesFeitas: d.questionsDone,
        questoesCorretas: d.questionsCorrect,
        acuracia: `${d.accuracyPercent}%`,
        quantidadeErros: d.errorsCount,
        errosPorTipo: d.errorsByType,
        topicosComMaisErros: d.problematicTopics,
        progressoTopicos: `${d.studiedTopicsCount}/${d.totalTopicsCount} estudados ou concluídos`,
        topicosEstudadosOuConcluidosRecentes: d.studiedTopicsList
      }))
    }

    const systemPrompt = `Você é um Mentor de Elite analisando o desempenho de um aluno nos últimos 30 dias.
Analise os dados fornecidos e gere um diagnóstico útil e acionável.

REGRAS CRÍTICAS CONTRA ALUCINAÇÕES (GARANTIA DE VERACIDADE):
1. Use APENAS as disciplinas, tópicos, erros, acertos e tempos contidos nos dados estruturados do aluno. É terminantemente PROIBIDO inventar qualquer dado, matéria, tópico, erro ou estatística fictícia.
2. Não tente inferir estudos fora do que está nos dados. Se o aluno não estudou nada de uma matéria, afirme isso explicitamente se necessário, mas não alucine dados de estudo.
3. Se um campo de dados (como "topicosComMaisErros") estiver vazio ou contiver zero erros, cite que não houve falhas registradas nesse assunto.

Regras:
1. Identifique a disciplina de destaque (maior tempo de estudo, constância ou acurácia).
2. Estime a curva de retenção de forma realista e otimista com base na acurácia e conclusão/estudo de tópicos (ex: "85%", "Excelente", "Em evolução", "Sólida").
3. Identifique o NOME EXATO da disciplina onde houve maior fadiga, repetição de erros ou que necessita de atenção urgente (ex: por baixo tempo de estudo ou acurácia abaixo do esperado). Nunca responda "Desconhecida" ou "Nenhuma". Escolha uma matéria real contida nos dados.
4. Escreva uma análise e recomendação extremamente detalhada, estruturada e completa. Não resuma. Apresente uma visão aprofundada do desempenho do aluno em cada disciplina estudada, listando explicitamente os tópicos estudados (independente de estarem concluídos ou não), a acurácia de questões, a quantidade de erros, pontos fortes e pontos fracos, seguidos de conselhos práticos e motivadores de estudo.

Dados do aluno:
${JSON.stringify(promptData, null, 2)}`

    const objectOptions = {
      system: systemPrompt,
      schema: z.object({
        highlightDiscipline: z.string().describe('O NOME da disciplina onde o aluno foi melhor ou dedicou mais tempo.'),
        retentionRate: z.string().describe('Uma estimativa de retenção ou elogio (ex: "85%", "Excelente").'),
        fatigueDiscipline: z.string().describe('O NOME EXATO da disciplina (matéria) com mais erros ou fadiga. NUNCA retorne o diagnóstico do erro aqui.'),
        recommendationText: z.string().describe('Análise de desempenho completa e extremamente detalhada por disciplina estudada, listando tópicos vistos, acurácia, erros e orientações de estudo.')
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
