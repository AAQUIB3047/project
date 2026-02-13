import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminEvents.css';

// FormData is a browser API, no import needed

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    category: '',
    department: '',
    max_capacity: '',
    event_type: 'workshop',
    registration_fee: '0.00',
    registration_deadline: '',
    poster_image: null,
  });

  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchEvents();
    fetchVenues();
    fetchCategories();
    fetchDepartments();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/events/venues/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVenues(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Error fetching venues - set empty array to prevent map errors
      console.error('Failed to fetch venues:', error);
      setVenues([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/events/categories/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure we always set an array
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Error fetching categories - set empty array to prevent map errors
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/events/departments/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Error fetching departments - set empty array to prevent map errors
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/events/events/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle both array and paginated responses
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setEvents(data);
    } catch (error) {
      setErrorMessage('Failed to fetch events');
      // Error fetching events - will show error message and empty events list
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      setErrorMessage('Please select a file to upload');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      // FormData is a browser API used for file uploads
      const formData = new FormData();
      formData.append('file', bulkUploadFile);

      const response = await axios.post(
        'http://localhost:8000/api/events/events/bulk_upload/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccessMessage(response.data.message);
      setBulkUploadFile(null);
      setShowBulkUpload(false);
      fetchEvents();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to upload events');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // FormData is a browser API used for form submissions with file uploads
      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === 'poster_image' && formData[key]) {
          formDataToSend.append('poster_image', formData[key]);
        } else if (key !== 'poster_image') {
          let value = formData[key];
          if (key === 'venue' || key === 'category' || key === 'department') {
            value = parseInt(value) || null;
          } else if (key === 'max_capacity') {
            value = parseInt(value) || 0;
          } else if (key === 'registration_fee') {
            value = parseFloat(value) || 0.0;
          }
          formDataToSend.append(key, value);
        }
      });

      if (editingId) {
        // Update event
        await axios.put(`http://localhost:8000/api/events/events/${editingId}/`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccessMessage('Event updated successfully!');
      } else {
        // Create event
        await axios.post('http://localhost:8000/api/events/events/', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccessMessage('Event created successfully!');
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || error.response?.data?.title?.[0] || 'Failed to save event'
      );
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      venue: event.venue || '',
      category: event.category || '',
      department: event.department || '',
      max_capacity: event.max_capacity || '',
      event_type: event.event_type || 'workshop',
      registration_fee: event.registration_fee || '0.00',
      registration_deadline: event.registration_deadline || '',
      poster_image: null, // Reset to null for editing
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/events/events/${deleteConfirm}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Event deleted successfully!');
      setDeleteConfirm(null);
      fetchEvents();
    } catch (error) {
      setErrorMessage('Failed to delete event');
    }
  };

  const handlePublish = async (eventId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/events/events/${eventId}/publish/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage('Event published successfully!');
      fetchEvents();
    } catch (error) {
      setErrorMessage('Failed to publish event');
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/events/events/${eventId}/cancel/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage('Event cancelled successfully!');
      fetchEvents();
    } catch (error) {
      setErrorMessage('Failed to cancel event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      venue: '',
      category: '',
      department: '',
      max_capacity: '',
      event_type: 'workshop',
      registration_fee: '0.00',
      registration_deadline: '',
      poster_image: null,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredEvents = Array.isArray(events)
    ? events.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="admin-events">
      <div className="container">
        <div className="admin-header">
          <div className="header-content">
            <h1>📊 Event Management</h1>
            <p>Create, edit, and delete events</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => setShowBulkUpload(!showBulkUpload)}
            >
              📁 Bulk Upload
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => (!showForm ? setShowForm(true) : resetForm())}
            >
              {showForm ? '✕ Cancel' : '+ Create Event'}
            </button>
          </div>
        </div>

        {successMessage && <div className="alert alert-success">✓ {successMessage}</div>}

        {errorMessage && <div className="alert alert-error">✕ {errorMessage}</div>}

        {showBulkUpload && (
          <div className="form-section card">
            <h2>Bulk Upload Events</h2>
            <div className="bulk-upload-form">
              <div className="form-group">
                <label htmlFor="bulk_file">Upload CSV or Excel File</label>
                <input
                  id="bulk_file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setBulkUploadFile(e.target.files[0])}
                />
                {bulkUploadFile && (
                  <div className="file-preview">Selected: {bulkUploadFile.name}</div>
                )}
              </div>
              <div className="bulk-upload-info">
                <h4>Required Columns:</h4>
                <ul>
                  <li>title - Event title</li>
                  <li>description - Event description</li>
                  <li>event_date - Date (YYYY-MM-DD)</li>
                  <li>start_time - Start time (HH:MM)</li>
                  <li>end_time - End time (HH:MM)</li>
                  <li>venue - Venue ID</li>
                  <li>department - Department ID</li>
                  <li>max_capacity - Maximum capacity</li>
                </ul>
                <h4>Optional Columns:</h4>
                <ul>
                  <li>category - Category ID</li>
                  <li>event_type - Event type (workshop, seminar, etc.)</li>
                  <li>registration_fee - Registration fee</li>
                  <li>registration_deadline - Registration deadline (YYYY-MM-DD)</li>
                  <li>status - Event status (draft, published, etc.)</li>
                </ul>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={handleBulkUpload}>
                  📤 Upload Events
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => {
                    setShowBulkUpload(false);
                    setBulkUploadFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="form-section card">
            <h2>{editingId ? 'Edit Event' : 'Create New Event'}</h2>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Event Title *</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="E.g., Summer Concert 2025"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the event in detail..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="event_date">Event Date *</label>
                  <input
                    id="event_date"
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="start_time">Start Time *</label>
                  <input
                    id="start_time"
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="end_time">End Time *</label>
                  <input
                    id="end_time"
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="venue">Venue *</label>
                  <select
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a venue</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.venue_name} ({venue.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department *</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="event_type">Event Type *</label>
                  <select
                    id="event_type"
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
                    <option value="competition">Competition</option>
                    <option value="cultural">Cultural Event</option>
                    <option value="sports">Sports Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="max_capacity">Max Capacity *</label>
                  <input
                    id="max_capacity"
                    type="number"
                    name="max_capacity"
                    value={formData.max_capacity}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="registration_fee">Registration Fee (₹)</label>
                  <input
                    id="registration_fee"
                    type="number"
                    name="registration_fee"
                    value={formData.registration_fee}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="registration_deadline">Registration Deadline</label>
                  <input
                    id="registration_deadline"
                    type="date"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="poster_image">Poster Image</label>
                  <input
                    id="poster_image"
                    type="file"
                    name="poster_image"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  {formData.poster_image && (
                    <div className="file-preview">Selected: {formData.poster_image.name}</div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-lg">
                  {editingId ? '✓ Update Event' : '+ Create Event'}
                </button>
                <button type="button" className="btn btn-secondary btn-lg" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search events by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="result-count">{filteredEvents.length} events</span>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="event-row skeleton"></div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="events-table">
            <div className="table-header">
              <div className="col-title">Event</div>
              <div className="col-date">Date</div>
              <div className="col-location">Location</div>
              <div className="col-price">Price</div>
              <div className="col-seats">Seats</div>
              <div className="col-actions">Actions</div>
            </div>

            {filteredEvents.map((event) => (
              <div key={event.id} className="table-row">
                <div className="col-title">
                  <div className="event-name">{event.title}</div>
                  <div className="event-category">
                    {event.category_details?.category_name || event.category}
                  </div>
                  {event.poster_image_url && (
                    <img
                      src={event.poster_image_url}
                      alt={event.title}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        marginTop: '5px',
                        borderRadius: '4px',
                      }}
                    />
                  )}
                </div>

                <div className="col-date">
                  {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date TBD'}
                </div>

                <div className="col-location">
                  {event.venue_details?.venue_name || event.location || 'TBD'}
                </div>

                <div className="col-price">
                  {event.registration_fee && parseFloat(event.registration_fee) > 0
                    ? `₹${parseFloat(event.registration_fee).toFixed(2)}`
                    : 'Free'}
                </div>

                <div className="col-seats">
                  <span
                    className={`seats-badge ${event.available_seats > 0 ? 'available' : 'sold-out'}`}
                  >
                    {event.available_seats} seats
                  </span>
                </div>

                <div className="col-status">
                  <span className={`status-badge status-${event.status}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>

                <div className="col-actions">
                  {event.status === 'draft' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handlePublish(event.id)}
                      title="Publish event"
                    >
                      📤 Publish
                    </button>
                  )}
                  {event.status === 'published' && (
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleCancel(event.id)}
                      title="Cancel event"
                    >
                      ❌ Cancel
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(event)}
                    title="Edit event"
                  >
                    ✎ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setDeleteConfirm(event.id)}
                    title="Delete event"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No events found</h3>
            <p>
              {searchQuery ? 'Try adjusting your search' : 'Create your first event to get started'}
            </p>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Event?</h2>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-danger btn-lg" onClick={handleDelete}>
                🗑 Delete
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
