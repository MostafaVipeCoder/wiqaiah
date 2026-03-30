import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus, Calendar as CalIcon, Clock } from 'lucide-react';

const ManageAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({ date: '', start_time: '', end_time: '' });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (!error) setSlots(data || []);
    setLoading(false);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) return;

    const { error } = await supabase
      .from('availability')
      .insert([newSlot]);

    if (!error) {
      setNewSlot({ date: '', start_time: '', end_time: '' });
      fetchSlots();
    }
  };

  const handleDeleteSlot = async (id) => {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id);

    if (!error) fetchSlots();
  };

  return (
    <div className="dashboard-content-inner animate-fade-in">
      <div className="dashboard-card mb-4">
        <h3 className="section-title-dash"><Plus size={18} /> Add New Slot</h3>
        <form onSubmit={handleAddSlot} className="add-slot-form">
          <div className="form-grid">
            <div className="input-group">
              <label><CalIcon size={14} /> Date</label>
              <input 
                type="date" required 
                value={newSlot.date}
                onChange={e => setNewSlot({...newSlot, date: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label><Clock size={14} /> Start Time</label>
              <input 
                type="time" required 
                value={newSlot.start_time}
                onChange={e => setNewSlot({...newSlot, start_time: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label><Clock size={14} /> End Time</label>
              <input 
                type="time" required 
                value={newSlot.end_time}
                onChange={e => setNewSlot({...newSlot, end_time: e.target.value})}
              />
            </div>
            <div className="input-group" style={{ justifyContent: 'flex-end' }}>
               <button type="submit" className="primary-btn add-btn">Add Slot</button>
            </div>
          </div>
        </form>
      </div>

      <div className="dashboard-card">
        <h3 className="section-title-dash"><CalIcon size={18} /> Current Availability</h3>
        {loading ? (
          <p>Loading slots...</p>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td>{new Date(slot.date).toLocaleDateString()}</td>
                    <td>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</td>
                    <td>
                      <span className={`status-pill ${slot.is_booked ? 'booked' : 'available'}`}>
                        {slot.is_booked ? 'Booked' : 'Available'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteSlot(slot.id)} 
                        className="delete-btn"
                        title="Delete slot"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {slots.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4">No availability slots set.</td>
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
