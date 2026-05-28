import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { userService } from './user.service.js'
import { CreateUserInput, UpdateUserInput } from './user.schema.js'
import { AuthenticatedRequest } from '../auth/auth.middleware.js'

const parseId = (raw: string | string[] | undefined) => Number(raw)

export async function listUsers(_req: Request, res: Response) {
    const users = await userService.list()
    return res.status(200).json(users)
}

export async function getUserById(req: Request, res: Response) {
    const id = parseId(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id invalido' })

    const user = await userService.getById(id)
    if (!user) return res.status(404).json({ message: 'user nao encontrado' })

    return res.status(200).json(user)
}

export async function createUser(req: Request, res: Response) {
    const { email, name } = req.body as CreateUserInput

    try {
        const user = await userService.create({ email, name })
        return res.status(201).json(user)
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ message: 'email ja existe' })
        }
        return res.status(500).json({ message: 'erro ao criar user' })
    }
}

export async function updateUser(req: Request, res: Response) {
    const id = parseId(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id invalido' })

    const { email, name, avatar } = req.body as UpdateUserInput

    try {
        const updated = await userService.update(id, { email, name, avatar })
        if (!updated) return res.status(404).json({ message: 'user nao encontrado' })
        return res.status(200).json(updated)
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ message: 'email ja existe' })
        }
        return res.status(500).json({ message: 'erro ao atualizar user' })
    }
}

export async function deleteUser(req: Request, res: Response) {
    const id = parseId(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id invalido' })

    const removed = await userService.remove(id)
    if (!removed) return res.status(404).json({ message: 'user nao encontrado' })

    return res.status(204).send()
}

export async function getUserPlan(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.dbUser?.id

    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' })

    try {
        const user = await userService.getById(userId)
        return res.status(200).json({ plan: user?.plan })
    } catch (err) {
        return res.status(500).json({ message: 'Não foi possível ler o plano do usuário.' })
    }
}

export async function updatePlan(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.dbUser?.id
    const desiredPlan = req.params.planType

    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' })

    try {
        const updated = await userService.updatePlan(userId, String(desiredPlan))
        if (!updated) return res.status(404).json({ message: 'Usuário não encontrado.' })

        return res.status(200).json({ plan: updated.plan })
    } catch (err) {
        if (err instanceof Error && err.message.startsWith('Plano inválido')) {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: 'Não foi possível atualizar o plano do usuário.' })
    }
}