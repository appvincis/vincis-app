import { Router } from 'express'
import {
    createUser,
    deleteUser,
    getUserById,
    listUsers,
    updateUser,
} from './user.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'
import { validateRequest } from '../../middlewares/validate.middleware.js'
import { createUserSchema, updateUserSchema } from './user.schema.js'

export const userRouter = Router()

userRouter.use(requireAuth) 

userRouter.get('/', listUsers)
userRouter.get('/:id', getUserById)
userRouter.post('/', validateRequest(createUserSchema), createUser)
userRouter.put('/:id', validateRequest(updateUserSchema), updateUser)
userRouter.delete('/:id', deleteUser)