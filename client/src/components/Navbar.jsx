// client/src/components/Navbar.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

// Import the logo directly from your src/includes folder
import logoImage from '../includes/logo1.png';
import { assetUrl } from '../utils/assetUrls';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('celesticare_token');
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('celesticare_theme') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('celesticare_theme', theme);
  }, [theme]);

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('celesticare_token');
    localStorage.removeItem('celesticare_user');
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top">
      <div className="container-fluid navbar-inner">
        
        <Link className="navbar-brand" to="/">
          {/* INDEPENDENT LOGO CONTAINER */}
          <div className="brand-logo-container">
            <img src={logoImage} alt="C" className="custom-c-image" />
          </div>
          
          {/* INDEPENDENT TEXT CONTAINER */}
          <div className="brand-text-container">
            <span className="brand-text">ELESTICARE</span>
          </div>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setMenuOpen((open) => !open)}
          aria-controls="navbarNav" 
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`navbar-collapse justify-content-end${menuOpen ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav align-items-center">
            {token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard" onClick={() => setMenuOpen(false)}>
                    <img src={assetUrl('/src/assets/icons/dashboard.png')} alt="Dashboard" className="nav-icon" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/astro-view" onClick={() => setMenuOpen(false)}>
                    <img src={assetUrl('/src/assets/icons/zodiacs.png')} alt="Zodiacs" className="nav-icon" />
                    <span>AstroView</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/tarot" onClick={() => setMenuOpen(false)}>
                    <div className="mystic-icon">
                      <div className="spirit-ball"></div>
                      <div className="tarot-card card-top"></div>
                      <div className="tarot-card card-right"></div>
                      <div className="tarot-card card-bottom"></div>
                      <div className="tarot-card card-left"></div>
                    </div>
                    <span>Mystic Arcana</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/about" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-info-circle nav-fa-icon"></i>
                    <span>About Us</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link text-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt nav-fa-icon"></i>
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-home nav-fa-icon"></i>
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/about" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-info-circle nav-fa-icon"></i>
                    <span>About</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-user-plus nav-fa-icon"></i>
                    <span>Login</span>
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <button
                className="nav-link theme-toggle"
                type="button"
                onClick={() => {
                  setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light');
                  setMenuOpen(false);
                }}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                aria-pressed={theme === 'dark'}
              >
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} nav-fa-icon`}></i>
                <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
