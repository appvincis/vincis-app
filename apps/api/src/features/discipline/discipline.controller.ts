import { disciplineService } from "./discipline.service.js";
import { Request, Response } from "express";
import { CreateDisciplineInput, UpdateDisciplineInput } from "./discipline.schema.js";
import { StudyPlanInjectedRequest } from "../study-plan/study-plan.middleware.js";

const parseId = (raw: string) => Number(raw);

export async function createDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const { name, color, weight } = req.body as CreateDisciplineInput;
        const studyPlanId = injectedReq.studyPlan!.id;

        const discipline = await disciplineService.createDiscipline({ name, color, weight }, studyPlanId);

        return res.status(201).json({
            message: "Disciplina criada com sucesso.",
            discipline
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message || "Erro interno durante a criação da disciplina." });
    }
}

export async function getDisciplines(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const studyPlanId = injectedReq.studyPlan!.id;
        const disciplines = await disciplineService.getDisciplines(studyPlanId);
        return res.status(200).json(disciplines);
    } catch (err: any) {
        return res.status(500).json({ message: "Erro interno ao buscar disciplinas." });
    }
}

export async function getDisciplineById(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });

        const studyPlanId = injectedReq.studyPlan!.id;
        const discipline = await disciplineService.getDisciplineById(id, studyPlanId);
        
        if (!discipline) {
            return res.status(404).json({ message: "Disciplina não encontrada." });
        }
        
        return res.status(200).json(discipline);
    } catch (err: any) {
        return res.status(500).json({ message: "Erro interno." });
    }
}

export async function updateDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });

        const studyPlanId = injectedReq.studyPlan!.id;
        const { name, color, weight } = req.body as UpdateDisciplineInput;

        const discipline = await disciplineService.updateDiscipline(id, studyPlanId, { name, color, weight });
        
        return res.status(200).json({
            message: "Disciplina atualizada com sucesso.",
            discipline
        });
    } catch (err: any) {
        if (err.message.includes("não encontrada")) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: "Erro interno durante a atualização da disciplina." });
    }
}

export async function deleteDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const id = parseId(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." });

        const studyPlanId = injectedReq.studyPlan!.id;

        await disciplineService.deleteDiscipline(id, studyPlanId);
        
        return res.status(204).send();
    } catch (err: any) {
        if (err.message.includes("não encontrada")) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: "Erro interno durante a deleção da disciplina." });
    }
}
