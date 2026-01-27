import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { env } from '../config/env';
import User from '../models/user.model';

interface JwtPayload {
    id: string;
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token no longer exists.',
                401
            )
        );
    }

    (req as any).user = currentUser;
    next();
});

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes((req as any).user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};
