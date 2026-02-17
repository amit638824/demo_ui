"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaSignOutAlt, FaPassport, FaScrewdriver } from "react-icons/fa";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { logout } from "@/redux/slice/authSlice";
import {
  setUserDetails,
  clearUserDetails,
} from "@/redux/slice/userDetailSlice";

import { userDetailService } from "@/services/AuthServices";
import { useSession, useUser } from "@/hooks/useSession";  
import { BiBell } from "react-icons/bi"; 
import { FaRegBell } from "react-icons/fa";
import { FaGenderless } from "react-icons/fa";
import { FaRegUserCircle } from "react-icons/fa";
import { FaHeadset, FaBahai } from "react-icons/fa";
import Link from "next/link";
import { FaScrewdriverWrench, FaSection, FaSellcast } from "react-icons/fa6";
export default function TopBar() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const dispatch = useDispatch();

  const session = useSession();
  const user = useUser();

  /* ===============================
     FETCH USER DETAIL (API CALL)
  ================================ */
  useEffect(() => {
    if (!session?.user?.user_id) return;

    const fetchUserDetail = async () => {
      try {
        const res = await userDetailService(session.user.user_id);
        dispatch(setUserDetails(res?.data));
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };

    fetchUserDetail();
  }, [session?.user?.user_id, dispatch]);

  /* ===============================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ================================ */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     LOGOUT HANDLER
  ================================ */
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    dispatch(clearUserDetails());
    router.replace("/super-admin/login");
  };

  return (
     <div className="d-flex align-items-center justify-content-end px-3 topBar-area">
      <div className="navbar-custom-menu r-side">
        <ul className="nav navbar-nav">

          {/* Notifications */}
          <li className="dropdown notifications-menu">
            <a
              href="#"
              className="waves-effect waves-light dropdown-toggle"
              data-bs-toggle="dropdown"
              title="Notifications"
              aria-expanded="false"
            >
              <span className="bell-icons"><FaRegBell /><span className="badge-notify">5</span></span>
            </a>

            <ul className="dropdown-menu ">
              <li className="header">
                <div className="p-20">
                  <div className="flexbox">
                    <h4 className="mb-0 mt-0">Notifications</h4>
                    <a href="#" className="text-danger">
                      Clear All
                    </a>
                  </div>
                </div>
              </li>

              <li>
                <div
                  className="slimScrollDiv"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "250px",
                  }}
                >
                  <ul
                    className="menu sm-scrol"
                    style={{ overflow: "hidden", height: "250px" }}
                  >
                    <li>
                      <a href="#">
                        <FaGenderless />{" "}
                        Curabitur id eros quis nunc suscipit blandit.
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <FaGenderless />{" "}
                        Duis malesuada justo eu sapien elementum.
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <FaGenderless />{" "}
                        Donec at nisi sit amet tortor commodo.
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <FaGenderless />{" "}
                        In gravida mauris et nisi
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <FaGenderless />{" "}
                        Praesent eu lacus in libero dictum.
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <FaGenderless />{" "}
                        Nunc fringilla lorem
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <FaGenderless />{" "}
                        Nullam euismod dolor ut quam interdum.
                      </a>
                    </li>
                  </ul>
                </div>
              </li>

              <li className="footer">
                <a href="#">View all</a>
              </li>
            </ul>
          </li>

          {/* User Account */}
          <li className="dropdown user user-menu">
            <a
              href="#"
              className="waves-effect waves-light dropdown-toggle"
              data-bs-toggle="dropdown"
              title="User"
              aria-expanded="false"
            >
              <span className="userProfilepic">
                {user?.user_profilePic ? <Image
                  src={user?.user_profilePic || "/assets/images/default-user.jpg"}
                  alt="profile"
                  width={38}
                  height={38}
                  onClick={() => setOpenDropdown((prev) => !prev)}
                  style={{ borderRadius: "50%", cursor: "pointer" }}
                /> : <FaRegUserCircle />}
              </span>
            </a>

            <ul className="dropdown-menu animated flipInX">
              <li className="user-body">
                <Link className="dropdown-item" href="#">
                  <FaRegUserCircle /> Profile
                </Link>
                <a className="dropdown-item" href="#">
                  <FaHeadset /> Help Center
                </a>
                <a className="dropdown-item customCrIcons" href="/super-admin/change-password">
                  <FaScrewdriverWrench /> Change Password
                </a>

                <div className="dropdown-divider"></div>
                <a onClick={handleLogout} className="dropdown-item text-danger" href="#">
                  <FaSignOutAlt /> Logout
                </a>
              </li>
            </ul>
          </li>

        </ul>
      </div>

      {/* <div className="position-relative" ref={dropdownRef}>
        <div className="d-flex">
          <div className=""> <BiBell size={20} /></div>
          <div className="user-logo"> 
            <Image
              src={user?.user_profilePic || "/assets/images/default-user.jpg"}
              alt="profile"
              width={38}
              height={38}
              onClick={() => setOpenDropdown((prev) => !prev)}
              style={{ borderRadius: "50%", cursor: "pointer" }}
            /></div></div>
        {openDropdown && (
          <div
            className="bg-white shadow position-absolute end-0 mt-2 p-3 rounded"
            style={{ width: "260px", zIndex: 1000 }}
          >
            <h6 className="fw-bold mb-0">
              {user?.user_fullName}
            </h6>
            <p className="text-muted small mb-3">
              {user?.user_email}
            </p>

            <div className="d-flex align-items-center gap-2 mb-3 cursor-pointer">
              <FaUser size={16} />
              <span>Profile</span>
            </div>

            <div
              className="d-flex align-items-center gap-2 cursor-pointer"
              onClick={handleLogout}
            >
              <FaSignOutAlt size={16} />
              <span>Log Out</span>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
}
