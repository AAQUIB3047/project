import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8001/api/events/events/', {
          headers: { Authorization: `Token ${token}` },
        });
        setEvents(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents([]);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Memoized filtered and sorted events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, statusFilter, sortBy]);

  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8001/api/registrations/`,
        { event: eventId },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      alert('Registered successfully!');
    } catch (err) {
      alert('Registration failed. You may already be registered or the event is full.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <div className="event-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      {/* Header Section */}
      <section className="events-header">
        <div className="container">
          <h1>Discover Events</h1>
          <p>Find and register for amazing college events</p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="filters-section">
        <div className="container">
          <div className="filters-grid">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-controls">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-section">
        <div className="container">
          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-image">
                    <span>📅</span>
                  </div>
                  <div className="event-content">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span
                        className="event-status"
                        style={{ backgroundColor: getStatusColor(event.status) }}
                      >
                        {event.status}
                      </span>
                    </div>
                    <p className="event-description">
                      {event.description.length > 120
                        ? `${event.description.substring(0, 120)}...`
                        : event.description}
                    </p>
                    <div className="event-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>
                          {event.event_date
                            ? new Date(event.event_date).toLocaleDateString()
                            : 'Date TBD'}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⏰</span>
                        <span>{event.start_time || 'Time TBD'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span>{event.venue_details?.venue_name || event.location || 'TBD'}</span>
                      </div>
                    </div>
                    <button
                      className="btn-primary register-btn"
                      onClick={() => handleRegister(event.id)}
                      disabled={event.status !== 'approved'}
                    >
                      {event.status === 'approved' ? 'Register Now' : 'Registration Closed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              <span>🎭</span>
              <h3>No events found</h3>
              <p>Try adjusting your search or filters to find more events.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventList;
