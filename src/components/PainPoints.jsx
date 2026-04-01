import React from 'react';
import { useTranslation } from 'react-i18next';
import './PainPoints.css';

const PainPoints = () => {
  const { t } = useTranslation();
  const whoPoints = t('who_its_for.points', { returnObjects: true });

  return (
    <section className="pain-section">
      <div className="container">
        {/* Benefits Section */}
        <div className="benefits-block">
          <div className="pain-label">{t('benefits.title').toUpperCase()}</div>
          <h2 className="pain-title">
            {t('benefits.content')}
          </h2>
        </div>

        <div style={{ height: '80px' }}></div>

        {/* Who it's for Section */}
        <div className="who-block">
          <div className="pain-label">{t('who_its_for.title').toUpperCase()}</div>
          <div className="pain-list">
            {whoPoints.map((point, i) => (
              <div key={i} className="pain-item">
                <span className="check">✓</span>
                <p>{point}</p>
              </div>
            ))}
          </div>
        </div>
        
        <p className="pain-punchline">
          {t('hero.price_note')}<br />
          <em>{t('hero.features.same_dentist')}</em>
        </p>
      </div>
    </section>
  );
};

export default PainPoints;
