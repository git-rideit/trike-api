import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/AppError';

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string = 'uploads'): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    return reject(new AppError('Image upload failed', 500));
                }
                resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};
