import express from "express";
import { followUser, unfollowUser, getFollows } from "../controllers/follow-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/", followUser);
router.delete("/", unfollowUser);
router.get("/", getFollows);

export default router;
