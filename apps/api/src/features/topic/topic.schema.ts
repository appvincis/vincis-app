import { z } from 'zod';

export const createTopicSchema = z.object({
  name: z.string().min(1, "O nome do tópico é obrigatório."),
  description: z.string().optional(),
  disciplineId: z.number({ required_error: "ID da disciplina é obrigatório." })
});

export const updateTopicSchema = z.object({
  name: z.string().min(1, "O nome não pode ser vazio.").optional(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional()
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
