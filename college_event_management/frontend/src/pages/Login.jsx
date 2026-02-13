import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setAuth, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Memoize featured events to prevent unnecessary recalculations
  const featuredEvents = useMemo(() => events.slice(0, 6), [events]);

  // Memoize total slides calculation
  const totalSlides = useMemo(() => Math.ceil(featuredEvents.length / 3), [featuredEvents.length]);

  // Optimized fetch with loading state
  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/events/events/');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Optimized carousel timer with cleanup
  useEffect(() => {
    if (totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalSlides]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Backend expects 'email' key, even if it's a username
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email: username,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      if (setAuth) setAuth(true);
      if (setUser) setUser(user);

      if (user.role === 'organizer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = (eventId) => {
    if (!localStorage.getItem('access_token')) {
      setShowLogin(true);
    } else {
      navigate(`/events/${eventId}`);
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section - BookMyShow Inspired */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">🎭 EventHub</h1>
          <p className="hero-subtitle">
            Your gateway to amazing college events. Discover, connect, and create unforgettable
            experiences with your campus community.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>
              🎪 Explore Events
            </button>
            <button className="btn-secondary" onClick={() => setShowLogin(true)}>
              🔐 Login to Register
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-illustration">
            <div className="floating-element elem-1">🎓</div>
            <div className="floating-element elem-2">📚</div>
            <div className="floating-element elem-3">🎨</div>
            <div className="floating-element elem-4">⚽</div>
            <div className="floating-element elem-5">🎵</div>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel - Movie Poster Style */}
      <section className="featured-events section">
        <div className="container">
          <h2 className="section-title">🎬 Featured Events</h2>
          <p className="section-subtitle">Don't miss out on these trending college events</p>

          {featuredEvents.length > 0 ? (
            <div className="carousel">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(featuredEvents.length / 3) }, (_, slideIndex) => (
                  <div key={slideIndex} className="carousel-slide">
                    {featuredEvents.slice(slideIndex * 3, (slideIndex + 1) * 3).map((event) => (
                      <div key={event.id} className="event-card">
                        <div className="event-poster">
                          <div className="poster-overlay">
                            <span className="event-category">
                              {event.status === 'approved' ? '🎭 LIVE' : '⏳ COMING SOON'}
                            </span>
                          </div>
                          <div className="poster-content">
                            <h3 className="event-title">{event.title}</h3>
                            <div className="event-meta">
                              <span className="event-date">
                                📅{' '}
                                {event.event_date
                                  ? new Date(event.event_date).toLocaleDateString()
                                  : 'TBD'}
                              </span>
                              <span className="event-location">
                                📍 {event.venue_details?.venue_name || event.location || 'Campus'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="event-details">
                          <p className="event-description">
                            {event.description?.substring(0, 120)}...
                          </p>
                          <div className="event-actions">
                            <button
                              className="btn-primary"
                              onClick={() => handleRegister(event.id)}
                              disabled={event.status !== 'approved'}
                            >
                              {event.status === 'approved' ? '🎫 Book Now' : '⏳ Coming Soon'}
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              📖 Learn More
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="carousel-indicators">
                {Array.from({ length: Math.ceil(featuredEvents.length / 3) }, (_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="no-events">
              <div className="no-events-icon">🎭</div>
              <h3>No events available right now</h3>
              <p>Check back soon for exciting new events!</p>
              <button className="btn-primary" onClick={() => navigate('/')}>
                Browse All Events
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section - Modern Cards */}
      <section className="stats-section">
        <div className="container">
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-number">{events.length}</div>
              <div className="stat-label">Total Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎭</div>
              <div className="stat-number">50+</div>
              <div className="stat-label">Event Organizers</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-number">1000+</div>
              <div className="stat-label">Registrations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join the Fun?</h2>
            <p>Sign up for events and be part of your college's vibrant community</p>
            <div className="cta-actions">
              <button className="btn-primary" onClick={() => setShowLogin(true)}>
                🚀 Get Started
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                🎪 Browse Events
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal - Modern Design */}
      {showLogin && (
        <div className="login-modal">
          <div className="modal-backdrop" onClick={() => setShowLogin(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>🎭 Welcome Back</h2>
              <p>Sign in to your EventHub account</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username or Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username or email"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? '🔄 Signing In...' : '🚀 Sign In'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowLogin(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
              <div className="auth-footer" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p>
                  Don't have an account?{' '}
                  <span
                    onClick={() => navigate('/register')}
                    className="auth-link"
                    style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Create one
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
