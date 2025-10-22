import React, { useState, useEffect } from "react";
import { axiosInstance } from "../utility/axios";

const Likedpage = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/v1/like/videos");
      setVideos(response.data.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/v1/like/posts");
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/v1/like/comments");
      setComments(response.data.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "videos") fetchVideos();
    else if (tab === "posts") fetchPosts();
    else if (tab === "comments") fetchComments();
  };

  const renderContent = () => {
    if (loading)
      return (
        <p className="text-cyan-400 text-center mt-10 animate-pulse">
          Loading...
        </p>
      );

    switch (activeTab) {
      case "videos":
        if (videos.length === 1)
          return <p className="text-red-500">No liked videos found.</p>;
        return (
          <div className="flex flex-col gap-4">
            {videos.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 p-3 border border-blue-500 rounded-lg hover:shadow-lg hover:shadow-blue-500 transition-shadow duration-300"
              >
                <img
                  src={
                    item?.video?.thumbnail || "https://via.placeholder.com/80"
                  }
                  alt={item?.video?.title || "No title"}
                  width={80}
                  className="rounded-md border border-pink-500"
                />
                <div>
                  <h4 className="text-green-400 font-semibold">
                    {item?.video?.title || "Untitled"}
                  </h4>
                  <p className="text-cyan-400 text-sm">
                    Duration: {item?.video?.duration || "0"}s
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case "posts":
        if (!posts.length)
          return <p className="text-red-500">No liked posts found.</p>;
        return (
          <div className="flex flex-col gap-4">
            {posts.map((item) => (
              <div
                key={item._id}
                className="p-4 border border-purple-500 rounded-lg hover:shadow-lg hover:shadow-purple-500 transition-shadow duration-300"
              >
                <p className="text-green-400 font-medium">
                  {item.post.content}
                </p>
                {item.post.media?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {item.post.media.map((m, i) => (
                      <img
                        key={i}
                        src={m}
                        alt="post media"
                        className="w-20 rounded-md border border-pink-500"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "comments":
        if (!comments.length)
          return <p className="text-red-500">No liked comments found.</p>;
        return (
          <div className="flex flex-col gap-4">
            {comments.map((item) => (
              <div
                key={item._id}
                className="p-3 border border-orange-500 rounded-lg hover:shadow-lg hover:shadow-orange-500 transition-shadow duration-300"
              >
                <p className="text-cyan-400">{item.comment.content}</p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen font-sans text-white">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["videos", "posts", "comments"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 ${
              activeTab === tab
                ? "bg-pink-500 text-black shadow-lg shadow-pink-500"
                : "bg-gray-800 text-gray-300 hover:shadow-lg hover:shadow-gray-500"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Likedpage;
