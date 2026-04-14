import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { 
  Trash2, Plus, Calendar as CalIcon, Clock, RefreshCw, 
  Settings, Info, Save, X, Check, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './ManageAvailability.css';

const ManageAvailability = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState({
    service_name_ar: '',
    service_name_en: '',
    service_duration: 45,
    buffer_time: 15,
    max_daily_bookings: 4,
    min_notice_hours: 6,
    max_future_weeks: 1,
    is_service_public: true
  });

  // Days Order: Sat to Fri
  const dayOrder = [6, 0, 1, 2, 3, 4, 5]; 
  const dayNames = isAr 
    ? ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    : ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const hours = Array.from({ length: 15 }).map((_, i) => 8 + i); // 8:00 to 22:00

  // ── Data Fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: setRes } = await supabase.from('site_settings').select('*').single();
      if (setRes) setSettings(setRes);

      const { data: tempRes } = await supabase
        .from('availability_templates')
        .select('*')
        .order('start_time', { ascending: true });
      if (tempRes) setTemplates(tempRes);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', settings.id);
      
      if (error) throw error;
      toast.success(t('dashboard.avail.save_success'));
    } catch (err) {
      toast.error(t('dashboard.avail.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDayAvailability = async (dayIdx) => {
    const dayTemplates = templates.filter(t => t.day_of_week === dayIdx);
    const wasActive = dayTemplates.length > 0;
    
    // Optimistic Update
    if (wasActive) {
      setTemplates(prev => prev.filter(t => t.day_of_week !== dayIdx));
      const { error } = await supabase.from('availability_templates').delete().eq('day_of_week', dayIdx);
      if (error) fetchData(); // Rollback
    } else {
      const newTemp = { id: `temp-${Date.now()}`, day_of_week: dayIdx, start_time: '09:00:00', end_time: '17:00:00' };
      setTemplates(prev => [...prev, newTemp]);
      const { data, error } = await supabase.from('availability_templates').insert([{
        day_of_week: dayIdx,
        start_time: '09:00',
        end_time: '17:00'
      }]).select();
      
      if (error) {
        fetchData(); // Rollback
      } else {
        // Replace temp ID with real ID
        setTemplates(prev => prev.map(t => t.id === newTemp.id ? data[0] : t));
      }
    }
  };

  const addTimeRange = async (dayIdx) => {
    const newTemp = { id: `temp-${Date.now()}`, day_of_week: dayIdx, start_time: '17:00:00', end_time: '20:00:00' };
    setTemplates(prev => [...prev, newTemp]);
    
    const { data, error } = await supabase.from('availability_templates').insert([{
      day_of_week: dayIdx,
      start_time: '17:00',
      end_time: '20:00'
    }]).select();
    
    if (error) {
      fetchData(); // Rollback
    } else {
      setTemplates(prev => prev.map(t => t.id === newTemp.id ? data[0] : t));
    }
  };

  const removeTemplate = async (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('availability_templates').delete().eq('id', id);
    if (error) fetchData(); // Rollback
  };

  const updateTemplateTime = async (id, field, value) => {
    // Optimistic update
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    
    const { error } = await supabase
      .from('availability_templates')
      .update({ [field]: value })
      .eq('id', id);
    
    if (error) {
      toast.error(t('common.error'));
      fetchData(); // Rollback
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getTemplatesForDay = (dayIdx) => templates.filter(t => t.day_of_week === dayIdx);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="dashboard-content-inner animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="flex-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.avail.root_title')}</h2>
          <p className="text-slate-500">{t('dashboard.avail.root_subtitle')}</p>
        </div>
      </header>

      <div className="availability-layout">
        
        {/* LEFT COLUMN: Time Grid View */}
        <div className="calendar-grid-container">
          <div className="calendar-header">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={18} /></button>
              <span className="font-semibold text-lg">{new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}</span>
              <button className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight size={18} /></button>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium">{t('dashboard.avail.today')}</button>
            </div>
          </div>

          <div className="calendar-grid">
            {/* Header Spacer */}
            <div className="grid-day-header"></div>
            {/* Day Headers */}
            {dayOrder.map((d, i) => (
              <div key={d} className="grid-day-header">
                <div className="text-xs uppercase text-slate-400 mb-1">{dayNames[i]}</div>
                <div className="text-xl">--</div>
              </div>
            ))}

            {/* Time Rows */}
            {hours.map(h => (
              <React.Fragment key={h}>
                <div className="grid-time-label">
                  {h > 12 ? `${h-12} ${isAr ? 'م' : 'PM'}` : `${h} ${isAr ? 'ص' : 'AM'}`}
                </div>
                {dayOrder.map(d => {
                  const dayTemps = getTemplatesForDay(d);
                  return (
                    <div key={`${h}-${d}`} className="grid-cell">
                      {dayTemps.map(temp => {
                        const startH = parseInt(temp.start_time.split(':')[0]);
                        const endH = parseInt(temp.end_time.split(':')[0]);
                        if (h >= startH && h < endH) {
                          return <div key={temp.id} className="slot-indicator h-full w-full"></div>;
                        }
                        return null;
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Configuration Sidebar */}
        <div className="availability-sidebar">
          
          {/* Service Info */}
          <div className="sidebar-section">
            <h4><Info size={18} /> {t('dashboard.avail.service_name')}</h4>
            <input 
              className="dash-input mb-4"
              value={isAr ? settings.service_name_ar : settings.service_name_en}
              onChange={(e) => setSettings({
                ...settings, 
                [isAr ? 'service_name_ar' : 'service_name_en']: e.target.value
              })}
              placeholder="e.g. Consultation"
            />
            <button className="flex items-center gap-2 text-primary text-sm font-medium hover:underline">
              <Plus size={16} /> {t('dashboard.avail.add_question')}
            </button>
          </div>

          {/* Weekly Schedule */}
          <div className="sidebar-section">
            <h4><Clock size={18} /> {t('dashboard.avail.templates_title')}</h4>
            <div className="weekly-schedule-list">
              {dayOrder.map((d, i) => {
                const dayTemps = getTemplatesForDay(d);
                const isActive = dayTemps.length > 0;
                return (
                  <div key={d} className="day-row-group">
                    <div className="day-row">
                      <div className="day-info">
                        <label className="switch">
                          <input type="checkbox" checked={isActive} onChange={() => toggleDayAvailability(d)} />
                          <span className="slider"></span>
                        </label>
                        <span className="day-name">{dayNames[i]}</span>
                        <span className={`day-status ${isActive ? 'active' : ''}`}>
                          {isActive ? t('dashboard.avail.available') : t('dashboard.avail.unavailable')}
                        </span>
                      </div>
                      <button onClick={() => addTimeRange(d)} className="add-time-btn">
                        <Plus size={16} />
                      </button>
                    </div>
                    {isActive && (
                      <div className="slots-container">
                        {dayTemps.map(temp => (
                          <div key={temp.id} className="time-range-row">
                            <div className="time-input-wrapper">
                              <Clock className="clock-icon" size={14} />
                              <input 
                                type="time" 
                                value={temp.start_time.slice(0, 5)} 
                                onChange={(e) => updateTemplateTime(temp.id, 'start_time', e.target.value)}
                              />
                            </div>
                            <span className="text-slate-400">-</span>
                            <div className="time-input-wrapper">
                              <Clock className="clock-icon" size={14} />
                              <input 
                                type="time" 
                                value={temp.end_time.slice(0, 5)} 
                                onChange={(e) => updateTemplateTime(temp.id, 'end_time', e.target.value)}
                              />
                            </div>
                            <button onClick={() => removeTemplate(temp.id)} className="delete-slot-btn">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="sidebar-section">
            <h4><Settings size={18} /> {t('dashboard.avail.service_settings')}</h4>
            
            <div className="setting-row">
              <span className="setting-label">{t('dashboard.avail.service_duration')}</span>
              <select 
                className="dash-input w-32"
                value={settings.service_duration}
                onChange={e => setSettings({...settings, service_duration: parseInt(e.target.value)})}
              >
                <option value={30}>30 {isAr ? 'دقيقة' : 'min'}</option>
                <option value={45}>45 {isAr ? 'دقيقة' : 'min'}</option>
                <option value={60}>60 {isAr ? 'دقيقة' : 'min'}</option>
              </select>
            </div>

            <div className="setting-row">
              <span className="setting-label">{t('dashboard.avail.buffer_time')}</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={settings.buffer_time > 0} 
                  onChange={e => setSettings({...settings, buffer_time: e.target.checked ? 15 : 0})}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <span className="setting-label">{t('dashboard.avail.max_daily')}</span>
              <div className="flex items-center gap-2">
                 <input 
                  type="number" 
                  className="setting-input-small"
                  value={settings.max_daily_bookings}
                  onChange={e => setSettings({...settings, max_daily_bookings: parseInt(e.target.value)})}
                />
                <input type="checkbox" checked={true} readOnly />
              </div>
            </div>

            <div className="setting-row">
              <span className="setting-label">{t('dashboard.avail.max_future')}</span>
              <select 
                className="dash-input w-32"
                value={settings.max_future_weeks}
                onChange={e => setSettings({...settings, max_future_weeks: parseInt(e.target.value)})}
              >
                <option value={1}>{isAr ? 'أسبوع' : '1 week'}</option>
                <option value={2}>{isAr ? 'أسبوعين' : '2 weeks'}</option>
                <option value={4}>{isAr ? 'شهر' : '1 month'}</option>
              </select>
            </div>
          </div>

          <div className="save-actions">
            <button className="btn-cancel" onClick={() => fetchData()}>{t('dashboard.avail.cancel_btn')}</button>
            <button className="btn-save-all" onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {t('dashboard.avail.save_btn')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageAvailability;
