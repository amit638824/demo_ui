import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import StoreProvider from './redux/StoreProvider.tsx'; 
import './styles/main.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode> 
     <StoreProvider>
      <App />
       <ToastContainer />
    </StoreProvider>
  </StrictMode>,
)
