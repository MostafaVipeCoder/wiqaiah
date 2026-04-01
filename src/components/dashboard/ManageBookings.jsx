import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Check, X, Trash2, Mail, Users, ExternalLink } from 'lucide-react';

const ManageBookings = () => {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionLink, setSessionLink] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
    // Note: If we had a column for custom_email_sent, we would save it here.
    // For now, we assume this customEmail would be passed to an edge function if implemented.

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      setAcceptingId(null);
      setSessionLink('');
      setEmailContent('');
      fetchBookings();
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
                        <strong>{booking.name}</strong>
                        <span><Mail size={12} /> {booking.email}</span>
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
                          <a href={booking.meeting_link} target="_blank" rel="noreferrer" className="link-info-pill hover:bg-teal-50 transition-colors">
                            <ExternalLink size={12} /> {booking.meeting_link.length > 20 ? booking.meeting_link.substring(0, 20) + '...' : booking.meeting_link}
                          </a>
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
    </div>
  );
};

export default ManageBookings;
