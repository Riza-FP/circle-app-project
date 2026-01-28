import { Response } from "express";
import prisma from "../connections/client";
import { AuthRequest } from "../middlewares/auth-middleware";
import redis from "../libs/redis";

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user?.user_id;
        const CACHE_KEY = `user:${id}`;

        // Try to fetch from cache
        try {
            const cachedUser = await redis.get(CACHE_KEY);
            if (cachedUser) {
                return res.status(200).json({
                    code: 200,
                    status: "success",
                    message: "Profile fetched from cache",
                    data: JSON.parse(cachedUser),
                });
            }
        } catch (error) {
            console.warn("Redis cache error (getProfile):", error);
        }

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "User not found",
            });
        }

        const userData = {
            id: user.id,
            username: user.username,
            name: user.fullName,
            email: user.email,
            avatar: user.photoProfile,
            cover_photo: user.coverPhoto,
            bio: user.bio,
            follower_count: user._count.followers,
            following_count: user._count.following,
        };

        // Cache for 60 seconds
        try {
            await redis.set(CACHE_KEY, JSON.stringify(userData), "EX", 60);
        } catch (error) {
            console.warn("Redis cache set error (getProfile):", error);
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Profile fetched successfully",
            data: userData,
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
        });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user?.user_id;
        const { fullName, username, bio } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Prepare data to update
        const updateData: any = {};
        if (fullName) updateData.fullName = fullName;
        if (username) updateData.username = username;
        if (bio) updateData.bio = bio;

        if (files?.avatar?.[0]) {
            updateData.photoProfile = `/uploads/${files.avatar[0].filename}`;
        }
        if (files?.cover?.[0]) {
            updateData.coverPhoto = `/uploads/${files.cover[0].filename}`;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        // Invalidate Caches
        try {
            // Invalidate user profile cache
            await redis.del(`user:${id}`);

            // Invalidate threads caches because they contain user details (author)
            await redis.del("threads:all");
            await redis.del(`threads:user:${id}:all`);
            await redis.del(`threads:user:${id}:media`);
        } catch (error) {
            console.warn("Redis delete error (updateProfile):", error);
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Profile updated successfully",
            data: {
                id: user.id,
                username: user.username,
                name: user.fullName,
                email: user.email,
                avatar: user.photoProfile,
                cover_photo: user.coverPhoto,
                bio: user.bio,
            },
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to update profile",
        });
    }
};

export const getSuggestedUsers = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.user_id;

        // Get list of users already followed
        const following = await prisma.follow.findMany({
            where: {
                followerId: userId,
            },
            select: {
                followingId: true,
            },
        });

        const followingIds = following.map((f) => f.followingId);

        // Find users NOT in following list and NOT self
        // Take 5 random-ish (for now just take 5, in real app random or algo)
        const suggestedUsers = await prisma.user.findMany({
            where: {
                id: {
                    notIn: [...followingIds, userId],
                },
            },
            take: 5,
            orderBy: {
                createdAt: 'desc' // Or any other criteria
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                photoProfile: true,
                bio: true,
            }
        });

        // Map to standard format if needed, but select matches frontend needs mostly
        const formattedUsers = suggestedUsers.map(user => ({
            id: user.id,
            username: user.username,
            name: user.fullName,
            avatar: user.photoProfile,
            bio: user.bio,
            is_following: false // By definition they are not followed
        }));

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Suggested users fetched successfully",
            data: formattedUsers,
        });

    } catch (error) {
        console.error("Suggested users error:", error);
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to fetch suggested users",
        });
    }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.user_id;
        const userId = parseInt(id as string);
        const CACHE_KEY = `user:${userId}`;

        if (isNaN(userId)) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid user ID",
            });
        }

        // Try to fetch from cache
        try {
            const cachedUser = await redis.get(CACHE_KEY);
            if (cachedUser) {
                // Re-check following status even if cached, OR we cache "basic info" and query "following" separately.
                // For simplicity, we'll cache the user object WITHOUT is_following, and compute is_following.
                // OR invalidating this cache is harder if it depends on WHO is viewing.
                // STRATEGY: Cache the "User Data" part. Fetch "isFollowing" live.

                const userData = JSON.parse(cachedUser);

                // Check isFollowing live
                let isFollowing = false;
                if (currentUserId) {
                    const follow = await prisma.follow.findFirst({
                        where: {
                            followerId: currentUserId,
                            followingId: userId,
                        },
                    });
                    isFollowing = !!follow;
                }

                return res.status(200).json({
                    code: 200,
                    status: "success",
                    message: "User fetched from cache",
                    data: {
                        ...userData,
                        is_following: isFollowing,
                    },
                });
            }
        } catch (error) {
            console.warn("Redis cache error (getUserById):", error);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "User not found",
            });
        }

        const userData = {
            id: user.id,
            username: user.username,
            name: user.fullName,
            avatar: user.photoProfile,
            cover_photo: user.coverPhoto,
            bio: user.bio,
            follower_count: user._count.followers,
            following_count: user._count.following,
        };

        // Cache User Data Only
        try {
            await redis.set(CACHE_KEY, JSON.stringify(userData), "EX", 60);
        } catch (error) {
            console.warn("Redis cache set error (getUserById):", error);
        }

        // Check isFollowing
        let isFollowing = false;
        if (currentUserId) {
            const follow = await prisma.follow.findFirst({
                where: {
                    followerId: currentUserId,
                    followingId: userId,
                },
            });
            isFollowing = !!follow;
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "User fetched successfully",
            data: {
                ...userData,
                is_following: isFollowing,
            },
        });

    } catch (error) {
        console.error("Get user by id error:", error);
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Failed to fetch user",
        });
    }
};
