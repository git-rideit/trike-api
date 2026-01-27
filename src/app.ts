import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import { rateLimiter } from './middleware/rateLimiter';
import errorHandler from './middleware/errorHandler';
import { AppError } from './utils/AppError';
import userRouter from './routes/user.routes';
import logger from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

import { env } from './config/env';
import authRouter from './routes/auth.routes';
import adminRouter from './routes/admin.routes';
import bookingRouter from './routes/booking.routes';

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate Limiting
app.use('/api', rateLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression
app.use(compression());

// Request Logger
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        logger.http(`${req.method} ${req.url}`);
    }
    next();
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/bookings', bookingRouter);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
});

// Root Route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Trike API',
        docs: '/api-docs',
        health: '/health'
    });
});

// Favicon
app.get('/favicon.ico', (req, res) => res.status(204));

// API Base Route
app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'Use /api/v1 for API endpoints',
        versions: ['v1']
    });
});

// 404 Handler
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
