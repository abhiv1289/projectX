import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://vystra-env.eba-tu6hymyc.ap-south-1.elasticbeanstalk.com/api"
      : "/api",
  withCredentials: true,
});
