import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Offer.css';

const Offer = () => {
  const navigate = useNavigate();
  return (
    <section id="book" className="offer-section section-padding">
      <div className="container">
        <div className="offer-grid">
          <div className="offer-details">
            <div className="section-label">THE ULTIMATE SESSION</div>
            <h2 className="section-title">Invest in your <em>long-term smile</em></h2>
            <p className="offer-desc">
              Get direct access to Dr. Muhammad Elberbawi for a 20-minute deep-dive into your oral health. No jargon, no sales pitches—just professional clarity from home.
            </p>
            <ul className="perks">
              <li><span>✓</span> 20 min session with Dr. Muhammad</li>
              <li><span>✓</span> Personalized oral risk assessment</li>
              <li><span>✓</span> Expert guidance, no clinic sales</li>
              <li><span>✓</span> Exclusive community access</li>
            </ul>
          </div>
          <div className="offer-card">
             <div className="card-inner">
                <div className="price-header">
                  <span className="current-price">$13.50</span>
                  <span className="original-price">$15.00</span>
                </div>
                <p className="price-note">10% off your first consultation</p>
                <button onClick={() => navigate('/book')} className="book-session-btn">Book My Session →</button>
                <div className="guarantee">
                   <span>🛡️</span> 100% Satisfaction Guarantee
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offer;
