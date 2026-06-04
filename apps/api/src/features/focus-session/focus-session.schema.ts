import { z } from 'zod';

export const createFocusSessionSchema = z.object({
  disciplineId: z.number({ message: "O ID da disciplina é obrigatório." }),
  duration: z.number({ message: "A duração total é obrigatória." }),
  focusTime: z.number({ message: "O tempo de foco é obrigatório." }),
  breakTime: z.number({ message: "O tempo de pausa curta é obrigatório." }),
  longBreakTime: z.number({ message: "O tempo de pausa longa é obrigatório." }),
  cyclesTarget: z.number({ message: "A quantidade de ciclos é obrigatória." }),
  cyclesCompleted: z.number({ message: "Os ciclos completados são obrigatórios." }),
  isCompleted: z.boolean().default(false),
  startedAt: z.string({ message: "A data de início é obrigatória." }),
  finishedAt: z.string().optional(),
});

export type CreateFocusSessionInput = z.infer<typeof createFocusSessionSchema>;
