import { Response } from "express";
import { AuthRequest } from "../middlewares/auth-middleware";
import prisma from "../connections/client";

export const followUser = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = req.user?.user_id;
        const { followed_user_id } = req.body;

        if (!followerId) {
            return res.status(401).json({ status: "error", message: "Unauthorized" });
        }

        if (followerId === followed_user_id) {
            return res.status(400).json({ status: "error", message: "You cannot follow yourself" });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: followed_user_id
                }
            }
        });

        if (existingFollow) {
            return res.status(400).json({ status: "error", message: "You are already following this user" });
        }

        await prisma.follow.create({
            data: {
                followerId,
                followingId: followed_user_id
            }
        });

        return res.json({
            status: "success",
            message: "You have successfully followed the user.",
            data: {
                user_id: followed_user_id,
                is_following: true
            }
        });

    } catch (error) {
        console.error("Follow error:", error);
        return res.status(500).json({ status: "error", message: "Failed to follow the user. Please try again later." });
    }
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = req.user?.user_id;
        const { followed_id } = req.body;

        if (!followerId) {
            return res.status(401).json({ status: "error", message: "Unauthorized" });
        }

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: followed_id
                }
            }
        });

        return res.json({
            status: "success",
            message: "You have successfully unfollowed the user.",
            data: {
                user_id: followed_id,
                is_following: false
            }
        });

    } catch (error) {
        console.error("Unfollow error:", error);
        return res.status(500).json({ status: "error", message: "Failed to unfollow the user. Please try again later." });
    }
};

export const getFollows = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.user_id;
        const { type } = req.query;

        if (!userId) {
            return res.status(401).json({ status: "error", message: "Unauthorized" });
        }

        let follows;

        if (type === 'followers') {
            // Who follows me?
            // I am the 'following', they are the 'follower'
            follows = await prisma.follow.findMany({
                where: { followingId: userId },
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true, // using fullName mapping to name in response
                            photoProfile: true // using photoProfile mapping to avatar
                        }
                    }
                }
            });

            // Map and check if I follow them back
            const data = await Promise.all(follows.map(async (f) => {
                const isFollowing = await prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: userId,
                            followingId: f.follower.id
                        }
                    }
                });

                return {
                    id: f.follower.id,
                    username: f.follower.username,
                    name: f.follower.fullName,
                    avatar: f.follower.photoProfile,
                    is_following: !!isFollowing
                };
            }));

            return res.json({
                status: "success",
                data: { followers: data } // Key is always 'followers' per spec example? Or should be dynamic? Spec says 'followers' array in data object for both.
            });

        } else if (type === 'following') {
            // Who do I follow?
            // I am the 'follower', they are the 'following'
            follows = await prisma.follow.findMany({
                where: { followerId: userId },
                include: {
                    following: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            photoProfile: true
                        }
                    }
                }
            });

            // For 'following' list, implies is_following is true (unless I can see others' following lists, but currently auth user only)
            const data = follows.map(f => ({
                id: f.following.id,
                username: f.following.username,
                name: f.following.fullName,
                avatar: f.following.photoProfile,
                is_following: true
            }));

            return res.json({
                status: "success",
                data: { followers: data } // Spec example uses 'followers' key even for following list? "followers": [...] in request_3 response body. I will stick to spec.
            });
        }

        return res.status(400).json({ status: "error", message: "Invalid type parameter" });

    } catch (error) {
        console.error("Get follows error:", error);
        return res.status(500).json({ status: "error", message: "Failed to fetch data." });
    }
};
