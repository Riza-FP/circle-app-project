import express from "express";
import { searchUsers } from "../controllers/search-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search functionality
 */

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for users
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query (name or username)
 *     responses:
 *       200:
 *         description: Search results found
 *       400:
 *         description: Missing query parameter
 */
router.get("/", authMiddleware, searchUsers);

export default router;
