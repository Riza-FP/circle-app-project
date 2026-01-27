import { Response } from "express";
import { AuthRequest } from "../middlewares/auth-middleware";
import prisma from "../connections/client";

export const searchUsers = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.user_id; // For checking is_following
        const { keyword } = req.query;

        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({ status: "error", message: "Keyword is required" });
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: keyword, mode: 'insensitive' } },
                    { fullName: { contains: keyword, mode: 'insensitive' } }
                ],
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                photoProfile: true,
                _count: {
                    select: { followers: true }
                }
            }
        });

        // Map data to spec format
        const data = await Promise.all(users.map(async (user) => {
            let isFollowing = false;

            if (userId) {
                // Check if current user follows this user
                const follow = await prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: userId,
                            followingId: user.id
                        }
                    }
                });
                isFollowing = !!follow;
            }

            return {
                id: user.id,
                username: user.username,
                name: user.fullName,
                avatar: user.photoProfile,
                followers: user._count.followers,
                is_following: isFollowing
            };
        }));

        return res.json({
            status: "success",
            data: { users: data }
        });

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch user data. Please try again later."
        });
    }
};
