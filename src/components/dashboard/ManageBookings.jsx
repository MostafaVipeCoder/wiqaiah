import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Check, X, Trash2, Mail, Phone, Users, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManageBookings = () => {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionLink, setSessionLink] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [summaryId, setSummaryId] = useState(null);
  const [summaryText, setSummaryText] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').single();
    if (data) setSiteSettings(data);
  };

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        availability (
          date,
          start_time,
          end_time
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const updateBookingStatus = async (id, status, meetingLink = '', customEmail = '') => {
    setIsUpdating(true);
    const updateData = { status };
    if (meetingLink) updateData.meeting_link = meetingLink;

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      if (status === 'accepted') {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          try {
            const { error: fnError } = await supabase.functions.invoke('send-booking-email', {
              body: {
                name: booking.name,
                email: booking.email,
                date: booking.availability?.date,
                startTime: booking.availability?.start_time?.slice(0, 5),
                meetingLink: meetingLink,
                customMessage: customEmail // The full text from the textarea
              }
            });
            if (fnError) throw fnError;
          } catch (fnErr) {
            console.error('Failed to send email via Edge Function:', fnErr);
            alert(t('dashboard.bookings.email_failed') || 'Could not send confirmation email, but booking was approved.');
          }
        }
      }

      setAcceptingId(null);
      setSessionLink('');
      setEmailContent('');
      fetchBookings();
    } else {
      console.error(error);
      alert(t('common.error') || 'Error updating booking');
    }
    setIsUpdating(false);
  };

  const replacePlaceholders = (template, booking, link) => {
    if (!template) return '';
    const dateStr = new Date(booking.availability?.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
    const timeStr = `${booking.availability?.start_time?.slice(0, 5)} - ${booking.availability?.end_time?.slice(0, 5)}`;
    
    return template
      .replace(/\[Patient Name\]/g, booking.name || '')
      .replace(/\[اسم المريض\]/g, booking.name || '')
      .replace(/\[Date\]/g, dateStr)
      .replace(/\[التاريخ\]/g, dateStr)
      .replace(/\[Time\]/g, timeStr)
      .replace(/\[الوقت\]/g, timeStr)
      .replace(/\[Link\]/g, link || '')
      .replace(/\[الرابط\]/g, link || '');
  };

  const handleStartAccepting = (booking) => {
    setAcceptingId(booking.id);
    const initialLink = 'https://zoom.us/j/your-meeting-id';
    setSessionLink(initialLink);
    const template = siteSettings?.booking_confirmation_email || '';
    setEmailContent(replacePlaceholders(template, booking, initialLink));
  };

  const handleLinkChange = (e, booking) => {
    const newLink = e.target.value;
    setSessionLink(newLink);
    const template = siteSettings?.booking_confirmation_email || '';
    setEmailContent(replacePlaceholders(template, booking, newLink));
  };

  const sendSummary = async () => {
    if (!summaryText) return;
    setIsUpdating(true);
    const booking = bookings.find(b => b.id === summaryId);
    
    try {
      await supabase.functions.invoke('send-booking-email', {
        body: {
          name: booking.name,
          email: booking.email,
          date: new Date(booking.availability.date).toLocaleDateString(),
          startTime: booking.availability.start_time,
          meetingLink: booking.meeting_link || '',
          customMessage: summaryText
        }
      });
      toast.success(i18n.language === 'ar' ? 'تم إرسال الملخص بنجاح!' : 'Summary sent successfully!');
      setSummaryId(null);
      setSummaryText('');
    } catch (err) {
      toast.error(i18n.language === 'ar' ? 'فشل في إرسال الملخص' : 'Failed to send summary');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBooking = async (id, availability_id) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) {
      await supabase.from('availability').update({ is_booked: false }).eq('id', availability_id);
      fetchBookings();
    }
  };

  return (
    <div className="dashboard-content-inner animate-fade-in" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
       <div className="dashboard-card">
        <h3 className="section-title-dash"><Users size={18} /> {t('dashboard.bookings.title')}</h3>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t('dashboard.bookings.patient')}</th>
                  <th>{t('dashboard.bookings.date_time')}</th>
                  <th>{t('dashboard.bookings.reason')}</th>
                  <th>{t('dashboard.bookings.status')}</th>
                  <th>{t('dashboard.bookings.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>
                      <div className="patient-info">
                        <div className="patient-name">{booking.name}</div>
                        <div className="patient-contact">
                          <div className="contact-item">
                            <Mail size={12} />
                            <span>{booking.email}</span>
                          </div>
                          {booking.phone && (
                            <div className="contact-item">
                              <Phone size={12} />
                              <span>{booking.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {new Date(booking.availability?.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')} <br />
                      <small>{booking.availability?.start_time?.slice(0, 5)} - {booking.availability?.end_time?.slice(0, 5)}</small>
                    </td>
                    <td><p className="reason-cell" title={booking.reason}>{booking.reason || '-'}</p></td>
                    <td>
                      <span className={`status-pill ${booking.status}`}>
                        {t(`dashboard.bookings.${booking.status}`)}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {booking.status === 'pending' && (
                          <div className="action-btns">
                            <button onClick={() => handleStartAccepting(booking)} className="confirm-btn" title={t('dashboard.bookings.accepted')}>
                              <Check size={16} />
                            </button>
                            <button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="reject-btn" title={t('dashboard.bookings.rejected')}>
                              <X size={16} />
                            </button>
                          </div>
                        )}
                        {booking.status === 'accepted' && booking.meeting_link && (
                          <div className="flex flex-col gap-2">
                             <a href={booking.meeting_link} target="_blank" rel="noreferrer" className="link-info-pill hover:bg-teal-50 transition-colors">
                               <ExternalLink size={12} /> {booking.meeting_link.length > 20 ? booking.meeting_link.substring(0, 20) + '...' : booking.meeting_link}
                             </a>
                             {new Date(`${booking.availability?.date}T${booking.availability?.start_time}`) < new Date() && (
                               <button onClick={() => setSummaryId(booking.id)} className="summary-btn-action">
                                 <Mail size={14} /> {i18n.language === 'ar' ? 'إرسال ملخص' : 'Send Summary'}
                               </button>
                             )}
                          </div>
                        )}
                        <button onClick={() => deleteBooking(booking.id, booking.availability_id)} className="delete-btn" title={t('common.delete')}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4">{t('dashboard.bookings.no_bookings')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accept Booking Modal */}
      {acceptingId && (
        <div className="modal-backdrop" onClick={() => {setAcceptingId(null); setSessionLink(''); setEmailContent('');}}>
          <div className="accept-modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{t('dashboard.bookings.accept_dialog_title')}</h4>
              <button 
                onClick={() => {setAcceptingId(null); setSessionLink(''); setEmailContent('');}} 
                className="btn-close-modal"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="email-custom-area">
              <div className="email-field-group">
                <label>{t('dashboard.bookings.placeholder_link')}</label>
                <input 
                  type="url" 
                  placeholder="https://zoom.us/..." 
                  className="dash-input"
                  value={sessionLink}
                  onChange={(e) => {
                    const booking = bookings.find(b => b.id === acceptingId);
                    handleLinkChange(e, booking);
                  }}
                  autoFocus 
                />
              </div>

              <div className="email-field-group">
                <label>{t('dashboard.bookings.email_label')}</label>
                <textarea
                  className="dash-textarea"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder={t('dashboard.bookings.placeholder_email')}
                />
              </div>
            </div>

            <div className="dialog-actions">
              <button 
                onClick={() => updateBookingStatus(acceptingId, 'accepted', sessionLink, emailContent)} 
                className="btn-accept-send"
                disabled={isUpdating}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Check size={18} /> {isUpdating ? t('common.loading') : t('dashboard.bookings.send_link_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {summaryId && (
        <div className="modal-backdrop" onClick={() => setSummaryId(null)}>
          <div className="accept-modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{i18n.language === 'ar' ? 'إرسال ملخص الجلسة' : 'Send Session Summary'}</h4>
              <button onClick={() => setSummaryId(null)} className="btn-close-modal"><X size={20} /></button>
            </div>
            <div className="email-custom-area">
              <div className="email-field-group">
                <label>{i18n.language === 'ar' ? 'اكتب ملخص الجلسة والخطوات القادمة' : 'Session Summary & Next Steps'}</label>
                <textarea
                  className="dash-textarea"
                  style={{ minHeight: '200px' }}
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder={i18n.language === 'ar' ? 'مثال: شكراً لحضورك.. لقد ناقشنا كذا وكذا.. والخطوات القادمة هي..' : 'Thank you for attending... we discussed... next steps are...'}
                />
              </div>
            </div>
            <div className="dialog-actions">
              <button 
                onClick={sendSummary} 
                className="btn-accept-send"
                disabled={isUpdating || !summaryText}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Mail size={18} /> {isUpdating ? t('common.loading') : (i18n.language === 'ar' ? 'إرسال للمريض' : 'Send to Patient')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
