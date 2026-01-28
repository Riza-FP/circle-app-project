import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth-routes";
import userRoutes from "./routes/user-routes";
import threadRoutes from "./routes/thread-route";
import replyRoutes from "./routes/reply-route";
import likeRoutes from "./routes/like-route";
import profileRoutes from "./routes/profile-route";
import followRoutes from "./routes/follow-route";
import searchRoutes from "./routes/search-route";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { swaggerDocs } from "./utils/swagger";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/thread", threadRoutes);
app.use("/api/v1/reply", replyRoutes);
app.use("/api/v1/like", likeRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/follows", followRoutes);
app.use("/api/v1/search", searchRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

export const broadcastToClients = (message: any) => {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  swaggerDocs(app, Number(PORT));
});