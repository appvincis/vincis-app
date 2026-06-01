import { Router, Request, Response } from 'express'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const aiRouter = Router()

// Initialize providers with custom API key variable names as requested
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
})

aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body
    const provider = req.body.provider || req.body.data?.provider || 'openai'

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

    let model
    if (provider === 'gemini') {
      model = google('gemini-2.5-flash')
    } else {
      model = openai('gpt-4o-mini')
    }

    const result = streamText({
      model: model,
      system: systemInstruction,
      messages,
      temperature: 0.5,
      maxTokens: 300
    })
    result.pipeTextStreamToResponse(res)
  } catch (error) {
    console.error('Error generating AI response:', error)
    res.status(500).json({ error: 'Failed to generate response' })
  }
})
