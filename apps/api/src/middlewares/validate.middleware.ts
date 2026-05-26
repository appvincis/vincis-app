import { Request, Response, NextFunction } from 'express'
import { ZodObject, ZodError } from 'zod'

export const validateRequest = (schema: ZodObject<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body)
      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues
        return res.status(400).json({
          message: 'Erro de validação',
          errors: issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }
      return res.status(500).json({ message: 'Erro interno na validação' })
    }
  }
}
