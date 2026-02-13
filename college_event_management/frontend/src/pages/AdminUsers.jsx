import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const token = localStorage.getItem('access_token');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch {
      // Error fetching users - will show empty state
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-users">
      <div className="container">
        <div className="users-header">
          <div className="header-content">
            <h1>👥 User Management</h1>
            <p>View and manage user accounts</p>
          </div>
          <div className="user-stats">
            <div className="stat">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{users.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Admins</span>
              <span className="stat-value">{users.filter((u) => u.role === 'admin').length}</span>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="organizer">Organizers</option>
            <option value="participant">Participants</option>
          </select>

          <span className="result-count">{filteredUsers.length} users</span>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="user-card skeleton"></div>
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <div key={user.id} className="user-card card">
                <div className="user-avatar">
                  {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>

                <div className="user-info">
                  <h3 className="user-name">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Anonymous'}
                  </h3>
                  <p className="user-email">{user.email}</p>

                  <div className="user-meta">
                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </div>
                </div>

                <div className="user-actions">
                  <button className="btn btn-sm btn-secondary">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No users found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
