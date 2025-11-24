import React, { useRef } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";

const Homepage = () => {
  const { isOpen, closeSidebar } = useSidebar();
  const sidebarRef = useRef(null);

  const handleClickOutside = (e) => {
    if (!isOpen) return;

    // IF click is OUTSIDE the sidebar → close it
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      closeSidebar();
    }
  };

  return (
    <>
      <Navbar />

      {/* Wrap everything so we can detect outside clicks */}
      <div onClick={handleClickOutside}>
        {/* Sidebar wrapped with ref */}
        <div ref={sidebarRef}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex">
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Homepage;
