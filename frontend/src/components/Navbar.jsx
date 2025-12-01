import React, { useState } from "react";
import { CiMenuFries, CiSearch } from "react-icons/ci";
import { MdOutlineVideoChat } from "react-icons/md";
import { FaRegBell } from "react-icons/fa6";
import { useSidebar } from "../context/SidebarContext";
import { useUser } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Vystra from "../assets/Vystra.png";
import { FaUser } from "react-icons/fa";
import PopupMenu from "./ui/PopupMenu";
const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const { user, logoutUser } = useUser();
  const { logout } = useAuth0();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    logoutUser();
    logout({ returnTo: window.location.origin });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") return;
    navigate(`/search?query=${encodeURIComponent(searchInput)}`);
  };

  return (
    <div className="sticky top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-xl border-b border-cyan-500/20 text-white flex items-center px-4 gap-4 shadow-lg shadow-cyan-500/10 z-20">
      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>

      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all duration-200 hover:scale-110 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CiMenuFries className="h-5 w-5 relative z-10 group-hover:text-cyan-400 transition-colors" />
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <img
              src={Vystra}
              alt="vystra"
              className="relative h-9 w-9 text-cyan-400 group-hover:scale-110 transition-transform duration-200"
            />
          </div>
          <span className="font-bold text-3xl hidden sm:inline bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:animate-pulse">
            Vystra
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-2xl mx-auto relative z-10">
        <form onSubmit={handleSearchSubmit} className="relative group">
          {/* Glow effect on focus */}
          <div
            className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
              isSearchFocused ? "opacity-30" : ""
            }`}
          ></div>

          <div className="relative w-full px-1 sm:px-0">
            <CiSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                isSearchFocused ? "text-cyan-400" : "text-gray-400"
              }`}
            />
            <input
              type="search"
              placeholder="Search videos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-7 py-2 rounded-lg text-sm sm:text-base
    "
            />
          </div>
        </form>
      </div>

      {/* Right Side */}
      {user ? (
        <div className="flex items-center gap-2 relative z-10">
          {/* Notification Bell */}

          {/* Profile Link */}
          <Link
            to="profile"
            className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all duration-200 hover:scale-110 active:scale-95 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold relative z-10">
              {user?.fullname?.charAt(0).toUpperCase() ||
                user?.username?.charAt(0).toUpperCase() ||
                "U"}
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="relative px-4 py-2 rounded-lg font-medium overflow-hidden group transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Logout</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 relative z-10">
          <PopupMenu />

          {/* <Link
            to="/login"
            className="relative px-4 py-2 rounded-lg font-medium overflow-hidden group transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Login</span>
          </Link> */}
          {/* Signup Button */}
          {/* <Link
            to="/signup"
            className="relative px-4 py-2 rounded-lg font-medium border border-cyan-500/30 overflow-hidden group transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 group-hover:text-cyan-400 transition-colors">
              Signup
            </span>
          </Link> */}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Custom scrollbar for search input */
        input[type="search"]::-webkit-search-cancel-button {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          background: linear-gradient(135deg, #06b6d4, #a855f7);
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
