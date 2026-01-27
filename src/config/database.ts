import mongoose from 'mongoose';
import logger from '../utils/logger';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
