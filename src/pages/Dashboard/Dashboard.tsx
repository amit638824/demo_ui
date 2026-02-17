import { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import ChatCard from "./ChatCard";
import { clearUserDetails } from "../../redux/slice/userDetailSlice";
import { logout } from "../../redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const Dashboard: any = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const dispatch=useDispatch()
  const navigate = useNavigate()
  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    dispatch(clearUserDetails());
    navigate('/')
  };
  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        {/* Sidebar */}
        <aside
          id="layout-menu"
          className="layout-menu menu-vertical menu bg-menu-theme"
        >
          <div className="app-brand demo">
            <a href="#" className="app-brand-link">
              <img height={50} src="assets/images/logo.png" />
            </a>
          </div>

          <ul className="menu-inner py-1">
            <li className="menu-item active">
              <a href="#" className="menu-link">
                <span className="me-2">
                  <FaSearch />
                </span>
                <div>Dashboard</div>
              </a>
            </li>
          </ul>
        </aside>

        {/* Main Page */}
        <div className="layout-page">
          {/* Navbar */}
          <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached bg-navbar-theme">
            <div className="navbar-nav-right d-flex align-items-center w-100">
              {/* Search */}
              <div className="navbar-nav align-items-center">
                <div className="nav-item d-flex align-items-center">
                  <FaSearch />
                  <input
                    type="text"
                    className="form-control border-0 shadow-none ms-2"
                    placeholder="Search..."
                  />
                </div>
              </div>

              {/* Profile */}
              <ul className="navbar-nav flex-row align-items-center ms-auto">
                <li
                  className="nav-item navbar-dropdown dropdown-user"
                  ref={dropdownRef}
                >
                  <a
                    href="#"
                    className="nav-link hide-arrow"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(!open);
                    }}
                  >
                    <div className="avatar avatar-online">
                      <img
                        src="assets/images/1.png"
                        alt="user"
                        className="w-px-40 h-auto rounded-circle"
                      />
                    </div>
                  </a>

                  {/* Dropdown */}
                  <ul
                    className={`dropdown-menu dropdown-menu-end ${open ? "show" : ""
                      }`}
                  >
                    <li>
                      <a className="dropdown-item" href="#">
                        <div className="d-flex">
                          <div className="flex-shrink-0 me-3">

                          </div>
                          <div className="flex-grow-1">
                            <span className="fw-semibold d-block">
                              John Doe
                            </span>
                            <small className="text-muted">Admin</small>
                          </div>
                        </div>
                      </a>
                    </li>

                    <li>
                      <div className="dropdown-divider"></div>
                    </li>

                    <li>
                      <a className="dropdown-item" href="#">
                        My Profile
                      </a>
                    </li>

                    <li>
                      <a className="dropdown-item" href="#">
                        Settings
                      </a>
                    </li>

                    <li>
                      <div className="dropdown-divider"></div>
                    </li>

                    <li onClick={handleLogout}>
                      <a className="dropdown-item" href="#">
                        Log Out
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="content-wrapper">
            <section className="container-xxl flex-grow-1 container-p-y">
              <div className="row">
                <div className="col-12">
                  <ChatCard />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
 

