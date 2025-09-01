// src/redux/slices/authSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { connectSocket, disconnectSocket } from "../../lib/socket";

// ============================
// 1️⃣ GET USER (on app load)
// ============================
export const getUser = createAsyncThunk("auth/getUser", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/user/me");
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Unauthorized");
  }
});

// ============================
// 2️⃣ LOGIN USER
// ============================
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/user/sign-in", data);

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }

    toast.success("Login successful!");
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

// ============================
// 3️⃣ SIGNUP USER
// ============================
export const signup = createAsyncThunk("auth/sign-up", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/user/sign-up", data);

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }

    toast.success("Account created successfully!");
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Signup failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

// ============================
// 4️⃣ LOGOUT USER
// ============================
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/user/sign-out");
    localStorage.removeItem("token");
    disconnectSocket();
    toast.success("Logged out successfully!");
    return null;
  } catch (error) {
    const message = error.response?.data?.message || "Logout failed!";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

// ============================
// 5️⃣ REDUX SLICE
// ============================


export const updateProfile= createAsyncThunk("user/update-profile",async(data,thunkAPI)=>{
  try{
    const res=await axiosInstance.put("/user/update-profile",data);
    toast.success("Profile Updated Successfully");
    return res.data;
  }catch(error){
    toast.error(error.response.data.message);
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});



const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isLoggingIn: false,
    isSigningUp: false,
    isCheckingAuth: true,
    error: null,
    onlineUsers: [],
  },
  reducers: {
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Get User
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isCheckingAuth = false;
        state.error = null;

        // ✅ Connect socket after successful user fetch
        connectSocket();
      })
      .addCase(getUser.rejected, (state, action) => {
        state.authUser = null;
        state.isCheckingAuth = false;
        state.error = action.payload;
      })

      // 🔹 Login User
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isLoggingIn = false;
        state.error = null;

        // ✅ Connect socket after login
        connectSocket();
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.error = action.payload;
      })

      // 🔹 Signup User
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigningUp = false;

        // ✅ Connect socket after signup
        connectSocket();
      })
      .addCase(signup.rejected, (state, action) => {
        state.isSigningUp = false;
        state.error = action.payload;
      })

      // 🔹 Logout User
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
        state.error = null;
        state.onlineUsers = [];
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isUpdatingProfile= false;

        
        connectSocket();
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdatingProfileUp = false;
        state.error = action.payload;
      });
  },
});

export const { setOnlineUsers, clearError } = authSlice.actions;
export default authSlice.reducer;
