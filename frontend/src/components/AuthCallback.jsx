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
        const response = await axiosInstance.post(
          "/v1/auth/auth0-login",
          { user },
          { withCredentials: true }
        );

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

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-cyan-400 text-xl animate-pulse">
          Finalizing your login<span className="ml-1">...</span>
        </p>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <p className="text-cyan-400 text-xl animate-pulse">
        Finalizing your login<span className="ml-1">...</span>
      </p>
    </div>
  );
};

export default AuthCallback;
