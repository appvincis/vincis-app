import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { userRouter } from './features/user/user.routes.js'
import { authRouter } from './features/auth/auth.routes.js'
import { prisma } from './lib/prisma.js'
import { studyPlanRouter } from './features/study-plan/study-plan.routes.js'

const PORT = Number(process.env.PORT) || 4000
const app = express()

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Endereço padrão do Vite
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

