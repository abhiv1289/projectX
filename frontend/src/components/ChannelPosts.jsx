import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import Postcard from "../components/Postcard";

const ChannelPosts = ({ currentUser }) => {
  const { userId } = useParams(); // Get userId from URL
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user posts
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
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">User Posts</h2>

        {loading && (
          <div className="text-gray-400 text-center py-10">
            Loading posts...
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-gray-400 text-center py-10">
            No posts to show
          </div>
        )}

        {/* Display posts */}
        {!loading &&
          posts.map((post) => (
            <Postcard
              key={post._id}
              post={post}
              currentUser={currentUser}
              refreshPosts={fetchUserPosts} // optional: allow refreshing after update/delete
            />
          ))}
      </div>
    </div>
  );
};

export default ChannelPosts;
