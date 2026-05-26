import { prisma } from "../../lib/prisma.js";

export const disciplineService = {
    async createDiscipline(data: { name: string, description?: string, color: string, weight?: number }, studyPlanId: number) {
        return prisma.discipline.create({
            data: {
                name: data.name,
                description: data.description,
                color: data.color,
                weight: data.weight ?? 1.0,
                studyPlanId
            }
        });
    },

    async getDisciplines(studyPlanId: number) {
        return prisma.discipline.findMany({
            where: { studyPlanId },
            include: {
                topics: {
                    select: { isCompleted: true }
                }
            }
        });
    },

    async getDisciplineById(id: number, studyPlanId: number) {
        return prisma.discipline.findFirst({
            where: { id, studyPlanId }
        });
    },

    async updateDiscipline(id: number, studyPlanId: number, data: { name?: string, color?: string, weight?: number }) {
        const discipline = await prisma.discipline.findFirst({ where: { id, studyPlanId } });
        if (!discipline) throw new Error("Disciplina não encontrada ou não pertence ao plano ativo.");

        return prisma.discipline.update({
            where: { id },
            data
        });
    },

    async deleteDiscipline(id: number, studyPlanId: number) {
        const discipline = await prisma.discipline.findFirst({ where: { id, studyPlanId } });
        if (!discipline) throw new Error("Disciplina não encontrada ou não pertence ao plano ativo.");

        return prisma.discipline.delete({
            where: { id }
        });
    }
}
