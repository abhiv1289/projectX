import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const PopupMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu if clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* User / Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-[#1a022b] border border-purple-500/40
        shadow-[0_0_12px_rgba(168,85,247,0.6)] hover:shadow-[0_0_18px_rgba(168,85,247,0.9)]
        transition-all"
      >
        {/* Replace with your user icon */}
        <svg
          viewBox="0 0 24 24"
          fill="#c084fc"
          height="26"
          width="26"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2c2.757 0 5 2.243 5 5.001 0 2.756-2.243 5-5 5s-5-2.244-5-5c0-2.758 2.243-5.001 5-5.001zm0-2c-3.866 0-7 3.134-7 7.001 0 3.865 3.134 7 7 7s7-3.135 7-7c0-3.867-3.134-7.001-7-7.001zm6.369 13.353c-.497.498-1.057.931-1.658 1.302 2.872 1.874 4.378 5.083 4.972 7.346h-19.387c.572-2.29 2.058-5.503 4.973-7.358-.603-.374-1.162-.811-1.658-1.312-4.258 3.072-5.611 8.506-5.611 10.669h24c0-2.142-1.44-7.557-5.631-10.647z" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 mt-3 ml-15 -translate-x-full w-48
          bg-[#0a0116] backdrop-blur-lg rounded-xl border border-purple-600/40
          shadow-[0_0_25px_rgba(168,85,247,0.7)]
          p-4 space-y-2 z-50 animate-fadeIn"
        >
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="block text-center text-white py-2 rounded-lg
              bg-gradient-to-r from-purple-600 to-fuchsia-500
              shadow-[0_0_15px_rgba(192,38,211,0.8)]
              hover:shadow-[0_0_25px_rgba(192,38,211,1)]
              transition-all duration-300"
          >
            Login
          </Link>

          <Link
            to="/signup"
            onClick={() => setIsOpen(false)}
            className="block text-center text-purple-300 py-2 rounded-lg
              border border-purple-600/40 bg-[#1a022b]/70 backdrop-blur
              hover:shadow-[0_0_18px_rgba(168,85,247,0.9)]
              hover:text-purple-200 transition-all duration-300"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default PopupMenu;
