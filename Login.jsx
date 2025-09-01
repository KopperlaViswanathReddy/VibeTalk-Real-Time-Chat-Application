import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import { login } from "../store/slices/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { authUser, isLoggingIn, error } = useSelector((state) => state.auth);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password!");
      return;
    }
    dispatch(login(formData));
  };

  // Navigate after successful login
  useEffect(() => {
    if (authUser) {
      toast.success("Login successful!");
      navigate("/"); // Redirect to Home
    }
  }, [authUser, navigate]);

  // Show login error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* LEFT SIDE - FORM */}
      <div className="flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* LOGO & HEADING */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="bg-blue-100 p-3 rounded-lg">
              <MessageSquare className="text-blue-600 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-2">
              Sign in to your account
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 
                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 
                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                        py-2 rounded-md transition duration-200 flex justify-center items-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - PATTERN */}
      <AuthImagePattern
        title={"Welcome Back"}
        subtitle={
          "Sign in to continue your conversation and catch up with your messages."
        }
      />
    </div>
  );
};

export default Login;
