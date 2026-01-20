import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../connections/client";
import { generateToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../validators/auth-validation";

export const register = async (req: Request, res: Response) => {
    try {
        const { value, error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: error.details[0].message,
            });
        }

        const { username, name, email, password } = value;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                fullName: name,
                email,
                password: hashedPassword,
            },
        });

        const token = generateToken({
            user_id: user.id,
            username: user.username,
            name: user.fullName,
            email: user.email,
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Registrations successful!",
            data: {
                user_id: user.id,
                username: user.username,
                name: user.fullName,
                email: user.email,
                bio: null,
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Invalid register",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { value, error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: error.details[0].message,
            });
        }
        const { identifier, password } = value;

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
        });

        if (!user) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid Login",
            });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid Login",
            });
        }

        const token = generateToken({
            user_id: user.id,
            username: user.username,
            name: user.fullName,
            email: user.email,
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Login successful.",
            data: {
                user_id: user.id,
                username: user.username,
                name: user.fullName,
                email: user.email,
                avatar: user.photoProfile || null,
                bio: user.bio,
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Invalid Login",
        });
    }
};

export const checkAuth = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.user_id,
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
            message: "User verified",
            data: {
                user_id: user.id,
                username: user.username,
                name: user.fullName,
                email: user.email,
                avatar: user.photoProfile || null,
                bio: user.bio,
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
