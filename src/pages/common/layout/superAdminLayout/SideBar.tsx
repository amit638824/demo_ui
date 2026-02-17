"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {FaTachometerAlt, FaBriefcase, FaUsers, FaUserTie, FaFileAlt, FaDatabase, FaUser, FaHeadset, FaUserShield } from "react-icons/fa";
//import { FaDatabase } from "react-icons/fa6";
import { TbLayoutSidebarRightExpand, TbLayoutSidebarRightCollapse } from "react-icons/tb";
import { useSession } from "@/hooks/useSession";


const menuItems = [
  { icon: <FaTachometerAlt  size={18} />, label: "Dashboard", path: "/super-admin",permission: "DASHBOARD", },
  { icon: <FaUserShield size={18} />, label: "Roles & Permissions", path: "/super-admin/role-permissions",permission: "ROLE_PERMISSION_MANAGEMENT", },
  { icon: <FaUserTie size={18} />, label: "Admin", path: "/super-admin/admin/list",permission: "ADMIN_MANAGEMENT", },
  { icon: <FaUsers size={18} />, label: "Recruter & Job Seeker", path: "/super-admin/users/list",permission: "A", },
  { icon: <FaBriefcase size={18} />, label: "Jobs", path: "/super-admin/job/list",permission: "VIEW_JOB", },
  { icon: <FaDatabase  size={18} />, label: "Master Data", path: "/super-admin/master-data",permission: "MASTER_DATA_MANAGEMENT", },
  { icon: <FaFileAlt  size={18} />, label: "Advertisement", path: "/super-admin/advertisement/list",permission: "VIEW_ADVERTISEMENT", },
  { icon: <FaUser  size={18} />, label: "Reported Data", path: "/super-admin/reported-data",permission: "REPORTS_HANDLING", },
  { icon: <FaHeadset  size={18} />, label: "Support", path: "#" },
];

export default function SideBar({
  isOpen,
  toggle,
}: {
  isOpen: boolean;
  toggle: () => void;
}) {
  const { permissions, roleId } = useSession();
  return (
    <div
      className="vh-100 position-relative side-nav-area"
      style={{
        width: isOpen ? 260 : 80,
        transition: "0.3s",
      }}
    >
      

      {/* Logo */}
      <div className="sidebar-logo">
        <Image src="/assets/images/logo.png" alt="" height={38} width={77} />
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
      <ul className="list-unstyled mt-4 px-3">
        {menuItems
  .filter((item) => {
      if (item.label === "Dashboard") return true;
    // 🔥 SUPER ADMIN (roleId === 1) → full access
    if (roleId === 1) return true;

    // 🔥 Exclude role 5 & 6 completely
    if (roleId === 5 || roleId === 6) return false;

    // 🔥 Other roles → show only assigned permissions
    return permissions?.includes(item.permission);
  })
  .map((item, index) => (

          <li key={index} className="mb-3">
            <Link
              href={item.path}
              className="d-flex align-items-center gap-3 text-decoration-none text-dark"
            >
              {item.icon} {isOpen && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* User Bottom */}
      <div className="position-absolute bottom-0 mb-4 px-3 d-flex align-items-center gap-3">
        <FaUser size={18} /> {isOpen && <span></span>}
      </div>
    </div>
  );
}
