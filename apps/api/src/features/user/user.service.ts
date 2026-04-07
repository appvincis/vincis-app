import { prisma } from '../../lib/prisma.js'
import type { CreateUserInput, UpdateUserInput } from './user.types.js'

export const userService = {
    list() {
        return prisma.user.findMany({ orderBy: { id: 'asc' } })
    },

    getById(id: number) {
        return prisma.user.findUnique({ where: { id } })
    },

    create(data: CreateUserInput) {
        return prisma.user.create({ data })
    },

    async update(id: number, data: UpdateUserInput) {
        const exists = await prisma.user.findUnique({ where: { id } })
        if (!exists) return null
        return prisma.user.update({ where: { id }, data })
    },

    async remove(id: number) {
        const exists = await prisma.user.findUnique({ where: { id } })
        if (!exists) return null
        return prisma.user.delete({ where: { id } })
    },
}