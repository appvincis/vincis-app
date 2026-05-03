import { z } from 'zod';

export const createDisciplineSchema = z.object({
  name: z.string().min(1, "O nome da disciplina é obrigatório."),
  color: z.string().min(1, "A cor da disciplina é obrigatória."),
  weight: z.number().optional().default(1.0)
});

export const updateDisciplineSchema = z.object({
  name: z.string().min(1, "O nome da disciplina não pode ser vazio.").optional(),
  color: z.string().min(1, "A cor não pode ser vazia.").optional(),
  weight: z.number().optional()
});

export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;
