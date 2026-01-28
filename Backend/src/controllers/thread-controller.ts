import { Response } from "express";
import prisma from "../connections/client";
import { AuthRequest } from "../middlewares/auth-middleware";
import redis from "../libs/redis";
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


        // Invalidate Cache
        try {
            await redis.del("threads:all");
            // Also invalidate the specific user's feed
            await redis.del(`threads:user:${userId}:all`);
            if (imageUrls.length > 0) {
                await redis.del(`threads:user:${userId}:media`);
            }
        } catch (error) {
            console.warn("Redis delete error:", error);
        }

        // Fetch full thread data for broadcast similar to getThreadById
        const fullThread = await prisma.thread.findUnique({
            where: { id: thread.id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true, // we use this as 'name'
                        photoProfile: true,
                    }
                },
                likes: true,
                replies: true,
            }
        });

        if (fullThread) {
            const mappedThread = {
                id: fullThread.id,
                content: fullThread.content,
                user: {
                    id: fullThread.author.id,
                    username: fullThread.author.username,
                    name: fullThread.author.fullName,
                    profile_picture: fullThread.author.photoProfile,
                },
                created_at: fullThread.createdAt,
                images: fullThread.images,
                likes: fullThread.likes.length,
                reply: fullThread.replies.length,
                isLiked: false, // New thread, author hasn't liked it yet
                authorId: fullThread.authorId // Ensure authorId is there
            };

            broadcastToClients({
                type: "NEW_THREAD",
                data: mappedThread
            });
        }

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
        const userId = req.user?.user_id;
        const limit = Number(req.query.limit) || 25;
        const CACHE_KEY = "threads:all";

        let threads;

        // Try to fetch from cache
        try {
            const cachedThreads = await redis.get(CACHE_KEY);
            if (cachedThreads) {
                console.log(`[REDIS] Cache HIT`);
                threads = JSON.parse(cachedThreads);
            }
        } catch (error) {
            console.warn("Redis cache error:", error);
        }

        if (!threads) {
            console.log(`[REDIS] Cache MISS`);
            threads = await prisma.thread.findMany({
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

            // Store raw threads in cache (including likes relation) for 60 seconds
            try {
                await redis.set(CACHE_KEY, JSON.stringify(threads), "EX", 60);
            } catch (error) {
                console.warn("Redis cache set error:", error);
            }
        }

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
                isLiked: userId ? thread.likes.some(
                    (like: any) => like.userId === userId
                ) : false,
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

        // Invalidate Cache
        try {
            await redis.del("threads:all");
            await redis.del(`threads:user:${userId}:all`);
            // We blindly delete media cache too just in case
            await redis.del(`threads:user:${userId}:media`);
        } catch (error) {
            console.warn("Redis delete error:", error);
        }

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

        // Invalidate Cache
        // Invalidate Cache
        try {
            await redis.del("threads:all");
            await redis.del(`threads:user:${userId}:all`);
            await redis.del(`threads:user:${userId}:media`);
        } catch (error) {
            console.warn("Redis delete error:", error);
        }

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

export const getThreadsByUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = parseInt(req.params.id as string);
        const currentUserId = req.user?.user_id;
        const type = req.query.type as string; // 'media' or undefined

        // Determine Cache Key based on type
        const CACHE_KEY = `threads:user:${userId}:${type === 'media' ? 'media' : 'all'}`;

        if (isNaN(userId)) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid user ID",
            });
        }

        // Try to fetch from cache
        let threads;
        try {
            const cachedThreads = await redis.get(CACHE_KEY);
            if (cachedThreads) {
                threads = JSON.parse(cachedThreads);
            }
        } catch (error) {
            console.warn("Redis cache error (getThreadsByUser):", error);
        }

        if (!threads) {
            // Build Where Clause
            const whereClause: any = {
                authorId: userId
            };

            if (type === 'media') {
                whereClause.NOT = {
                    images: {
                        equals: []
                    }
                };
            }

            threads = await prisma.thread.findMany({
                where: whereClause,
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

            // Store raw threads in cache for 60 seconds
            try {
                await redis.set(CACHE_KEY, JSON.stringify(threads), "EX", 60);
            } catch (error) {
                console.warn("Redis cache set error (getThreadsByUser):", error);
            }
        }

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
                isLiked: currentUserId ? thread.likes.some(
                    (like: any) => like.userId === currentUserId
                ) : false,
            };
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "User threads fetched successfully",
            data: {
                threads: mappedThreads,
            },
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to get user threads",
        });
    }
};
