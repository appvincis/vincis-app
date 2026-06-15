import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma.js', () => ({
    prisma: mockDeep<PrismaClient>()
}))

import { prisma } from '../../lib/prisma.js'
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

import { studyPlanService } from './study-plan.service.js'

describe('Study Plan Service - Fluxos Críticos', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('CT-04: Deve criar um plano de estudos com sucesso vinculado ao usuário', async () => {
        const mockInput = {
            name: 'Plano CNU 2024',
            description: 'Foco total no edital X',
            is_active: true
        }
        
        const mockUserId = 1

        const mockResponse = {
            id: 10,
            ...mockInput,
            userId: mockUserId,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        prismaMock.studyPlan.create.mockResolvedValue(mockResponse)

        const result = await studyPlanService.createStudyPlan(mockInput, mockUserId)

        expect(prismaMock.studyPlan.create).toHaveBeenCalledWith({
            data: {
                ...mockInput,
                userId: mockUserId
            }
        })
        expect(result.id).toBe(10)
        expect(result.name).toBe('Plano CNU 2024')
    })

    it('CT-05: Deve listar os planos de estudos de um estudante específico', async () => {
        const mockUserId = 1
        const mockList = [
            { id: 10, name: 'Plano A', description: null, is_active: true, userId: mockUserId, createdAt: new Date(), updatedAt: new Date() },
            { id: 11, name: 'Plano B', description: null, is_active: false, userId: mockUserId, createdAt: new Date(), updatedAt: new Date() }
        ]

        prismaMock.studyPlan.findMany.mockResolvedValue(mockList)

        const result = await studyPlanService.getStudyPlans(mockUserId)

        expect(prismaMock.studyPlan.findMany).toHaveBeenCalledWith({
            where: { userId: mockUserId }
        })
        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('Plano A')
    })

    it('CT-06: Deve garantir que exclusão de plano não autorizado lance um erro', async () => {
        const mockPlanId = 10
        const mockUserId = 2 // Usuário que não é o dono

        // Simula que o Prisma não encontrou o plano porque não pertence a este usuário
        prismaMock.studyPlan.findFirst.mockResolvedValue(null)

        await expect(studyPlanService.deleteStudyPlan(mockPlanId, mockUserId))
            .rejects
            .toThrow('Plano de estudo não encontrado ou não autorizado.')

        expect(prismaMock.studyPlan.findFirst).toHaveBeenCalledWith({
            where: { id: mockPlanId, userId: mockUserId }
        })
        expect(prismaMock.studyPlan.delete).not.toHaveBeenCalled()
    })
})
