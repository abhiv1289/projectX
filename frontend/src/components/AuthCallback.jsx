import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";

const AuthCallback = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { loginUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // Send user data to backend
        const response = await axiosInstance.post(
          "/v1/auth/auth0-login",
          { user },
          { withCredentials: true }
        );

        console.log("Auth0 login success:", response.data.data);

        // Save user in context
        loginUser(response.data.data.user);

        toast.success("Welcome " + user.name);
        navigate("/");
      } catch (error) {
        console.error("Auth0 sync error:", error);
        toast.error("Failed to sync with backend");
        navigate("/login");
      }
    };

    syncUserWithBackend();
  }, [isAuthenticated, user, loginUser, navigate]);

  if (isLoading) return <p>Loading...</p>;

  return <p>Finalizing your login...</p>;
};

export default AuthCallback;
