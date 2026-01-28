import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { upload } from "../middlewares/upload-middleware";

import {
    createThread,
    getThreads,
    deleteThread,
    updateThread,
    getThreadById,
    getThreadsByUser,
} from "../controllers/thread-controller";

const router = Router();


/**
 * @swagger
 * tags:
 *   name: Thread
 *   description: Thread management endpoints
 */

/**
 * @swagger
 * /thread:
 *   post:
 *     summary: Create a new thread
 *     tags: [Thread]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Thread created successfully
 *   get:
 *     summary: Get all threads (feed)
 *     tags: [Thread]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Threads fetched successfully
 */
router.post("/", authMiddleware, upload.array("images", 4), createThread);
router.get("/", authMiddleware, getThreads);

/**
 * @swagger
 * /thread/{id}:
 *   get:
 *     summary: Get thread by ID
 *     tags: [Thread]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thread details fetched successfully
 *       404:
 *         description: Thread not found
 *   delete:
 *     summary: Delete a thread
 *     tags: [Thread]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thread deleted successfully
 *       403:
 *         description: Unauthorized to delete this thread
 *   patch:
 *     summary: Update a thread
 *     tags: [Thread]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Thread updated successfully
 */
router.get("/:id", authMiddleware, getThreadById);
router.delete("/:id", authMiddleware, deleteThread);
router.patch("/:id", authMiddleware, upload.array("images", 4), updateThread);

/**
 * @swagger
 * /thread/user/{id}:
 *   get:
 *     summary: Get threads by user ID and optional type
 *     tags: [Thread]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [media]
 *         description: Filter by type (e.g., 'media' for threads with images)
 *     responses:
 *       200:
 *         description: User threads fetched successfully
 */
router.get("/user/:id", authMiddleware, getThreadsByUser);

export default router;
