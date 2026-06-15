import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma.js', () => ({
    prisma: mockDeep<PrismaClient>()
}))

import { prisma } from '../../lib/prisma.js'
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

import { topicService } from './topic.service.js'

describe('Topic Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('CT-11: Deve criar um tópico garantindo que a disciplina pertença ao plano ativo', async () => {
        const mockData = { name: 'Crase', description: 'Regras de crase', disciplineId: 20 }
        const mockStudyPlanId = 1

        // Simula que a disciplina pertence ao plano
        prismaMock.discipline.findFirst.mockResolvedValue({
            id: 20, name: 'Português', description: null, color: '#f00', weight: 1, priority: 3, knowledgeLevel: 1, isActive: true, studyPlanId: 1, createdAt: new Date(), updatedAt: new Date()
        })

        const mockResponse = {
            id: 30,
            ...mockData,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        prismaMock.topic.create.mockResolvedValue(mockResponse)

        const result = await topicService.createTopic(mockData, mockStudyPlanId)

        expect(prismaMock.discipline.findFirst).toHaveBeenCalledWith({
            where: { id: mockData.disciplineId, studyPlanId: mockStudyPlanId }
        })
        expect(prismaMock.topic.create).toHaveBeenCalled()
        expect(result.id).toBe(30)
    })

    it('CT-12: Deve lançar erro ao criar tópico para disciplina de outro plano de estudos', async () => {
        // Retorna null simulando falha de segurança (disciplina não encontrada para esse plano)
        prismaMock.discipline.findFirst.mockResolvedValue(null)

        await expect(topicService.createTopic({ name: 'Matemática', disciplineId: 99 }, 1))
            .rejects
            .toThrow('Disciplina não encontrada ou não pertence ao plano ativo.')

        expect(prismaMock.topic.create).not.toHaveBeenCalled()
    })
})
