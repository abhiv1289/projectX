import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8000/api"
      : "http://vystra-env.eba-tu6hymyc.ap-south-1.elasticbeanstalk.com/api",
  withCredentials: true,
});
