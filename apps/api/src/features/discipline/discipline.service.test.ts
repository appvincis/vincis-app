import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma.js', () => ({
    prisma: mockDeep<PrismaClient>()
}))

import { prisma } from '../../lib/prisma.js'
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

import { disciplineService } from './discipline.service.js'

describe('Discipline Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('CT-09: Deve criar uma nova disciplina para o plano de estudos', async () => {
        const mockData = { name: 'Português', description: 'Gramática e Interpretação', color: '#ff0000', weight: 2.0 }
        const mockStudyPlanId = 1

        const mockResponse = {
            id: 20,
            ...mockData,
            isActive: true,
            studyPlanId: mockStudyPlanId,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        prismaMock.discipline.create.mockResolvedValue(mockResponse)

        const result = await disciplineService.createDiscipline(mockData, mockStudyPlanId)

        expect(prismaMock.discipline.create).toHaveBeenCalledWith({
            data: {
                ...mockData,
                studyPlanId: mockStudyPlanId
            }
        })
        expect(result.id).toBe(20)
        expect(result.name).toBe('Português')
    })

    it('CT-10: Deve impedir atualização de disciplina inexistente ou não autorizada', async () => {
        prismaMock.discipline.findFirst.mockResolvedValue(null)

        await expect(disciplineService.updateDiscipline(999, 1, { name: 'Matemática' }))
            .rejects
            .toThrow('Disciplina não encontrada ou não pertence ao plano ativo.')

        expect(prismaMock.discipline.update).not.toHaveBeenCalled()
    })
})
