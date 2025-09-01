import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { getUser, setOnlineUsers } from "./store/slices/authSlice";
import { connectSocket, disconnectSocket } from "./lib/socket";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";

const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const didFetchRef = useRef(false);

  // ✅ Fetch user info if a token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!didFetchRef.current && token) {
      didFetchRef.current = true;
      dispatch(getUser());
    }
  }, [dispatch]);

  // ✅ Connect socket only after user is authenticated
  useEffect(() => {
    if (!authUser) return;

    // Connect to the socket server
    const socket = connectSocket();

    if (socket) {
      // Listen for online users list from backend
      socket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });
    }

    // ✅ Cleanup when user logs out or component unmounts
    return () => {
      if (socket) {
        socket.off("getOnlineUsers");
        disconnectSocket();
      }
    };
  }, [authUser, dispatch]);

  // ✅ Show loader only if checking auth and token exists
  const hasToken = !!localStorage.getItem("token");
  if (isCheckingAuth && hasToken && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={!authUser ? <Register /> : <Navigate to="/" />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Navigate to={authUser ? "/" : "/login"} replace />}
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
