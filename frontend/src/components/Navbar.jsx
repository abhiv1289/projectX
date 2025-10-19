import React from "react";

import { CiMenuFries } from "react-icons/ci";
import { MdOutlineVideoChat } from "react-icons/md";
import { FaRegBell } from "react-icons/fa6";
import { FaRegUserCircle } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { useSidebar } from "../context/SidebarContext";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const { user, logoutUser } = useUser();

  return (
    <>
      <div className=" top-0 left-0 right-0 h-14 bg-gray-900 text-white flex items-center px-4 gap-4 shadow-md z-50">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-gray-800 transition"
          >
            <CiMenuFries className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-1">
            <MdOutlineVideoChat className="h-6 w-6 text-red-500" />
            <span className="font-bold text-lg hidden sm:inline">VideoHub</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search videos..."
              className="w-full pl-10 pr-3 py-1 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {user ? (
          // ✅ When user is logged in
          <div className="flex items-center gap-2">
            <button className="p-2 rounded hover:bg-gray-800 transition">
              <FaRegBell className="h-5 w-5" />
            </button>
            <Link
              to="profile"
              className="p-2 rounded hover:bg-gray-800 transition"
            >
              <FaRegUserCircle className="h-5 w-5" />
            </Link>
            <button
              onClick={logoutUser}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          // 🚪 When user is not logged in
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-800 transition"
            >
              Signup
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
