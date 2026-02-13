import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({});
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [userFilters, setUserFilters] = useState({ role: '', department: '' });
  const [eventFilters, setEventFilters] = useState({ status: '', organizer: '' });

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchEvents();
    fetchReports();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8001/api/admin/dashboard/', {
        headers: { Authorization: `Token ${token}` },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8001/api/admin/users/', {
        headers: { Authorization: `Token ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8001/api/admin/events/', {
        headers: { Authorization: `Token ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8001/api/reports/', {
        headers: { Authorization: `Token ${token}` },
      });
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8001/api/admin/users/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8001/api/admin/events/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setEvents(events.filter((event) => event.id !== id));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleApproveEvent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8001/api/admin/events/${id}/`,
        { status: 'approved' },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setEvents(
        events.map((event) => (event.id === id ? { ...event, status: 'approved' } : event))
      );
    } catch (error) {
      console.error('Error approving event:', error);
    }
  };

  const handleRejectEvent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8001/api/admin/events/${id}/`,
        { status: 'rejected' },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setEvents(
        events.map((event) => (event.id === id ? { ...event, status: 'rejected' } : event))
      );
    } catch (error) {
      console.error('Error rejecting event:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const renderOverview = () => (
    <div className="overview-section">
      {/* Welcome Header */}
      <section className="welcome-section">
        <div className="welcome-content">
          <h2>Admin Dashboard</h2>
          <p>Manage your college event management system efficiently</p>
        </div>
        <div className="welcome-image">
          <span>⚙️</span>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{dashboardData.big_numbers?.total_users || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{dashboardData.big_numbers?.total_events || 0}</h3>
              <p>Total Events</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{dashboardData.big_numbers?.total_registrations || 0}</h3>
              <p>Registrations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{dashboardData.big_numbers?.total_attendance || 0}</h3>
              <p>Attendance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity & Alerts */}
      <div className="activity-alerts-grid">
        <section className="recent-activity-card">
          <h3>Recent Activity</h3>
          <div className="activity-item">
            <span className="activity-icon">📝</span>
            <div>
              <p>Registrations (7 days)</p>
              <span className="activity-number">
                {dashboardData.recent_activity?.registrations_last_7_days || 0}
              </span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">👀</span>
            <div>
              <p>Attendance (7 days)</p>
              <span className="activity-number">
                {dashboardData.recent_activity?.attendance_last_7_days || 0}
              </span>
            </div>
          </div>
        </section>

        <section className="alerts-card">
          <h3>System Alerts</h3>
          {dashboardData.alerts?.length > 0 ? (
            <ul className="alerts-list">
              {dashboardData.alerts.map((alert, index) => (
                <li key={index} className="alert-item">
                  <span className="alert-icon">⚠️</span>
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-alerts">No alerts at this time</p>
          )}
        </section>
      </div>

      {/* User Breakdown & Recent Events */}
      <div className="breakdown-events-grid">
        <section className="user-breakdown-card">
          <h3>User Breakdown</h3>
          <div className="breakdown-item">
            <span className="breakdown-label">Participants</span>
            <span className="breakdown-number">
              {dashboardData.user_breakdown?.participants || 0}
            </span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Organizers</span>
            <span className="breakdown-number">
              {dashboardData.user_breakdown?.organizers || 0}
            </span>
          </div>
        </section>

        <section className="recent-events-card">
          <h3>Recent Events</h3>
          {dashboardData.recent_events?.length > 0 ? (
            <ul className="events-list">
              {dashboardData.recent_events.slice(0, 5).map((event) => (
                <li key={event.id} className="event-item">
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    <span className={`event-status status-${event.status}`}>{event.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-events">No recent events</p>
          )}
        </section>
      </div>
    </div>
  );

  const filteredUsers = users.filter(
    (user) =>
      (userFilters.role === '' || user.role === userFilters.role) &&
      (userFilters.department === '' || user.department === userFilters.department)
  );

  const renderUsers = () => (
    <div className="users-content">
      <h2>Manage Users</h2>
      <div className="filters">
        <select
          value={userFilters.role}
          onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="participant">Participant</option>
          <option value="organizer">Organizer</option>
        </select>
        <input
          type="text"
          placeholder="Filter by Department"
          value={userFilters.department}
          onChange={(e) => setUserFilters({ ...userFilters, department: e.target.value })}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Date Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.department}</td>
              <td>{user.date_joined}</td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const filteredEvents = events.filter(
    (event) =>
      (eventFilters.status === '' || event.status === eventFilters.status) &&
      (eventFilters.organizer === '' ||
        event.organizer__username.toLowerCase().includes(eventFilters.organizer.toLowerCase()))
  );

  const renderEvents = () => (
    <div className="events-content">
      <h2>Manage Events</h2>
      <div className="filters">
        <select
          value={eventFilters.status}
          onChange={(e) => setEventFilters({ ...eventFilters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Filter by Organizer"
          value={eventFilters.organizer}
          onChange={(e) => setEventFilters({ ...eventFilters, organizer: e.target.value })}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Date</th>
            <th>Status</th>
            <th>Organizer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event) => (
            <tr key={event.id}>
              <td>{event.id}</td>
              <td>{event.title}</td>
              <td>{event.description}</td>
              <td>{event.date}</td>
              <td>{event.status}</td>
              <td>{event.organizer__username}</td>
              <td>
                {event.status === 'pending' && (
                  <>
                    <button onClick={() => handleApproveEvent(event.id)}>Approve</button>
                    <button onClick={() => handleRejectEvent(event.id)}>Reject</button>
                  </>
                )}
                <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReports = () => (
    <div className="reports-content">
      <h2>Reports</h2>
      <p>{reports.message || 'Reports will be displayed here.'}</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'events':
        return renderEvents();
      case 'reports':
        return renderReports();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1>College Event Management</h1>
          <div className="header-actions">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              Overview
            </li>
            <li
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <span className="nav-icon">👥</span>
              Users
            </li>
            <li
              className={activeTab === 'events' ? 'active' : ''}
              onClick={() => setActiveTab('events')}
            >
              <span className="nav-icon">📅</span>
              Events
            </li>
            <li
              className={activeTab === 'reports' ? 'active' : ''}
              onClick={() => setActiveTab('reports')}
            >
              <span className="nav-icon">📋</span>
              Reports
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="main-content">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;
