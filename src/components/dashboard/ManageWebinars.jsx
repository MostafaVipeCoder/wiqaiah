import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Users, Save, X } from 'lucide-react';

const ManageWebinars = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);
  const [viewingRegistrations, setViewingRegistrations] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('webinars')
      .select('*')
      .order('start_time', { ascending: false });

    if (!error) setWebinars(data || []);
    setLoading(false);
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
    start_time: '', price: 9, is_published: true, form_fields: [
       { name: 'name', label_en: 'Name', label_ar: 'الاسم', type: 'text', required: true },
       { name: 'email', label_en: 'Email', label_ar: 'البريد الإلكتروني', type: 'email', required: true }
    ]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = editingWebinar ? 'update' : 'insert';
    let query = supabase.from('webinars');

    if (editingWebinar) {
       const { error } = await query.update(formData).eq('id', editingWebinar.id);
       if (!error) { setEditingWebinar(null); setShowAddForm(false); fetchWebinars(); }
    } else {
       const { error } = await query.insert([formData]);
       if (!error) { setShowAddForm(false); fetchWebinars(); }
    }
  };

  const deleteWebinar = async (id) => {
    if (!window.confirm('Delete this webinar?')) return;
    const { error } = await supabase.from('webinars').delete().eq('id', id);
    if (!error) fetchWebinars();
  };

  if (viewingRegistrations) {
    return (
      <div className="dashboard-content-inner animate-fade-in">
        <button onClick={() => setViewingRegistrations(null)} className="back-link mb-4">← Back to Webinars</button>
        <div className="dashboard-card">
          <h3 className="section-title-dash">Registrations ({registrations.length})</h3>
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered At</th>
                  <th>Custom Data</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.name}</td>
                    <td>{reg.email}</td>
                    <td>{new Date(reg.created_at).toLocaleString()}</td>
                    <td><pre style={{ fontSize: '10px' }}>{JSON.stringify(reg.registration_data, null, 2)}</pre></td>
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
    <div className="dashboard-content-inner animate-fade-in">
      <div className="flex-between mb-4">
        <h3 className="section-title-dash"><Users size={18} /> Manage Webinars</h3>
        {!showAddForm && <button onClick={() => setShowAddForm(true)} className="primary-btn add-btn"><Plus size={16} /> Create New</button>}
      </div>

      {showAddForm && (
        <div className="dashboard-card mb-4">
          <h3 className="section-title-dash">{editingWebinar ? 'Edit' : 'Create'} Webinar</h3>
          <form onSubmit={handleSubmit} className="webinar-form">
            <div className="form-grid">
               <div className="input-group">
                 <label>Title (English)</label>
                 <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
               </div>
               <div className="input-group">
                 <label>Title (Arabic)</label>
                 <input type="text" required value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} dir="rtl" />
               </div>
               <div className="input-group full-width">
                 <label>Description (English)</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>
               <div className="input-group full-width">
                 <label>Description (Arabic)</label>
                 <textarea value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} dir="rtl" />
               </div>
               <div className="input-group">
                 <label>Start Date & Time</label>
                 <input type="datetime-local" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
               </div>
               <div className="input-group">
                 <label>Price ($)</label>
                 <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
               </div>
               <div className="input-group checkbox">
                 <label><input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} /> Published</label>
               </div>
            </div>
            <div className="flex-end gap-2 mt-4">
              <button type="button" onClick={() => { setShowAddForm(false); setEditingWebinar(null); }} className="secondary-btn">Cancel</button>
              <button type="submit" className="primary-btn"><Save size={16} /> Save Webinar</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        {loading ? <p>Loading...</p> : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {webinars.map(w => (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.title}</strong>
                      <br /><small>{w.title_ar}</small>
                    </td>
                    <td>{new Date(w.start_time).toLocaleString()}</td>
                    <td>${w.price}</td>
                    <td><span className={`status-pill ${w.is_published ? 'published' : 'draft'}`}>{w.is_published ? 'Published' : 'Draft'}</span></td>
                    <td>
                      <div className="action-btns">
                        <button onClick={() => fetchRegistrations(w.id)} className="confirm-btn" title="View Registrations"><Users size={16} /></button>
                        <button onClick={() => { setEditingWebinar(w); setFormData(w); setShowAddForm(true); }} className="edit-btn" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => deleteWebinar(w.id)} className="delete-btn" title="Delete"><Trash2 size={16} /></button>
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
