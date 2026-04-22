import { supabase } from '../../lib/supabase.js';
import { userService } from '../user/user.service.js';
export const requireAuth = async (req, res, next) => {
    // 1. Extrair o token dos cookies
    const accessToken = req.cookies?.access_token;
    if (!accessToken) {
        return res.status(401).json({ message: 'Acesso negado: Token não fornecido no cookie.' });
    }
    try {
        // 2. Validar a sessão ativa chamando a verificação do Supabase com o token específico do cliente atual
        // Isso é seguro em ambiente de servidor (não manipula a sessão global do client)
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (error || !user) {
            return res.status(401).json({ message: 'Não autorizado: Token inválido ou expirado.' });
        }
        // 3. Atribuir o usuário Supabase validado à requisição
        req.user = user;
        // 4. Buscar e atribuir o usuário da aplicação (Prisma) via supabaseId
        const dbUser = await userService.getBySupabaseId(user.id);
        if (!dbUser) {
            return res.status(401).json({ message: 'Não autorizado: Usuário da aplicação não encontrado.' });
        }
        req.dbUser = dbUser;
        return next();
    }
    catch (err) {
        return res.status(500).json({ message: 'Erro interno ao verificar a autenticação.' });
    }
};
