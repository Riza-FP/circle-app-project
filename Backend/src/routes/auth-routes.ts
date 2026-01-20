import { Router } from "express";
import { login, register, checkAuth } from "../controllers/auth-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check", authMiddleware, checkAuth);

export default router;
