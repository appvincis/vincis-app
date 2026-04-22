import { ZodError } from 'zod';
export const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            return next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const issues = error.issues ?? error.errors ?? [];
                return res.status(400).json({
                    message: 'Erro de validação',
                    errors: issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }
            return res.status(500).json({ message: 'Erro interno na validação' });
        }
    };
};
