import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Memoized API base URL
  const API_BASE = useMemo(() => 'http://localhost:8001/api', []);

  // Optimized data fetching with error handling
  const fetchData = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) setRefreshing(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Parallel API calls for better performance
        const [userResponse, eventsResponse, registrationsResponse] = await Promise.allSettled([
          axios.get(`${API_BASE}/users/profile/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`${API_BASE}/events/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`${API_BASE}/registrations/registrations/`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        // Handle user profile
        if (userResponse.status === 'fulfilled') {
          setUser(userResponse.value.data);
        } else {
          console.error('Error fetching user profile:', userResponse.reason);
          setError('Failed to load user profile');
        }

        // Handle events
        if (eventsResponse.status === 'fulfilled') {
          setEvents(Array.isArray(eventsResponse.value.data) ? eventsResponse.value.data : []);
        } else {
          console.error('Error fetching events:', eventsResponse.reason);
          setEvents([]);
        }

        // Handle registrations
        if (registrationsResponse.status === 'fulfilled') {
          setRegistrations(
            Array.isArray(registrationsResponse.value.data) ? registrationsResponse.value.data : []
          );
        } else {
          console.error('Error fetching registrations:', registrationsResponse.reason);
          setRegistrations([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate, API_BASE]
  );

  // Refresh data function
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const upcomingEvents = events.filter((event) => new Date(event.date) > new Date());
  const recentEvents = events.slice(0, 6);
  const userRegistrations = registrations.length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Error Banner */}
      {error && (
        <div className="error-banner" role="alert" aria-live="polite">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="error-close"
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="dashboard-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-brand">
          <h1>EventHub</h1>
        </div>
        <div className="nav-tabs" role="tablist">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="overview-panel"
          >
            Overview
          </button>
          <button
            className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
            role="tab"
            aria-selected={activeTab === 'events'}
            aria-controls="events-panel"
          >
            My Events
          </button>
          <button
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            role="tab"
            aria-selected={activeTab === 'profile'}
            aria-controls="profile-panel"
          >
            Profile
          </button>
        </div>
        <div className="nav-user">
          <span className="welcome-text">Welcome, {user?.name || 'User'}</span>
          <button
            onClick={handleRefresh}
            className="refresh-btn"
            disabled={refreshing}
            aria-label="Refresh dashboard data"
          >
            {refreshing ? '⟳' : '🔄'}
          </button>
          <button onClick={handleLogout} className="logout-btn" aria-label="Logout from dashboard">
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <>
            {/* Hero Welcome Section */}
            <section className="welcome-section">
              <div className="welcome-content">
                <h2>Your Event Dashboard</h2>
                <p>Discover, register, and manage your college events all in one place.</p>
                <div className="quick-actions">
                  <button className="btn-primary" onClick={() => navigate('/events')}>
                    Browse Events
                  </button>
                  <button className="btn-secondary" onClick={() => setActiveTab('events')}>
                    My Registrations
                  </button>
                </div>
              </div>
              <div className="welcome-image">
                <span>🎓</span>
              </div>
            </section>

            {/* Stats Cards */}
            <section className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3>{events.length}</h3>
                    <p>Total Events</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <h3>{userRegistrations}</h3>
                    <p>My Registrations</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏰</div>
                  <div className="stat-content">
                    <h3>{upcomingEvents.length}</h3>
                    <p>Upcoming Events</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-content">
                    <h3>{user?.role === 'organizer' ? 'Organizer' : 'Participant'}</h3>
                    <p>Your Role</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Events Carousel */}
            <section className="recent-events-section">
              <h2>Recent Events</h2>
              <div className="events-carousel">
                {recentEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-image">
                      <span>📅</span>
                    </div>
                    <div className="event-content">
                      <h3>{event.title}</h3>
                      <p>{event.description.substring(0, 80)}...</p>
                      <div className="event-meta">
                        <span className="event-date">
                          📅{' '}
                          {event.event_date
                            ? new Date(event.event_date).toLocaleDateString()
                            : 'Date TBD'}
                        </span>
                        <span className="event-status">{event.status}</span>
                      </div>
                      <button className="btn-primary" onClick={() => navigate('/events')}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'events' && (
          <section className="my-events-section">
            <h2>My Events</h2>
            {userRegistrations > 0 ? (
              <div className="events-grid">
                {registrations.map((reg) => {
                  const event = events.find((e) => e.id === reg.event);
                  return event ? (
                    <div key={reg.id} className="event-card registered">
                      <div className="event-image">
                        <span>✅</span>
                      </div>
                      <div className="event-content">
                        <h3>{event.title}</h3>
                        <p>{event.description.substring(0, 100)}...</p>
                        <div className="event-meta">
                          <span className="event-date">
                            📅{' '}
                            {event.event_date
                              ? new Date(event.event_date).toLocaleDateString()
                              : 'Date TBD'}
                          </span>
                          <span className="registration-status">Registered</span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <div className="no-events">
                <span>📭</span>
                <h3>No registrations yet</h3>
                <p>Start exploring events and register for the ones that interest you!</p>
                <button className="btn-primary" onClick={() => navigate('/events')}>
                  Browse Events
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="profile-section">
            <h2>My Profile</h2>
            <div className="profile-card">
              <div className="profile-avatar">
                <span>👤</span>
              </div>
              <div className="profile-info">
                <h3>{user?.name || 'User'}</h3>
                <p>
                  <strong>Username:</strong> {user?.username}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Role:</strong> {user?.role}
                </p>
                <p>
                  <strong>Department:</strong> {user?.department || 'Not specified'}
                </p>
                <p>
                  <strong>Joined:</strong>{' '}
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
