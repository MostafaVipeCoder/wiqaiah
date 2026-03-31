import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo-link">
          <img src="logo.svg" alt="Wiqaiah" className="nav-logo-img" />
        </Link>

        <div className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          <a href={location.pathname === '/' ? '#how' : '/#how'} onClick={() => setMenuOpen(false)} className="nav-link">{t('nav.process')}</a>
          <a href={location.pathname === '/' ? '#questions' : '/#questions'} onClick={() => setMenuOpen(false)} className="nav-link">{t('nav.faq')}</a>
          <a href={location.pathname === '/' ? '#sessions' : '/#sessions'} onClick={() => setMenuOpen(false)} className="nav-link">{t('nav.sessions')}</a>
          
          <button onClick={() => {toggleLanguage(); setMenuOpen(false);}} className="lang-switcher">
            <Globe size={18} />
            <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <Link to="/book" onClick={() => setMenuOpen(false)} className="cta-button">{t('nav.book_now')}</Link>
        </div>

        <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
