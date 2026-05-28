import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { userRouter } from './features/user/user.routes.js'
import { authRouter } from './features/auth/auth.routes.js'
import { prisma } from './lib/prisma.js'
import { studyPlanRouter } from './features/study-plan/study-plan.routes.js'

import { disciplineRouter } from './features/discipline/discipline.routes.js'
import { topicRouter } from './features/topic/topic.routes.js'
import { errorLogRouter } from './features/error-log/error-log.routes.js'
import { editalRouter } from './features/edital/edital.routes.js'
import { paymentRouter } from './features/payment/payment.routes.js'

const PORT = Number(process.env.PORT) || 4000
const app = express()

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'], // Endereços padrão do Vite
    credentials: true // Necessário para enviar/receber cookies
}))
app.use(cookieParser())
app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
    return res.send('oie')
})

app.get('/status', (_req: Request, res: Response) => {
    return res.send('tamo on e roteando')
})

app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use("/study-plans", studyPlanRouter)
app.use("/disciplines", disciplineRouter)
app.use("/topics", topicRouter)
app.use("/error-logs", errorLogRouter)
app.use("/editais", editalRouter)
app.use("/payments", paymentRouter)

// Verifica conexão com banco antes de escutar na porta
prisma.$connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Back end conectado com banco e escutando na porta ${PORT}`)
        })
    })
    .catch((err) => {
        console.error('Falha ao conectar no banco:', err)
        process.exit(1)
    })
// Trigger reload to pick up new Prisma Client schema and tables
