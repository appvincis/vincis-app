import { prisma } from "../../lib/prisma.js";

const topicInclude = {
    include: {
        discipline: { select: { id: true, name: true, color: true } }
    }
} as const;

const errorLogInclude = {
    include: {
        topic: topicInclude
    }
} as const;

type CreateData = {
    analise: string;
    correcao?: string;
    fonte?: string;
    diagnostico?: string;
    topicText?: string;
    topicId?: number;
};

type UpdateData = {
    analise?: string;
    correcao?: string;
    fonte?: string;
    diagnostico?: string;
    topicText?: string;
    topicId?: number;
    isResolved?: boolean;
};

export const errorLogService = {

    async createErrorLog(data: CreateData, userId: number, studyPlanId: number) {
        // Se topicId fornecido, valida que pertence ao plano ativo
        if (data.topicId) {
            const topic = await prisma.topic.findFirst({
                where: { id: data.topicId, discipline: { studyPlanId } }
            });
            if (!topic) {
                throw new Error("Tópico não encontrado ou não pertence ao plano ativo.");
            }
        }

        return prisma.errorLog.create({
            data: {
                analise:     data.analise,
                correcao:    data.correcao,
                fonte:       data.fonte,
                diagnostico: data.diagnostico,
                topicText:   data.topicText,
                topicId:     data.topicId,
                userId,
                studyPlanId,
            },
            ...errorLogInclude
        });
    },

    async getErrorLogs(
        userId: number,
        studyPlanId: number,
        filters: { topicId?: number; disciplineId?: number }
    ) {
        return prisma.errorLog.findMany({
            where: {
                userId,
                studyPlanId,
                topic: filters.topicId || filters.disciplineId ? {
                    discipline: {
                        studyPlanId,
                        ...(filters.disciplineId ? { id: filters.disciplineId } : {})
                    },
                    ...(filters.topicId ? { id: filters.topicId } : {})
                } : undefined
            },
            ...errorLogInclude,
            orderBy: { createdAt: 'desc' }
        });
    },

    async getErrorLogById(id: number, userId: number) {
        return prisma.errorLog.findFirst({
            where: { id, userId },
            ...errorLogInclude
        });
    },

    async updateErrorLog(id: number, userId: number, studyPlanId: number, data: UpdateData) {
        const errorLog = await prisma.errorLog.findFirst({ where: { id, userId } });
        if (!errorLog) throw new Error("Registro não encontrado.");

        // Valida novo topicId se fornecido
        if (data.topicId) {
            const topic = await prisma.topic.findFirst({
                where: { id: data.topicId, discipline: { studyPlanId } }
            });
            if (!topic) throw new Error("Tópico não encontrado ou não pertence ao plano ativo.");
        }

        const resolvedAt =
            data.isResolved === true  ? new Date() :
            data.isResolved === false ? null :
            undefined;

        return prisma.errorLog.update({
            where: { id },
            data: {
                ...data,
                ...(resolvedAt !== undefined ? { resolvedAt } : {})
            },
            ...errorLogInclude
        });
    },

    async deleteErrorLog(id: number, userId: number) {
        const errorLog = await prisma.errorLog.findFirst({ where: { id, userId } });
        if (!errorLog) throw new Error("Registro não encontrado.");
        return prisma.errorLog.delete({ where: { id } });
    }
};
