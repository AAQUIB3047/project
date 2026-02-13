/**
 * Services - Example
 * API service functions organized by feature
 */

/* global URLSearchParams */

import { api } from '../utils/helpers';

/**
 * Events Service
 */
export const eventsService = {
  /**
   * Get all events
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    return api.get(`/api/events/events/?${params}`);
  },

  /**
   * Get single event
   */
  async getById(id) {
    return api.get(`/api/events/events/${id}/`);
  },

  /**
   * Create new event (admin only)
   */
  async create(data) {
    return api.post('/api/events/events/', data);
  },

  /**
   * Update event (admin only)
   */
  async update(id, data) {
    return api.put(`/api/events/events/${id}/`, data);
  },

  /**
   * Delete event (admin only)
   */
  async delete(id) {
    return api.delete(`/api/events/events/${id}/`);
  },
};

/**
 * Users Service
 */
export const usersService = {
  /**
   * Get user profile
   */
  async getProfile() {
    return api.get('/api/users/profile/');
  },

  /**
   * Update user profile
   */
  async updateProfile(data) {
    return api.put('/api/users/profile/', data);
  },

  /**
   * Get all users (admin only)
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    return api.get(`/api/users/?${params}`);
  },

  /**
   * Get user by ID (admin only)
   */
  async getById(id) {
    return api.get(`/api/users/${id}/`);
  },

  /**
   * Create new user (admin only)
   */
  async create(data) {
    return api.post('/api/users/', data);
  },

  /**
   * Update user (admin only)
   */
  async update(id, data) {
    return api.put(`/api/users/${id}/`, data);
  },

  /**
   * Delete user (admin only)
   */
  async delete(id) {
    return api.delete(`/api/users/${id}/`);
  },

  /**
   * Get participant enrollments (organizer only)
   */
  async getEnrollments(filters = {}) {
    const params = new URLSearchParams(filters);
    return api.get(`/api/users/enrollments/?${params}`);
  },

  /**
   * Google login
   */
  async googleLogin(token, branch) {
    return api.post('/api/users/google_login/', {
      token,
      branch,
    });
  },
};

/**
 * Registrations Service
 */
export const registrationsService = {
  /**
   * Get user's registrations
   */
  async getMyRegistrations() {
    return api.get('/api/registrations/my-registrations/');
  },

  /**
   * Register for event
   */
  async register(eventId, data = {}) {
    return api.post(`/api/registrations/`, {
      event: eventId,
      ...data,
    });
  },

  /**
   * Cancel registration
   */
  async cancel(registrationId) {
    return api.delete(`/api/registrations/${registrationId}/`);
  },

  /**
   * Check in to event
   */
  async checkIn(registrationId) {
    return api.post(`/api/registrations/${registrationId}/check-in/`, {});
  },

  /**
   * Get event registrations (admin only)
   */
  async getEventRegistrations(eventId, filters = {}) {
    const params = new URLSearchParams(filters);
    return api.get(`/api/registrations/?event=${eventId}&${params}`);
  },
};

/**
 * Attendance Service
 */
export const attendanceService = {
  /**
   * Get attendance records
   */
  async getRecords(filters = {}) {
    const params = new URLSearchParams(filters);
    return api.get(`/api/attendance/?${params}`);
  },

  /**
   * Mark attendance
   */
  async markAttendance(registrationId) {
    return api.post(`/api/attendance/`, {
      registration: registrationId,
    });
  },

  /**
   * Get attendance report (admin only)
   */
  async getReport(eventId) {
    return api.get(`/api/attendance/report/?event=${eventId}`);
  },

  /**
   * Export attendance (admin only)
   */
  async exportAttendance(eventId, format = 'csv') {
    return api.get(`/api/attendance/export/?event=${eventId}&format=${format}`);
  },
};

/**
 * Reports Service
 */
export const reportsService = {
  /**
   * Get event statistics
   */
  async getEventStats(eventId) {
    return api.get(`/api/reports/event-stats/?event=${eventId}`);
  },

  /**
   * Get attendance report by branch
   */
  async getAttendanceByBranch(eventId) {
    return api.get(`/api/reports/attendance-by-branch/?event=${eventId}`);
  },

  /**
   * Get user attendance history
   */
  async getUserAttendanceHistory() {
    return api.get(`/api/reports/my-attendance/`);
  },

  /**
   * Generate report (admin only)
   */
  async generateReport(data) {
    return api.post('/api/reports/generate/', data);
  },
};

/**
 * Dashboard Service
 */
export const dashboardService = {
  /**
   * Get dashboard stats
   */
  async getStats() {
    return api.get('/api/dashboard/stats/');
  },

  /**
   * Get upcoming events
   */
  async getUpcomingEvents() {
    return api.get('/api/dashboard/upcoming-events/');
  },

  /**
   * Get recent activity
   */
  async getRecentActivity() {
    return api.get('/api/dashboard/recent-activity/');
  },
};

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Register new user
   */
  async register(data) {
    return api.post('/api/auth/register/', data);
  },

  /**
   * Login
   */
  async login(email, password) {
    return api.post('/api/auth/login/', { email, password });
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return api.post('/api/auth/token/refresh/', { refresh: refreshToken });
  },

  /**
   * Logout
   */
  async logout() {
    return api.post('/api/auth/logout/', {});
  },

  /**
   * Verify email
   */
  async verifyEmail(token) {
    return api.post('/api/auth/verify-email/', { token });
  },
};

export default {
  eventsService,
  usersService,
  registrationsService,
  attendanceService,
  reportsService,
  dashboardService,
  authService,
};
