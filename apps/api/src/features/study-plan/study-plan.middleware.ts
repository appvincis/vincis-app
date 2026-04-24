import { Request, Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../auth/auth.middleware.js'
import { StudyPlan } from '@prisma/client'
import { studyPlanService } from './study-plan.service.js'

export interface StudyPlanInjectedRequest extends AuthenticatedRequest {
    studyPlan: StudyPlan | null
}

export const injectStudyPlan = async (req: Request, res: Response, next: NextFunction) => {
    const injectedReq = req as StudyPlanInjectedRequest
    const studyPlanId = req.cookies?.study_plan_id
    const userId = injectedReq.dbUser!.id

    if (!studyPlanId) {
        injectedReq.studyPlan = null
        return next()
    }

    const studyPlan = await studyPlanService.getStudyPlanById(Number(studyPlanId), Number(userId))

    if (!studyPlan) {
        return res.status(404).json({ message: 'Plano de estudo não encontrado.' })
    }

    injectedReq.studyPlan = studyPlan

    return next()
}

export const requireStudyPlan = (req: Request, res: Response, next: NextFunction) => {
    const injectedReq = req as StudyPlanInjectedRequest
    if (!injectedReq.studyPlan) {
        return res.status(400).json({ message: 'Plano de estudo não fornecido.' })
    }
    return next()
}