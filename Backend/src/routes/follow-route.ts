import express from "express";
import { followUser, unfollowUser, getFollows } from "../controllers/follow-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Follows
 *   description: Follow/Unfollow management
 */

/**
 * @swagger
 * /follows:
 *   post:
 *     summary: Follow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followingId
 *             properties:
 *               followingId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully followed user
 *       400:
 *         description: Cannot follow yourself or invalid ID
 * 
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followingId
 *             properties:
 *               followingId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 * 
 *   get:
 *     summary: Get followers or following list
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [followers, following]
 *         description: Type of list to fetch (followers or following, defaults to following)
 *     responses:
 *       200:
 *         description: List fetched successfully
 */
router.post("/", followUser);
router.delete("/", unfollowUser);
router.get("/", getFollows);

export default router;
