import { focusSessionService } from "./focus-session.service.js";
import { Request, Response } from "express";
import { CreateFocusSessionInput } from "./focus-session.schema.js";
import { StudyPlanInjectedRequest } from "../study-plan/study-plan.middleware.js";

export async function createFocusSession(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const body = req.body as CreateFocusSessionInput;
        const studyPlanId = injectedReq.studyPlan!.id;
        const userId = injectedReq.dbUser!.id;

        const session = await focusSessionService.createSession(body, studyPlanId, userId);

        return res.status(201).json({
            message: "Sessão de foco salva com sucesso.",
            session,
        });
    } catch (err: any) {
        return res.status(500).json({
            message: err.message || "Erro interno ao salvar sessão de foco.",
        });
    }
}

export async function getFocusSessions(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const studyPlanId = injectedReq.studyPlan!.id;

        const sessions = await focusSessionService.getSessions(studyPlanId);
        return res.status(200).json(sessions);
    } catch (err: any) {
        return res.status(500).json({
            message: "Erro interno ao buscar sessões de foco.",
        });
    }
}

export async function getFocusSessionsByDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const disciplineId = Number(req.params.disciplineId);
        if (Number.isNaN(disciplineId))
            return res.status(400).json({ message: "ID da disciplina inválido." });

        const studyPlanId = injectedReq.studyPlan!.id;

        const sessions = await focusSessionService.getSessionsByDiscipline(
            disciplineId,
            studyPlanId
        );
        return res.status(200).json(sessions);
    } catch (err: any) {
        return res.status(500).json({
            message: "Erro interno ao buscar sessões por disciplina.",
        });
    }
}
