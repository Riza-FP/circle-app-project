import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { upload } from "../middlewares/upload-middleware"; // Import upload
import { getReplies, createReply, deleteReply, updateReply } from "../controllers/reply-controller";

const router = Router();

router.get("/", authMiddleware, getReplies);
router.post("/", authMiddleware, upload.array("images", 4), createReply);
router.delete("/:id", authMiddleware, deleteReply);
router.patch("/:id", authMiddleware, upload.array("images", 4), updateReply);

export default router;
