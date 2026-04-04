import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, CheckCircle, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageContent } from '../hooks/usePageContent';
import { useSiteSettings } from '../hooks/useSiteSettings';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import toast from 'react-hot-toast';
import './BookingPage.css';
import '../components/HowItWorks.css';

const BookingPage = () => {
  const { t, i18n } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);
  const { get } = usePageContent('confirmations');
  const theme = useSiteSettings();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  // Timezone conversion helper
  const getLocalTime = (dateStr, timeStr) => {
    try {
      // Create a formatter for the Admin's timezone
      const adminTz = theme.site_timezone || 'Africa/Cairo';
      
      // Step 1: Get the current date in Admin TZ to find offset correctly
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: adminTz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      });
      
      // We want to find the UTC time that corresponds to (dateStr + timeStr) in adminTz
      // A simple way: find the offset of adminTz at that moment
      const parts = formatter.formatToParts(new Date(`${dateStr}T${timeStr}`));
      const dateMap = {};
      parts.forEach(p => dateMap[p.type] = p.value);
      
      const adminDate = new Date(`${dateMap.year}-${dateMap.month}-${dateMap.day}T${dateMap.hour}:${dateMap.minute}:${dateMap.second}`);
      const diff = adminDate.getTime() - new Date(`${dateStr}T${timeStr}`).getTime();
      
      // Adjust the input time to get the absolute UTC time
      const utcTime = new Date(new Date(`${dateStr}T${timeStr}`).getTime() - diff);
      
      return utcTime;
    } catch (e) {
      return new Date(`${dateStr}T${timeStr}`);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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

    const loadingToast = toast.loading(i18n.language === 'ar' ? 'جاري إرسال طلبك...' : 'Sending request...');

    const { error } = await supabase
      .from('bookings')
      .insert([{
        availability_id: selectedSlot.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        status: 'pending'
      }]);

    if (!error) {
      toast.success(i18n.language === 'ar' ? 'تم إرسال طلب الحجز بنجاح!' : 'Booking request sent successfully!', { id: loadingToast });
      setSubmitted(true);
      await supabase.from('availability').update({ is_booked: true }).eq('id', selectedSlot.id);
    } else {
      toast.error(i18n.language === 'ar' ? 'حدث خطأ. يرجى المحاولة لاحقاً.' : 'An error occurred. Please try again.', { id: loadingToast });
    }
  };

  if (submitted) {
    return (
      <div className="booking-status-page container section-padding">
        <div className="status-card">
          <CheckCircle size={64} color="var(--brand-primary)" />
          <h2>{get('booking_success_title', lang, i18n.language === 'ar' ? 'تم استلام طلبك!' : 'Request Sent!')}</h2>
          <p>{get('booking_success_message', lang, i18n.language === 'ar' ? 'شكراً لك. سيقوم الدكتور بمراجعة الطلب وسيصلك إيميل بالتفاصيل قريباً.' : 'Thank you. Dr. Muhammad will review your request and you will receive an email confirmation soon.')}</p>
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

      <div className="booking-steps-guide" style={{ marginBottom: '60px' }}>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>{i18n.language === 'ar' ? 'اختر موعدك' : 'Select a Slot'}</h3>
            <p>{i18n.language === 'ar' ? 'قم باختيار الوقت والتاريخ المناسبين لك من القائمة المتاحة.' : 'Choose a suitable time and date from the available options.'}</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>{i18n.language === 'ar' ? 'أدخل بياناتك' : 'Enter Details'}</h3>
            <p>{i18n.language === 'ar' ? 'قم بتعبئة نموذج الحجز لتوضيح سبب الاستشارة لتجهيز أفضل.' : 'Fill out the booking form with your details to help us prepare.'}</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>{i18n.language === 'ar' ? 'تأكيد الموعد' : 'Booking Confirmation'}</h3>
            <p>{i18n.language === 'ar' ? 'سيصلك بريد إلكتروني يحتوي على تأكيد الموعد ورابط الاجتماع.' : 'You will receive an email with the appointment confirmation and meeting link.'}</p>
          </div>
        </div>
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
                  <div className="slot-date">
                    {(() => {
                      const localDate = getLocalTime(slot.date, slot.start_time);
                      return localDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long' });
                    })()}
                  </div>
                  <div className="slot-time">
                    <Clock size={14} /> 
                    {(() => {
                      const start = getLocalTime(slot.date, slot.start_time);
                      const end = getLocalTime(slot.date, slot.end_time);
                      const fmt = { hour: '2-digit', minute: '2-digit', hour12: false };
                      return `${start.toLocaleTimeString([], fmt)} - ${end.toLocaleTimeString([], fmt)}`;
                    })()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="booking-form-container">
          <h3><CheckCircle size={20} /> {i18n.language === 'ar' ? 'بيانات الحجز' : 'Booking Details'}</h3>
          {!selectedSlot ? (
            <div className="form-placeholder">
              <div className="placeholder-content">
                <Calendar size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                <p>{i18n.language === 'ar' ? 'يرجى اختيار موعد متاح من القائمة للبدء' : 'Please select an available slot from the list to start'}</p>
              </div>
            </div>
          ) : (
            <div className="booking-form-wrapper animate-fade-in">
              <div className="selected-slot-summary">
                <div className="summary-icon">
                   <Clock size={24} />
                </div>
                <div className="summary-details">
                   <h4>{i18n.language === 'ar' ? 'الموعد المختار' : 'Selected Slot'}</h4>
                    <p>
                      {(() => {
                        const local = getLocalTime(selectedSlot.date, selectedSlot.start_time);
                        const end = getLocalTime(selectedSlot.date, selectedSlot.end_time);
                        const fmt = { hour: '2-digit', minute: '2-digit', hour12: false };
                        return `${local.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long' })} · ${local.toLocaleTimeString([], fmt)} - ${end.toLocaleTimeString([], fmt)}`;
                      })()}
                    </p>
                </div>
              </div>

              <form onSubmit={handleBooking} className="booking-form">
                <div className="input-group">
                  <label>{i18n.language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input 
                    type="text" required 
                    placeholder={i18n.language === 'ar' ? 'أدخل اسمك هنا' : 'Enter your name'}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
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
                  <label>{i18n.language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                  <PhoneInput
                    country={'eg'}
                    value={formData.phone}
                    onChange={phone => setFormData({...formData, phone})}
                    placeholder="+20 123 456 7890"
                    specialLabel=""
                    inputProps={{
                      name: 'phone',
                      required: true,
                    }}
                    containerClass="phone-input-container"
                    inputClass="phone-input-field"
                    buttonClass="phone-input-button"
                    searchPlaceholder={i18n.language === 'ar' ? 'بحث عن دولة' : 'Search country'}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
