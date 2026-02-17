import React from 'react'
import "./loader.css"
const Loader = () => {
  return (
    <div   className="loader-container">
    
        <div className="loader-component">
          <div className="loader-img">
            <div className="spinner-border" role="status"></div> 
            <img src="/assets/images/logo.png" className="img-fluid" alt="Logo" />
          </div>
        </div>
      
  </div>
  )
}

export default Loader
