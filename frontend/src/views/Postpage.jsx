import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { useUser } from "../context/UserContext";
import Postcard from "../components/Postcard";
import { toast } from "react-toastify";

const PostPage = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const POSTS_PER_PAGE = 5;

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v1/post/search", {
        params: { page: pageNum, limit: POSTS_PER_PAGE },
        withCredentials: true,
      });
      const data = res.data?.data?.posts || [];

      if (pageNum === 1) setPosts(data);
      else setPosts((prev) => [...prev, ...data]);

      if (data.length < POSTS_PER_PAGE) setHasMore(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8">
      {posts.map((post) => (
        <Postcard key={post._id} post={post} currentUser={user} />
      ))}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchPosts(nextPage);
            }}
            className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
          >
            Load More
          </button>
        </div>
      )}

      {loading && (
        <p className="text-gray-400 text-center mb-8">Loading posts...</p>
      )}
    </div>
  );
};

export default PostPage;
