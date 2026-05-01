import { Router } from "express";
import { createDiscipline, getDisciplines, getDisciplineById, deleteDiscipline, updateDiscipline } from './discipline.controller.js'
import { requireAuth } from "../auth/auth.middleware.js";
import { injectStudyPlan, requireStudyPlan } from "../study-plan/study-plan.middleware.js";

export const disciplineRouter = Router()

disciplineRouter.use(requireAuth, injectStudyPlan, requireStudyPlan)

disciplineRouter.post('/', createDiscipline)
disciplineRouter.get('/', getDisciplines)
disciplineRouter.get('/:id', getDisciplineById)
disciplineRouter.delete('/:id', deleteDiscipline)
disciplineRouter.patch('/:id', updateDiscipline)
