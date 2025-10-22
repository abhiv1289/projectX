import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import Postcard from "../components/Postcard";

const ChannelPosts = ({ currentUser }) => {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/v1/post/u/${userId}`);
      setPosts(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-green-400 text-center neon-text">
          User Posts
        </h2>

        {/* Loading state */}
        {loading && (
          <div className="text-cyan-400 text-center py-10 animate-pulse">
            Loading posts...
          </div>
        )}

        {/* No posts */}
        {!loading && posts.length === 0 && (
          <div className="text-red-500 text-center py-10">No posts to show</div>
        )}

        {/* Posts list */}
        {!loading &&
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-gray-800 border border-blue-500 rounded-lg hover:shadow-lg hover:shadow-blue-500 transition-shadow duration-300 p-4"
            >
              <Postcard
                post={post}
                currentUser={currentUser}
                refreshPosts={fetchUserPosts}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ChannelPosts;
