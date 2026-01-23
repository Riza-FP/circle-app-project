import { Response } from "express";
import prisma from "../connections/client";
import { AuthRequest } from "../middlewares/auth-middleware";
import { createThreadSchema } from "../validators/thread-validation";
import { broadcastToClients } from "../app";


export const createThread = async (req: AuthRequest, res: Response) => {
    try {

        const { error, value } = createThreadSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: error.details[0].message,
            });
        }

        const { content } = value;
        const userId = req.user.user_id;


        const files = req.files as Express.Multer.File[];
        const imageUrls = files?.map(file => `/uploads/${file.filename}`) || [];


        const thread = await prisma.thread.create({
            data: {
                content,
                images: imageUrls,
                authorId: userId,
            },
        });


        broadcastToClients({
            type: "NEW_THREAD",
            data: thread
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Thread created successfully",
            data: {
                id: thread.id,
                content: thread.content,
                images: thread.images,
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
                images: thread.images,
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

export const getThreadById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const threadId = parseInt(req.params.id as string);

        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
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

        if (!thread) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Thread not found",
            });
        }

        const mappedThread = {
            id: thread.id,
            content: thread.content,
            user: {
                id: thread.author.id,
                username: thread.author.username,
                name: thread.author.fullName,
                profile_picture: thread.author.photoProfile,
            },
            created_at: thread.createdAt,
            images: thread.images,
            likes: thread.likes.length,
            reply: thread.replies.length,
            isLiked: thread.likes.some(
                (like: any) => like.userId === userId
            ),
        };

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Get Data Thread Successfully",
            data: mappedThread,
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to get thread details",
        });
    }
};






export const deleteThread = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const threadId = parseInt(req.params.id as string);

        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
        });

        if (!thread) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Thread not found",
            });
        }

        if (thread.authorId !== userId) {
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "You are not authorized to delete this thread",
            });
        }

        await prisma.thread.delete({
            where: { id: threadId },
        });

        broadcastToClients({
            type: "DELETE_THREAD",
            threadId,
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Thread deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to delete thread",
        });
    }
};

export const updateThread = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const threadId = parseInt(req.params.id as string);

        const { error, value } = createThreadSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: error.details[0].message,
            });
        }

        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
        });

        if (!thread) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Thread not found",
            });
        }

        if (thread.authorId !== userId) {
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "You are not authorized to update this thread",
            });
        }

        const { content } = value;
        const files = req.files as Express.Multer.File[];

        let newImages = thread.images;

        if (files && files.length > 0) {
            newImages = files.map(file => `/uploads/${file.filename}`);
        }

        const updatedThread = await prisma.thread.update({
            where: { id: threadId },
            data: {
                content,
                images: newImages,
            },
        });

        broadcastToClients({
            type: "UPDATE_THREAD",
            data: updatedThread,
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Thread updated successfully",
            data: updatedThread,
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to update thread",
        });
    }
};
