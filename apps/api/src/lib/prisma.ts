import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Padrão Singleton para evitar vazamento de conexões no hot-reload do desenvolvimento
const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
    pool?: pg.Pool
}

// Usamos DIRECT_URL (porta 5432) em vez de DATABASE_URL (porta 6543) no ambiente local.
// Isso evita que o PgBouncer/Supavisor feche a conexão devido ao uso de Prepared Statements da biblioteca 'pg'.
const pool = globalForPrisma.pool ?? new pg.Pool({ connectionString: process.env.DIRECT_URL })
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

