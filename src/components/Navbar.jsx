import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <div className="logo">
          <span className="wiqaiah">wiqaiah</span>
          <span className="dot pink">.</span>
          <span className="dot orange">.</span>
        </div>
        <div className="nav-links">
          <a href="#how" className="nav-link">Process</a>
          <a href="#questions" className="nav-link">FAQ</a>
          <a href="#sessions" className="nav-link">Sessions</a>
          <a href="#book" className="cta-button">Book Now</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
