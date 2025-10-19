import { FaHome } from "react-icons/fa";
import { IoIosTrendingUp } from "react-icons/io";
import { IoLibraryOutline } from "react-icons/io5";
import { FaHistory } from "react-icons/fa";
import { CiClock1 } from "react-icons/ci";
import { FaRegThumbsUp } from "react-icons/fa";
import { AiFillPlaySquare } from "react-icons/ai";
import { useSidebar } from "../context/SidebarContext";
import { Link } from "react-router-dom";

const menuItems = [
  { icon: FaHome, label: "Home" },
  { icon: IoIosTrendingUp, label: "Trending" },
  { icon: IoLibraryOutline, label: "Posts", to: "/posts" },
  { icon: FaHistory, label: "History" },
  { icon: CiClock1, label: "Watch Later" },
  { icon: FaRegThumbsUp, label: "Liked Videos" },
  { icon: AiFillPlaySquare, label: "Playlists", to: "/playlists" },
];

const Sidebar = () => {
  const { isOpen } = useSidebar();

  const sidebarClasses = `fixed left-0 top-14 bottom-0 bg-gray-950 text-gray-100 border-r border-gray-800 transition-all duration-300 z-40 shadow-lg ${
    isOpen ? "w-60" : "w-0 -translate-x-full"
  }`;

  return (
    <aside className={sidebarClasses}>
      <div className="py-4 px-3 space-y-1 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to || "#"}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
