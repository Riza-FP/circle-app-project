import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { upload } from "../middlewares/upload-middleware";

import {
    createThread,
    getThreads,
    deleteThread,
    updateThread,
    getThreadById,
    getThreadsByUser,
} from "../controllers/thread-controller";

const router = Router();


router.post("/", authMiddleware, upload.array("images", 4), createThread);
router.get("/", authMiddleware, getThreads);
router.get("/:id", authMiddleware, getThreadById);
router.get("/user/:id", authMiddleware, getThreadsByUser);
router.delete("/:id", authMiddleware, deleteThread);
router.patch("/:id", authMiddleware, upload.array("images", 4), updateThread);

export default router;
