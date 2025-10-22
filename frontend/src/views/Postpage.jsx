import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { useUser } from "../context/UserContext";
import Postcard from "../components/Postcard";
import { toast } from "react-toastify";
import { MdArticle } from "react-icons/md";
import { BiNews } from "react-icons/bi";

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
    <div className="min-h-screen bg-gray-950 text-white pt-20 px-4 md:px-6 lg:px-8">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BiNews className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Community Posts
            </h1>
          </div>
          <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Posts List */}
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-cyan-400">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <Postcard key={post._id} post={post} currentUser={user} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-12 text-center max-w-md">
              <MdArticle className="mx-auto h-16 w-16 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-cyan-400 mb-2">
                No Posts Yet
              </h3>
              <p className="text-gray-400">Be the first to share something!</p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && posts.length > 0 && (
          <div className="flex justify-center mt-8 mb-8">
            <button
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchPosts(nextPage);
              }}
              className="relative px-6 py-3 font-medium text-white rounded-lg overflow-hidden group transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">Load More Posts</span>
            </button>
          </div>
        )}

        {/* Loading More Spinner */}
        {loading && posts.length > 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="mt-3 text-cyan-400 text-sm">Loading more posts...</p>
          </div>
        )}

        {/* End of posts message */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-block bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl px-8 py-4">
              <p className="text-cyan-400 font-medium">
                You've reached the end!
              </p>
              <p className="text-gray-400 text-sm mt-1">
                No more posts to load 📝
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #a855f7);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0891b2, #9333ea);
        }
      `}</style>
    </div>
  );
};

export default PostPage;
