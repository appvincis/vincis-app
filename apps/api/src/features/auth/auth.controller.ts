import { Request, Response } from 'express'
import { supabase } from '../../lib/supabase.js'
import { SignupInput, LoginInput } from './auth.schema.js'
import { userService } from '../user/user.service.js'

const isProduction = process.env.NODE_ENV === 'production';
const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    path: '/',
}

export async function signup(req: Request<{}, {}, SignupInput>, res: Response) {
    const { email, password, name } = req.body

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
            name, // Passa o nome para gravar no banco
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
                name: dbUser.name,
                avatar: dbUser.avatar,
                plan: dbUser.plan,
            },
        })
    } catch (err) {
        console.error('Erro detalhado no signup:', err)
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

        // Define os cookies reutilizando as opções base
        res.cookie('access_token', session.access_token, {
            ...baseCookieOptions,
            maxAge: session.expires_in * 1000,
        })

        res.cookie('refresh_token', session.refresh_token, {
            ...baseCookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({
            message: 'Login realizado com sucesso',
            user: {
                id: dbUser.id,
                supabaseId: dbUser.supabaseId,
                email: dbUser.email,
                name: dbUser.name,
                avatar: dbUser.avatar,
                plan: dbUser.plan,
            },
        })
    } catch (err) {
        console.error('Erro detalhado no login:', err)
        return res.status(500).json({ message: 'Erro interno durante o login' })
    }
}


export async function logout(_req: Request, res: Response) {
    try {
        // Limpa os cookies HttpOnly — apenas o servidor consegue fazer isso
        res.clearCookie('access_token', baseCookieOptions)
        res.clearCookie('refresh_token', baseCookieOptions)

        return res.status(200).json({ message: 'Logout realizado com sucesso' })
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno durante o logout' })
    }
}


export async function refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refresh_token

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token não encontrado.' })
    }

    try {
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        })

        if (error || !data.session) {
            // Refresh token inválido ou expirado — limpa os cookies
            res.clearCookie('access_token', baseCookieOptions)
            res.clearCookie('refresh_token', baseCookieOptions)
            return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' })
        }

        const { session } = data

        // Define os novos cookies com os tokens atualizados
        res.cookie('access_token', session.access_token, {
            ...baseCookieOptions,
            maxAge: session.expires_in * 1000,
        })

        res.cookie('refresh_token', session.refresh_token, {
            ...baseCookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({ message: 'Token renovado com sucesso' })
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno ao renovar o token' })
    }
}

export async function googleLogin(req: Request, res: Response) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            },
        })

        if (error) {
            return res.status(400).json({ message: error.message })
        }

        if (data?.url) {
            return res.redirect(data.url)
        }
        
        return res.status(400).json({ message: 'Não foi possível gerar a URL de autenticação do Google.' })
    } catch (err: any) {
        console.error('Erro no googleLogin:', err)
        return res.status(500).json({ message: 'Erro interno ao iniciar login com Google' })
    }
}

export async function authCallback(req: Request, res: Response) {
    const { access_token, refresh_token, expires_in } = req.body

    if (!access_token || !refresh_token) {
        return res.status(400).json({ message: 'Tokens de autenticação não fornecidos.' })
    }

    try {
        // Valida o access_token buscando o usuário autenticado no Supabase
        const { data: { user }, error } = await supabase.auth.getUser(access_token)

        if (error || !user) {
            console.error('Erro ao validar token do Google:', error)
            return res.status(401).json({ message: error?.message || 'Token inválido ou expirado.' })
        }

        let dbUser = await userService.getBySupabaseId(user.id)

        if (!dbUser) {
            dbUser = await userService.createFromAuth({
                supabaseId: user.id,
                email: user.email!,
                name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                avatar: user.user_metadata?.avatar_url || '',
            })
        }

        const tokenMaxAge = typeof expires_in === 'number' ? expires_in * 1000 : 3600 * 1000

        res.cookie('access_token', access_token, {
            ...baseCookieOptions,
            maxAge: tokenMaxAge,
        })

        res.cookie('refresh_token', refresh_token, {
            ...baseCookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({
            message: 'Login com Google realizado com sucesso',
            user: {
                id: dbUser.id,
                supabaseId: dbUser.supabaseId,
                email: dbUser.email,
                name: dbUser.name,
                avatar: dbUser.avatar,
                plan: dbUser.plan,
            }
        })
    } catch (err: any) {
        console.error('Erro no callback do Google Auth:', err)
        return res.status(500).json({ message: err.message || 'Erro interno no callback de autenticação.' })
    }
}

