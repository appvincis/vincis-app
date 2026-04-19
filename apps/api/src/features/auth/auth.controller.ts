import { Request, Response } from 'express'
import { supabase } from '../../lib/supabase.js'
import { SignupInput, LoginInput } from './auth.schema.js'
import { userService } from '../user/user.service.js'

export async function signup(req: Request<{}, {}, SignupInput>, res: Response) {
    const { email, password } = req.body

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            return res.status(error.status || 400).json({ message: error.message })
        }

        const supabaseUser = data.user
        if (!supabaseUser) {
            return res.status(400).json({ message: 'Usuário não criado. Verifique as configurações do projeto.' })
        }

        // Cria/garante que existe o registro do usuário no banco de dados da aplicação
        const dbUser = await userService.createFromAuth({
            supabaseId: supabaseUser.id,
            email: supabaseUser.email!,
        })

        // Se require_email_confirmation estiver ativado no Supabase, a sessão será null até o usuário confirmar.
        // Se estiver desativado, user e session virão preenchidos.
        const message = data.session
            ? 'Cadastro realizado com sucesso'
            : 'Verifique seu e-mail para confirmar o cadastro'

        return res.status(201).json({
            message,
            user: {
                id: dbUser.id,
                supabaseId: dbUser.supabaseId,
                email: dbUser.email,
            },
        })
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno durante o cadastro' })
    }
}


export async function login(req: Request<{}, {}, LoginInput>, res: Response) {
    const { email, password } = req.body

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return res.status(error.status || 400).json({ message: error.message })
        }

        const { session, user } = data

        if (!session) {
            return res.status(400).json({ message: 'Sessão não foi criada. Verifique as configurações do projeto.' })
        }

        let dbUser = await userService.getBySupabaseId(user.id)
        if (!dbUser) {
            dbUser = await userService.createFromAuth({
                supabaseId: user.id,
                email: user.email!,
            })
        }

        // Definindo as opções do cookie de forma segura
        const cookieOptions = {
            httpOnly: true, // Impede acesso via JavaScript (XSS)
            secure: process.env.NODE_ENV === 'production', // Só trafega em HTTPS em prod
            sameSite: 'strict' as const, // Proteção contra CSRF
            path: '/', // Válido em toda a aplicação
        }

        // Define os cookies
        res.cookie('access_token', session.access_token, {
            ...cookieOptions,
            maxAge: session.expires_in * 1000, // maxAge é em milissegundos
        })

        res.cookie('refresh_token', session.refresh_token, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias para expirar o refresh token
        })

        return res.status(200).json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                supabaseId: dbUser.supabaseId,
                email: dbUser.email,
            },
        })
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno durante o login' })
    }
}
