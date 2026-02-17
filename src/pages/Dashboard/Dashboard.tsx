import { FaSearch } from "react-icons/fa";
const Dashboard: any = () => {
  
  return (
    <div>
<div className="layout-wrapper layout-content-navbar">
  <div className="layout-container">
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme" data-bg-className="bg-menu-theme">
          <div className="app-brand demo">
            <a href="#" className="app-brand-link">              
              <img height={50} src="assets/images/logo.png" />
            </a>            
          </div>        

          <ul className="menu-inner py-1 ps ps--active-y">
           
            <li className="menu-item active">
              <a href="index.html" className="menu-link">
                <span className="serchicons"><FaSearch  /></span>
                <div data-i18n="Analytics">Dashboard</div>
              </a>
            </li>           
          </ul>
        </aside>
      <div className="layout-page">
        <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
            

            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
             
              <div className="navbar-nav align-items-center">
                <div className="nav-item d-flex align-items-center">
                  <FaSearch  />
                  <input type="text" className="form-control border-0 shadow-none" placeholder="Search..." aria-label="Search..." />
                </div>
              </div>
             

              <ul className="navbar-nav flex-row align-items-center ms-auto">
               
               
                <li className="nav-item navbar-dropdown dropdown-user dropdown">
                  <a className="nav-link dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
                    <div className="avatar avatar-online">
                      <img src="assets/images/1.png" alt="" className="w-px-40 h-auto rounded-circle" />
                    </div>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="#">
                        <div className="d-flex">
                          <div className="flex-shrink-0 me-3">
                            <div className="avatar avatar-online">
                              <img src="assets/images/1.png" alt="" className="w-px-40 h-auto rounded-circle" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <span className="fw-semibold d-block">John Doe</span>
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
                        <i className="bx bx-user me-2"></i>
                        <span className="align-middle">My Profile</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        <i className="bx bx-cog me-2"></i>
                        <span className="align-middle">Settings</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        <span className="d-flex align-items-center align-middle">
                          <i className="flex-shrink-0 bx bx-credit-card me-2"></i>
                          <span className="flex-grow-1 align-middle">Billing</span>
                          <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">4</span>
                        </span>
                      </a>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <a className="dropdown-item" href="auth-login-basic.html">
                        <i className="bx bx-power-off me-2"></i>
                        <span className="align-middle">Log Out</span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </nav>

        <div className="content-wrapper">
          <section className="container-xxl flex-grow-1 container-p-y">
        <div className="py-5">

          <div className="row">


            <div className="col-md-12 col-lg-12 col-xl-12">
              <div className="card">
                <h5 className="card-header">Chat with Chatbot</h5>
                <div className="card-body">
                    <ul className="list-unstyled">
                <li className="d-flex  mb-4">
                  <img src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp" alt="avatar"
                    className="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60" />
                  <div className="card w-100">
                    <div className="card-header d-flex justify-content-between p-3">
                      <p className="fw-bold mb-0">Brad Pitt</p>
                      <p className="text-muted small mb-0"><i className="far fa-clock"></i> 12 mins ago</p>
                    </div>
                    <div className="card-body">
                      <p className="mb-0">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                      </p>
                    </div>
                  </div>
                </li>
                <li className="d-flex  mb-4">
                  <div className="card w-100">
                    <div className="card-header d-flex justify-content-between p-3">
                      <p className="fw-bold mb-0">Lara Croft</p>
                      <p className="text-muted small mb-0"><i className="far fa-clock"></i> 13 mins ago</p>
                    </div>
                    <div className="card-body">
                      <p className="mb-0">
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                        laudantium.
                      </p>
                    </div>
                  </div>
                  <img src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp" alt="avatar"
                    className="rounded-circle d-flex align-self-start ms-3 shadow-1-strong" width="60" />
                </li>
                <li className="d-flex  mb-4">
                  <img src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp" alt="avatar"
                    className="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60" />
                  <div className="card w-100">
                    <div className="card-header d-flex justify-content-between p-3">
                      <p className="fw-bold mb-0">Brad Pitt</p>
                      <p className="text-muted small mb-0"><i className="far fa-clock"></i> 10 mins ago</p>
                    </div>
                    <div className="card-body">
                      <p className="mb-0">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                      </p>
                    </div>
                  </div>
                </li>
                <li className=" mb-3">
                  <div data-mdb-input-init className="form-outline">
                    <label
                      className="form-label"
                      htmlFor="textAreaExample2"
                    >
                      Type your message here
                    </label>
                    <textarea
                      className="form-control bg-body-tertiary"
                      id="textAreaExample2"
                      rows={4}
                    />

                    

                  </div>
                </li>
                <button type="button" data-mdb-button-init data-mdb-ripple-init className="btn btn-info btn-rounded float-end">Send</button>
              </ul>
                </div>
              </div>

              

            </div>

          </div>

        </div>
      </section>
        </div>



      </div>
    
  </div>
</div>
    
      
    </div>
  )
}

export default Dashboard
