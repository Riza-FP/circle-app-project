import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { upload } from "../middlewares/upload-middleware";

import {
    createThread,
    getThreads,
    likeThread,
    unlikeThread,
    replyThread,
    deleteThread,
    updateThread,
} from "../controllers/thread-controller";

const router = Router();


router.post("/", authMiddleware, upload.array("images", 4), createThread);
router.get("/", authMiddleware, getThreads);


router.post("/:id/like", authMiddleware, likeThread);
router.delete("/:id/like", authMiddleware, unlikeThread);


router.post("/:id/reply", authMiddleware, replyThread);

router.delete("/:id", authMiddleware, deleteThread);
router.patch("/:id", authMiddleware, upload.array("images", 4), updateThread);

export default router;
