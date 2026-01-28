import request from "supertest";
import express from "express";
import threadRoutes from "../../routes/thread-route";
import prisma from "../../connections/client";
import redis from "../../libs/redis";

// Mock Prisma
jest.mock("../../connections/client", () => ({
    __esModule: true,
    default: {
        thread: {
            findMany: jest.fn(),
        },
    },
}));

// Mock Redis
jest.mock("../../libs/redis", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
    },
}));

// Mock Auth Middleware to bypass JWT check for simplicity
jest.mock("../../middlewares/auth-middleware", () => ({
    authMiddleware: (req: any, res: any, next: any) => {
        req.user = { user_id: 1, username: "testuser" };
        next();
    },
}));

// Mock App (broadcastToClients)
jest.mock("../../app", () => ({
    broadcastToClients: jest.fn(),
}));

// Setup Express App for Testing
const app = express();
app.use(express.json());
app.use("/thread", threadRoutes);

describe("Thread Integration Tests", () => {
    describe("GET /thread", () => {
        it("should return threads list", async () => {
            // Mock Redis Cache Miss
            (redis.get as jest.Mock).mockResolvedValue(null);

            // Mock Prisma response
            (prisma.thread.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 1,
                    content: "Hello World",
                    createdAt: new Date(),
                    images: [],
                    author: {
                        id: 1,
                        username: "testuser",
                        fullName: "Test User",
                        photoProfile: null,
                    },
                    likes: [],
                    replies: [],
                },
            ]);

            const res = await request(app).get("/thread");

            expect(res.status).toBe(200);
            expect(res.body.data.threads).toHaveLength(1);
            expect(res.body.data.threads[0].content).toBe("Hello World");
        });
    });
});
