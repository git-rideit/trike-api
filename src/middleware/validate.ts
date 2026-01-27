import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            return next(new AppError(messages, 400));
        }
        next(error);
    }
};
