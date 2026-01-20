import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";

import {
    createThread,
    getThreads,
    likeThread,
    unlikeThread,
    replyThread,
} from "../controllers/thread-controller";

const router = Router();


router.post("/", authMiddleware, createThread);
router.get("/", authMiddleware, getThreads);


router.post("/:id/like", authMiddleware, likeThread);
router.delete("/:id/like", authMiddleware, unlikeThread);


router.post("/:id/reply", authMiddleware, replyThread);

export default router;
