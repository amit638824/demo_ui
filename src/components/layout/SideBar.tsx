"use client";

import React from "react"; 
import { FaHome, FaBriefcase, FaEllipsisH, FaUser, FaBahai } from "react-icons/fa";
import { FaDatabase } from "react-icons/fa6";
import { TbLayoutSidebarRightExpand, TbLayoutSidebarRightCollapse } from "react-icons/tb";
import { FaCrown } from "react-icons/fa"; 
import { MdOutlineSupportAgent } from "react-icons/md";
import { Link } from "react-router-dom";
const menuItems = [
  { icon: <FaHome size={18} />, label: "Home", path: "/recruiter" },
  // { icon: <FaBriefcase size={18} />, label: "Jobs", path: "/recruiter/job" },
  { icon: <FaBriefcase size={18} />, label: "Jobs", path: "/recruiter/job/list" },
  { icon: <FaDatabase size={18} />, label: "Database", path: "/recruiter/database" },
  { icon: <FaBahai size={18} />, label: "Purchase Credit", path: "/recruiter/purchase-credit" },
  { icon: <FaCrown size={18} />, label: "Your Plan", path: "/recruiter/subscription" },
];

export default function SideBar({
  isOpen,
  toggle,
}: {
  isOpen: boolean;
  toggle: () => void;
}) {
  return (
    <div
      className={`vh-100 position-relative side-nav-area ${isOpen ? 'openNavigation': 'closeNavigation'}`}
      
    >
      

      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/assets/images/logo.png" alt="" height={38} width={77} />
        {/* Toggle Button */}
      <button
        onClick={toggle}
        className="toggleButton">
        {isOpen ? (
          <TbLayoutSidebarRightCollapse size={18} color="#bbb" />
        ) : (
          <TbLayoutSidebarRightExpand size={18} color="#bbb" />
        )}
      </button>
      </div>

      {/* Menu */}
      <ul className="leftNavigation list-unstyled mt-4 px-3">
        {menuItems.map((item, index) => (
          <li key={index} className="mb-3">
            <Link
              to={item.path}
              className="d-flex align-items-center gap-3 text-decoration-none text-dark"
            >
              {item.icon} {isOpen && <span className="MenuItemName">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* User Bottom */}
      
    </div>
  );
}
