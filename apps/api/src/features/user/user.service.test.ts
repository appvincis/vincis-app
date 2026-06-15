import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient, Plan } from '@prisma/client'

vi.mock('../../lib/prisma.js', () => ({
    prisma: mockDeep<PrismaClient>()
}))

import { prisma } from '../../lib/prisma.js'
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// Importamos o userService que utilizará o prisma já mockado
import { userService } from './user.service.js'

describe('User Service - Fluxos Críticos', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('CT-01: Deve consultar um usuário pelo ID corretamente', async () => {
        const mockUser = {
            id: 1,
            email: 'aluno@cefet.br',
            name: 'Aluno Teste',
            avatar: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            supabaseId: 'supa-123',
            plan: Plan.BASIC,
            planExpiresAt: null,
        }

        prismaMock.user.findUnique.mockResolvedValue(mockUser)

        const result = await userService.getById(1)

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } })
        expect(result).toEqual(mockUser)
    })

    it('CT-02: Deve criar um novo usuário via Auth garantindo o plano BASIC inicial', async () => {
        const mockInput = {
            supabaseId: 'supa-999',
            email: 'novo@cefet.br',
            name: 'Novo Aluno',
            avatar: 'avatar.png'
        }

        const mockResponse = {
            id: 2,
            ...mockInput,
            createdAt: new Date(),
            updatedAt: new Date(),
            plan: Plan.BASIC,
            planExpiresAt: null,
        }

        prismaMock.user.upsert.mockResolvedValue(mockResponse)

        const result = await userService.createFromAuth(mockInput)

        expect(prismaMock.user.upsert).toHaveBeenCalledWith({
            where: { supabaseId: mockInput.supabaseId },
            update: {},
            create: {
                ...mockInput,
                plan: Plan.BASIC
            }
        })
        expect(result?.plan).toBe(Plan.BASIC)
        expect(result?.email).toBe('novo@cefet.br')
    })

    it('CT-03: Deve atualizar o plano de assinatura do usuário corretamente', async () => {
        const mockUser = {
            id: 1,
            email: 'aluno@cefet.br',
            name: 'Aluno Teste',
            avatar: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            supabaseId: 'supa-123',
            plan: Plan.BASIC,
            planExpiresAt: null,
        }

        prismaMock.user.findUnique.mockResolvedValue(mockUser)
        prismaMock.user.update.mockResolvedValue({
            ...mockUser,
            plan: Plan.PREMIUM
        })

        const result = await userService.updatePlan(1, 'PREMIUM')

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } })
        expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { plan: 'PREMIUM' }
        })
        expect(result?.plan).toBe(Plan.PREMIUM)
    })

    it('CT-04: Deve retornar erro ao tentar atualizar plano com tipo inválido', async () => {
        await expect(userService.updatePlan(1, 'PLANO_LOUCO')).rejects.toThrow('Plano inválido: PLANO_LOUCO')
    })
})
