import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Save, Settings as SettingsIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

const SiteSettings = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      setSettings(data);
    } else {
      // Initialize with default values if not found
      setSettings({
        consultation_price: 15,
        discount_percentage: 20,
        show_discount_badge: true,
        discount_badge_text_en: 'LIMITED TIME OFFER',
        discount_badge_text_ar: 'لفترة محدودة فقط',
        auto_generate_slots: true,
        booking_confirmation_email: '',
        webinar_confirmation_email_default: ''
      });
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase
      .from('site_settings')
      .upsert({ 
        id: settings.id,
        ...settings,
        updated_at: new Date()
      });

    if (error) {
      setMessage({ type: 'error', text: t('dashboard.settings.error') });
    } else {
      setMessage({ type: 'success', text: t('dashboard.settings.success') });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="dashboard-content-inner animate-fade-in" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="dashboard-card max-w-4xl">
        <div className="flex-between mb-6">
          <h3 className="section-title-dash"><SettingsIcon size={20} /> {t('dashboard.settings.title')}</h3>
        </div>

        <p className="help-text mb-8">{t('dashboard.settings.desc')}</p>

        {message.text && (
          <div className={`alert-dash ${message.type} animate-slide-in`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="settings-form-grid">
           <div className="form-grid">
              <div className="input-group">
                <label>{t('dashboard.settings.std_price')}</label>
                <input 
                  type="number" step="0.01" 
                  value={settings.consultation_price ?? ''} 
                  onChange={e => setSettings({...settings, consultation_price: parseFloat(e.target.value)})}
                />
              </div>

              <div className="input-group">
                <label>{t('dashboard.settings.discount_pct')}</label>
                <input 
                  type="number" 
                  value={settings.discount_percentage ?? ''} 
                  onChange={e => setSettings({...settings, discount_percentage: parseInt(e.target.value)})}
                />
              </div>

              <div className="input-group checkbox full-width">
                <label className="flex gap-3 items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!settings.show_discount_badge} 
                    onChange={e => setSettings({...settings, show_discount_badge: e.target.checked})}
                  />
                  <span>{t('dashboard.settings.show_discount')}</span>
                </label>
              </div>

              <div className="input-group checkbox full-width">
                <label className="flex gap-3 items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!settings.auto_generate_slots} 
                    onChange={e => setSettings({...settings, auto_generate_slots: e.target.checked})}
                  />
                  <span>{t('dashboard.settings.auto_gen_slots')}</span>
                </label>
              </div>

              <div className="input-group">
                <label>{t('dashboard.settings.badge_en')}</label>
                <input 
                  type="text" 
                  value={settings.discount_badge_text_en ?? ''} 
                  onChange={e => setSettings({...settings, discount_badge_text_en: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>{t('dashboard.settings.badge_ar')}</label>
                <input 
                  type="text" dir="rtl"
                  value={settings.discount_badge_text_ar ?? ''} 
                  onChange={e => setSettings({...settings, discount_badge_text_ar: e.target.value})}
                />
              </div>

              <div className="input-group full-width mt-4">
                <label>{t('dashboard.settings.email_template')}</label>
                <textarea 
                  rows="4" 
                  value={settings.booking_confirmation_email || ''} 
                  onChange={e => setSettings({...settings, booking_confirmation_email: e.target.value})}
                />
                <small className="help-text">Available placeholders: {'{name}, {date}, {time}, {link}'}</small>
              </div>


           </div>

           <div className="flex-end mt-8 pt-6 border-t border-soft">
              <button 
                type="submit" 
                className="primary-btn flex gap-2 items-center min-w-[150px] justify-center"
                disabled={saving}
              >
                <Save size={18} />
                {saving ? t('dashboard.settings.saving') : t('dashboard.settings.save_btn')}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettings;
