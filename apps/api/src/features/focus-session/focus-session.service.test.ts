import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma.js', () => ({
    prisma: mockDeep<PrismaClient>()
}))

import { prisma } from '../../lib/prisma.js'
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

import { focusSessionService } from './focus-session.service.js'

describe('Focus Session Service - Fluxos Críticos', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('CT-07: Deve registrar uma sessão de foco com sucesso', async () => {
        const mockData = {
            disciplineId: 5,
            duration: 1500, // 25 min em segundos
            focusTime: 1500,
            breakTime: 300,
            longBreakTime: 900,
            cyclesTarget: 4,
            cyclesCompleted: 1,
            isCompleted: true,
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        }
        const mockStudyPlanId = 1
        const mockUserId = 2

        const mockDiscipline = { id: 5, name: 'Matemática', color: '#ff0000' }

        const mockResponse = {
            id: 100,
            duration: mockData.duration,
            focusTime: mockData.focusTime,
            breakTime: mockData.breakTime,
            longBreakTime: mockData.longBreakTime,
            cyclesTarget: mockData.cyclesTarget,
            cyclesCompleted: mockData.cyclesCompleted,
            isCompleted: mockData.isCompleted,
            startedAt: new Date(mockData.startedAt),
            finishedAt: new Date(mockData.finishedAt),
            disciplineId: mockData.disciplineId,
            studyPlanId: mockStudyPlanId,
            userId: mockUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
            Discipline: mockDiscipline
        }

        prismaMock.focusSession.create.mockResolvedValue(mockResponse)

        const result = await focusSessionService.createSession(mockData, mockStudyPlanId, mockUserId)

        expect(prismaMock.focusSession.create).toHaveBeenCalled()
        expect(result.id).toBe(100)
        expect(result.discipline).toEqual(mockDiscipline)
        expect(result.isCompleted).toBe(true)
    })

    it('CT-08: Deve listar sessões de foco por plano de estudos', async () => {
        const mockStudyPlanId = 1
        
        const mockDiscipline = { id: 5, name: 'Matemática', color: '#ff0000' }
        const mockList = [
            {
                id: 100,
                duration: 1500,
                focusTime: 1500,
                breakTime: 300,
                longBreakTime: 900,
                cyclesTarget: 4,
                cyclesCompleted: 1,
                isCompleted: true,
                startedAt: new Date(),
                finishedAt: new Date(),
                disciplineId: 5,
                studyPlanId: mockStudyPlanId,
                userId: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                Discipline: mockDiscipline
            }
        ]

        prismaMock.focusSession.findMany.mockResolvedValue(mockList)

        const result = await focusSessionService.getSessions(mockStudyPlanId)

        expect(prismaMock.focusSession.findMany).toHaveBeenCalledWith({
            where: { studyPlanId: mockStudyPlanId },
            include: {
                Discipline: {
                    select: { id: true, name: true, color: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })
        expect(result).toHaveLength(1)
        expect(result[0].discipline.name).toBe('Matemática')
    })
})
