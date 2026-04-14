import 'dotenv/config'
import express, { Request, Response } from 'express'
import { userRouter } from './features/user/user.routes.js'
import { prisma } from './lib/prisma.js'

const PORT = Number(process.env.PORT) || 4000
const app = express()

app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
return res.send('oie')
})

app.get('/status', (_req: Request, res: Response) => {
return res.send('tamo on e roteando')
})

app.use('/users', userRouter)

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
