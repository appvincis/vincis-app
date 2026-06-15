import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma.js', () => ({
    prisma: mockDeep<PrismaClient>()
}))

import { prisma } from '../../lib/prisma.js'
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

import { errorLogService } from './error-log.service.js'

describe('Error Log Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('CT-13: Deve criar um log de erro validando a segurança do tópico informado', async () => {
        const mockData = {
            analise: 'Errei por desatenção na vírgula',
            correcao: 'Revisar regras de vírgula antes do e',
            topicId: 30
        }
        const mockUserId = 2
        const mockStudyPlanId = 1

        // Mock confirmando que o tópico pertence à disciplina e ao plano correto
        prismaMock.topic.findFirst.mockResolvedValue({
            id: 30, name: 'Crase', description: null, isCompleted: false, disciplineId: 20, createdAt: new Date(), updatedAt: new Date()
        })

        const mockResponse = {
            id: 50,
            analise: mockData.analise,
            correcao: mockData.correcao,
            fonte: null,
            diagnostico: null,
            topicText: null,
            isResolved: false,
            resolvedAt: null,
            topicId: 30,
            userId: mockUserId,
            studyPlanId: mockStudyPlanId,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        prismaMock.errorLog.create.mockResolvedValue(mockResponse as any)

        const result = await errorLogService.createErrorLog(mockData, mockUserId, mockStudyPlanId)

        expect(prismaMock.topic.findFirst).toHaveBeenCalledWith({
            where: { id: 30, discipline: { studyPlanId: mockStudyPlanId } }
        })
        expect(prismaMock.errorLog.create).toHaveBeenCalled()
        expect(result.id).toBe(50)
    })

    it('CT-14: Deve listar os logs de erro aplicando os filtros de tópico/disciplina', async () => {
        prismaMock.errorLog.findMany.mockResolvedValue([])

        await errorLogService.getErrorLogs(2, 1, { topicId: 30 })

        // Onde foi chamado, deve incluir o filtro aninhado de topic e discipline
        expect(prismaMock.errorLog.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: 2,
                    studyPlanId: 1,
                    topic: expect.objectContaining({
                        id: 30
                    })
                })
            })
        )
    })
})
