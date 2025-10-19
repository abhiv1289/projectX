import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { CiCamera } from "react-icons/ci";
import ChannelVideos from "../components/ChannelVideos";
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
  // at top (with other useState hooks)
  const [channelStats, setChannelStats] = useState(null);

  // Video upload section
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
              {
                withCredentials: true,
              }
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
  }, [setUser]);

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Loading profile...
      </div>
    );

  // Change Password
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
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Update Fullname
  const handleFullnameChange = async (e) => {
    e.preventDefault();
    if (!fullname.trim()) return toast.error("Fullname cannot be empty");

    try {
      setLoading(true);
      const res = await axiosInstance.patch(
        "/v1/auth/update-fullname",
        { fullname },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Fullname updated successfully");
      setUser((prev) => ({ ...prev, fullname }));
      setShowFullnameForm(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update fullname");
    } finally {
      setLoading(false);
    }
  };

  // Update Avatar
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
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
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  // Update Cover Image
  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) setCoverFile(e.target.files[0]);
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
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update cover");
    } finally {
      setLoading(false);
    }
  };

  // Upload Video
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
      console.error(err);
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
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-10 px-4 space-y-8">
      {/* Profile Header */}
      <div className="w-full max-w-4xl relative rounded-2xl shadow-xl bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="h-48 w-full rounded-t-2xl overflow-hidden relative">
          {user.coverImage ? (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No cover image
            </div>
          )}
          <label className="absolute top-2 right-2 bg-red-600 p-2 rounded-full cursor-pointer hover:bg-red-700 transition z-20">
            <CiCamera className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </label>
        </div>

        <div className="flex flex-col items-center mt-[-4rem] mb-4 relative z-10">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.fullname}
              className="w-32 h-32 rounded-full border-4 border-gray-900 shadow-lg object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-red-600 p-1 rounded-full cursor-pointer hover:bg-red-700 transition">
              <CiCamera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          {avatarFile && (
            <button
              onClick={handleAvatarUpload}
              disabled={loading}
              className={`mt-2 px-4 py-1 rounded bg-red-600 hover:bg-red-700 transition font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Uploading..." : "Update Avatar"}
            </button>
          )}

          {coverFile && (
            <button
              onClick={handleCoverUpload}
              disabled={loading}
              className={`mt-2 px-4 py-1 rounded bg-red-600 hover:bg-red-700 transition font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Uploading..." : "Update Cover"}
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{user.fullname}</h2>
          <p className="text-gray-400">@{user.username}</p>
          <button
            onClick={() => setShowFullnameForm(!showFullnameForm)}
            className="mt-2 text-sm text-red-500 hover:underline"
          >
            {showFullnameForm ? "Cancel" : "Edit Name"}
          </button>
        </div>

        {showFullnameForm && (
          <form onSubmit={handleFullnameChange} className="mt-4 flex gap-2">
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="text-gray-400 text-sm">Email</h3>
            <p className="text-gray-200">{user.email}</p>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Created At</h3>
            <p className="text-gray-200">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Last Updated</h3>
            <p className="text-gray-200">
              {new Date(user.updatedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Link
              to={`/channel/${user._id}`}
              className="text-center bg-amber-900 hover:bg-amber-800 transition py-2 rounded font-semibold mt-4"
            >
              <button>All Channel Videos</button>
            </Link>
            <Link
              to={`/post/${user._id}`}
              className="text-center bg-amber-900 hover:bg-amber-800 transition py-2 rounded font-semibold mt-4"
            >
              <button>All Channel Posts</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Channel Stats */}
      {channelStats && (
        <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-2xl font-semibold text-center mb-4">
            Channel Statistics
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-gray-400 text-sm">Subscribers</h4>
              <p className="text-xl font-bold text-white">
                {channelStats.totalSubscribers}
              </p>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm">Videos</h4>
              <p className="text-xl font-bold text-white">
                {channelStats.totalVideos}
              </p>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm">Total Views</h4>
              <p className="text-xl font-bold text-white">
                {channelStats.totalVideoViews}
              </p>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm">Likes</h4>
              <p className="text-xl font-bold text-white">
                {channelStats.totalLikes}
              </p>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm">Comments</h4>
              <p className="text-xl font-bold text-white">
                {channelStats.totalComments}
              </p>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm">Avg Views / Video</h4>
              <p className="text-xl font-bold text-white">
                {Math.round(channelStats.averageViewsPerVideo)}
              </p>
            </div>
          </div>

          {/* Top Videos */}
          {channelStats.topVideos?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">
                Top Performing Videos
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {channelStats.topVideos.map((video) => (
                  <div
                    key={video._id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <p className="font-semibold">{video.title}</p>
                      <p className="text-gray-400 text-sm">
                        {video.views} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Change Password */}
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex justify-between items-center cursor-pointer">
          <span>Change Password</span>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-red-500 hover:underline"
          >
            {showPasswordForm ? "Cancel" : "Edit"}
          </button>
        </h3>
        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded bg-red-600 hover:bg-red-700 transition font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>

      {/* Upload Video (Dropdown) */}
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-xl p-6 transition-all duration-300">
        <h3
          className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer select-none"
          onClick={() => setShowVideoUpload(!showVideoUpload)}
        >
          <span>Upload a New Video</span>
          <span className="text-red-500 text-sm">
            {showVideoUpload ? "▲" : "▼"}
          </span>
        </h3>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            showVideoUpload
              ? "max-h-[1000px] opacity-100 mt-4"
              : "max-h-0 opacity-0"
          }`}
        >
          <form onSubmit={handleVideoUpload} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-gray-400 text-sm block mb-1">
                  Select Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-sm block mb-1">
                  Select Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded bg-red-600 hover:bg-red-700 transition font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        </div>
      </div>

      {/* Create Post (Dropdown) */}
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-xl p-6 transition-all duration-300">
        <h3
          className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer select-none"
          onClick={() => setShowPostForm(!showPostForm)}
        >
          <span>Create a New Post</span>
          <span className="text-red-500 text-sm">
            {showPostForm ? "▲" : "▼"}
          </span>
        </h3>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            showPostForm
              ? "max-h-[1000px] opacity-100 mt-4"
              : "max-h-0 opacity-0"
          }`}
        >
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              required
            />
            <div>
              <label className="text-gray-400 text-sm block mb-1">
                Add Media (optional, max 5 files)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handlePostMediaChange}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded bg-red-600 hover:bg-red-700 transition font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profilepage;
