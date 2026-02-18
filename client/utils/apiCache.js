/**
 * API Request Deduplication and Caching Utility
 * Prevents 429 errors by avoiding duplicate simultaneous requests
 */

class APIRequestManager {
  constructor() {
    this.pendingRequests = new Map()
    this.cache = new Map()
    this.cacheTimeout = 30000 // 30 seconds cache
  }

  // Generate unique key for request
  getRequestKey(url, params = {}) {
    return `${url}?${JSON.stringify(params)}`
  }

  // Check if request is already pending
  isPending(key) {
    return this.pendingRequests.has(key)
  }

  // Get cached response
  getCached(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  // Set pending request
  setPending(key, promise) {
    this.pendingRequests.set(key, promise)
    
    // Clean up after request completes
    promise.finally(() => {
      this.pendingRequests.delete(key)
    })
  }

  // Cache response
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Execute request with deduplication
  async executeRequest(apiCall, key) {
    // Check cache first
    const cached = this.getCached(key)
    if (cached) {
      console.log(`📋 Using cached response for ${key}`)
      return cached
    }

    // Check if already pending
    if (this.isPending(key)) {
      console.log(`⏳ Request already pending for ${key}, waiting...`)
      return await this.pendingRequests.get(key)
    }

    // Execute new request
    const promise = apiCall()
    this.setPending(key, promise)

    try {
      const response = await promise
      this.setCache(key, response)
      return response
    } catch (error) {
      console.error(`❌ Request failed for ${key}:`, error)
      throw error
    }
  }

  // Clear cache manually
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
}

// Create singleton instance
const apiManager = new APIRequestManager()

// Enhanced API wrapper functions
export const withDeduplication = {
  getDashboard: () => {
    const key = apiManager.getRequestKey('/admin/dashboard')
    return apiManager.executeRequest(
      () => import('./api').then(m => m.adminAPI.getDashboard()),
      key
    )
  },

  getConversations: (params = {}) => {
    const key = apiManager.getRequestKey('/admin/conversations', params)
    return apiManager.executeRequest(
      () => import('./api').then(m => m.adminAPI.getConversations(params)),
      key
    )
  },

  getBookings: (params = {}) => {
    const key = apiManager.getRequestKey('/admin/bookings', params)
    return apiManager.executeRequest(
      () => import('./api').then(m => m.adminAPI.getBookings(params)),
      key
    )
  },

  getConversation: (id) => {
    const key = apiManager.getRequestKey(`/admin/conversations/${id}`)
    return apiManager.executeRequest(
      () => import('./api').then(m => m.adminAPI.getConversation(id)),
      key
    )
  },

  // Clear cache when data changes
  invalidateCache: (pattern) => {
    apiManager.clearCache(pattern)
  }
}

export default apiManager
