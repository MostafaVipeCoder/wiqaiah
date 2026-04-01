import React from 'react';
import { useTranslation } from 'react-i18next';
import './FAQ.css';

const FAQ = () => {
  const { t } = useTranslation();
  const questions = t('faq.questions', { returnObjects: true });

  return (
    <section id="questions" className="faq-section section-padding">
      <div className="container">
        <div className="section-label">{t('faq.label').toUpperCase()}</div>
        <h2 className="section-title" dangerouslySetInnerHTML={{ __html: t('faq.title') }}>
        </h2>
        <div className="q-grid">
          {questions.map((q, i) => (
            <div key={i} className="q-card">
              <div className="q-icon">?</div>
              <p>{q}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
