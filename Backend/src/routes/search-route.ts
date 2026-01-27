import express from "express";
import { searchUsers } from "../controllers/search-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.get("/", authMiddleware, searchUsers);

export default router;
