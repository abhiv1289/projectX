import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserCircle,
  FaImage,
  FaBolt,
  FaCheckCircle,
} from "react-icons/fa";

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
  const [coverPreview, setCoverPreview] = useState(null);
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

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

  const verifyOtp = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/v1/auth/verify-otp", {
        email: userEmail,
        otp,
      });
      toast.success("OTP verified! Completing registration...");

      const formData = new FormData();
      formData.append("fullname", watch("fullname"));
      formData.append("username", watch("username"));
      formData.append("email", userEmail);
      formData.append("password", watch("password"));

      if (avatarFile) formData.append("avatar", avatarFile);
      if (coverFile) formData.append("coverImage", coverFile);

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
    <div className="relative flex items-center justify-center min-h-screen bg-gray-950 overflow-hidden py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {step === 1 ? (
        /* Signup Form */
        <div className="relative w-full max-w-2xl mx-4 animate-[fadeIn_0.6s_ease-out]">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>

          <div className="relative bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50 animate-pulse"></div>
                <FaBolt className="relative w-12 h-12 text-cyan-400" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite]">
              Create Account
            </h1>
            <p className="text-center text-gray-400 mb-8 text-sm">
              Join us and start your journey
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name & Username - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="group">
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      placeholder="John Doe"
                      {...register("fullname", {
                        required: "Full name is required",
                      })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                  {errors.fullname && (
                    <p className="mt-2 text-sm text-pink-400 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-pink-400"></span>
                      {errors.fullname.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="group">
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      placeholder="johndoe"
                      {...register("username", {
                        required: "Username is required",
                        minLength: {
                          value: 3,
                          message: "Username must be at least 3 characters",
                        },
                      })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-pink-400 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-pink-400"></span>
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-medium text-cyan-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    placeholder="you@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-pink-400 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-pink-400"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-medium text-cyan-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-pink-400 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-pink-400"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Avatar & Cover Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Avatar */}
                <div className="group">
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Avatar
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      {...register("avatar", {
                        required: "Avatar is required",
                      })}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 hover:border-cyan-500/50 transition-all duration-200"
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <FaUserCircle className="w-10 h-10 text-gray-500 mb-2" />
                          <span className="text-sm text-gray-400">
                            Upload Avatar
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.avatar && (
                    <p className="mt-2 text-sm text-pink-400 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-pink-400"></span>
                      {errors.avatar.message}
                    </p>
                  )}
                </div>

                {/* Cover Image */}
                <div className="group">
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Cover Image{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      {...register("coverImage")}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setCoverFile(file);
                          setCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 hover:border-cyan-500/50 transition-all duration-200"
                    >
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Cover Preview"
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <FaImage className="w-10 h-10 text-gray-500 mb-2" />
                          <span className="text-sm text-gray-400">
                            Upload Cover
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3 px-4 font-semibold text-white rounded-lg overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <FaBolt />
                      Sign Up
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-700"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Google Signup */}
            <button
              onClick={() =>
                loginWithRedirect({
                  connection: "google-oauth2",
                  redirectUri: window.location.origin + "/auth-callback",
                })
              }
              className="relative w-full py-3 px-4 bg-gray-800 border border-gray-700 rounded-lg text-white font-medium overflow-hidden group hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </span>
            </button>

            {/* Login Link */}
            <p className="mt-6 text-sm text-center text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      ) : (
        /* OTP Verification Step */
        <div className="relative w-full max-w-md mx-4 animate-[fadeIn_0.6s_ease-out]">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>

          <div className="relative bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50 animate-pulse"></div>
                <FaCheckCircle className="relative w-12 h-12 text-cyan-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Verify Email
            </h2>
            <p className="text-center text-gray-400 mb-8 text-sm">
              We've sent a code to{" "}
              <span className="text-cyan-400 font-medium">{userEmail}</span>
            </p>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-cyan-400 mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                  placeholder="000000"
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="relative w-full py-3 px-4 font-semibold text-white rounded-lg overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Verify OTP
                    </>
                  )}
                </span>
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full py-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
              >
                Back to signup
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;
