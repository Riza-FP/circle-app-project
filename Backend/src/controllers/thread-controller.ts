import { Request, Response } from "express";
import prisma from "../connections/client";
import { AuthRequest } from "../middlewares/auth-middleware";
import { createThreadSchema } from "../validators/thread-validation";


export const createThread = async (req: AuthRequest, res: Response) => {
    try {
        const { value, error } = createThreadSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: error.details[0].message,
            });
        }

        const { content, image } = value;
        const userId = req.user.user_id;

        const thread = await prisma.thread.create({
            data: {
                content,
                image,
                authorId: userId,
            },
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Thread created successfully",
            data: {
                id: thread.id,
                content: thread.content,
                created_at: thread.createdAt,
            },
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to create thread",
        });
    }
};


export const getThreads = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const limit = Number(req.query.limit) || 25;

        const threads = await prisma.thread.findMany({
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        photoProfile: true,
                    },
                },
                likes: true,
                replies: true,
            },
        });

        const mappedThreads = threads.map((thread: any) => {
            return {
                id: thread.id,
                content: thread.content,
                user: {
                    id: thread.author.id,
                    username: thread.author.username,
                    name: thread.author.fullName,
                    profile_picture: thread.author.photoProfile,
                },
                created_at: thread.createdAt,
                likes: thread.likes.length,
                reply: thread.replies.length,
                isLiked: thread.likes.some(
                    (like: any) => like.userId === userId
                ),
            };
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Get Data Thread Successfully",
            data: {
                threads: mappedThreads,
            },
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to get threads",
        });
    }
};


export const likeThread = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const threadId = parseInt(req.params.id as string);

        await prisma.like.create({
            data: {
                userId,
                threadId,
            },
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Thread liked successfully",
        });

    } catch (error) {
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
        const threadId = parseInt(req.params.id as string);

        await prisma.like.deleteMany({
            where: {
                userId,
                threadId,
            },
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Thread unliked successfully",
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to unlike thread",
        });
    }
};


export const replyThread = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const threadId = parseInt(req.params.id as string);
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Reply content is required",
            });
        }

        const reply = await prisma.reply.create({
            data: {
                content,
                threadId,
                authorId: userId,
            },
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Reply created successfully",
            data: reply,
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to reply thread",
        });
    }
};
