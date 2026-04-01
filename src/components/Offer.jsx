import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Offer.css';

const Offer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perks = t('offer.perks', { returnObjects: true });

  return (
    <section id="book" className="offer-section section-padding">
      <div className="container">
        <div className="offer-grid">
          <div className="offer-details">
            <div className="section-label">{t('hero.badge').toUpperCase()}</div>
            <h2 className="section-title" dangerouslySetInnerHTML={{ __html: t('offer.title') }}></h2>
            <p className="offer-desc">
              {t('offer.subtitle')}
            </p>
            <ul className="perks">
              {perks.map((perk, i) => (
                <li key={i}><span>✓</span> {perk}</li>
              ))}
            </ul>
          </div>
          <div className="offer-card">
             <div className="card-inner">
                <div className="price-header">
                  <span className="current-price">$15.00</span>
                </div>
                <p className="price-note">{t('hero.price_note')}</p>
                <button onClick={() => navigate('/book')} className="book-session-btn">{t('hero.book_btn')} →</button>
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
