import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { signup } from "../store/slices/authSlice";
import AuthImagePattern from "../components/AuthImagePattern";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const { isSigningUp, error } = useSelector((state) => state.auth);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signup(formData));
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      <div className="flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* LOGO & HEADING */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="bg-blue-100 p-3 rounded-lg">
              <MessageSquare className="text-blue-600 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold mt-4">Create Account</h1>
            <p className="text-gray-500 text-sm mt-2">
              Get started with your free account
            </p>
          </div>

          {/* Show error message */}
          {error && (
            <p className="text-red-500 bg-red-100 border border-red-300 p-2 rounded-md mb-4 text-sm text-center">
              {error}
            </p>
          )}

          {/* REGISTER FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  name="fullName"
                  className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 
                          focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Indira Priyadharsini"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
                  required
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
                  required
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
              disabled={isSigningUp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                      py-2 rounded-md transition duration-200 flex justify-center items-center gap-2"
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - PATTERN */}
      <AuthImagePattern
        title={"Join Our Community"}
        subtitle={
          "Connect with friends and family, share your thoughts, and stay updated with the latest news."
        }
      />
    </div>
  );
};

export default Register;
