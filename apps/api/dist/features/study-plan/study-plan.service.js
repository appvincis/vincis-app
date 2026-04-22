import { prisma } from "../../lib/prisma.js";
export const studyPlanService = {
    createStudyPlan: async (data, userId) => {
        return prisma.studyPlan.create({
            data: {
                name: data.name,
                description: data.description,
                is_active: data.is_active,
                userId: userId
            }
        });
    },
    getStudyPlans: async (userId) => {
        return prisma.studyPlan.findMany({
            where: {
                userId: userId
            }
        });
    },
    getStudyPlanById: async (studyPlanId, userId) => {
        return prisma.studyPlan.findFirst({
            where: {
                id: studyPlanId,
                userId: userId
            }
        });
    },
    setStudyPlanActive: async (studyPlanId, userId) => {
        const plan = await prisma.studyPlan.findFirst({
            where: { id: studyPlanId, userId: userId }
        });
        if (!plan)
            throw new Error("Plano de estudo não encontrado ou não autorizado.");
        return prisma.studyPlan.update({
            where: {
                id: studyPlanId
            },
            data: {
                is_active: true
            }
        });
    },
    deleteStudyPlan: async (id, userId) => {
        const plan = await prisma.studyPlan.findFirst({
            where: { id, userId }
        });
        if (!plan)
            throw new Error("Plano de estudo não encontrado ou não autorizado.");
        return prisma.studyPlan.delete({
            where: {
                id
            }
        });
    },
    updateStudyPlan: async (studyPlanId, userId, data) => {
        const plan = await prisma.studyPlan.findFirst({
            where: { id: studyPlanId, userId: userId }
        });
        if (!plan)
            throw new Error("Plano de estudo não encontrado ou não autorizado.");
        return prisma.studyPlan.update({
            where: {
                id: studyPlanId
            },
            data: {
                name: data.name,
                description: data.description
            }
        });
    }
};
