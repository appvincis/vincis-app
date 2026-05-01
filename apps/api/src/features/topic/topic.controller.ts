import { topicService } from "./topic.service.js";
import { Request, Response } from "express";
import { CreateTopicInput, UpdateTopicInput } from "./topic.types.js";
import { StudyPlanInjectedRequest } from "../study-plan/study-plan.middleware.js";

export async function createTopic(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const { name, description, disciplineId } = req.body as CreateTopicInput;
        const studyPlanId = injectedReq.studyPlan!.id;

        const topic = await topicService.createTopic({ name, description, disciplineId }, studyPlanId);

        return res.status(201).json({
            message: "Tópico criado com sucesso.",
            topic
        });
    } catch (err: any) {
        if (err.message.includes("não encontrada")) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: "Erro interno durante a criação do tópico." });
    }
}

export async function getTopicsByDiscipline(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const { disciplineId } = req.params;
        const studyPlanId = injectedReq.studyPlan!.id;

        const topics = await topicService.getTopicsByDiscipline(Number(disciplineId), studyPlanId);
        return res.status(200).json(topics);
    } catch (err: any) {
        if (err.message.includes("não encontrada")) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: "Erro interno ao buscar tópicos." });
    }
}

export async function getTopicById(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const { id } = req.params;
        const studyPlanId = injectedReq.studyPlan!.id;
        
        const topic = await topicService.getTopicById(Number(id), studyPlanId);
        
        if (!topic) {
            return res.status(404).json({ message: "Tópico não encontrado." });
        }
        
        return res.status(200).json(topic);
    } catch (err: any) {
        return res.status(500).json({ message: "Erro interno." });
    }
}

export async function updateTopic(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const { id } = req.params;
        const studyPlanId = injectedReq.studyPlan!.id;
        const { name, description, isCompleted } = req.body as UpdateTopicInput;

        const topic = await topicService.updateTopic(Number(id), studyPlanId, { name, description, isCompleted });
        
        return res.status(200).json({
            message: "Tópico atualizado com sucesso.",
            topic
        });
    } catch (err: any) {
        if (err.message.includes("não encontrado")) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: "Erro interno durante a atualização do tópico." });
    }
}

export async function deleteTopic(req: Request, res: Response) {
    try {
        const injectedReq = req as StudyPlanInjectedRequest;
        const { id } = req.params;
        const studyPlanId = injectedReq.studyPlan!.id;

        await topicService.deleteTopic(Number(id), studyPlanId);
        
        return res.status(204).send();
    } catch (err: any) {
        if (err.message.includes("não encontrado")) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: "Erro interno durante a deleção do tópico." });
    }
}
