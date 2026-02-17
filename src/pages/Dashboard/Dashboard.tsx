 
const Dashboard = () => {
  return (
    <div>
<div className="layout-wrapper layout-content-navbar">
  <div className="layout-container">
    
  </div>
</div>
    
      <section>
  <div className="container py-5">

    <div className="row">

      
      <div className="col-md-12 col-lg-12 col-xl-12">

        <ul className="list-unstyled">
          <li className="d-flex  mb-4">
            <img src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp" alt="avatar"
              className="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60" />
            <div className="card">
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
            <div className="card">
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
          <li className="bg-white mb-3">
            <div data-mdb-input-init className="form-outline">
              <textarea className="form-control bg-body-tertiary" id="textAreaExample2" rows="4"></textarea>
              <label className="form-label" for="textAreaExample2">Message</label>
            </div>
          </li>
          <button  type="button" data-mdb-button-init data-mdb-ripple-init className="btn btn-info btn-rounded float-end">Send</button>
        </ul>

      </div>

    </div>

  </div>
</section>
    </div>
  )
}

export default Dashboard
