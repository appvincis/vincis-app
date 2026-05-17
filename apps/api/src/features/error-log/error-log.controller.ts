import { Request, Response } from "express";
import { errorLogService } from "./error-log.service.js";
import { CreateErrorLogInput, UpdateErrorLogInput } from "./error-log.schema.js";
import { StudyPlanInjectedRequest } from "../study-plan/study-plan.middleware.js";

const parseId = (raw: string | string[] | undefined) => Number(raw);

export async function createErrorLog(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const body = req.body as CreateErrorLogInput;
        const studyPlanId = injectedReq.studyPlan!.id;
        const userId = req.dbUser!.id;

        const errorLog = await errorLogService.createErrorLog(body, userId, studyPlanId);
        return res.status(201).json({ message: "Erro registrado com sucesso.", errorLog });
    } catch (err: any) {
        if (err.message.includes("não encontrado")) return res.status(404).json({ message: err.message });
        console.error("Erro na criação:", err);
        return res.status(500).json({ message: err.message || "Erro interno durante o registro." });
    }
}

export async function getErrorLogs(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const studyPlanId = injectedReq.studyPlan!.id;
        const userId = req.dbUser!.id;
        const topicId = req.query.topicId ? Number(req.query.topicId) : undefined;
        const disciplineId = req.query.disciplineId ? Number(req.query.disciplineId) : undefined;

        const errorLogs = await errorLogService.getErrorLogs(userId, studyPlanId, { topicId, disciplineId });
        return res.status(200).json(errorLogs);
    } catch (err: any) {
        return res.status(500).json({ message: "Erro interno ao buscar registros." });
    }
}

export async function getErrorLogById(req: Request, res: Response) {
    try {
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });
        const userId = req.dbUser!.id;

        const errorLog = await errorLogService.getErrorLogById(id, userId);
        if (!errorLog) return res.status(404).json({ message: "Registro não encontrado." });
        return res.status(200).json(errorLog);
    } catch (err: any) {
        return res.status(500).json({ message: "Erro interno." });
    }
}

export async function updateErrorLog(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });
        const studyPlanId = injectedReq.studyPlan!.id;
        const userId = req.dbUser!.id;
        const body = req.body as UpdateErrorLogInput;

        const errorLog = await errorLogService.updateErrorLog(id, userId, studyPlanId, body);
        return res.status(200).json({ message: "Registro atualizado com sucesso.", errorLog });
    } catch (err: any) {
        if (err.message.includes("não encontrado")) return res.status(404).json({ message: err.message });
        return res.status(500).json({ message: "Erro interno durante a atualização." });
    }
}

export async function deleteErrorLog(req: Request, res: Response) {
    try {
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });
        const userId = req.dbUser!.id;

        await errorLogService.deleteErrorLog(id, userId);
        return res.status(204).send();
    } catch (err: any) {
        if (err.message.includes("não encontrado")) return res.status(404).json({ message: err.message });
        console.error("Erro na exclusão:", err);
        return res.status(500).json({ message: err.message || "Erro interno durante a exclusão." });
    }
}
