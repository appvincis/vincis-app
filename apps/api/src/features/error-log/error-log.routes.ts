import { Router } from "express";
import {
    createErrorLog,
    getErrorLogs,
    getErrorLogById,
    updateErrorLog,
    deleteErrorLog
} from './error-log.controller.js';
import { requireAuth } from "../auth/auth.middleware.js";
import { injectStudyPlan, requireStudyPlan } from "../study-plan/study-plan.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createErrorLogSchema, updateErrorLogSchema } from "./error-log.schema.js";

export const errorLogRouter = Router();

errorLogRouter.use(requireAuth, injectStudyPlan, requireStudyPlan);

errorLogRouter.post('/', validateRequest(createErrorLogSchema), createErrorLog);
errorLogRouter.get('/', getErrorLogs);
errorLogRouter.get('/:id', getErrorLogById);
errorLogRouter.patch('/:id', validateRequest(updateErrorLogSchema), updateErrorLog);
errorLogRouter.delete('/:id', deleteErrorLog);
