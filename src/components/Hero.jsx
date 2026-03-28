import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-grid container">
        <div className="hero-content animate-fade-up">
          <div className="badge">
            <span className="dot pink">.</span>
            <span className="badge-text">Real Doctors. Real Answers. From Home.</span>
          </div>
          <h1>
            Your smile deserves <em>total protection</em>, starting from your couch.
          </h1>
          <p className="hero-subtext">
            Consult with <strong>Dr. Muhammad Elberbawi</strong> — a licensed expert with over 10 years of experience. Get live clarity on your dental health in just 20 minutes.
          </p>
          <div className="hero-actions">
            <a href="#book" className="primary-btn">Book Your Session</a>
            <div className="price-tag">
              <span className="price">$13.50</span>
              <span className="old-price">$15</span>
              <span className="discount">10% OFF FIRST SESSION</span>
            </div>
          </div>
          <div className="hero-features">
            <div className="feature"><span>✓</span> NO WAITING ROOMS</div>
            <div className="feature"><span>✓</span> NO PRESCRIPTIONS</div>
            <div className="feature"><span>✓</span> 100% PERSONALIZED</div>
          </div>
        </div>
        <div className="hero-image animate-fade-in">
          <div className="image-wrapper">
             <img src="/hero_image.png" alt="Dr. Muhammad Consultation" className="hero-main-img" />
             <div className="gradient-sphere"></div>
             <div className="floating-card c1">🦷 Preventive Care</div>
             <div className="floating-card c2">✨ Online consult</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
