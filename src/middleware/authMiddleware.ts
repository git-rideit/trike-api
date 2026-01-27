import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/user.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

interface JwtPayload {
    id: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }

    // 2) Verification token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    // (Optional: Implement changedPasswordAfter in User model if needed)

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};
