import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Trash2, Mail, Users } from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const updateBookingStatus = async (id, status) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (!error) fetchBookings();
  };

  const deleteBooking = async (id, availability_id) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (!error) {
      // Freed up the slot
      await supabase.from('availability').update({ is_booked: false }).eq('id', availability_id);
      fetchBookings();
    }
  };

  return (
    <div className="dashboard-content-inner animate-fade-in">
       <div className="dashboard-card">
        <h3 className="section-title-dash"><Users size={18} /> Consultation Bookings</h3>
        {loading ? (
          <p>Loading bookings...</p>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                      {new Date(booking.availability?.date).toLocaleDateString()} <br />
                      <small>{booking.availability?.start_time?.slice(0, 5)} - {booking.availability?.end_time?.slice(0, 5)}</small>
                    </td>
                    <td><p className="reason-cell" title={booking.reason}>{booking.reason || '-'}</p></td>
                    <td>
                      <span className={`status-pill ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {booking.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'accepted')} 
                              className="confirm-btn" title="Confirm"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'rejected')} 
                              className="reject-btn" title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => deleteBooking(booking.id, booking.availability_id)} 
                          className="delete-btn" title="Delete & Free Slot"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4">No bookings found.</td>
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

export default ManageBookings;
