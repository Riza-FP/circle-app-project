import { Response } from "express";
import prisma from "../connections/client";
import { AuthRequest } from "../middlewares/auth-middleware";

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user?.user_id;

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

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Profile fetched successfully",
            data: {
                id: user.id,
                username: user.username,
                name: user.fullName,
                email: user.email,
                avatar: user.photoProfile,
                cover_photo: user.coverPhoto,
                bio: user.bio,
                follower_count: user._count.followers,
                following_count: user._count.following,
            },
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
        });
    }
};
