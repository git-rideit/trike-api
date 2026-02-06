import express from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['user', 'admin', 'driver', 'student']).optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email(),
    }),
});

const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1),
        password: z.string().min(8),
    }),
});

const studentRegisterSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        studentId: z.string().min(1),
        course: z.string().min(1),
        year: z.string().min(1),
        birthDate: z.string().datetime().or(z.string()), // Accept ISO string
        address: z.object({
            province: z.string(),
            municipality: z.string(),
            barangay: z.string(),
            purok: z.string().optional()
        }),
        contactNumber: z.string().min(10),
        emergencyContact: z.object({
            name: z.string(),
            relationship: z.string(),
            contactNumber: z.string()
        }),
        schoolIdPhoto: z.string().url()
    })
});

const driverRegisterSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        licenseNumber: z.string().min(1),
        licenseExpiry: z.string().datetime().or(z.string()),
        tricyclePlateNumber: z.string().min(1),
        documents: z.array(z.object({
            type: z.string(),
            url: z.string().url(),
            status: z.enum(['pending', 'approved', 'rejected']).optional()
        })).optional()
    })
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *                - name
 *                - email
 *                - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *                - email
 *                - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(loginSchema), authController.login);

// Forgot / Reset password
router.patch('/update-password', protect, authController.updatePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /auth/register/student:
 *   post:
 *     summary: Register a new student
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *                - name
 *                - email
 *                - password
 *                - studentId
 *                - course
 *                - year
 *                - contactNumber
 *                - schoolIdPhoto
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               studentId:
 *                 type: string
 *               course:
 *                 type: string
 *               year:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               schoolIdPhoto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created
 */
router.post('/register/student', validate(studentRegisterSchema), authController.registerStudent);

/**
 * @swagger
 * /auth/register/driver:
 *   post:
 *     summary: Register a new driver
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *                - name
 *                - email
 *                - password
 *                - licenseNumber
 *                - tricyclePlateNumber
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               tricyclePlateNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Driver created (pending approval)
 */
router.post('/register/driver', validate(driverRegisterSchema), authController.registerDriver);

export default router;
