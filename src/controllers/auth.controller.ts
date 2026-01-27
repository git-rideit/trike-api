import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/user.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const signToken = (id: string) => {
    return jwt.sign({ id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
    });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
    const token = signToken(user._id);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
    });

    createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
});
