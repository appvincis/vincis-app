import { prisma } from '../../lib/prisma.js';
export const userService = {
    list() {
        return prisma.user.findMany({ orderBy: { id: 'asc' } });
    },
    getById(id) {
        return prisma.user.findUnique({ where: { id } });
    },
    getBySupabaseId(supabaseId) {
        return prisma.user.findUnique({ where: { supabaseId } });
    },
    create(data) {
        return prisma.user.create({ data });
    },
    createFromAuth(data) {
        return prisma.user.upsert({
            where: { supabaseId: data.supabaseId },
            update: {}, // Already exists — do nothing
            create: {
                supabaseId: data.supabaseId,
                email: data.email,
                name: data.name,
            },
        });
    },
    async update(id, data) {
        const exists = await prisma.user.findUnique({ where: { id } });
        if (!exists)
            return null;
        return prisma.user.update({ where: { id }, data });
    },
    async remove(id) {
        const exists = await prisma.user.findUnique({ where: { id } });
        if (!exists)
            return null;
        return prisma.user.delete({ where: { id } });
    },
};
