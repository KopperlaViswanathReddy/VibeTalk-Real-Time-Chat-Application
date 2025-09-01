// backend/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const userSocketMap = {}; // userId -> socketId
let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    try {
      const token = socket.handshake.auth?.token;
      if (!token) return socket.disconnect();

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded.id;

      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      });
    } catch (err) {
      console.log("Socket auth error:", err.message);
      socket.disconnect();
    }
  });
}


// Getter function to use in controllers
export function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
