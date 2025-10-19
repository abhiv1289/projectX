import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { loginUser } = useUser();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/v1/auth/login", data, {
        withCredentials: true,
      });
      console.log("Login success:", response.data);
      loginUser(response.data.data.user);
      toast.success(response.data.message || "Login successful!");
      reset();
      navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Welcome Back!
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address or Username
            </label>
            <input
              id="identifier"
              placeholder="you@example.com"
              {...register("identifier", {
                required: "Email or Username is required",
              })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-center text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </Link>
        </div>

        <h1 className="text-center font-black">Or</h1>

        <div className="flex gap-2">
          <button className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600">
            Login with Google
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
