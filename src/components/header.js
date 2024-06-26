import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <img src="/icons/logo.png" alt="Logo" className="header-logo" />
        <span className="header-title">Professional Dashboard</span>
      </div>
      <nav className="header-menu">
        <Link to="/" className="menu-link">Clients</Link>
        <div className="menu-divider"></div>
        <Link to="/admin" className="menu-link">Admin</Link>
      </nav>
      <button className="login-button">Login</button>
    </header>
  );
}

export default Header;
