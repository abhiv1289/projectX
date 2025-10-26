import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8000/api"
      : "https://projectx-v5bn.onrender.com/api",
  withCredentials: true,
});
