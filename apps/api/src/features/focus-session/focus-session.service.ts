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
        },
        studyPlanId: number,
        userId: number
    ) {
        return prisma.focusSession.create({
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
                disciplineId: data.disciplineId,
                studyPlanId,
                userId,
                updatedAt: new Date(),
            },
            include: {
                Discipline: {
                    select: { id: true, name: true, color: true },
                },
            },
        });
    },

    async getSessions(studyPlanId: number) {
        return prisma.focusSession.findMany({
            where: { studyPlanId },
            include: {
                Discipline: {
                    select: { id: true, name: true, color: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    async getSessionsByDiscipline(disciplineId: number, studyPlanId: number) {
        return prisma.focusSession.findMany({
            where: { disciplineId, studyPlanId },
            include: {
                Discipline: {
                    select: { id: true, name: true, color: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    },
};
