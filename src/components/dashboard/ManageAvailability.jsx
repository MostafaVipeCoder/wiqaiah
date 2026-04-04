import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, Calendar as CalIcon, Clock, RefreshCw } from 'lucide-react';

const ManageAvailability = () => {
  const { t, i18n } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({ day_of_week: 1, start_time: '', end_time: '' });
  const [newSlot, setNewSlot] = useState({ date: '', start_time: '10:00', end_time: '10:45', repeat_weekly: false });

  const timeSlots = Array.from({ length: 20 }).map((_, i) => {
    const startHour = 8 + Math.floor(i * 45 / 60);
    const startMin = (i * 45) % 60;
    const endTotalMin = (i + 1) * 45;
    const endHour = 8 + Math.floor(endTotalMin / 60);
    const endMin = endTotalMin % 60;
    
    const fmt = (h, m) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    return { start: fmt(startHour, startMin), end: fmt(endHour, endMin) };
  });

  const days = t('dashboard.avail.days', { returnObjects: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [slotsRes, templatesRes] = await Promise.all([
      supabase.from('availability').select('*').order('date', { ascending: true }).order('start_time', { ascending: true }),
      supabase.from('availability_templates').select('*').order('day_of_week', { ascending: true }).order('start_time', { ascending: true })
    ]);

    if (!slotsRes.error) setSlots(slotsRes.data || []);
    if (!templatesRes.error) setTemplates(templatesRes.data || []);
    setLoading(false);
  };

  const handleAddTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.start_time || !newTemplate.end_time) return;
    const { error } = await supabase.from('availability_templates').insert([newTemplate]);
    if (!error) {
      setNewTemplate({ ...newTemplate, start_time: '', end_time: '' });
      fetchData();
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) return;

    const slotPayload = {
      date: newSlot.date,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      is_booked: false
    };

    const { error: slotError } = await supabase.from('availability').insert([slotPayload]);
    
    if (newSlot.repeat_weekly) {
      const dateObj = new Date(newSlot.date);
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday...
      // Map JS day to our DB day (assuming 0-6)
      await supabase.from('availability_templates').insert([{
        day_of_week: dayOfWeek,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time
      }]);
    }

    if (!slotError) {
      setNewSlot({ ...newSlot, repeat_weekly: false });
      fetchData();
    }
  };

  const handleDeleteSlot = async (id) => {
    const { error } = await supabase.from('availability').delete().eq('id', id);
    if (!error) fetchData();
  };

  const handleDeleteTemplate = async (id) => {
    const { error } = await supabase.from('availability_templates').delete().eq('id', id);
    if (!error) fetchData();
  };

  const handleSync = async () => {
    setSyncing(true);
    const { error } = await supabase.rpc('replicate_availability_for_next_week');
    if (error) alert('Error syncing: ' + error.message);
    else fetchData();
    setSyncing(false);
  };

  return (
    <div className="dashboard-content-inner animate-fade-in" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* SECTION 1: WEEKLY TEMPLATES */}
      <div className="dashboard-card mb-4">
        <div className="flex-between mb-4">
          <div>
            <h3 className="section-title-dash"><RefreshCw size={18} /> {t('dashboard.avail.templates_title')}</h3>
            <p className="help-text">{t('dashboard.avail.templates_desc')}</p>
          </div>
          <button 
            onClick={handleSync} 
            disabled={syncing}
            className="secondary-btn flex gap-2 items-center"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {t('dashboard.avail.sync_btn')}
          </button>
        </div>

        <form onSubmit={handleAddTemplate} className="add-slot-form mb-4 bg-soft p-4 rounded-xl">
          <div className="form-grid">
            <div className="input-group">
              <label>{t('dashboard.avail.day')}</label>
              <select 
                value={newTemplate.day_of_week}
                onChange={e => setNewTemplate({...newTemplate, day_of_week: parseInt(e.target.value)})}
              >
                {days.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>{t('dashboard.avail.start')}</label>
              <input 
                type="time" required 
                value={newTemplate.start_time ?? ''}
                onChange={e => setNewTemplate({...newTemplate, start_time: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>{t('dashboard.avail.end')}</label>
              <input 
                type="time" required 
                value={newTemplate.end_time ?? ''}
                onChange={e => setNewTemplate({...newTemplate, end_time: e.target.value})}
              />
            </div>
            <div className="input-group flex-end">
               <button type="submit" className="primary-btn add-btn">{t('dashboard.avail.add_template')}</button>
            </div>
          </div>
        </form>

        <div className="table-responsive">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{t('dashboard.avail.day')}</th>
                <th>{t('dashboard.avail.start')} - {t('dashboard.avail.end')}</th>
                <th>{t('dashboard.bookings.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(tRow => (
                <tr key={tRow.id}>
                  <td><strong>{days[tRow.day_of_week]}</strong></td>
                  <td>{tRow.start_time.slice(0, 5)} - {tRow.end_time.slice(0, 5)}</td>
                  <td>
                    <button onClick={() => handleDeleteTemplate(tRow.id)} className="delete-btn"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4">{t('dashboard.avail.no_templates')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: ADD MANUAL SLOT */}
      <div className="dashboard-card mb-4">
        <h3 className="section-title-dash"><Plus size={18} /> {i18n.language === 'ar' ? 'إضافة ميعاد محدد' : 'Add Specific Slot'}</h3>
        <form onSubmit={handleAddSlot} className="add-slot-form bg-soft p-4 rounded-xl">
          <div className="form-grid">
            <div className="input-group">
              <label>{t('dashboard.bookings.date')}</label>
              <input 
                type="date" required 
                value={newSlot.date}
                onChange={e => setNewSlot({...newSlot, date: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>{i18n.language === 'ar' ? 'الميعاد' : 'Time Interval'}</label>
              <select 
                value={`${newSlot.start_time}-${newSlot.end_time}`}
                onChange={e => {
                  const [start, end] = e.target.value.split('-');
                  setNewSlot({...newSlot, start_time: start, end_time: end});
                }}
              >
                {timeSlots.map((ts, idx) => (
                  <option key={idx} value={`${ts.start}-${ts.end}`}>
                    {ts.start} - {ts.end}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group checkbox-row mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newSlot.repeat_weekly}
                  onChange={e => setNewSlot({...newSlot, repeat_weekly: e.target.checked})}
                />
                <span>{i18n.language === 'ar' ? 'تكرار أسبوعياً' : 'Repeat Weekly'}</span>
              </label>
            </div>
            <div className="input-group flex-end">
               <button type="submit" className="primary-btn add-btn">
                 {i18n.language === 'ar' ? 'إضافة الموعد' : 'Add Slot'}
               </button>
            </div>
          </div>
        </form>
      </div>

      {/* SECTION 3: CURRENT SLOTS LIST */}
      <div className="dashboard-card">
        <h3 className="section-title-dash"><CalIcon size={18} /> {t('dashboard.avail.slots_title')}</h3>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t('dashboard.bookings.date_time')}</th>
                  <th>{t('dashboard.avail.start')} - {t('dashboard.avail.end')}</th>
                  <th>{t('dashboard.bookings.status')}</th>
                  <th>{t('dashboard.bookings.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td>{new Date(slot.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                    <td>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</td>
                    <td>
                      <span className={`status-pill ${slot.is_booked ? 'booked' : 'available'}`}>
                        {slot.is_booked ? t('dashboard.bookings.accepted') : 'Available'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteSlot(slot.id)} className="delete-btn"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {slots.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4">{t('dashboard.avail.no_slots')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAvailability;
