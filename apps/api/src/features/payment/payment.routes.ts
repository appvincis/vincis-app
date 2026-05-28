import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { generatePremiumPix, handleWebhook } from './payment.controller.js';

export const paymentRouter = Router();

// Webhook (não tem autenticação da nossa plataforma, a AbacatePay que o chama)
paymentRouter.post('/webhook', handleWebhook);

// Rotas autenticadas do usuário
paymentRouter.use(requireAuth);
paymentRouter.post('/pix', generatePremiumPix);

