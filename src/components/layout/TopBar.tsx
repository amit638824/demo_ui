import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaSignOutAlt, FaRegUserCircle, FaHeadset, FaBahai } from "react-icons/fa";
import { useSession, useUser } from "../../hooks/useSession";
import { logout } from "../../redux/slice/authSlice";
import { clearUserDetails } from "../../redux/slice/userDetailSlice";
 
const TopBar = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const session = useSession();
  const user = useUser();

  /* ===============================
     FETCH USER DETAIL
  ================================ */
  // useEffect(() => {
  //   if (!session?.user?.user_id) return;

  //   const fetchUserDetail = async () => {
  //     try {
  //       const res = await userDetailService(session.user.user_id);
  //       dispatch(setUserDetails(res?.data));
  //     } catch (err) {
  //       console.error("Failed to fetch user details", err);
  //     }
  //   };

  //   fetchUserDetail();
  // }, [session?.user?.user_id, dispatch]);

  /* ===============================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ================================ */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     LOGOUT
  ================================ */
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    dispatch(clearUserDetails());
    navigate("/", { replace: true });
  };

  return (
    <div className="d-flex align-items-center justify-content-end px-3 topBar-area">
      <div className="navbar-custom-menu r-side">
        <ul className="nav navbar-nav">
          <li className="dropdown user user-menu" ref={dropdownRef as any}>
            <span
              className="userProfilepic"
              onClick={() => setOpenDropdown((p) => !p)}
              style={{ cursor: "pointer" }}
            >
              {user?.user_profilePic ? (
                <img
                  src={
                    user.user_profilePic ||
                    "/assets/images/default-user.jpg"
                  }
                  alt="profile"
                  width={38}
                  height={38}
                  style={{ borderRadius: "50%" }}
                />
              ) : (
                <FaRegUserCircle size={34} />
              )}
            </span>

            {openDropdown && (
              <ul className="dropdown-menu show">
                <li className="user-body">
                  <Link
                    className="dropdown-item"
                    to="/recruiter/profile"
                    onClick={() => setOpenDropdown(false)}
                  >
                    <FaRegUserCircle /> Profile
                  </Link>

                  <Link
                    className="dropdown-item"
                    to="/recruiter/support"
                    onClick={() => setOpenDropdown(false)}
                  >
                    <FaHeadset /> Help Center
                  </Link>

                  <Link
                    className="dropdown-item"
                    to="/recruiter/purchase-credit"
                    onClick={() => setOpenDropdown(false)}
                  >
                    <FaBahai /> Purchase Credit
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TopBar;
