import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import { connectDB } from '../src/config/database';

// Cache the database connection
let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) {
        return;
    }
    await connectDB();
    isConnected = true;
};

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    app(req, res);
};
