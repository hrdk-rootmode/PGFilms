import axios from 'axios'

// ═══════════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('auth-storage') // Clear Zustand persist state
      window.location.href = '/admin'
    }
    return Promise.reject(error)
  }
)

// ═══════════════════════════════════════════════════════════════
// PUBLIC API (No auth required)
// ═══════════════════════════════════════════════════════════════

export const publicAPI = {
  // Get packages (with cache-busting)
  getPackages: () => api.get('/public/packages', {
    params: {
      _t: Date.now() // Cache-busting parameter
    }
  }),

  // Get portfolio/gallery
  getPortfolio: () => api.get('/public/portfolio', {
    params: {
      _t: Date.now() // Cache-busting parameter
    }
  }),

  // Get filmmaker info
  getInfo: () => api.get('/public/info', {
    params: {
      _t: Date.now() // Cache-busting parameter
    }
  }),

  // Submit booking (via contact form or chat)
  submitBooking: (bookingData) => api.post('/chat/booking', bookingData)
}

// ═══════════════════════════════════════════════════════════════
// CHAT API (No auth required)
// ═══════════════════════════════════════════════════════════════

export const chatAPI = {
  // Send message
  sendMessage: (sessionId, message, language = 'en') =>
    api.post('/chat/message', { sessionId, message, language }),

  // Get conversation
  getConversation: (sessionId) =>
    api.get(`/chat/${sessionId}`),

  // Submit booking
  submitBooking: (sessionId, bookingData) =>
    api.post('/chat/booking', { sessionId, ...bookingData }),

  // Send feedback
  sendFeedback: (sessionId, rating, comment) =>
    api.post('/chat/feedback', { sessionId, rating, comment }),

  // Create booking (for custom packages)
  createBooking: (bookingData) =>
    api.post('/chat/booking', bookingData),

  // Check existing booking with device fingerprint
  checkExistingBooking: (mobile, deviceFingerprint) =>
    api.post('/chat/check-booking', { mobile, deviceFingerprint }),

  // Update booking
  updateBooking: (bookingId, updateData) =>
    api.put(`/chat/booking/${bookingId}`, updateData)
}

// ═══════════════════════════════════════════════════════════════
// ADMIN API (Auth required)
// ═══════════════════════════════════════════════════════════════

