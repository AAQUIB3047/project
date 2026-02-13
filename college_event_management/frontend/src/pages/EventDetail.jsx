import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:8001/api/events/events/${id}/`);
      setEvent(response.data);
    } catch (err) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const validateBooking = () => {
    const errors = {};

    // Check if event has required details
    if (!event.event_date) {
      errors.date = 'Event date is not available';
    }

    if (!event.start_time) {
      errors.time = 'Event time is not available';
    }

    if (!event.venue_details?.venue_name && !event.venue_details?.location) {
      errors.venue = 'Event venue is not available';
    }

    // Check seat availability
    if (availableSeats <= 0) {
      errors.seats = 'No seats available';
    }

    // Check quantity
    if (quantity < 1) {
      errors.quantity = 'Please select at least 1 ticket';
    }

    if (quantity > availableSeats) {
      errors.quantity = `Only ${availableSeats} seats available`;
    }

    // Check if user is authenticated (this will be handled in handleBooking)

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async () => {
    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate form first
    if (!validateBooking()) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setBooking(true);
    try {
      const response = await axios.post(
        `http://localhost:8001/api/registrations/`,
        { event: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('🎉 Booking successful! Redirecting to your bookings...');

      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      let errorMessage = 'Booking failed';

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid booking request. Please check your details.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login to book tickets.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to book this event.';
      } else if (err.response?.status === 409) {
        errorMessage = 'You have already booked this event.';
      }

      setError(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );

  if (!event) {
    return (
      <div className="container" style={{ paddingTop: '100px' }}>
        <div className="empty-state">
          <h2>Event not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const availableSeats = Math.max(
    0,
    (event.max_capacity || 0) - (event.registration_count || event.current_registrations || 0)
  );

  return (
    <div className="event-detail">
      <div className="event-hero">
        <img
          src={
            event.poster_image_url ||
            event.image_url ||
            'https://via.placeholder.com/1200x400?text=Event'
          }
          alt={event.title}
          className="hero-image"
        />
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>

      <div className="container event-content">
        <div className="event-main">
          <div className="event-info">
            <h1>{event.title}</h1>
            <div className="event-details-grid">
              <div className="detail-item">
                <span className="detail-icon" role="img" aria-label="Calendar">
                  📅
                </span>
                <div>
                  <p className="detail-label">Date</p>
                  <p className="detail-value">
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Date to be announced'}
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon" role="img" aria-label="Clock">
                  ⏰
                </span>
                <div>
                  <p className="detail-label">Time</p>
                  <p className="detail-value">
                    {event.start_time
                      ? new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : 'Time to be announced'}
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon" role="img" aria-label="Location">
                  📍
                </span>
                <div>
                  <p className="detail-label">Venue</p>
                  <p className="detail-value">
                    {event.venue_details?.venue_name ||
                      (event.venue_details?.location
                        ? event.venue_details.location
                        : 'Venue to be announced')}
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon" role="img" aria-label="People">
                  👥
                </span>
                <div>
                  <p className="detail-label">Seats Available</p>
                  <p className="detail-value">
                    {Math.max(
                      0,
                      (event.max_capacity || 0) -
                        (event.registration_count || event.current_registrations || 0)
                    )}{' '}
                    / {event.max_capacity || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h2>About This Event</h2>
              <p>{event.description}</p>
            </div>
          </div>

          <div className="event-booking">
            <div className="booking-card card">
              <div className="price-section">
                <span className="price-label">Price per ticket</span>
                <span className="price-value">
                  {event.registration_fee > 0 ? `₹${event.registration_fee}` : 'Free Entry'}
                </span>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {Object.keys(formErrors).length > 0 && (
                <div className="alert alert-warning">
                  <strong>Please fix the following issues:</strong>
                  <ul>
                    {Object.values(formErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="quantity-section">
                <label>Number of Tickets</label>
                <div className="quantity-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={booking}
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(availableSeats, quantity + 1))}
                    disabled={booking}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="total-section">
                <span className="total-label">Total</span>
                <span className="total-value">
                  {event.registration_fee > 0
                    ? `₹${(event.registration_fee * quantity).toFixed(2)}`
                    : 'Free'}
                </span>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={handleBooking}
                disabled={booking || availableSeats === 0}
                style={{ width: '100%' }}
              >
                {booking ? 'Booking...' : availableSeats === 0 ? 'Sold Out' : 'Book Tickets'}
              </button>

              {availableSeats === 0 && (
                <p className="sold-out-message">Sorry, all tickets are sold out!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
