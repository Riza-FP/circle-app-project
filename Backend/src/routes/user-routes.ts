import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth-middleware";

const router = Router();



/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 */
router.get("/me", authMiddleware, (req: AuthRequest, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user,
    });
});

/**
 * @swagger
 * /users/suggested:
 *   get:
 *     summary: Get suggested users to follow
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suggested users
 */
router.get("/suggested", authMiddleware, (req, res) => {
    // Lazy load controller to avoid circular deps if any, or just import top level
    const userController = require("../controllers/user-controller");
    userController.getSuggestedUsers(req, res);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [User]
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
 *         description: User profile fetched successfully
 *       404:
 *         description: User not found
 */
router.get("/:id", authMiddleware, (req, res) => {
    const userController = require("../controllers/user-controller");
    userController.getUserById(req, res);
});

export default router;
