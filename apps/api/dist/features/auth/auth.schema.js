import { z } from 'zod';
export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});
export const signupSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z
        .string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres')
        .regex(/[a-zA-Z]/, 'A senha deve conter letras')
        .regex(/[0-9]/, 'A senha deve conter números'),
});
