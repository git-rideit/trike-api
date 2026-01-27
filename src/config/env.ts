import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    MONGO_URI: z.string().min(1),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default('90d'),
    CORS_ORIGIN: z.string().default('*'),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
    console.error('❌ Invalid environment variables:', envVars.error.format());
    process.exit(1);
}

export const env = envVars.data;
