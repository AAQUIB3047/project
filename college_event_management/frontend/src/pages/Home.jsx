import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Error parsing user data - will continue without admin features
      }
    }
  }, []);

  const categories = [
    { id: 'all', name: 'All Events', icon: '🎯' },
    { id: 'concert', name: 'Concerts', icon: '🎵' },
    { id: 'conference', name: 'Conferences', icon: '💼' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'workshop', name: 'Workshops', icon: '🛠️' },
    { id: 'festival', name: 'Festivals', icon: '🎉' },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/events/events/');
      const eventsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      // Debug: Events fetched successfully
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch {
      // Error fetching events - will show empty state
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = useCallback(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.event_type === selectedCategory);
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  return (
    <div className="home">
      {/* Admin Access Banner */}
      {(user?.role === 'admin' || user?.role === 'organizer') && (
        <div className="admin-access-banner">
          <div className="container">
            <div className="admin-access-content">
              <span className="admin-badge">🔑 Admin Access</span>
              <p>Manage events, users, and system settings</p>
              <Link to="/admin" className="btn btn-admin">
                ⚙️ Admin Panel
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover Amazing
            <br />
            <span className="gradient-text">Events Happening Now</span>
          </h1>
          <p className="hero-subtitle">
            Find and book tickets to the most exciting events in your college
          </p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="btn btn-primary">Search</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">🎫</div>
          <div className="floating-card card-2">🎵</div>
          <div className="floating-card card-3">🎬</div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="categories">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-section">
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <p className="section-subtitle">{filteredEvents.length} events available</p>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="event-card skeleton"></div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="events-grid grid-3">
              {filteredEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="event-card">
                  <div className="event-image">
                    <img
                      src={
                        event.poster_image_url ||
                        event.poster_image ||
                        'https://via.placeholder.com/300x200?text=Event'
                      }
                      alt={event.title}
                    />
                    <div className="event-badge">
                      {event.category_details?.category_name || 'Event'}
                    </div>
                  </div>
                  <div className="event-body">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">{event.description?.substring(0, 60)}...</p>
                    <div className="event-meta">
                      <span className="meta-item">
                        📅{' '}
                        {event.event_date
                          ? new Date(event.event_date).toLocaleDateString()
                          : 'Date TBD'}
                      </span>
                      <span className="meta-item">
                        📍 {event.venue_details?.venue_name || 'TBD'}
                      </span>
                    </div>
                    <div className="event-footer">
                      <span className="event-price">
                        {event.registration_fee && parseFloat(event.registration_fee) > 0
                          ? `₹${parseFloat(event.registration_fee).toFixed(2)}`
                          : 'Free'}
                      </span>
                      <span className="event-status">
                        {event.max_capacity >
                        (event.registration_count || event.current_registrations || 0) ? (
                          <span className="badge-available">Available</span>
                        ) : (
                          <span className="badge-sold">Sold Out</span>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h3>No events found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
