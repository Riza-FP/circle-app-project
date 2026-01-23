import { Response } from "express";
import prisma from "../connections/client";
import { AuthRequest } from "../middlewares/auth-middleware";
import { createThreadSchema } from "../validators/thread-validation";
import { broadcastToClients } from "../app";

export const createReply = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const { thread_id, content } = req.body;

        // Validate with schema (treating reply similar to thread)
        const { error, value } = createThreadSchema.validate({ content });

        if (error) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: error.details[0].message,
            });
        }

        if (!thread_id) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Thread ID is required",
            });
        }

        const threadId = parseInt(thread_id);

        const files = req.files as Express.Multer.File[];
        const imageUrls = files?.map(file => `/uploads/${file.filename}`) || [];

        const reply = await prisma.reply.create({
            data: {
                content: value.content || "", // allow empty if images exist
                images: imageUrls,
                threadId,
                authorId: userId,
            },
        });

        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
            include: { author: true }
        });

        const replier = await prisma.user.findUnique({ where: { id: userId } });

        if (thread && replier) {
            broadcastToClients({
                type: "NOTIFICATION",
                message: `${replier.fullName} replied to your thread`,
                userId: thread.authorId
            });
            // Also broadcast the new reply so the thread detail can update live?
            broadcastToClients({
                type: "NEW_REPLY",
                data: reply,
                threadId: threadId
            });
        }

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
            message: "Failed to create reply",
        });
    }
};

export const getReplies = async (req: AuthRequest, res: Response) => {
    try {
        const { thread_id } = req.query;
        const threadId = parseInt(thread_id as string);

        if (!threadId) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Thread ID is required",
            });
        }

        const replies = await prisma.reply.findMany({
            where: {
                threadId: threadId,
            },
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
            },
        });

        const mappedReplies = replies.map((reply) => {
            return {
                id: reply.id,
                content: reply.content,
                user: {
                    id: reply.author.id,
                    username: reply.author.username,
                    name: reply.author.fullName,
                    profile_picture: reply.author.photoProfile,
                },
                created_at: reply.createdAt,
                images: reply.images, // Add images to response
            };
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Get Data Replies Successfully",
            data: {
                replies: mappedReplies,
            },
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to get replies",
        });
    }
};

export const deleteReply = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const replyId = parseInt(req.params.id as string);

        const reply = await prisma.reply.findUnique({
            where: { id: replyId },
        });

        if (!reply) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Reply not found",
            });
        }

        if (reply.authorId !== userId) {
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "You are not authorized to delete this reply",
            });
        }

        await prisma.reply.delete({
            where: { id: replyId },
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Reply deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to delete reply",
        });
    }
};

export const updateReply = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.user_id;
        const replyId = parseInt(req.params.id as string);
        const { content } = req.body;
        const files = req.files as Express.Multer.File[];

        const reply = await prisma.reply.findUnique({
            where: { id: replyId },
        });

        if (!reply) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Reply not found",
            });
        }

        if (reply.authorId !== userId) {
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "You are not authorized to update this reply",
            });
        }

        let newImages = reply.images;
        if (files && files.length > 0) {
            newImages = files.map(file => `/uploads/${file.filename}`);
        }

        const updatedReply = await prisma.reply.update({
            where: { id: replyId },
            data: {
                content,
                images: newImages,
            },
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Reply updated successfully",
            data: updatedReply,
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to update reply",
        });
    }
};
