import express from "express";
import {
    getAllUsers,
    getMessages,
    sendMessage
} from "../controllers/message.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router=express.Router();

router.get("/users",isAuthenticated,getAllUsers);
router.get("/:id",isAuthenticated,getMessages);

// Send message to a specific user
router.post("/send/:id", isAuthenticated, sendMessage);




export default router;
