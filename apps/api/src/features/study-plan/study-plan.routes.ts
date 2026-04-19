import { Router } from "express";
import { createStudyPlan, getStudyPlans, getStudyPlanById, setStudyPlanActive, deleteStudyPlan, updateStudyPlan } from './study-plan.controller.js'
import { requireAuth } from "../auth/auth.middleware.js";

export const studyPlanRouter = Router()

studyPlanRouter.post('/', requireAuth, createStudyPlan)
studyPlanRouter.get('/', requireAuth, getStudyPlans)
studyPlanRouter.get('/:id', requireAuth, getStudyPlanById)
studyPlanRouter.put('/:id/active', requireAuth, setStudyPlanActive)
studyPlanRouter.delete('/:id', requireAuth, deleteStudyPlan)
studyPlanRouter.patch('/:id', requireAuth, updateStudyPlan)
