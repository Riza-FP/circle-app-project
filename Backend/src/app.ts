
import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth-routes";
import userRoutes from "./routes/user-routes";
import threadRoutes from "./routes/thread-route";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/thread", threadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});