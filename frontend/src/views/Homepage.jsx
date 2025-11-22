import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";

const Homepage = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <>
      <Navbar />

      <Sidebar />

      <div className="flex">
        {/* Clicking anywhere in the main content closes sidebar */}
        <div className="flex-1" onClick={() => toggleSidebar(false)}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Homepage;
