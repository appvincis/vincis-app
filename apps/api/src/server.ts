import express, { Request, Response } from 'express'
import { userRouter } from './features/user/user.routes.js'

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

app.listen(PORT, () => {
console.log('Listening on port: ' + PORT)
}