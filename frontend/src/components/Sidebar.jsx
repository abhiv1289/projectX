import React from "react";
import { FaHome } from "react-icons/fa";
import { IoIosTrendingUp } from "react-icons/io";
import { IoLibraryOutline } from "react-icons/io5";
import { FaHistory } from "react-icons/fa";
import { CiClock1 } from "react-icons/ci";
import { FaRegThumbsUp } from "react-icons/fa";
import { AiFillPlaySquare } from "react-icons/ai";
import { useSidebar } from "../context/SidebarContext";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: FaHome, label: "Home", to: "/" },
  { icon: IoIosTrendingUp, label: "Trending", to: "/trending" },
  { icon: IoLibraryOutline, label: "Posts", to: "/posts" },
  { icon: FaHistory, label: "History", to: "/history" },
  { icon: CiClock1, label: "Watch Later", to: "/watch-later" },
  { icon: FaRegThumbsUp, label: "Liked Stuffs", to: "/liked" },
  { icon: AiFillPlaySquare, label: "Playlists", to: "/playlists" },
];

const Sidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const location = useLocation();

  const sidebarClasses = `fixed left-0 top-16 bottom-0 bg-gray-900/95 backdrop-blur-xl text-gray-100 border-r border-cyan-500/20 transition-all duration-300 z-40 overflow-hidden ${
    isOpen ? "w-64" : "w-0 -translate-x-full"
  }`;

  return (
    <>
      {/* BACKDROP – click outside to close */}
      {isOpen && (
        <div
          onClick={() => toggleSidebar(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 md:hidden"
        ></div>
      )}

      <aside className={sidebarClasses}>
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

        {/* Background glow effects */}
        <div className="absolute top-20 left-0 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative py-6 px-4 space-y-2 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent hover:scrollbar-thumb-cyan-500/50">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.label}
                to={item.to || "#"}
                className="group relative block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 rounded-r-full animate-pulse"></div>
                )}

                {/* Hover glow effect */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isActive ? "opacity-50" : ""
                  }`}
                ></div>

                {/* Menu item content */}
                <div
                  className={`relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-transparent border border-cyan-500/30"
                      : "hover:bg-gray-800/50 hover:border hover:border-cyan-500/20"
                  }`}
                >
                  {/* Icon with glow */}
                  <div className="relative">
                    <div
                      className={`absolute inset-0 blur-lg transition-opacity duration-200 ${
                        isActive
                          ? "bg-cyan-500 opacity-50"
                          : "bg-cyan-500 opacity-0 group-hover:opacity-30"
                      }`}
                    ></div>
                    <Icon
                      className={`relative h-5 w-5 transition-all duration-200 ${
                        isActive
                          ? "text-cyan-400 scale-110"
                          : "text-gray-400 group-hover:text-cyan-400 group-hover:scale-110"
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-cyan-400 font-semibold"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Animated particle */}
                  <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping"></div>
                  </div>
                </div>

                {/* Bottom border glow */}
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="pt-4 mt-4 border-t border-gray-800/50">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
          </div>

          {/* Footer */}
          <div className="pt-4 px-4">
            <p className="text-xs text-gray-500 text-center">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                VideoHub
              </span>
            </p>
            <p className="text-xs text-gray-600 text-center mt-1">
              © 2025 All rights reserved
            </p>
          </div>
        </div>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
