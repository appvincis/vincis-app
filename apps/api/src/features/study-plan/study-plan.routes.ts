import { Router } from "express";
import { createStudyPlan, getStudyPlans, getStudyPlanById, setStudyPlanActive, deleteStudyPlan, updateStudyPlan, selectStudyPlan } from './study-plan.controller.js'
import { requireAuth } from "../auth/auth.middleware.js";
import { injectStudyPlan, requireStudyPlan, StudyPlanInjectedRequest } from "./study-plan.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createStudyPlanSchema, updateStudyPlanSchema, selectStudyPlanSchema } from "./study-plan.schema.js";

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
studyPlanRouter.post('/', requireAuth, validateRequest(createStudyPlanSchema), createStudyPlan)
studyPlanRouter.post('/select', requireAuth, validateRequest(selectStudyPlanSchema), selectStudyPlan)
studyPlanRouter.put('/:id/active', requireAuth, setStudyPlanActive)
studyPlanRouter.delete('/:id', requireAuth, deleteStudyPlan)
studyPlanRouter.patch('/:id', requireAuth, validateRequest(updateStudyPlanSchema), updateStudyPlan)

