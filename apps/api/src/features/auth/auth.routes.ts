import { Router } from 'express'
import { signupSchema, loginSchema } from './auth.schema.js'
import { validateRequest } from '../../middlewares/validate.middleware.js'
import { signup, login, logout, refresh } from './auth.controller.js'
import { requireAuth, AuthenticatedRequest } from './auth.middleware.js'

export const authRouter = Router()

authRouter.post('/register', validateRequest(signupSchema), signup)
authRouter.post('/signup', validateRequest(signupSchema), signup) // Alias if needed

authRouter.post('/login', validateRequest(loginSchema), login)
authRouter.post('/logout', requireAuth, logout)
authRouter.post('/refresh', refresh) // Sem requireAuth — o access_token já expirou quando chega aqui

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
    return res.status(200).json({ 
        message: 'Acesso permitido', 
        user: {
            ...req.user,
            id: req.dbUser?.id,
            name: req.dbUser?.name,
            avatar: req.dbUser?.avatar,
            email: req.dbUser?.email || req.user?.email,
        }
    })
})
