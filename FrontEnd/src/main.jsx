import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
// import { Loader } from './components/loader/loader.jsx'

const ContionalNavbar = () => {
  const location = useLocation();

  const hideNavbarRoutes = ['/login', '/register'];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return !shouldHideNavbar ? <Navbar /> : null;

};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ContionalNavbar />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
