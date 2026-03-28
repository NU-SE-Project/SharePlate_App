// src/socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  const allowedOrigin = process.env.SOCKET_ORIGIN || process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const corsOptions = {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  };

  // In development allow any origin if explicitly set to '*'
  if (allowedOrigin === '*') {
    corsOptions.origin = true;
  }

  io = new Server(server, { cors: corsOptions });

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId.toString());
      console.log("User joined room:", userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};