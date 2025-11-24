import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = (forceState) => {
    if (typeof forceState === "boolean") {
      setIsOpen(forceState); // ← FIX
    } else {
      setIsOpen((prev) => !prev); // toggle normally
    }
  };

  const closeSidebar = () => setIsOpen(false); // convenience function

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => useContext(SidebarContext);
