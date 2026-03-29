import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, AlertCircle } from 'lucide-react';

const SiteSettings = () => {
  const [settings, setSettings] = useState({
    consultation_price: 15,
    discount_percentage: 10,
    show_discount: true,
    discount_text_en: '',
    discount_text_ar: ''
  });
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
      .single();

    if (data && !error) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', settings.id);

    if (error) {
       setMessage({ type: 'error', text: 'Error saving settings: ' + error.message });
    } else {
       setMessage({ type: 'success', text: 'Settings updated successfully!' });
       setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
    setSaving(false);
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="dashboard-content-inner animate-fade-in">
       <div className="dashboard-card max-width-800">
        <h3 className="section-title-dash"><Save size={18} /> Platform Pricing & Discounts</h3>
        <p className="section-desc">Manage the consultation prices and the promotional discount displayed on the landing page.</p>
        
        <form onSubmit={handleSave} className="settings-form mt-4">
          <div className="form-grid">
            <div className="input-group">
              <label>Standard Consultation Price ($)</label>
              <input 
                type="number" step="0.01" required 
                value={settings.consultation_price}
                onChange={e => setSettings({...settings, consultation_price: parseFloat(e.target.value)})}
              />
            </div>
            
            <div className="input-group">
              <label>Discount Percentage (%)</label>
              <input 
                type="number" step="0.1" required 
                value={settings.discount_percentage}
                onChange={e => setSettings({...settings, discount_percentage: parseFloat(e.target.value)})}
              />
            </div>

            <div className="input-group full-width checkbox-row">
              <input 
                type="checkbox" id="showDesc"
                checked={settings.show_discount}
                onChange={e => setSettings({...settings, show_discount: e.target.checked})}
              />
              <label htmlFor="showDesc">Show discount on Landing Page</label>
            </div>

            <div className="input-group">
              <label>Discount Badge Text (English)</label>
              <input 
                type="text" 
                value={settings.discount_text_en}
                onChange={e => setSettings({...settings, discount_text_en: e.target.value})}
                placeholder="e.g. 10% OFF FIRST SESSION"
              />
            </div>

            <div className="input-group">
              <label>Discount Badge Text (Arabic)</label>
              <input 
                type="text" 
                value={settings.discount_text_ar}
                onChange={e => setSettings({...settings, discount_text_ar: e.target.value})}
                dir="rtl"
                placeholder="مثلاً: خصم 10% على أول جلسة"
              />
            </div>
          </div>

          <div className="flex-between dashboard-form-footer mt-4">
             {message.text && (
               <div className={`status-message ${message.type}`}>
                 <AlertCircle size={16} /> <span>{message.text}</span>
               </div>
             )}
             <button type="submit" disabled={saving} className="primary-btn">
               {saving ? 'Saving...' : 'Save Settings'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettings;
