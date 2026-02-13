import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/eventcard.css';

// Note: Using window.alert to explicitly reference browser API and satisfy ESLint

/**
 * EventCard Component
 * Displays a single event in card format with registration functionality
 *
 * @param {Object} event - Event data
 * @param {string} event.id - Event ID
 * @param {string} event.title - Event title
 * @param {string} event.description - Event description
 * @param {string} event.date - Event date
 * @param {string} event.location - Event location
 * @param {number} event.capacity - Event capacity
 * @param {number} event.registered - Number registered
 * @param {string} event.image - Event image URL
 */
const EventCard = ({ event }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);

  const registrationPercentage = (event.registered / event.capacity) * 100;
  const isFull = event.registered >= event.capacity;
  const token = localStorage.getItem('access_token');

  const checkRegistrationStatus = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `http://localhost:8001/api/registrations/check_registration/?event_id=${event.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsRegistered(response.data.is_registered);
      setRegistrationStatus(response.data.registration?.status);
    } catch {
      // User might not be logged in or other error - silently fail for UX
      // Could add toast notification here in the future
    }
  }, [token, event.id]);

  useEffect(() => {
    checkRegistrationStatus();
  }, [checkRegistrationStatus]);

  const handleRegister = async () => {
    if (!token) {
      window.alert('Please log in to register for events');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8001/api/registrations/register_event/',
        { event_id: event.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsRegistered(true);
      setRegistrationStatus(response.data.registration.status);
      window.alert('Successfully registered for the event!');

      // Update the registered count in the event
      event.registered += 1;
    } catch (error) {
      window.alert(error.response?.data?.error || 'Failed to register for event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      await axios.post(
        'http://localhost:8001/api/registrations/unregister_event/',
        { event_id: event.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsRegistered(false);
      setRegistrationStatus(null);
      window.alert('Successfully unregistered from the event');

      // Update the registered count in the event
      event.registered -= 1;
    } catch (error) {
      window.alert(error.response?.data?.error || 'Failed to unregister from event');
    } finally {
      setIsLoading(false);
    }
  };

  const getRegistrationButtonText = () => {
    if (isLoading) return 'Loading...';
    if (isRegistered) {
      if (registrationStatus === 'cancelled') return 'Register';
      return 'Unregister';
    }
    if (isFull) return 'Event Full';
    return 'Register';
  };

  const getRegistrationButtonClass = () => {
    let baseClass = 'btn-register';
    if (isLoading) return `${baseClass} loading`;
    if (isRegistered && registrationStatus !== 'cancelled') return `${baseClass} registered`;
    if (isFull) return `${baseClass} disabled`;
    return baseClass;
  };

  return (
    <div className="event-card">
      <div className="event-card-image">
        {event.image && <img src={event.image} alt={event.title} />}
        <div className={`event-badge ${event.status}`}>
          {event.status === 'upcoming'
            ? '📅 Upcoming'
            : event.status === 'ongoing'
              ? '🔴 Ongoing'
              : '✅ Completed'}
        </div>
      </div>

      <div className="event-card-content">
        <h3 className="event-title">{event.title}</h3>

        <div className="event-meta">
          <span className="meta-item">📅 {new Date(event.date).toLocaleDateString()}</span>
          <span className="meta-item">📍 {event.location}</span>
        </div>

        <p className="event-description">{event.description.substring(0, 100)}...</p>

        <div className="event-capacity">
          <div className="capacity-info">
            <span>
              {event.registered}/{event.capacity} Registered
            </span>
          </div>
          <div className="capacity-bar">
            <div
              className="capacity-fill"
              style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="event-card-footer">
          <Link to={`/events/${event.id}`} className="btn-view-details">
            View Details →
          </Link>
          <button
            className={getRegistrationButtonClass()}
            disabled={isFull || isLoading}
            onClick={isRegistered ? handleUnregister : handleRegister}
          >
            {getRegistrationButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    capacity: PropTypes.number.isRequired,
    registered: PropTypes.number.isRequired,
    image: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default EventCard;
