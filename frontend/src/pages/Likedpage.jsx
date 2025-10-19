import React, { useState, useEffect } from "react";
import { axiosInstance } from "../utility/axios";

const Likedpage = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch videos
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/v1/like/videos"); // replace with your endpoint

      setVideos(response.data.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/v1/like/posts"); // replace with your endpoint
      //   console.log(response.data.data);

      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/v1/like/comments"); // replace with your endpoint
      //   console.log(response.data.data);

      setComments(response.data.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    if (loading) return <p>Loading...</p>;

    switch (activeTab) {
      case "videos":
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {videos.map((item) => (
              <div
                key={item._id}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <img
                  src={item.video.thumbnail}
                  alt={item.video.title}
                  width={80}
                />
                <div>
                  <h4>{item.video.title}</h4>
                  <p>Duration: {item.video.duration}s</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "posts":
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {posts.map((item) => (
              <div
                key={item._id}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              >
                <h4>{item.post.content}</h4>
                {item.post.media && item.post.media.length > 0 && (
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "5px" }}
                  >
                    {item.post.media.map((m, i) => (
                      <img key={i} src={m} alt="post media" width={80} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "comments":
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {comments.map((item) => (
              <div
                key={item._id}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              >
                {item.comment.content}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Handle tab change
  const handleTabClick = (tab) => {
    setActiveTab(tab);

    // Fetch data based on selected tab
    if (tab === "videos") fetchVideos();
    else if (tab === "posts") fetchPosts();
    else if (tab === "comments") fetchComments();
  };

  // Fetch videos by default on page load
  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Tab Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => handleTabClick("videos")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "videos" ? "#4CAF50" : "#f0f0f0",
            color: activeTab === "videos" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Videos
        </button>
        <button
          onClick={() => handleTabClick("posts")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "posts" ? "#4CAF50" : "#f0f0f0",
            color: activeTab === "posts" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Posts
        </button>
        <button
          onClick={() => handleTabClick("comments")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "comments" ? "#4CAF50" : "#f0f0f0",
            color: activeTab === "comments" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Comments
        </button>
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default Likedpage;
