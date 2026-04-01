import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Hero.css';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    consultation_price: 15.0,
    discount_percentage: 10.0,
    show_discount: true,
    discount_text_en: "10% OFF FIRST SESSION",
    discount_text_ar: "خصم 10% على أول جلسة"
  });

  useEffect(() => {
    // Fetch settings from Supabase
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (data && !error) {
        setSettings(data);
      }
    };
    fetchSettings();
  }, []);

  const discountText = i18n.language === 'ar' ? settings.discount_text_ar : settings.discount_text_en;
  const currentPrice = settings.show_discount 
    ? (settings.consultation_price * (1 - settings.discount_percentage / 100)).toFixed(2)
    : settings.consultation_price.toFixed(2);

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-content animate-fade-up">
          <div className="badge">
            <span className="badge-dot"></span>
            <span className="badge-text">{t('hero.badge')}</span>
          </div>
          
          <h1 dangerouslySetInnerHTML={{ __html: t('hero.title') }} />
          
          <p className="hero-subtext" dangerouslySetInnerHTML={{ __html: t('hero.subtitle') }} />

          <div className="hero-actions">
            <Link to="/book" className="primary-btn">{t('hero.book_btn')}</Link>
            <div className="price-tag">
              <span className="price">${currentPrice}</span>
              {settings.show_discount && (
                <>
                  <span className="old-price">${settings.consultation_price}</span>
                  <span className="discount">{discountText}</span>
                </>
              )}
            </div>
          </div>

          <div className="hero-features">
            <div className="feature"><span>✓</span> {t('hero.features.no_waiting')}</div>
            <div className="feature"><span>✓</span> {t('hero.features.no_prescriptions')}</div>
            <div className="feature"><span>✓</span> {t('hero.features.same_dentist')}</div>
          </div>
        </div>
        
        {/* Image side - placeholder (the user removed the original hero image) */}
        <div className="hero-image animate-fade-in">
          <div className="image-wrapper">
             <div className="gradient-sphere"></div>
             <div className="floating-card c1">🦷 {i18n.language === 'ar' ? 'عناية وقائية' : 'Preventive Care'}</div>
             <div className="floating-card c2">✨ {i18n.language === 'ar' ? 'استشارة أونلاين' : 'Online consult'}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
