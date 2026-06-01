import { Router } from "express";
import { createFocusSession, getFocusSessions, getFocusSessionsByDiscipline } from "./focus-session.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { injectStudyPlan, requireStudyPlan } from "../study-plan/study-plan.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createFocusSessionSchema } from "./focus-session.schema.js";

export const focusSessionRouter = Router();

focusSessionRouter.use(requireAuth, injectStudyPlan, requireStudyPlan);

focusSessionRouter.post("/", validateRequest(createFocusSessionSchema), createFocusSession);
focusSessionRouter.get("/", getFocusSessions);
focusSessionRouter.get("/discipline/:disciplineId", getFocusSessionsByDiscipline);
