import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { CiCamera } from "react-icons/ci";
import {
  FaEdit,
  FaLock,
  FaVideo,
  FaPencilAlt,
  FaEye,
  FaHeart,
  FaComment,
  FaUserFriends,
} from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";
import { Link } from "react-router";

const Profilepage = () => {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showFullnameForm, setShowFullnameForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postMedia, setPostMedia] = useState([]);
  const [channelStats, setChannelStats] = useState(null);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/v1/auth/get-user", {
          withCredentials: true,
        });
        setUser(response.data.data);
        setFullname(response.data.data.fullname);
        if (response.data?.data?._id) {
          try {
            const statsRes = await axiosInstance.get(
              `/v1/dashboard/${response.data.data._id}`,
              { withCredentials: true }
            );
            setChannelStats(statsRes.data.data);
          } catch (err) {
            console.error(err);
            toast.error("Failed to load channel stats");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch user data");
      }
    };
    fetchUser();
  }, []);

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-950">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-cyan-400">Loading profile...</p>
      </div>
    );

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword)
      return toast.error("New passwords do not match");
    try {
      setLoading(true);
      const res = await axiosInstance.post(
        "/v1/auth/change-password",
        { oldPassword: currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleFullnameChange = async (e) => {
    e.preventDefault();
    if (!fullname.trim()) return toast.error("Fullname cannot be empty");
    try {
      setLoading(true);
      const res = await axiosInstance.patch(
        "/v1/auth/update-details",
        { fullname },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Fullname updated successfully");
      setUser((prev) => ({ ...prev, fullname }));
      setShowFullnameForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update fullname");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files?.[0]) setAvatarFile(e.target.files[0]);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return toast.error("Please select an image first");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await axiosInstance.patch(
        "/v1/auth/update-avatar",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(res.data?.message || "Avatar updated successfully");
      setUser((prev) => ({ ...prev, avatar: res.data.avatarUrl }));
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = (e) => {
    if (e.target.files?.[0]) setCoverFile(e.target.files[0]);
  };

  const handleCoverUpload = async () => {
    if (!coverFile) return toast.error("Please select a cover image first");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("coverImage", coverFile);
      const res = await axiosInstance.patch(
        "/v1/auth/update-coverImage",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(res.data?.message || "Cover updated successfully");
      setUser((prev) => ({ ...prev, coverImage: res.data.coverUrl }));
      setCoverFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update cover");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !thumbnail || !title.trim() || !description.trim()) {
      toast.error("All fields are required!");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);
      formData.append("title", title);
      formData.append("description", description);
      const res = await axiosInstance.post(
        "/v1/video/publish-video",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(res.data?.message || "Video uploaded successfully!");
      setVideoFile(null);
      setThumbnail(null);
      setTitle("");
      setDescription("");
      setShowVideoUpload(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  const handlePostMediaChange = (e) => {
    if (e.target.files) setPostMedia(Array.from(e.target.files));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return toast.error("Post content cannot be empty");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("content", postContent);
      postMedia.forEach((file) => formData.append("media", file));
      const res = await axiosInstance.post("/v1/post/create-post", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data?.message || "Post created successfully!");
      setPostContent("");
      setPostMedia([]);
      setShowPostForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 px-4 md:px-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-8 space-y-6">
        {/* Profile Header Card */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl overflow-hidden">
            {/* Cover Image */}
            <div className="h-48 md:h-64 w-full relative group">
              {user.coverImage ? (
                <img
                  src={user.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                  <p className="text-gray-500">No cover image</p>
                </div>
              )}
              <label className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-purple-500 p-3 rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <CiCamera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
              {coverFile && (
                <button
                  onClick={handleCoverUpload}
                  disabled={loading}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:scale-105 transition-transform"
                >
                  {loading ? "Uploading..." : "Update Cover"}
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur"></div>
                  <img
                    src={user.avatar}
                    alt={user.fullname}
                    className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-900 object-cover"
                  />
                  <label className="absolute bottom-2 right-2 bg-gradient-to-r from-cyan-500 to-purple-500 p-2 rounded-full cursor-pointer hover:scale-110 transition-transform">
                    <CiCamera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                {/* User Details */}
                <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {user.fullname}
                    </h2>
                    <button
                      onClick={() => setShowFullnameForm(!showFullnameForm)}
                      className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all"
                    >
                      <FaEdit className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                  <p className="text-gray-400 mt-1">@{user.username}</p>
                  <p className="text-gray-500 text-sm mt-2">{user.email}</p>
                </div>

                {avatarFile && (
                  <button
                    onClick={handleAvatarUpload}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:scale-105 transition-transform"
                  >
                    {loading ? "Uploading..." : "Update Avatar"}
                  </button>
                )}
              </div>

              {showFullnameForm && (
                <form
                  onSubmit={handleFullnameChange}
                  className="mt-6 flex gap-2"
                >
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:scale-105 transition-transform"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Channel Stats */}
        {channelStats && (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
                Channel Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  {
                    icon: FaUserFriends,
                    label: "Subscribers",
                    value: channelStats.totalSubscribers,
                    color: "cyan",
                  },
                  {
                    icon: MdVideoLibrary,
                    label: "Videos",
                    value: channelStats.totalVideos,
                    color: "purple",
                  },
                  {
                    icon: FaEye,
                    label: "Total Views",
                    value: channelStats.totalVideoViews,
                    color: "pink",
                  },
                  {
                    icon: FaHeart,
                    label: "Likes",
                    value: channelStats.totalLikes,
                    color: "cyan",
                  },
                  {
                    icon: FaComment,
                    label: "Comments",
                    value: channelStats.totalComments,
                    color: "purple",
                  },
                  {
                    icon: FaEye,
                    label: "Avg Views",
                    value: Math.round(channelStats.averageViewsPerVideo),
                    color: "pink",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/30 transition-all"
                  >
                    <stat.icon
                      className={`w-6 h-6 text-${stat.color}-400 mb-2`}
                    />
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Top Videos */}
              {channelStats.topVideos?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">
                    Top Performing Videos
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {channelStats.topVideos.map((video) => (
                      <div
                        key={video._id}
                        className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-all group"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="p-4">
                          <p className="font-semibold text-white line-clamp-2">
                            {video.title}
                          </p>
                          <p className="text-cyan-400 text-sm mt-1">
                            {video.views} views
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <Link
                  to={`/channel/${user._id}`}
                  className="relative px-6 py-3 rounded-lg font-medium overflow-hidden group transition-all hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <MdVideoLibrary /> All Channel Videos
                  </span>
                </Link>
                <Link
                  to={`/post/${user._id}`}
                  className="relative px-6 py-3 rounded-lg font-medium border border-cyan-500/30 hover:bg-cyan-500/10 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaPencilAlt /> All Channel Posts
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Change Password */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaLock className="text-cyan-400" />
                  <h3 className="text-lg font-semibold">Change Password</h3>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-cyan-400 text-sm hover:underline"
                >
                  {showPasswordForm ? "Cancel" : "Edit"}
                </button>
              </div>
              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:scale-105 transition-transform"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Upload Video */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowVideoUpload(!showVideoUpload)}
              >
                <div className="flex items-center gap-2">
                  <FaVideo className="text-cyan-400" />
                  <h3 className="text-lg font-semibold">Upload Video</h3>
                </div>
                <span className="text-cyan-400">
                  {showVideoUpload ? "▲" : "▼"}
                </span>
              </div>
              {showVideoUpload && (
                <form onSubmit={handleVideoUpload} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                    rows="3"
                    required
                  />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:scale-105 transition-transform"
                  >
                    {loading ? "Uploading..." : "Upload Video"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Create Post */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => setShowPostForm(!showPostForm)}
            >
              <div className="flex items-center gap-2">
                <FaPencilAlt className="text-cyan-400" />
                <h3 className="text-lg font-semibold">Create New Post</h3>
              </div>
              <span className="text-cyan-400">{showPostForm ? "▲" : "▼"}</span>
            </div>
            {showPostForm && (
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                  rows="4"
                  required
                />
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handlePostMediaChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:scale-105 transition-transform"
                >
                  {loading ? "Posting..." : "Create Post"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(17, 24, 39, 0.5); }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #06b6d4, #a855f7); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default Profilepage;
