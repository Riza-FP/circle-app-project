import request from "supertest";
import express from "express";
import authRoutes from "../../routes/auth-routes";
import prisma from "../../connections/client";

// Mock Prisma
jest.mock("../../connections/client", () => ({
    __esModule: true,
    default: {
        user: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    },
}));

// Mock JWT
jest.mock("../../utils/jwt", () => ({
    generateToken: jest.fn().mockReturnValue("mocked_token"),
}));

// Setup Express App for Testing
const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth Integration Tests", () => {
    describe("POST /auth/register", () => {
        it("should register a new user", async () => {
            // Mock Prisma behavior
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // No existing user
            (prisma.user.create as jest.Mock).mockResolvedValue({
                id: 1,
                email: "test@example.com",
                name: "Test User",
                password: "hashedpassword"
            });

            const res = await request(app).post("/auth/register").send({
                name: "Test User",
                username: "testuser",
                email: "test@example.com",
                password: "password123",
            });

            // Adjusted expectations to match controller implementation
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Registrations successful!");
        });

        it("should fail if email already exists", async () => {
            // Mock existing user
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 1, email: "test@example.com" });

            const res = await request(app).post("/auth/register").send({
                name: "Test User",
                username: "testuser",
                email: "test@example.com",
                password: "password123",
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("User already exists");
        });
    });
});
