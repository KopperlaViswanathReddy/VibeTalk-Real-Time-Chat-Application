// controllers/message.controller.js
import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { getReceiverSocketId, getIO } from "../utils/socket.js";

/**
 * Get all users except the logged-in user
 */
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId } }).select("-password");
    res.status(200).json({
        success: true,
        users,
    });
});

/**
 * Get all messages between logged-in user and a receiver
 */
export const getMessages = catchAsyncError(async (req, res, next) => {
    const receiverId = req.params.id;
    const myId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ success: false, message: "Invalid Receiver ID." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return res.status(404).json({ success: false, message: "Receiver not found." });
    }

    const messages = await Message.find({
        $or: [
            { senderId: myId, receiverId: receiverId },
            { senderId: receiverId, receiverId: myId },
        ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
});

/**
 * Send a message (text or media) to a receiver
 */
export const sendMessage = catchAsyncError(async (req, res, next) => {
    const { text } = req.body;
    const media = req?.files?.media;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Validate receiverId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ success: false, message: "Invalid Receiver ID." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return res.status(404).json({ success: false, message: "Receiver not found." });
    }

    const sanitizedText = text?.trim() || "";
    if (!sanitizedText && !media) {
        return res.status(400).json({ success: false, message: "Cannot send empty message." });
    }

    // Upload media to Cloudinary if present
    let mediaUrl = "";
    if (media) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(media.tempFilePath, {
                resource_type: "auto",
                folder: "CHAT_APP_MEDIA",
                transformation: [
                    { width: 1080, height: 1080, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "auto" },
                ],
            });
            mediaUrl = uploadResponse.secure_url;
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to upload media. Please try again later.",
            });
        }
    }

    // Save message in DB
    const newMessage = await Message.create({
        senderId,
        receiverId,
        text: sanitizedText,
        media: mediaUrl,
    });

    // Emit message via Socket.IO if receiver is online
    try {
        const io = getIO();
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    } catch (err) {
        console.error("Socket emit error:", err.message);
    }

    res.status(201).json({ success: true, message: newMessage });
});
