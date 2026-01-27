import { Server } from 'http';
import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';
import logger from './utils/logger';

let server: Server;

const startServer = async () => {
    await connectDB();

    server = app.listen(env.PORT, () => {
        logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
};

startServer();

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: Error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
