import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, AnalyticsIcon, LoginIcon, RegisterIcon } from './../utils/icons/NavIcons';
import './../styles/navigation.css';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Главная', icon: HomeIcon  },
    { path: '/analitics', label: 'Аналитика', icon: AnalyticsIcon  },
   // { path: '/login', label: 'Вход', icon: LoginIcon  },
   // { path: '/register', label: 'Регистрация', icon: RegisterIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/home">
            <span className="logo-icon">⚖️</span>
            <span className="logo-text">Судебная аналитика</span>
          </Link>
        </div>
        
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-actions">
        </div>
      </div>
    </nav>
  );
};

export default Navigation;