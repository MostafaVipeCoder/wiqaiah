import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, CheckCircle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BookingPage.css';

const BookingPage = () => {
  const { t, i18n } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('is_booked', false)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (!error) setSlots(data || []);
    setLoading(false);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const { error } = await supabase
      .from('bookings')
      .insert([{
        availability_id: selectedSlot.id,
        name: formData.name,
        email: formData.email,
        reason: formData.reason,
        status: 'pending'
      }]);

    if (!error) {
      // Mark slot as pending/booked (or wait for doctor approval)
      // Usually we mark as booked once approved, but for UX we can show success
      setSubmitted(true);
      // Optionally update slot to 'is_booked' if you want real-time reservation
      await supabase.from('availability').update({ is_booked: true }).eq('id', selectedSlot.id);
    }
  };

  if (submitted) {
    return (
      <div className="booking-status-page container section-padding">
        <div className="status-card">
          <CheckCircle size={64} color="var(--primary)" />
          <h2>{i18n.language === 'ar' ? 'تم استلام طلبك!' : 'Request Sent!'}</h2>
          <p>{i18n.language === 'ar' ? 'شكراً لك. سيقوم الدكتور بمراجعة الطلب وسيصلك إيميل بالتفاصيل قريباً.' : 'Thank you. Dr. Muhammad will review your request and you will receive an email confirmation soon.'}</p>
          <Link to="/" className="primary-btn">{i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page container section-padding">
      <div className="booking-header">
        <Link to="/" className="back-link"><ChevronLeft size={16} /> {i18n.language === 'ar' ? 'رجوع' : 'Back'}</Link>
        <h1>{i18n.language === 'ar' ? 'احجز استشارتك الخاصة' : 'Book Your Private Consultation'}</h1>
        <p>{i18n.language === 'ar' ? 'اختر موعداً يناسبك من قائمة المواعيد المتاحة أدناه.' : 'Select a time slot that works for you from the available options below.'}</p>
      </div>

      <div className="booking-selection-grid">
        <div className="slots-container">
          <h3><Calendar size={20} /> {i18n.language === 'ar' ? 'المواعيد المتاحة' : 'Available Slots'}</h3>
          {loading ? (
            <p className="loading-text">{t('common.loading')}</p>
          ) : slots.length === 0 ? (
            <div className="empty-slots">
              <p>{i18n.language === 'ar' ? 'لا توجد مواعيد متاحة حالياً. يرجى المحاولة لاحقاً.' : 'No available slots at the moment. Please check back later.'}</p>
            </div>
          ) : (
            <div className="slots-list">
              {slots.map(slot => (
                <button 
                  key={slot.id} 
                  className={`slot-item ${selectedSlot?.id === slot.id ? 'active' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div className="slot-date">{new Date(slot.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long' })}</div>
                  <div className="slot-time"><Clock size={14} /> {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="booking-form-container">
          <h3><CheckCircle size={20} /> {i18n.language === 'ar' ? 'بيانات الحجز' : 'Booking Details'}</h3>
          {!selectedSlot ? (
            <div className="form-placeholder">
              <p>{i18n.language === 'ar' ? 'يرجى اختيار موعد أولاً' : 'Please select a slot first'}</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="booking-form animate-fade-in">
              <div className="input-group">
                <label>{i18n.language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                <input 
                  type="text" required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder={i18n.language === 'ar' ? 'ادخل اسمك' : 'Enter your name'}
                />
              </div>
              <div className="input-group">
                <label>{i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <input 
                  type="email" required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="example@mail.com"
                />
              </div>
              <div className="input-group">
                <label>{i18n.language === 'ar' ? 'سبب الاستشارة (اختياري)' : 'Reason for consultation (Optional)'}</label>
                <textarea 
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  placeholder={i18n.language === 'ar' ? 'ما الذي تود مناقشته؟' : 'What would you like to discuss?'}
                />
              </div>
              <button type="submit" className="primary-btn submit-btn">
                {i18n.language === 'ar' ? 'تأكيد طلب الحجز' : 'Confirm Booking Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
