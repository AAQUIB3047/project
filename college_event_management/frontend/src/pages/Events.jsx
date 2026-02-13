import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import './Events.css';

/**
 * Events Page - Example
 * Displays list of all events with filters
 * Shows upcoming, ongoing, and completed events
 */
const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/events/events/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Handle both array and paginated responses
          const events = Array.isArray(data) ? data : data.results || [];

          // Transform event data to match expected format
          const transformedEvents = events.map((event) => ({
            ...event,
            date: event.event_date,
            location: event.venue_details?.location || event.venue || 'TBD',
            capacity: event.max_capacity,
            registered: event.registration_count || 0,
            image: event.poster_image_url || event.image || null,
            status: event.status || 'upcoming',
          }));

          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // Failed to fetch events, use sample data
        setEvents(SAMPLE_EVENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((event) => event.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filter, searchTerm]);

  if (loading) {
    return (
      <div className="events-page">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>College Events</h1>
        <p>Discover and register for upcoming college events</p>
      </div>

      <div className="events-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            📅 Upcoming
          </button>
          <button
            className={`filter-btn ${filter === 'ongoing' ? 'active' : ''}`}
            onClick={() => setFilter('ongoing')}
          >
            🔴 Ongoing
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            ✅ Completed
          </button>
        </div>
      </div>

      <div className="events-stats">
        <div className="stat-card">
          <span className="stat-number">{events.length}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {events.filter((e) => e.status === 'upcoming').length}
          </span>
          <span className="stat-label">Upcoming</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{events.filter((e) => e.status === 'ongoing').length}</span>
          <span className="stat-label">Ongoing</span>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="no-events">
          <p>No events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

// Sample events data for demo
const SAMPLE_EVENTS = [
  {
    id: 1,
    title: 'Annual Tech Fest 2025',
    description:
      'Join us for the biggest technology festival with workshops, competitions, and networking opportunities.',
    date: '2025-01-15',
    location: 'Main Campus Auditorium',
    capacity: 500,
    registered: 345,
    status: 'upcoming',
    image: 'https://via.placeholder.com/400x300?text=Tech+Fest',
  },
  {
    id: 2,
    title: 'Cultural Night',
    description:
      'Experience the vibrant culture with performances from different states and communities.',
    date: '2025-01-20',
    location: 'Open Air Theatre',
    capacity: 800,
    registered: 620,
    status: 'upcoming',
    image: 'https://via.placeholder.com/400x300?text=Cultural+Night',
  },
  {
    id: 3,
    title: 'Sports Championship',
    description:
      'Inter-college sports competition featuring cricket, football, badminton and more.',
    date: '2025-01-10',
    location: 'Sports Complex',
    capacity: 1000,
    registered: 850,
    status: 'ongoing',
    image: 'https://via.placeholder.com/400x300?text=Sports',
  },
];

export default Events;
