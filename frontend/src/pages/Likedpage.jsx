import React, { useState, useEffect, useRef } from "react";
import { axiosInstance } from "../utility/axios";

const Likedpage = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabRefs = {
    videos: useRef(null),
    posts: useRef(null),
    comments: useRef(null),
  };

  const [sliderStyle, setSliderStyle] = useState({
    width: 0,
    left: 0,
  });

  useEffect(() => {
    updateSliderPosition(activeTab);
  }, [activeTab]);

  const updateSliderPosition = (tab) => {
    const tabEl = tabRefs[tab].current;
    if (tabEl) {
      setSliderStyle({
        width: tabEl.offsetWidth,
        left: tabEl.offsetLeft,
      });
    }
  };

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
        <p className="text-cyan-400 text-center mt-10 animate-pulse text-lg">
          Loading...
        </p>
      );

    switch (activeTab) {
      case "videos":
        if (!videos.length)
          return (
            <p className="text-purple-500 text-center text-lg">
              No liked videos found.
            </p>
          );
        return (
          <div className="flex flex-col gap-4">
            {videos.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 p-4 border border-blue-500 rounded-xl bg-gray-900 hover:shadow-lg hover:shadow-blue-500/40 transition duration-300"
              >
                <img
                  src={item?.video?.thumbnail}
                  alt={item?.video?.title}
                  width={90}
                  className="rounded-md border border-pink-500"
                />
                <div>
                  <h4 className="text-green-400 font-semibold text-lg">
                    {item?.video?.title}
                  </h4>
                  <p className="text-cyan-400 text-sm">
                    Duration: {item?.video?.duration}s
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case "posts":
        if (!posts.length)
          return (
            <p className="text-purple-500 text-center text-lg">
              No liked posts found.
            </p>
          );
        return (
          <div className="flex flex-col gap-4">
            {posts.map((item) => (
              <div
                key={item._id}
                className="p-5 border border-purple-500 rounded-xl bg-gray-900 hover:shadow-lg hover:shadow-purple-500/40 transition duration-300"
              >
                <p className="text-green-400 text-lg font-medium">
                  {item.post.content}
                </p>
                {item.post.media?.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {item.post.media.map((m, i) => (
                      <img
                        key={i}
                        src={m}
                        alt="media"
                        className="w-24 h-24 object-cover rounded-md border border-pink-500"
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
          return (
            <p className="text-purple-500 text-center text-lg">
              No liked comments found.
            </p>
          );
        return (
          <div className="flex flex-col gap-4">
            {comments.map((item) => (
              <div
                key={item._id}
                className="p-4 border border-orange-500 rounded-xl bg-gray-900 hover:shadow-lg hover:shadow-orange-500/40 transition duration-300"
              >
                <p className="text-cyan-400 text-lg">{item.comment.content}</p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8 min-h-screen bg-black text-white pt-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none"></div>

      <div className="relative z-20">
        {/* ⭐ PERFECT CENTERED, RESPONSIVE, SMOOTH TABS */}
        <div className="flex justify-center mb-10">
          <div className="relative flex bg-gray-800/40 rounded-full p-2 gap-4">
            {/* Animated Slider */}
            <div
              className="absolute top-2 bottom-2 bg-purple-500 rounded-full transition-all duration-300"
              style={{
                width: `${sliderStyle.width}px`,
                left: `${sliderStyle.left}px`,
              }}
            ></div>

            {/* Tabs */}
            {["videos", "posts", "comments"].map((tab) => (
              <button
                key={tab}
                ref={tabRefs[tab]}
                onClick={() => handleTabClick(tab)}
                className={`relative z-10 px-6 py-2 text-lg font-semibold transition-all ${
                  activeTab === tab
                    ? "text-black"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Likedpage;
