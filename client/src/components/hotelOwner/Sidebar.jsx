import React from "react";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";
const Sidebar = () => {
  const sidebarLinks = [
    { name: "Dashboard", icon: assets.dashboardIcon, path: "/owner" },
    { name: "Add Room", icon: assets.addIcon, path: "/owner/add-room" },
    { name: "List Room", icon: assets.listIcon, path: "/owner/list-room" },
  ];
  return (
    <div className="md:w-64 w-16 border-r h-full text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
      {sidebarLinks.map((link, index) => (
        <NavLink
          to={link.path}
          key={index}
          end
          className={({ isActive }) =>
            `flex items-center py-3 px-4 md:px-8 gap-3 ${
              isActive
                ? "border-r-4 md:border-r-blue-600 border-blue-600 bg-blue-300 text-blue-600"
                : "hover:bg-gray-100/90 border-white text-gray-700"
            }`
          }
        >
          <img src={link.icon} alt={link.name} className="min-w-6 min-h-6" />
          <span className="md:block hidden text-center">{link.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
