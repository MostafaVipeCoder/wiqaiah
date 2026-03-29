import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
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
          <img src="/logo.svg" alt="Wiqaiah" className="nav-logo-img" />
        </Link>

        <div className="nav-links">
          {location.pathname === '/' && (
            <>
              <a href="#how" className="nav-link">{t('nav.process')}</a>
              <a href="#questions" className="nav-link">{t('nav.faq')}</a>
              <a href="#sessions" className="nav-link">{t('nav.sessions')}</a>
            </>
          )}
          
          <button onClick={toggleLanguage} className="lang-switcher">
            <Globe size={18} />
            <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <Link to="/book" className="cta-button">{t('nav.book_now')}</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
