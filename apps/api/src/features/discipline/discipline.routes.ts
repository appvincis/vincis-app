import { Router } from "express";
import {
    createDiscipline,
    getDisciplines,
    getDisciplineById,
    deleteDiscipline,
    updateDiscipline,
    generateTopicsForDiscipline,
    bulkCreateDisciplines,
    bulkDeleteDisciplines,
    bulkWeightUpdateDisciplines,
    bulkStatusUpdateDisciplines,
    exportDisciplines
} from './discipline.controller.js';
import { requireAuth } from "../auth/auth.middleware.js";
import { injectStudyPlan, requireStudyPlan } from "../study-plan/study-plan.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createDisciplineSchema, updateDisciplineSchema } from "./discipline.schema.js";

export const disciplineRouter = Router();

disciplineRouter.use(requireAuth, injectStudyPlan, requireStudyPlan);

disciplineRouter.post('/', validateRequest(createDisciplineSchema), createDiscipline);
disciplineRouter.get('/', getDisciplines);
disciplineRouter.post('/bulk', bulkCreateDisciplines);
disciplineRouter.post('/bulk-delete', bulkDeleteDisciplines);
disciplineRouter.post('/bulk-weight', bulkWeightUpdateDisciplines);
disciplineRouter.post('/bulk-status', bulkStatusUpdateDisciplines);
disciplineRouter.post('/export', exportDisciplines);
disciplineRouter.post('/:id/generate-topics', generateTopicsForDiscipline);
disciplineRouter.get('/:id', getDisciplineById);
disciplineRouter.delete('/:id', deleteDiscipline);
disciplineRouter.patch('/:id', validateRequest(updateDisciplineSchema), updateDiscipline);
