import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";

const Signup = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [step, setStep] = useState(1); // 1 = Signup form, 2 = OTP input
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Step 1: Request OTP
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      setUserEmail(data.email);
      await axiosInstance.post("/v1/auth/send-otp", { email: data.email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const verifyOtp = async () => {
    setLoading(true);
    try {
      // Verify OTP with backend
      await axiosInstance.post("/v1/auth/verify-otp", {
        email: userEmail,
        otp,
      });
      toast.success("OTP verified! Completing registration...");

      // Submit full registration
      const formData = new FormData();
      formData.append("fullname", watch("fullname"));
      formData.append("username", watch("username"));
      formData.append("email", userEmail);
      formData.append("password", watch("password"));
      if (watch("avatar")?.[0]) formData.append("avatar", watch("avatar")[0]);
      if (watch("coverImage")?.[0])
        formData.append("coverImage", watch("coverImage")[0]);

      const response = await axiosInstance.post("/v1/auth/register", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message || "Registration successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {step === 1 && (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Create an Account
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                placeholder="Your full name"
                {...register("fullname", { required: "Full name is required" })}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                placeholder="Your username"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 mt-2 transform -translate-y-1/2 text-xl text-gray-500"
              >
                {showPassword ? "😐" : "😑"}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("avatar", { required: "Avatar is required" })}
                onChange={(e) =>
                  setAvatarPreview(URL.createObjectURL(e.target.files[0]))
                }
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="mt-2 w-20 h-20 rounded-full"
                />
              )}
              {errors.avatar && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.avatar.message}
                </p>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cover Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("coverImage")}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
          </form>

          <h1 className="text-center font-bold">Or</h1>
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={() =>
                loginWithRedirect({
                  connection: "google-oauth2",
                  redirectUri: window.location.origin + "/auth-callback",
                })
              }
            >
              Login with Google
            </button>
          </div>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </Link>
          </p>
        </div>
      )}

      {/* OTP Step */}
      {step === 2 && (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-center">Enter OTP</h2>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter OTP"
          />
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Signup;
