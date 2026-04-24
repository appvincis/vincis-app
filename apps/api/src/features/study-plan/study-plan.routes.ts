import { Router } from "express";
import { createStudyPlan, getStudyPlans, getStudyPlanById, setStudyPlanActive, deleteStudyPlan, updateStudyPlan, selectStudyPlan } from './study-plan.controller.js'
import { requireAuth } from "../auth/auth.middleware.js";
import { injectStudyPlan, requireStudyPlan, StudyPlanInjectedRequest } from "./study-plan.middleware.js";

export const studyPlanRouter = Router()

// TESTE
studyPlanRouter.get('/test', requireAuth, injectStudyPlan, requireStudyPlan, (req, res) => {
    const { studyPlan } = req as StudyPlanInjectedRequest

    return res.status(200).json({
        message: "Teste do middleware de study plan",
        studyPlan
    })
})

studyPlanRouter.get('/', requireAuth, getStudyPlans)
studyPlanRouter.get('/:id', requireAuth, getStudyPlanById)
studyPlanRouter.post('/', requireAuth, createStudyPlan)
studyPlanRouter.post('/select', requireAuth, selectStudyPlan)
studyPlanRouter.put('/:id/active', requireAuth, setStudyPlanActive)
studyPlanRouter.delete('/:id', requireAuth, deleteStudyPlan)
studyPlanRouter.patch('/:id', requireAuth, updateStudyPlan)

