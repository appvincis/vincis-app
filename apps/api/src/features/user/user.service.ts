import { prisma } from '../../lib/prisma.js'
import type { CreateUserInput, CreateUserFromAuthInput, UpdateUserInput } from './user.schema.js'

export const userService = {
    list() {
        return prisma.user.findMany({ orderBy: { id: 'asc' } })
    },

    getById(id: number) {
        return prisma.user.findUnique({ where: { id } })
    },

    getBySupabaseId(supabaseId: string) {
        return prisma.user.findUnique({ where: { supabaseId } })
    },

    create(data: CreateUserInput) {
        return prisma.user.create({ data })
    },

    createFromAuth(data: CreateUserFromAuthInput) {
        return prisma.user.upsert({
            where: { supabaseId: data.supabaseId },
            update: {},               // Already exists — do nothing
            create: {
                supabaseId: data.supabaseId,
                email: data.email,
                name: data.name,
                avatar: data.avatar,
            },
        })
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
