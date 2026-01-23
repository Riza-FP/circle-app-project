import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { likeThread, unlikeThread } from "../controllers/like-controller";

const router = Router();

router.post("/", authMiddleware, likeThread);
router.delete("/:thread_id", authMiddleware, unlikeThread);

export default router;
