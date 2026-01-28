import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { getProfile, updateProfile } from "../controllers/user-controller";
import { upload } from "../middlewares/upload-middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *   patch:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               fullName:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.get("/", authMiddleware, getProfile);
router.patch(
    "/",
    authMiddleware,
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
    updateProfile
);

export default router;
