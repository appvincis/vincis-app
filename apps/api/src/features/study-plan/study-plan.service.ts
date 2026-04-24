import { prisma } from "../../lib/prisma.js"
import { CreateStudyPlanInput, UpdateStudyPlanInput } from "./study-plan.types.js"

export const studyPlanService = {
    createStudyPlan: async (data: CreateStudyPlanInput, userId: number) => {
        return prisma.studyPlan.create({
            data: {
                name: data.name,
                description: data.description,
                is_active: data.is_active,
                userId: userId
            }
        })
    },
    getStudyPlans: async (userId: number) => {
        return prisma.studyPlan.findMany({
            where: {
                userId: userId
            }
        })
    },
    getStudyPlanById: async (studyPlanId: number, userId: number) => {
        return await prisma.studyPlan.findFirst({
            where: {
                id: studyPlanId,
                userId: userId
            }
        })
    },
    setStudyPlanActive: async (studyPlanId: number, userId: number) => {
        const plan = await prisma.studyPlan.findFirst({
            where: { id: studyPlanId, userId: userId }
        })
        if (!plan) throw new Error("Plano de estudo não encontrado ou não autorizado.")

        return prisma.studyPlan.update({
            where: {
                id: studyPlanId
            },
            data: {
                is_active: true
            }
        })
    },
    deleteStudyPlan: async (id: number, userId: number) => {
        const plan = await prisma.studyPlan.findFirst({
            where: { id, userId }
        })
        if (!plan) throw new Error("Plano de estudo não encontrado ou não autorizado.")

        return prisma.studyPlan.delete({
            where: {
                id
            }
        })
    },
    updateStudyPlan: async (studyPlanId: number, userId: number, data: UpdateStudyPlanInput) => {
        const plan = await prisma.studyPlan.findFirst({
            where: { id: studyPlanId, userId: userId }
        })
        if (!plan) throw new Error("Plano de estudo não encontrado ou não autorizado.")

        return prisma.studyPlan.update({
            where: {
                id: studyPlanId
            },
            data: {
                name: data.name,
                description: data.description
            }
        })
    }
}