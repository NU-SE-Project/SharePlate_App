import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header from localStorage for every request if available
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Response interceptor: if 401, try to refresh access token using refresh cookie
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || !error.response) return Promise.reject(error);

    // If unauthorized and not already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // queue the request
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            if (!originalRequest.headers) originalRequest.headers = {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // call refresh endpoint - expects refresh cookie (withCredentials=true)
        const resp = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/refresh', {}, { withCredentials: true });
        const newToken = resp.data?.accessToken;
        if (newToken) {
          try { localStorage.setItem('accessToken', newToken); } catch (e) {}
          onRefreshed(newToken);
          if (!originalRequest.headers) originalRequest.headers = {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // refresh failed - clear storage and redirect to login
        try { localStorage.removeItem('accessToken'); localStorage.removeItem('user'); localStorage.removeItem('restaurantId'); } catch (e) {}
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
