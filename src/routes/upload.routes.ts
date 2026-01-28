import express, { Request, Response } from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware';
import { uploadToCloudinary } from '../services/cloudinary.service';

const router = express.Router();

// Memory Storage for Cloudinary Upload
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Not an image or PDF!'));
        }
    }
});

// router.use(protect); // Uploads now public for registration

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
        }

        // Upload buffer to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, 'trike-users');

        res.status(201).json({
            status: 'success',
            url: result.secure_url // Return Cloudinary URL
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Upload failed'
        });
    }
});

export default router;
