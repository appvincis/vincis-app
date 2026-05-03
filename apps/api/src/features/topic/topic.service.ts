import { prisma } from "../../lib/prisma.js";

export const topicService = {
    async createTopic(data: { name: string, description?: string, disciplineId: number }, studyPlanId: number) {
        // Verifica se a disciplina pertence ao plano de estudo atual
        const discipline = await prisma.discipline.findFirst({
            where: { id: data.disciplineId, studyPlanId }
        });

        if (!discipline) {
            throw new Error("Disciplina não encontrada ou não pertence ao plano ativo.");
        }

        return prisma.topic.create({
            data: {
                name: data.name,
                description: data.description,
                disciplineId: data.disciplineId
            }
        });
    },

    async getTopicsByDiscipline(disciplineId: number, studyPlanId: number) {
        // Verifica se a disciplina pertence ao plano de estudo
        const discipline = await prisma.discipline.findFirst({
            where: { id: disciplineId, studyPlanId }
        });

        if (!discipline) {
            throw new Error("Disciplina não encontrada ou não pertence ao plano ativo.");
        }

        return prisma.topic.findMany({
            where: { disciplineId }
        });
    },

    async getTopicById(id: number, studyPlanId: number) {
        const topic = await prisma.topic.findUnique({
            where: { id },
            include: { discipline: true }
        });

        if (!topic || topic.discipline.studyPlanId !== studyPlanId) {
            return null;
        }

        return topic;
    },

    async updateTopic(id: number, studyPlanId: number, data: { name?: string, description?: string, isCompleted?: boolean }) {
        const topic = await prisma.topic.findUnique({
            where: { id },
            include: { discipline: true }
        });

        if (!topic || topic.discipline.studyPlanId !== studyPlanId) {
            throw new Error("Tópico não encontrado ou não pertence ao plano ativo.");
        }

        return prisma.topic.update({
            where: { id },
            data
        });
    },

    async deleteTopic(id: number, studyPlanId: number) {
        const topic = await prisma.topic.findUnique({
            where: { id },
            include: { discipline: true }
        });

        if (!topic || topic.discipline.studyPlanId !== studyPlanId) {
            throw new Error("Tópico não encontrado ou não pertence ao plano ativo.");
        }

        return prisma.topic.delete({
            where: { id }
        });
    }
}
