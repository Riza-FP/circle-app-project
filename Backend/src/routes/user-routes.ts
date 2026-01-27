import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth-middleware";

const router = Router();



router.get("/me", authMiddleware, (req: AuthRequest, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user,
    });
});

router.get("/suggested", authMiddleware, (req, res) => {
    // Lazy load controller to avoid circular deps if any, or just import top level
    const userController = require("../controllers/user-controller");
    userController.getSuggestedUsers(req, res);
});

router.get("/:id", authMiddleware, (req, res) => {
    const userController = require("../controllers/user-controller");
    userController.getUserById(req, res);
});

export default router;
