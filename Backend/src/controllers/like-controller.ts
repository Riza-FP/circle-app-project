import { Response } from "express";
import prisma from "../connections/client";
import { AuthRequest } from "../middlewares/auth-middleware";
import { broadcastToClients } from "../app";
import redis from "../libs/redis";

export const likeThread = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const { thread_id } = req.body;

        if (!thread_id) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Thread ID is required",
            });
        }

        const threadId = parseInt(thread_id);

        const existingLike = await prisma.like.findFirst({
            where: {
                userId,
                threadId,
            }
        });

        if (existingLike) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "You have already liked this thread",
            });
        }

        await prisma.like.create({
            data: {
                userId,
                threadId,
            },
        });

        const newLikeCount = await prisma.like.count({
            where: { threadId }
        });

        broadcastToClients({
            type: "LIKE_UPDATE",
            payload: {
                threadId: threadId,
                likes: newLikeCount
            }
        });

        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
            include: { author: true },
        });

        const liker = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (thread && liker && thread.authorId !== userId) {
            broadcastToClients({
                type: "NOTIFICATION",
                message: `${liker.fullName} liked your thread`,
                userId: thread.authorId
            });
        }

        // Invalidate Cache
        try {
            await redis.del("threads:all");
            if (thread && thread.authorId) {
                await redis.del(`threads:user:${thread.authorId}:all`);
                await redis.del(`threads:user:${thread.authorId}:media`);
            }
        } catch (error) {
            console.warn("Redis delete error:", error);
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Thread liked successfully",
        });

    } catch (error) {
        console.error("Failed to like thread:", error);
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to like thread",
        });
    }
};

export const unlikeThread = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const threadId = parseInt(req.params.thread_id as string);

        if (!threadId) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Thread ID is required",
            });
        }

        await prisma.like.deleteMany({
            where: {
                userId,
                threadId,
            },
        });

        const newLikeCount = await prisma.like.count({
            where: { threadId }
        });

        broadcastToClients({
            type: "LIKE_UPDATE",
            payload: {
                threadId: threadId,
                likes: newLikeCount
            }
        });

        // Invalidate Cache
        try {
            await redis.del("threads:all");
            const thread = await prisma.thread.findUnique({
                where: { id: threadId },
                select: { authorId: true }
            });

            if (thread) {
                await redis.del(`threads:user:${thread.authorId}:all`);
                await redis.del(`threads:user:${thread.authorId}:media`);
            }
        } catch (error) {
            console.warn("Redis delete error:", error);
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Thread unliked successfully",
        });

    } catch (error) {
        console.error("Failed to unlike thread:", error);
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to unlike thread",
        });
    }
};

