import { Router } from 'express';
import { signupSchema, loginSchema } from './auth.schema.js';
import { validateRequest } from './validate.middleware.js';
import { signup, login } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';
export const authRouter = Router();
authRouter.post('/register', validateRequest(signupSchema), signup);
authRouter.post('/signup', validateRequest(signupSchema), signup); // Alias if needed
authRouter.post('/login', validateRequest(loginSchema), login);
authRouter.get('/me', requireAuth, (req, res) => {
    return res.status(200).json({
        message: 'Acesso permitido',
        user: req.user
    });
});
