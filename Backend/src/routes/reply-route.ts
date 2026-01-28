import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { upload } from "../middlewares/upload-middleware"; // Import upload
import { getReplies, createReply, deleteReply, updateReply } from "../controllers/reply-controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reply
 *   description: Thread replies management
 */

/**
 * @swagger
 * /reply:
 *   get:
 *     summary: Get replies for a thread
 *     tags: [Reply]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: thread_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the thread to fetch replies for
 *     responses:
 *       200:
 *         description: Replies fetched successfully
 *   post:
 *     summary: Create a reply
 *     tags: [Reply]
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
 *               - thread_id
 *             properties:
 *               content:
 *                 type: string
 *               thread_id:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Reply created successfully
 * 
 * /reply/{id}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Reply]
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
 *         description: Reply deleted successfully
 *   patch:
 *     summary: Update a reply
 *     tags: [Reply]
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
 *         description: Reply updated successfully
 */
router.get("/", authMiddleware, getReplies);
router.post("/", authMiddleware, upload.array("images", 4), createReply);
router.delete("/:id", authMiddleware, deleteReply);
router.patch("/:id", authMiddleware, upload.array("images", 4), updateReply);

export default router;
