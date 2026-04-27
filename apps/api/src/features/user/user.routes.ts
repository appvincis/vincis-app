import { Router } from 'express'
import {
    createUser,
    deleteUser,
    getUserById,
    listUsers,
    updateUser,
} from './user.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'

export const userRouter = Router()

userRouter.use(requireAuth) 

userRouter.get('/', listUsers)
userRouter.get('/:id', getUserById)
userRouter.post('/', createUser)
userRouter.put('/:id', updateUser)
userRouter.delete('/:id', deleteUser)