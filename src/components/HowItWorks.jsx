import React from 'react';
import { useTranslation } from 'react-i18next';
import './HowItWorks.css';

const Step = ({ number, title, text }) => (
  <div className="step-card">
    <div className="step-num">{number}</div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

const HowItWorks = () => {
  const { t } = useTranslation();
  const steps = t('how_it_works_new.steps', { returnObjects: true });

  return (
    <section id="how" className="how-section section-padding">
      <div className="container">
        <div className="section-label">{t('how_it_works_new.title').toUpperCase()}</div>
        <h2 className="section-title">
          {t('how_it_works_new.footer')}
        </h2>
        
        <div className="steps-grid">
          {steps.map((step, i) => (
            <Step key={i} number={`0${i + 1}`} title={step.title} text={step.text} />
          ))}
        </div>

        <div className="disclaimer-block">
          <div className="disclaimer-header">
            <span className="warning-icon">⚠</span>
            <h3>{t('disclaimer_text.title')}</h3>
          </div>
          <p className="disclaimer-content">{t('disclaimer_text.content')}</p>
          <div className="disclaimer-replaces">
            <p>{t('disclaimer_text.replaces')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
