import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const userId = req.user ? req.user._id : 'guest';
        cb(null, `user-${userId}-${Date.now()}${ext}`);
    }
});

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

router.post('/', upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    // Return the relative path. In app.ts we serve 'uploads' static folder.
    const url = `/uploads/${req.file.filename}`;

    res.status(201).json({
        status: 'success',
        url
    });
});

export default router;
