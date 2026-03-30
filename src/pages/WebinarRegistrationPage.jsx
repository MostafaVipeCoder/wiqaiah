import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './WebinarRegistrationPage.css';

const WebinarRegistrationPage = () => {
  const { webinarId } = useParams();
  const { t, i18n } = useTranslation();
  const [webinar, setWebinar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchWebinar();
  }, [webinarId]);

  const fetchWebinar = async () => {
    const { data, error } = await supabase
      .from('webinars')
      .select('*, webinar_registrations(status)')
      .eq('id', webinarId)
      .single();

    if (data && !error) {
      setWebinar(data);
      // Initialize dynamic form fields if any
      const initialForm = {};
      if (data.form_fields) {
        data.form_fields.forEach(f => {
          initialForm[f.name || f.label_en] = '';
        });
      }
      setFormData(initialForm);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(i18n.language === 'ar' ? 'جاري التسجيل...' : 'Registering...');
    
    const { error } = await supabase
      .from('webinar_registrations')
      .insert([{
        webinar_id: webinarId,
        registration_data: formData, // JSONB
        name: formData.name || formData.Name || 'Anonymous', // Fallback for schema compatibility
        email: formData.email || formData.Email || ''
      }]);

    if (!error) {
      toast.success(i18n.language === 'ar' ? 'تم التسجيل بنجاح!' : 'Registration successful!', { id: loadingToast });
      setSubmitted(true);
    } else {
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء التسجيل. يرجى المحاولة لاحقاً.' : 'Failed to register. Please try again.', { id: loadingToast });
    }
  };

  if (loading) return <div className="section-padding container"><h3>{t('common.loading')}</h3></div>;
  if (!webinar) return <div className="section-padding container"><h3>Webinar not found</h3></div>;

  const title = i18n.language === 'ar' ? webinar.title_ar || webinar.title : webinar.title;
  const description = i18n.language === 'ar' ? webinar.description_ar || webinar.description : webinar.description;

  if (submitted) {
    return (
      <div className="registration-status-page container section-padding">
        <div className="status-card">
          <CheckCircle size={64} color="var(--brand-primary)" />
          <h2>{i18n.language === 'ar' ? 'تم التسجيل بنجاح!' : 'Registration Successful!'}</h2>
          <p>{i18n.language === 'ar' ? 'شكراً لك. سيصلك رابط الحضور وتفاصيل الويبينار عبر البريد الإلكتروني قريباً.' : 'Thank you for registering. You will receive the meeting link and details via email soon.'}</p>
          <Link to="/" className="primary-btn">{i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="webinar-reg-page container section-padding">
      <div className="reg-header">
        <Link to="/" className="back-link">
           <ArrowLeft size={16} /> 
           {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
        
        {webinar.cover_url && (
          <div className="reg-hero-cover" style={{ 
            width: '100%', 
            height: '300px', 
            background: `url(${webinar.cover_url}) center/cover no-repeat`,
            borderRadius: '24px',
            marginBottom: '32px'
          }} />
        )}

        <h1>{title}</h1>
        <div className="reg-meta">
          <span className="meta-item"><Calendar size={18} /> {new Date(webinar.start_time).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="meta-item"><Clock size={18} /> {new Date(webinar.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · 60 min</span>
        </div>
      </div>

      <div className="reg-grid">
        <div className="reg-info">
          <h3>{i18n.language === 'ar' ? 'عن الويبينار' : 'About this Webinar'}</h3>
          <p className="reg-description">{description || (i18n.language === 'ar' ? 'لا يوجد وصف متاح.' : 'No description available.')}</p>
          
          <div className="reg-price-box">
             <span className="price-label">{i18n.language === 'ar' ? 'السعر' : 'Price'}:</span>
             <span className="price-val">${webinar.price}</span>
          </div>
        </div>

        <div className="reg-form-card">
          <h3>{i18n.language === 'ar' ? 'سجل بياناتك' : 'Register Now'}</h3>
          
          {(() => {
            const approvedCount = webinar.webinar_registrations?.filter(r => r.status === 'approved').length || 0;
            const isFull = approvedCount >= (webinar.capacity || 50);

            if (isFull) {
              return (
                <div className="full-capacity-notice">
                  <p>{i18n.language === 'ar' ? 'عذراً، هذا الويبينار مكتمل حالياً.' : 'Sorry, this webinar is fully booked.'}</p>
                  <Link to="/" className="secondary-btn">{i18n.language === 'ar' ? 'عرض الويبينارز الأخرى' : 'View Other Webinars'}</Link>
                </div>
              );
            }

            return (
              <form onSubmit={handleRegister} className="reg-form">
                {/* Hardcoded Name/Email first for basic data */}
                <div className="input-group">
                   <label>{i18n.language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
                   <input 
                     type="text" required 
                     value={formData.name || ''}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div className="input-group">
                   <label>{i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                   <input 
                     type="email" required 
                     value={formData.email || ''}
                     onChange={e => setFormData({...formData, email: e.target.value})}
                   />
                </div>

                {/* Dynamic fields from database */}
                {webinar.form_fields && webinar.form_fields.map((field, idx) => {
                  if (field.name === 'name' || field.name === 'email') return null; // skip hardcoded
                  const label = i18n.language === 'ar' ? field.label_ar || field.label_en : field.label_en;
                  return (
                    <div className="input-group" key={idx}>
                      <label>{label}</label>
                      <input 
                        type={field.type || "text"} 
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                      />
                    </div>
                  );
                })}

                <button type="submit" className="primary-btn submit-btn">
                  {i18n.language === 'ar' ? 'تأكيد التسجيل والدفع' : 'Register and Continue'}
                </button>
              </form>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default WebinarRegistrationPage;
