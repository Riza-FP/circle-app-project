import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { getProfile, updateProfile } from "../controllers/user-controller";
import { upload } from "../middlewares/upload-middleware";

const router = Router();

router.get("/", authMiddleware, getProfile);
router.patch(
    "/",
    authMiddleware,
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
    updateProfile
);

export default router;
