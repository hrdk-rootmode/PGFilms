import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════
// AUTH STORE - Admin Authentication
// ═══════════════════════════════════════════════════════════════

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      admin: null,
      token: null,
      
      // Actions
      login: (admin, token) => {
        localStorage.setItem('adminToken', token)
        set({ isAuthenticated: true, admin, token })
      },
      
      logout: () => {
        localStorage.removeItem('adminToken')
        set({ isAuthenticated: false, admin: null, token: null })
      },
      
      updateAdmin: (data) => {
        set((state) => ({ admin: { ...state.admin, ...data } }))
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        admin: state.admin 
      })
    }
  )
)

// ═══════════════════════════════════════════════════════════════
// CHAT STORE - Chat Widget State
// ═══════════════════════════════════════════════════════════════

export const useChatStore = create((set, get) => ({
  // State
  isOpen: false,
  messages: [],
  sessionId: null,
  isTyping: false,
  language: 'en',
  bookingFlow: null,
  
  // Actions
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  
  openChat: () => set({ isOpen: true }),
  
  closeChat: () => set({ isOpen: false }),
  
  setSessionId: (sessionId) => set({ sessionId }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, { ...message, timestamp: new Date() }] 
  })),
  
  setTyping: (isTyping) => set({ isTyping }),
  
  setLanguage: (language) => set({ language }),
  
  startBookingFlow: (packageId) => set({ 
    bookingFlow: { step: 1, packageId, data: {} } 
  }),
  
  updateBookingFlow: (data) => set((state) => ({
    bookingFlow: state.bookingFlow 
      ? { ...state.bookingFlow, data: { ...state.bookingFlow.data, ...data } }
      : null
  })),
  
  nextBookingStep: () => set((state) => ({
    bookingFlow: state.bookingFlow 
      ? { ...state.bookingFlow, step: state.bookingFlow.step + 1 }
      : null
  })),
  
  endBookingFlow: () => set({ bookingFlow: null }),
  
  clearChat: () => set({ messages: [], bookingFlow: null })
}))

// ═══════════════════════════════════════════════════════════════
// UI STORE - General UI State
// ═══════════════════════════════════════════════════════════════

export const useUIStore = create((set) => ({
  // State
  isMobileMenuOpen: false,
  activeSection: 'home',
  isLoading: false,
  toast: null,
  modal: null,
  
  // Actions
  toggleMobileMenu: () => set((state) => ({ 
    isMobileMenuOpen: !state.isMobileMenuOpen 
  })),
  
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  setActiveSection: (section) => set({ activeSection: section }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  showToast: (message, type = 'info', duration = 3000) => {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => set({ toast: null }), duration)
  },
  
  hideToast: () => set({ toast: null }),
  
  showModal: (modal) => set({ modal }),
  
  hideModal: () => set({ modal: null })
}))

// ═══════════════════════════════════════════════════════════════
// ADMIN STORE - Admin Dashboard State
// ═══════════════════════════════════════════════════════════════

export const useAdminStore = create((set, get) => ({
  // State
  activeTab: 'dashboard',
  dashboardData: null,
  conversations: [],
  bookings: [],
  packages: [],
  patterns: null,
  abuseReports: [],
  trash: [],
  analytics: null,
  settings: null,
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setDashboardData: (data) => set({ dashboardData: data }),
  
  setConversations: (conversations) => set({ conversations }),
  
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations]
  })),
  
  removeConversation: (id) => set((state) => ({
    conversations: state.conversations.filter(c => c._id !== id)
  })),
  
  setBookings: (bookings) => set({ bookings }),
  
  updateBookingInList: (id, data) => set((state) => ({
    bookings: state.bookings.map(b => b._id === id ? { ...b, ...data } : b)
  })),
  
  setPackages: (packages) => set({ packages }),
  
  setPatterns: (patterns) => set({ patterns }),
  
  setAbuseReports: (reports) => set({ abuseReports: reports }),
  
  setTrash: (trash) => set({ trash }),
  
  removeFromTrash: (id) => set((state) => ({
    trash: state.trash.filter(t => t._id !== id)
  })),
  
  setAnalytics: (analytics) => set({ analytics }),
  
  setSettings: (settings) => set({ settings })
}))