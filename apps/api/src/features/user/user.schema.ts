import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email("E-mail inválido."),
  name: z.string().optional()
});

export const createAuthUserSchema = z.object({
  supabaseId: z.string(),
  email: z.string().email(),
  name: z.string().optional()
});

export const updateUserSchema = z.object({
  email: z.string().email("E-mail inválido.").optional(),
  name: z.string().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateUserFromAuthInput = z.infer<typeof createAuthUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
