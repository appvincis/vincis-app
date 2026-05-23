import { z } from 'zod';

export const DIAGNOSTICO_OPTIONS = [
    'Lacuna Teórica',
    'Falta de Atenção',
    'Interpretação',
    'Pegadinha',
    'Falta de Tempo',
] as const;

export const createErrorLogSchema = z.object({
    analise:     z.string().min(1, "Descreva por que você errou."),
    correcao:    z.string().optional(),
    fonte:       z.string().optional(),
    diagnostico: z.enum(DIAGNOSTICO_OPTIONS).optional(),
    topicText:   z.string().optional(),
    topicId:     z.number().optional(),
});

export const updateErrorLogSchema = z.object({
    analise:     z.string().min(1).optional(),
    correcao:    z.string().optional(),
    fonte:       z.string().optional(),
    diagnostico: z.enum(DIAGNOSTICO_OPTIONS).optional(),
    topicText:   z.string().optional(),
    topicId:     z.number().optional(),
    isResolved:  z.boolean().optional(),
});

export type CreateErrorLogInput  = z.infer<typeof createErrorLogSchema>;
export type UpdateErrorLogInput  = z.infer<typeof updateErrorLogSchema>;
export type DiagnosticoType      = typeof DIAGNOSTICO_OPTIONS[number];
