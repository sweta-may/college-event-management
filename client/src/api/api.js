import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cem-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear stale auth and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cem-token');
      localStorage.removeItem('cem-user');
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data)           => api.post('/auth/register', data),
  login:    (data)           => api.post('/auth/login', data),
  me:       ()               => api.get('/auth/me'),
};

export const events = {
  list:   (params)      => api.get('/events', { params }),
  get:    (id)          => api.get(`/events/${id}`),
  create: (data)        => api.post('/events', data),
  update: (id, data)    => api.put(`/events/${id}`, data),
  delete: (id)          => api.delete(`/events/${id}`),
};

export const registrations = {
  register:             (eventId)              => api.post(`/registrations/${eventId}`),
  getMyRegistrations:   (params)               => api.get('/registrations/my', { params }),
  cancel:               (registrationId)       => api.patch(`/registrations/${registrationId}/cancel`),
  getEventParticipants: (eventId, params)      => api.get(`/registrations/event/${eventId}`, { params }),
  updateStatus:         (registrationId, status) => api.patch(`/registrations/${registrationId}/status`, { status }),
};

export const admin = {
  getUsers:       (params)         => api.get('/admin/users', { params }),
  updateUserRole: (userId, role)   => api.patch(`/admin/users/${userId}/role`, { role }),
  getEvents:      (params)         => api.get('/admin/events', { params }),
  approveEvent:   (eventId)        => api.patch(`/admin/events/${eventId}/approve`),
  rejectEvent:    (eventId)        => api.patch(`/admin/events/${eventId}/reject`),
  getRegistrations: (params)       => api.get('/admin/registrations', { params }),
};

export default api;
