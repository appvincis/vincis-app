import { Router } from 'express'
import {
    createUser,
    deleteUser,
    getUserById,
    listUsers,
    updateUser,
    getUserPlan,
    updatePlan
} from './user.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'
import { validateRequest } from '../../middlewares/validate.middleware.js'
import { createUserSchema, updateUserSchema } from './user.schema.js'
import { requirePremium } from './user.middleware.js'

export const userRouter = Router()

userRouter.use(requireAuth)

userRouter.get('/plan', requireAuth, getUserPlan)

userRouter.get('/plan/premium', requireAuth, requirePremium, (req, res) => {
    res.send("Usuario confirmadamente premium!")
})

userRouter.patch('/plan/:planType', requireAuth, updatePlan)

userRouter.get('/', listUsers)
userRouter.get('/:id', getUserById)
userRouter.post('/', validateRequest(createUserSchema), createUser)
userRouter.put('/:id', validateRequest(updateUserSchema), updateUser)
userRouter.delete('/:id', deleteUser)