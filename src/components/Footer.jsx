import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo">
            <span className="wiqaiah">wiqaiah</span>
            <span className="dot pink">.</span>
            <span className="dot orange">.</span>
          </div>
          <p className="footer-motto">Medical-grade clarity, from home.</p>
        </div>
        <div className="footer-links">
          <div className="footer-group">
            <h4>Services</h4>
            <a href="#">One-on-One Session</a>
            <a href="#">Webinars</a>
            <a href="#">Community Join</a>
          </div>
          <div className="footer-group">
            <h4>Support</h4>
            <a href="#">FAQ</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-legal">
          <p>© 2026 Wiqaiah. All rights reserved.</p>
          <p className="disclaimer">
            <strong>DISCLAIMER:</strong> This is a consultative session and <u>not</u> a clinical diagnosis or treatment. For emergencies, please visit your local clinic.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
