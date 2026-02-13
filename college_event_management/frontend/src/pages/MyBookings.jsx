import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MyBookings.css';

// alert is a browser API, no import needed

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No token found, user not authenticated');
        setBookings([]);
        return;
      }

      const response = await axios.get(
        'http://localhost:8001/api/registrations/my_registrations/',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Debug logging to check response structure
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));

      // Ensure we always set an array
      if (Array.isArray(response.data)) {
        setBookings(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, check if it has a results property (pagination)
        if (Array.isArray(response.data.results)) {
          setBookings(response.data.results);
        } else {
          console.warn('API returned non-array data:', response.data);
          setBookings([]);
        }
      } else {
        console.warn('Unexpected response format:', response.data);
        setBookings([]);
      }
    } catch (error) {
      // Error fetching bookings - will show empty state
      console.error('Error fetching bookings:', error);
      console.error('Error response:', error.response);
      setBookings([]); // Ensure we always have an array
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { text: '✓ Confirmed', class: 'confirmed' },
      pending: { text: '⏳ Pending', class: 'pending' },
      cancelled: { text: '✕ Cancelled', class: 'cancelled' },
      no_show: { text: '✗ No Show', class: 'no-show' },
    };

    return statusConfig[status] || { text: status, class: 'default' };
  };

  const handleCancelRegistration = async (registrationId, eventId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        'http://localhost:8001/api/registrations/unregister_event/',
        { event_id: eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh bookings
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel registration');
    }
  };

  return (
    <div className="my-bookings">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings 🎫</h1>
          <p>View and manage all your event tickets</p>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="booking-card skeleton"></div>
            ))}
          </div>
        ) : Array.isArray(bookings) && bookings.length > 0 ? (
          <div className="bookings-grid">
            {bookings.map((booking) => {
              const statusInfo = getStatusBadge(booking.status);
              return (
                <div key={booking.id} className="booking-card card">
                  <div className="booking-header">
                    <h3>{booking.event_title || booking.event?.title || 'Event'}</h3>
                    <span className={`booking-status ${statusInfo.class}`}>{statusInfo.text}</span>
                  </div>
                  <div className="booking-details">
                    <div className="detail">
                      <span className="detail-label">📅 Date</span>
                      <span className="detail-value">
                        {new Date(
                          booking.event?.event_date || booking.event?.date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">📍 Location</span>
                      <span className="detail-value">
                        {booking.event?.venue_details?.location || 'TBD'}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">🎟️ Registration</span>
                      <span className="detail-value">
                        {new Date(booking.registration_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">💰 Fee</span>
                      <span className="detail-value">₹{booking.event?.registration_fee || 0}</span>
                    </div>
                  </div>
                  <div className="booking-actions">
                    <Link
                      to={`/events/${booking.event?.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, marginRight: '8px' }}
                    >
                      View Details
                    </Link>
                    {booking.status === 'confirmed' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelRegistration(booking.id, booking.event?.id)}
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🎫</span>
            <h2>No bookings yet</h2>
            <p>Start exploring events and book your first ticket!</p>
            <Link to="/events" className="btn btn-primary">
              Explore Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
