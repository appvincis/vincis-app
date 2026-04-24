import { studyPlanService } from "./study-plan.service.js";
import { Request, Response } from "express";
import { CreateStudyPlanInput, UpdateStudyPlanInput } from "./study-plan.types.js";
import { AuthenticatedRequest } from "../auth/auth.middleware.js";

export async function createStudyPlan(req: AuthenticatedRequest, res: Response) {
    try {
        const { name, description, is_active } = req.body as CreateStudyPlanInput
        const userId = req.dbUser!.id

        const studyPlan = await studyPlanService.createStudyPlan({
            name,
            description,
            is_active
        }, userId)

        return res.status(201).json({
            message: "Plano de estudos criado com sucesso.",
            studyPlan
        })
    } catch (err) {
        return res.status(500).json({
            message: "Erro interno durante a criação do plano de estudo."
        })
    }
}

export async function getStudyPlans(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.dbUser!.id
        const studyPlans = await studyPlanService.getStudyPlans(userId)
        return res.status(200).json(studyPlans)
    } catch (err) {
        return res.status(500).json({ message: "Erro interno." })
    }
}

export async function getStudyPlanById(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        const userId = req.dbUser!.id
        const studyPlan = await studyPlanService.getStudyPlanById(Number(id), userId)
        if (!studyPlan) {
            return res.status(404).json({ message: "Plano de estudo não encontrado." })
        }
        return res.status(200).json(studyPlan)
    } catch (err) {
        return res.status(500).json({ message: "Erro interno." })
    }
}

export async function setStudyPlanActive(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: studyPlanId } = req.params
        const userId = req.dbUser!.id

        const studyPlan = await studyPlanService.setStudyPlanActive(Number(studyPlanId), userId)

        return res.status(200).json({
            message: "Plano de estudo ativado com sucesso.",
            studyPlan
        })
    } catch (err) {
        return res.status(500).json({
            message: "Erro interno durante a ativação do plano de estudo."
        })
    }
}


export async function deleteStudyPlan(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params
        const userId = req.dbUser!.id

        await studyPlanService.deleteStudyPlan(Number(id), userId)
        return res.status(200).json({
            message: "Plano de estudo deletado com sucesso."
        })
    } catch (err) {
        return res.status(500).json({
            message: "Erro interno durante a deleção do plano de estudo."
        })
    }
}

export async function updateStudyPlan(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params
        const userId = req.dbUser!.id
        const { name, description } = req.body as UpdateStudyPlanInput

        const studyPlan = await studyPlanService.updateStudyPlan(Number(id), userId, { name, description })
        return res.status(200).json({
            message: "Plano de estudo atualizado com sucesso.",
            studyPlan
        })
    } catch (err) {
        return res.status(500).json({
            message: "Erro interno durante a atualização do plano de estudo."
        })
    }
}

export async function selectStudyPlan(req: AuthenticatedRequest, res: Response) {
    try {
        const { studyPlanId } = req.body

        if (!studyPlanId) {
            return res.status(400).json({ message: 'Plano de estudo não fornecido.' })
        }

        const studyPlan = await studyPlanService.getStudyPlanById(Number(studyPlanId), req.dbUser!.id)
        if (!studyPlan) {
            return res.status(404).json({ message: "Plano de estudo não encontrado." })
        }

        res.cookie('study_plan_id', studyPlanId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production",
        })

        return res.status(200).json({
            message: "Plano de estudo selecionado com sucesso.",
        })
    } catch (err) {
        return res.status(500).json({
            message: "Erro interno durante a seleção do plano de estudo."
        })
    }
}