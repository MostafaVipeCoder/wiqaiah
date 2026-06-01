import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePageContent } from '../hooks/usePageContent';
import { usePricing } from '../hooks/usePricing';
import './PainPoints.css';

const PainPoints = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const { get: getBenefits } = usePageContent('benefits');
  const { get: getWho, content: whoContent } = usePageContent('who_its_for');
  const { finalPrice, currencySymbol, loading: pricingLoading } = usePricing();

  // Build who_its_for points dynamically from DB or fallback to i18n
  const whoPoints = whoContent
    ? Object.keys(whoContent)
        .filter(k => k.startsWith('point_'))
        .sort()
        .map(k => whoContent[k][lang] || whoContent[k]['en'])
    : t('who_its_for.points', { returnObjects: true });

  const punchline = getWho('punchline', lang, t('hero.features.same_dentist'));

  return (
    <section className="pain-section">
      <div className="container">
        <div className="benefits-block">
          <div className="pain-label">{getBenefits('title', lang, t('benefits.title')).toUpperCase()}</div>
          <h2 className="pain-title">
            {getBenefits('content', lang, t('benefits.content'))}
          </h2>
        </div>

        <div style={{ height: '80px' }}></div>

        <div className="who-block">
          <div className="pain-label">{getWho('title', lang, t('who_its_for.title')).toUpperCase()}</div>
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
          {!pricingLoading ? t('hero.price_note', { price: finalPrice, symbol: currencySymbol }) : '...'}<br />
          <em>{punchline}</em>
        </p>
      </div>
    </section>
  );
};

export default PainPoints;
