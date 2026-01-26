import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { getProfile } from "../controllers/user-controller";

const router = Router();

router.get("/", authMiddleware, getProfile);

export default router;
