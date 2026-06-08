import { Router, Request, Response } from 'express'
import { streamText, convertToModelMessages } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { requireAuth, AuthenticatedRequest } from '../auth/auth.middleware.js'
import { prisma } from '../../lib/prisma.js'
import { supabaseAdmin } from '../../lib/supabase.js'

export const aiRouter = Router()

aiRouter.use(requireAuth)

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
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
    if (provider === 'gemini') {
      model = google('gemini-2.5-flash')
    } else {
      model = openai('gpt-4o-mini')
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
                    const { PDFParse } = await import('pdf-parse');
                    const parser = new PDFParse({ data: buffer });
                    const pdfData = await parser.getText();
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

    const result = await streamText({
      model: model,
      system: finalSystemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.5,
      maxOutputTokens: 500,
      async onFinish({ text, usage }) {
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
    })
    
    // Send sessionId in headers so the client knows it (for new sessions)
    res.setHeader('x-session-id', sessionId)
    result.pipeUIMessageStreamToResponse(res)
  } catch (error) {
    console.error('Error generating AI response:', error)
    res.status(500).json({ error: 'Failed to generate response' })
  }
})