export const adminAPI = {
  // ─────────────────────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────────────────────

  login: (email, password) =>
    api.post('/admin/login', { email, password }),

  logout: () =>
    api.post('/admin/logout'),

  verifyToken: () =>
    api.get('/admin/verify'),

  // ─────────────────────────────────────────────────────────────
  // Dashboard
  // ─────────────────────────────────────────────────────────────

  getDashboard: () =>
    api.get('/admin/dashboard'),

  // ─────────────────────────────────────────────────────────────
  // Conversations
  // ─────────────────────────────────────────────────────────────

  getConversations: (params = {}) =>
    api.get('/admin/conversations', { params }),

  getConversation: (id) =>
    api.get(`/admin/conversations/${id}`),

  deleteConversation: (id, reason = 'unwanted') =>
    api.delete(`/admin/conversations/${id}`, { data: { reason } }),

  bulkDeleteConversations: (ids, reason = 'unwanted') =>
    api.post('/admin/conversations/bulk-delete', { ids, reason }),

  // ─────────────────────────────────────────────────────────────
  // Bookings
  // ─────────────────────────────────────────────────────────────

  getBookings: (params = {}) =>
    api.get('/admin/bookings', { params }),

  updateBooking: (id, data) =>
    api.put(`/admin/bookings/${id}`, data),

  deleteBooking: (id) =>
    api.delete(`/admin/bookings/${id}`),

  // ─────────────────────────────────────────────────────────────
  // Packages
  // ─────────────────────────────────────────────────────────────

  getAdminPackages: () =>
    api.get('/admin/packages'),

  createPackage: (data) =>
    api.post('/admin/packages', data),

  updatePackage: (id, data) =>
    api.put(`/admin/packages/${id}`, data),

  deletePackage: (id) =>
    api.delete(`/admin/packages/${id}`),

  reorderPackages: (order) =>
    api.put('/admin/packages/reorder', { order }),

  // ─────────────────────────────────────────────────────────────
  // Learning/Patterns
  // ─────────────────────────────────────────────────────────────

  getPatterns: () =>
    api.get('/admin/patterns'),

  getPendingPatterns: () =>
    api.get('/admin/patterns/pending'),

  approvePattern: (id, intent) =>
    api.post(`/admin/patterns/approve/${id}`, { intent }),

  rejectPattern: (id) =>
    api.post(`/admin/patterns/reject/${id}`),

  addKeyword: (intent, keyword, language) =>
    api.post('/admin/patterns/keyword', { intent, keyword, language }),

  removeKeyword: (intent, keyword) =>
    api.delete(`/admin/patterns/keyword/${intent}/${keyword}`),

  // ─────────────────────────────────────────────────────────────
  // Abuse Reports
  // ─────────────────────────────────────────────────────────────

  getAbuseReports: () =>
    api.get('/admin/abuse'),

  dismissAbuse: (id) =>
    api.post(`/admin/abuse/dismiss/${id}`),

  blockUser: (visitorId) =>
    api.post('/admin/abuse/block', { visitorId }),

  addAbuseWord: (word, severity) =>
    api.post('/admin/abuse/word', { word, severity }),

  removeAbuseWord: (word) =>
    api.delete(`/admin/abuse/word/${word}`),

  // ─────────────────────────────────────────────────────────────
  // Trash
  // ─────────────────────────────────────────────────────────────

  getTrash: () =>
    api.get('/admin/trash'),

  recoverFromTrash: (id) =>
    api.post(`/admin/trash/recover/${id}`),

  permanentDelete: (id, otp) =>
    api.delete(`/admin/trash/${id}`, { data: { otp } }),

  emptyTrash: (otp) =>
    api.post('/admin/trash/empty', { otp }),

  // ─────────────────────────────────────────────────────────────
  // Analytics
  // ─────────────────────────────────────────────────────────────

  getAnalytics: (params = {}) =>
    api.get('/admin/analytics', { params }),

  exportAnalytics: (params = {}) =>
    api.get('/admin/analytics/export', { params, responseType: 'blob' }),

  // ─────────────────────────────────────────────────────────────
  // Settings
  // ─────────────────────────────────────────────────────────────

  getSettings: () =>
    api.get('/admin/settings'),

  updateSettings: (data) =>
    api.put('/admin/settings', data),

  changePassword: (currentPassword, newPassword, otp) =>
    api.post('/admin/settings/password', { currentPassword, newPassword, otp }),

  // ─────────────────────────────────────────────────────────────
  // OTP
  // ─────────────────────────────────────────────────────────────

  sendOTP: (action) =>
    api.post('/admin/otp/send', { action }),

  verifyOTP: (otp, action) =>
    api.post('/admin/otp/verify', { otp, action }),


// ─────────────────────────────────────────────────────────────
// Automation & AI Assistant
// ─────────────────────────────────────────────────────────────

// Daily Briefing
getDailyBriefing: () =>
  api.get('/automation/briefing'),

// AI Insights
getAIInsights: () =>
  api.get('/automation/insights'),

// Smart Task Suggestions
getTaskSuggestions: () =>
  api.get('/automation/task-suggestions'),

// Activity Feed
getActivityFeed: (limit = 20) =>
  api.get('/automation/activity-feed', { params: { limit } }),

// Chart Data
getChartData: (type = 'bookings', days = 30) =>
  api.get('/automation/chart-data', { params: { type, days } }),

// Growth Metrics
getGrowthMetrics: () =>
  api.get('/automation/growth-metrics'),

// ─────────────────────────────────────────────────────────────
// Email Preferences
// ─────────────────────────────────────────────────────────────

getEmailPreferences: () =>
  api.get('/automation/email-preferences'),

updateEmailPreferences: (preferences) =>
  api.put('/automation/email-preferences', preferences),

sendTestEmail: () =>
  api.post('/automation/test-email'),

  // ─────────────────────────────────────────────────────────────
  // UPLOADS
  // ─────────────────────────────────────────────────────────────

  uploadFile: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadFiles: (files) => {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files', file))
    return api.post('/admin/upload/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════

export default api