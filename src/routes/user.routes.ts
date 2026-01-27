import express from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { z } from 'zod';

import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        role: z.enum(['user', 'admin']).optional(),
    }),
});

// Protect all routes after this middleware
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user name
 *         email:
 *           type: string
 *           description: The user email
 *         role:
 *           type: string
 *           description: The user role
 *           enum: [user, admin]
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the user was added
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns the list of all the users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *                - name
 *                - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 */
router.route('/')
    .get(restrictTo('admin'), userController.getAllUsers)
    .post(validate(createUserSchema), userController.createUser);

router.patch('/profile-picture', upload.single('profilePicture'), userController.updateProfilePicture);

router.route('/:id')
    .get(userController.getUser);

export default router;
