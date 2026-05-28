import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { prisma } from '../../lib/prisma.js';

export const generatePremiumPix = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.dbUser?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        const apiKey = process.env.ABACATEPAY_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Chave de API de pagamento não configurada no servidor' });
        }

        // Valor do plano Premium em centavos (R$ 19,90)
        const amount = 1990;
        
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                frequency: 'ONE_TIME',
                methods: ['PIX'],
                products: [{
                    externalId: 'premium-1m',
                    name: 'Vincis Premium',
                    description: 'Assinatura Premium de 1 mês',
                    quantity: 1,
                    price: amount
                }],
                customer: {
                    name: user?.name || 'Usuário Vincis',
                    email: user?.email || 'usuario@vincis.com',
                    taxId: '11144477735', // CPF válido generic para testes devMode
                    cellphone: '11999999999'
                },
                returnUrl: 'http://localhost:5173/private/plans',
                completionUrl: 'http://localhost:5173/private/plans',
                metadata: { userId }
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error('Erro na AbacatePay Billing:', data);
            return res.status(500).json({ error: 'Falha ao gerar cobrança com o provedor' });
        }

        // Retornamos a URL de checkout hospedada pela AbacatePay!
        return res.status(200).json({
            checkoutUrl: data.data.url,
            billingId: data.data.id,
            devMode: data.data.devMode
        });

    } catch (error) {
        console.error('Erro ao gerar PIX Premium:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

export const handleWebhook = async (req: Request, res: Response): Promise<any> => {
    try {
        const { event, data } = req.body;

        // Log para visualizar o webhook chegando no terminal
        console.log(`[Webhook Recebido] Evento: ${event}`);

        // 'billing.paid' ou 'PIX.PAID' ou similar dependendo da versão da AbacatePay
        if (event === 'billing.paid' || data?.billing?.status === 'PAID') {
            const userId = data?.billing?.metadata?.userId;

            if (userId) {
                await prisma.user.update({
                    where: { id: Number(userId) },
                    data: { plan: 'PREMIUM' }
                });
                console.log(`[Webhook] ✅ Usuário ${userId} atualizado para PREMIUM com sucesso!`);
            } else {
                console.log('[Webhook] ⚠️ userId não encontrado no metadata do payload.');
            }
        }

        // A AbacatePay exige que você responda 200 rapidamente
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Erro no processamento do Webhook:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};
