import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { likeThread, unlikeThread } from "../controllers/like-controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Like
 *   description: Thread like management
 */

/**
 * @swagger
 * /like:
 *   post:
 *     summary: Like a thread
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - thread_id
 *             properties:
 *               thread_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Thread liked successfully
 *       400:
 *         description: Thread already liked or invalid ID
 * 
 * /like/{thread_id}:
 *   delete:
 *     summary: Unlike a thread
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: thread_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thread unliked successfully
 */
router.post("/", authMiddleware, likeThread);
router.delete("/:thread_id", authMiddleware, unlikeThread);

export default router;
