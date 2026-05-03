import { z } from 'zod';

export const createStudyPlanSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(false)
});

export const updateStudyPlanSchema = z.object({
  name: z.string().min(1, "O nome não pode ser vazio.").optional(),
  description: z.string().optional()
});

export const selectStudyPlanSchema = z.object({
  studyPlanId: z.number({ required_error: "ID do plano de estudo é obrigatório." })
});

export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
export type UpdateStudyPlanInput = z.infer<typeof updateStudyPlanSchema>;
