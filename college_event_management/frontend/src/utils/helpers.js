/**
 * Utility Functions - Example
 * Common helper functions for the application
 */

/**
 * API Request Helper
 * Wraps fetch with common headers and error handling
 */
export const api = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  },

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

/**
 * Validation Utilities
 */
export const validators = {
  /**
   * Validate email format
   */
  isEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate password strength
   * At least 8 chars, 1 uppercase, 1 lowercase, 1 number
   */
  isStrongPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  },

  /**
   * Validate phone number
   */
  isPhoneNumber(phone) {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone.replace(/\D/g, ''));
  },

  /**
   * Validate required field
   */
  isRequired(value) {
    return value && value.toString().trim().length > 0;
  },

  /**
   * Validate field length
   */
  minLength(value, min) {
    return value && value.toString().length >= min;
  },

  maxLength(value, max) {
    return value && value.toString().length <= max;
  },
};

/**
 * Format Utilities
 */
export const formatters = {
  /**
   * Format date to readable string
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Format date with time
   */
  formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format time
   */
  formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  /**
   * Format number with commas
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Truncate text
   */
  truncate(text, length = 50) {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  },
};

/**
 * Storage Utilities
 */
export const storage = {
  set(key, value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  get(key) {
    if (typeof localStorage !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    }
    return null;
  },

  remove(key) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },

  clear() {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  },
};

/**
 * Notification Utilities
 */
export const notify = {
  success() {
    // Success notification - can be integrated with toast notification library
  },

  error() {
    // Error notification
  },

  warning() {
    // Warning notification
  },

  info() {
    // Info notification
  },
};

/**
 * Common Error Handler
 */
export const handleError = (error) => {
  let message = 'An error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  notify.error(message);
  return message;
};

export default {
  api,
  validators,
  formatters,
  storage,
  notify,
  handleError,
};
