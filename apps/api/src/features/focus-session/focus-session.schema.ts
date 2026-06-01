import { z } from 'zod';

export const createFocusSessionSchema = z.object({
  disciplineId: z.number({ required_error: "O ID da disciplina é obrigatório." }),
  duration: z.number({ required_error: "A duração total é obrigatória." }),
  focusTime: z.number({ required_error: "O tempo de foco é obrigatório." }),
  breakTime: z.number({ required_error: "O tempo de pausa curta é obrigatório." }),
  longBreakTime: z.number({ required_error: "O tempo de pausa longa é obrigatório." }),
  cyclesTarget: z.number({ required_error: "A quantidade de ciclos é obrigatória." }),
  cyclesCompleted: z.number({ required_error: "Os ciclos completados são obrigatórios." }),
  isCompleted: z.boolean().default(false),
  startedAt: z.string({ required_error: "A data de início é obrigatória." }),
  finishedAt: z.string().optional(),
});

export type CreateFocusSessionInput = z.infer<typeof createFocusSessionSchema>;
