import { prisma } from "../../lib/prisma.js";

export const focusSessionService = {
    async createSession(
        data: {
            disciplineId: number;
            duration: number;
            focusTime: number;
            breakTime: number;
            longBreakTime: number;
            cyclesTarget: number;
            cyclesCompleted: number;
            isCompleted: boolean;
            startedAt: string;
            finishedAt?: string;
            // Campos de Relatório Pós-Sessão
            modalities?: string[];
            topicId?: number | null;
            questionsDone?: number;
            questionsCorrect?: number;
        },
        studyPlanId: number,
        userId: number
    ) {
        const session = await prisma.focusSession.create({
            data: {
                duration: data.duration,
                focusTime: data.focusTime,
                breakTime: data.breakTime,
                longBreakTime: data.longBreakTime,
                cyclesTarget: data.cyclesTarget,
                cyclesCompleted: data.cyclesCompleted,
                isCompleted: data.isCompleted,
                startedAt: new Date(data.startedAt),
                finishedAt: data.finishedAt ? new Date(data.finishedAt) : null,
                modalities: data.modalities || [],
                topicId: data.topicId || null,
                questionsDone: data.questionsDone || 0,
                questionsCorrect: data.questionsCorrect || 0,
                disciplineId: data.disciplineId,
                studyPlanId,
                userId,
                updatedAt: new Date(),
            },
            include: {
                Discipline: {
                    select: { id: true, name: true, color: true },
                },
                Topic: {
                    select: { id: true, name: true },
                },
            },
        });
        return {
            ...session,
            discipline: session.Discipline,
            topic: session.Topic,
        };
    },

    async getSessions(studyPlanId: number) {
        const sessions = await prisma.focusSession.findMany({
            where: { studyPlanId },
            include: {
                Discipline: {
                    select: { id: true, name: true, color: true },
                },
                Topic: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return sessions.map((session) => ({
            ...session,
            discipline: session.Discipline,
            topic: session.Topic,
        }));
    },

    async getSessionsByDiscipline(disciplineId: number, studyPlanId: number) {
        const sessions = await prisma.focusSession.findMany({
            where: { disciplineId, studyPlanId },
            include: {
                Discipline: {
                    select: { id: true, name: true, color: true },
                },
                Topic: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return sessions.map((session) => ({
            ...session,
            discipline: session.Discipline,
            topic: session.Topic,
        }));
    },
};
