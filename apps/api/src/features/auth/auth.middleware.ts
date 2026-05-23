import { Request, Response, NextFunction } from 'express'
import { supabase } from '../../lib/supabase.js'
import { User } from '@supabase/supabase-js'
import { User as DbUser } from '@prisma/client'
import { userService } from '../user/user.service.js'

export interface AuthenticatedRequest extends Request {
    user?: User
    dbUser?: DbUser
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1. Extrair o token dos cookies
    const accessToken = req.cookies?.access_token

    if (!accessToken) {
        return res.status(401).json({ message: 'Acesso negado: Token não fornecido no cookie.' })
    }

    try {
        // 2. Validar a sessão ativa chamando a verificação do Supabase com o token específico do cliente atual
        // Isso é seguro em ambiente de servidor (não manipula a sessão global do client)
        const { data: { user }, error } = await supabase.auth.getUser(accessToken)

        if (error || !user) {
            return res.status(401).json({ message: 'Não autorizado: Token inválido ou expirado.' })
        }

        // 3. Atribuir o usuário Supabase validado à requisição
        req.user = user

        // 4. Buscar e atribuir o usuário da aplicação (Prisma) via supabaseId
        const dbUser = await userService.getBySupabaseId(user.id)
        if (!dbUser) {
            return res.status(401).json({ message: 'Não autorizado: Usuário da aplicação não encontrado.' })
        }
        req.dbUser = dbUser

        return next()
    } catch (err) {
        console.error('Erro no middleware requireAuth:', err)
        return res.status(500).json({ message: 'Erro interno ao verificar a autenticação.' })
    }
}
