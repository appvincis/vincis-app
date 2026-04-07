import { Router } from 'express'
import {
    createUser,
    deleteUser,
    getUserById,
    listUsers,
    updateUser,
} from './user.controller.js'

export const userRouter = Router()

userRouter.get('/', listUsers)
userRouter.get('/:id', getUserById)
userRouter.post('/', createUser)
userRouter.put('/:id', updateUser)
userRouter.delete('/:id', deleteUser)