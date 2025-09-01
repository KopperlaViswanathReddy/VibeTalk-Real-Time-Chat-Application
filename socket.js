// frontend/socket.js
import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  const token = localStorage.getItem("token"); // stored after login
  if (!token) return null;

  if (!socket) {
    socket = io("http://localhost:4000", {
      auth: { token }, // ✅ Send token only
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
