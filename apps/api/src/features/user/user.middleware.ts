import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { userService } from "./user.service.js";

export async function requirePremium(req: Request, res: Response, next: NextFunction) {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.dbUser?.id

    try {
        const user = await userService.getById(Number(userId))
        if (user?.plan == "PREMIUM") {
            return next()
        } else {
            return res.status(401).json({
                message: "Não autorizado: Usuário não possui o plano Premium e não pode acessar essa área exclusiva."
            })
        }
    } catch (err) {
        console.error("Erro no middleware requirePremium: ", err)
        return res.status(500).json({
            message: "Erro interno ao verificar o plano premium."
        })
    }
}