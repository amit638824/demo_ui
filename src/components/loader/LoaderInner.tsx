import React from 'react'
import "./loaderInner.css"
const LoaderInner = () => {
  return (
    <div   className="loader-container inner-pages">
    <div>
        <div className="loader-component-inner">
          <div className="loader-img-inner">
            <div className="spinner-border-inner" role="status"></div> 
            <img src="/assets/images/logo.png" className="img-fluid" alt="Logo" />
          </div>
        </div>
      </div>
  </div>
  )
}

export default LoaderInner
