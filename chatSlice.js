// frontend/store/slices/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// ------------------ Async Thunks ------------------ //

// Fetch all users
export const getUsers = createAsyncThunk("chat/getUsers", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/message/users");
    return res.data.users;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch users");
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

// Fetch messages with a selected user
export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (userId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// Send message (text + optional media)
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ data, receiverId, tempId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(`/message/send/${receiverId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Return both server message and temporary ID to update UI
      return { serverMessage: res.data.message, tempId };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ------------------ Slice ------------------ //
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    users: [],            // All chat users
    messages: [],         // Current conversation messages
    selectedUser: null,   // Active user in chat
    isUsersLoading: false,
    isMessagesLoading: false,
  },
  reducers: {
    // Set selected user and reset messages
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.messages = [];
    },

    // Push a new message into messages list (socket or optimistic)
    pushNewMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // Update a temporary message with the server response
    updatePendingMessage: (state, action) => {
      const { tempId, serverMessage } = action.payload;
      state.messages = state.messages.map((msg) =>
        msg._id === tempId ? serverMessage : msg
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.isUsersLoading = false;
      })
      .addCase(getUsers.rejected, (state) => {
        state.isUsersLoading = false;
      })

      // Fetch Messages
      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
        state.isMessagesLoading = false;
      })
      .addCase(getMessages.rejected, (state) => {
        state.isMessagesLoading = false;
      })

      // Send Message Success → Replace temp message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { tempId, serverMessage } = action.payload;
        state.messages = state.messages.map((msg) =>
          msg._id === tempId ? serverMessage : msg
        );
      });
  },
});

export const { setSelectedUser, pushNewMessage, updatePendingMessage } =
  chatSlice.actions;
export default chatSlice.reducer;
