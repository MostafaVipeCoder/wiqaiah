import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Users, Mail, Phone, Save, X, ExternalLink } from 'lucide-react';

const ManageWebinars = () => {
  const { t, i18n } = useTranslation();
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);
  const [viewingRegistrations, setViewingRegistrations] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  const fetchWebinars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('webinars')
      .select('*, webinar_registrations(count)')
      .order('created_at', { ascending: false });

    if (!error) setWebinars(data || []);
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('webinar-covers')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error uploading image');
      return;
    }

    const { data } = supabase.storage.from('webinar-covers').getPublicUrl(filePath);
    setFormData({ ...formData, cover_url: data.publicUrl });
  };

  const fetchRegistrations = async (webinarId) => {
    const { data, error } = await supabase
      .from('webinar_registrations')
      .select('*')
      .eq('webinar_id', webinarId);

    if (!error) setRegistrations(data || []);
    setViewingRegistrations(webinarId);
  };

  const [formData, setFormData] = useState({
    title: '', title_ar: '', description: '', description_ar: '',
    start_time: '', price: 9, is_published: true, capacity: 50, cover_url: '', 
    meeting_link: '', confirmation_email_content: '',
    form_fields: [
       { name: 'name', label_en: 'Name', label_ar: 'الاسم', type: 'text', required: true },
       { name: 'email', label_en: 'Email', label_ar: 'البريد الإلكتروني', type: 'email', required: true }
    ]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      end_time: formData.end_time || (formData.start_time ? new Date(new Date(formData.start_time).getTime() + 60 * 60 * 1000).toISOString() : null)
    };

    if (editingWebinar) {
       const { error } = await supabase.from('webinars').update(payload).eq('id', editingWebinar.id);
       if (!error) { setEditingWebinar(null); setShowAddForm(false); fetchWebinars(); }
    } else {
       const { error } = await supabase.from('webinars').insert([payload]);
       if (!error) { setShowAddForm(false); fetchWebinars(); }
    }
  };

  const updateRegistrationStatus = async (regId, newStatus) => {
    const { error } = await supabase.from('webinar_registrations').update({ status: newStatus }).eq('id', regId);
    if (!error) {
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: newStatus } : r));

      // Send email if accepted
      if (newStatus === 'accepted') {
        const reg = registrations.find(r => r.id === regId);
        const webinar = webinars.find(w => w.id === viewingRegistrations);
        if (reg && webinar) {
           const emailContent = (webinar.confirmation_email_content || '')
             .replace(/\[Name\]/g, reg.name)
             .replace(/\[الاسم\]/g, reg.name)
             .replace(/\[Title\]/g, webinar.title)
             .replace(/\[العنوان\]/g, webinar.title_ar || webinar.title)
             .replace(/\[Link\]/g, webinar.meeting_link || '')
             .replace(/\[الرابط\]/g, webinar.meeting_link || '');

           try {
             await supabase.functions.invoke('send-booking-email', {
               body: {
                 name: reg.name,
                 email: reg.email,
                 date: new Date(webinar.start_time).toLocaleDateString(),
                 startTime: new Date(webinar.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                 meetingLink: webinar.meeting_link || '',
                 customMessage: emailContent
               }
             });
           } catch (err) {
             console.error('Failed to send webinar email:', err);
             // silently fail or alert the user
           }
        }
      }
    }
  };

  const deleteWebinar = async (id) => {
    if (!window.confirm('Delete this webinar?')) return;
    const { error } = await supabase.from('webinars').delete().eq('id', id);
    if (!error) fetchWebinars();
  };

  if (viewingRegistrations) {
    return (
      <div className="dashboard-content-inner animate-fade-in" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <button onClick={() => setViewingRegistrations(null)} className="back-link mb-4">← {t('dashboard.webinars.registrations')}</button>
        <div className="dashboard-card">
          <h3 className="section-title-dash">{t('dashboard.webinars.registrations')} ({registrations.length})</h3>
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t('dashboard.bookings.patient')}</th>
                  <th>{t('auth.email')}</th>
                  <th>{t('dashboard.bookings.status')}</th>
                  <th>{t('dashboard.bookings.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id}>
                    <td>
                      <div className="patient-info">
                        <strong>{reg.name}</strong>
                        <span><Phone size={12} /> {reg.phone || '-'}</span>
                      </div>
                    </td>
                    <td>{reg.email}</td>
                    <td><span className={`status-pill ${reg.status}`}>{t(`dashboard.bookings.${reg.status}`)}</span></td>
                    <td>
                      <div className="action-btns">
                        <button onClick={() => updateRegistrationStatus(reg.id, 'accepted')} className="confirm-btn" title={t('dashboard.bookings.accepted')} disabled={reg.status === 'accepted'}>
                          <Plus size={14} />
                        </button>
                        <button onClick={() => updateRegistrationStatus(reg.id, 'rejected')} className="delete-btn" title={t('dashboard.bookings.rejected')} disabled={reg.status === 'rejected'}>
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content-inner animate-fade-in" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex-between mb-4">
        <h3 className="section-title-dash"><Users size={18} /> {t('dashboard.webinars.title')}</h3>
        {!showAddForm && <button onClick={() => setShowAddForm(true)} className="primary-btn add-btn"><Plus size={16} /> {t('dashboard.webinars.create')}</button>}
      </div>

      {showAddForm && (
        <div className="dashboard-card mb-4">
          <h3 className="section-title-dash">{editingWebinar ? t('dashboard.webinars.edit') : t('dashboard.webinars.create')}</h3>
          <form onSubmit={handleSubmit} className="webinar-form">
            <div className="form-grid">
               <div className="input-group">
                 <label>{t('dashboard.webinars.topic')} (English)</label>
                 <input type="text" required value={formData.title ?? ''} onChange={e => setFormData({...formData, title: e.target.value})} />
               </div>
               <div className="input-group">
                 <label>{t('dashboard.webinars.topic')} (Arabic)</label>
                 <input type="text" required value={formData.title_ar ?? ''} onChange={e => setFormData({...formData, title_ar: e.target.value})} dir="rtl" />
               </div>
               <div className="input-group full-width">
                 <label>{t('dashboard.webinars.description')} (English)</label>
                 <textarea value={formData.description ?? ''} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>
               <div className="input-group full-width">
                 <label>{t('dashboard.webinars.description')} (Arabic)</label>
                 <textarea value={formData.description_ar ?? ''} onChange={e => setFormData({...formData, description_ar: e.target.value})} dir="rtl" />
               </div>
                <div className="input-group">
                  <label>{t('dashboard.webinars.date')}</label>
                  <input type="datetime-local" required value={formatDateForInput(formData.start_time) ?? ''} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>{t('dashboard.webinars.price')} ($)</label>
                  <input type="number" step="0.01" required value={formData.price ?? ''} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>{t('dashboard.webinars.capacity')}</label>
                  <input type="number" required value={formData.capacity ?? ''} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>{t('dashboard.webinars.upload_image')}</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  {formData.cover_url && <img src={formData.cover_url} alt="Preview" style={{ width: '100px', marginTop: '10px', borderRadius: '8px' }} />}
                </div>
                <div className="input-group full-width">
                  <label>{t('dashboard.webinars.meeting_link')}</label>
                  <input type="url" value={formData.meeting_link || ''} onChange={e => setFormData({...formData, meeting_link: e.target.value})} />
                </div>
                <div className="input-group full-width">
                  <label>{t('dashboard.webinars.confirmation_email')}</label>
                  <textarea value={formData.confirmation_email_content || ''} onChange={e => setFormData({...formData, confirmation_email_content: e.target.value})} rows={4} />
                  <small className="help-text">{t('dashboard.webinars.help_text')}</small>
                </div>
               <div className="input-group checkbox">
                 <label><input type="checkbox" checked={!!formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} /> {t('dashboard.webinars.published')}</label>
               </div>
            </div>
            <div className="flex-end gap-2 mt-4">
              <button type="button" onClick={() => { setShowAddForm(false); setEditingWebinar(null); }} className="secondary-btn">{t('dashboard.bookings.cancel')}</button>
              <button type="submit" className="primary-btn"><Save size={16} /> {t('dashboard.webinars.save')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        {loading ? <p>{t('common.loading')}</p> : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t('dashboard.webinars.topic')}</th>
                  <th>{t('dashboard.webinars.date')}</th>
                  <th>{t('dashboard.webinars.price')}</th>
                  <th>{t('dashboard.bookings.status')}</th>
                  <th>{t('dashboard.webinars.registrants')}</th>
                  <th>{t('dashboard.bookings.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {webinars.map(w => (
                  <tr key={w.id}>
                    <td>
                      <strong>{i18n.language === 'ar' ? w.title_ar || w.title : w.title}</strong>
                    </td>
                    <td>{new Date(w.start_time).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                    <td>${w.price}</td>
                    <td><span className={`status-pill ${w.is_published ? 'published' : 'draft'}`}>{w.is_published ? t('dashboard.webinars.published') : t('dashboard.webinars.draft')}</span></td>
                    <td><strong>{w.webinar_registrations?.[0]?.count || 0}</strong> / {w.capacity || 50}</td>
                    <td>
                      <div className="action-btns">
                        <button onClick={() => fetchRegistrations(w.id)} className="confirm-btn" title={t('dashboard.webinars.registrations')}><Users size={16} /></button>
                        <button onClick={() => { 
                          setEditingWebinar(w); 
                          setFormData({ ...w, start_time: formatDateForInput(w.start_time) }); 
                          setShowAddForm(true); 
                        }} className="edit-btn" title={t('dashboard.webinars.edit')}><Edit2 size={16} /></button>
                        <button onClick={() => deleteWebinar(w.id)} className="delete-btn" title={t('dashboard.bookings.rejected')}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageWebinars;
