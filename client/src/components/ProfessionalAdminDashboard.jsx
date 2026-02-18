import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminAPI } from '../utils/api'
import {
  Users,
  Calendar,
  MessageSquare,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  PieChart,
  Activity,
  UserCheck,
  Check,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Download,
  BarChart3,
  Star,
  AlertCircle,
  Target,
  Bell,
  ListTodo
} from 'lucide-react'
import PackageManagement from './PackageManagement'
import TodoList from './TodoList'
import TodoForm from './TodoForm'
import MonthlySchedule from './MonthlySchedule'

const ProfessionalAdminDashboard = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to false (light theme)
    const savedTheme = localStorage.getItem('pg-admin-theme')
    return savedTheme === 'dark'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusDropdown, setStatusDropdown] = useState(null)
  const [conversationFilter, setConversationFilter] = useState('all')
  const [selectedConversations, setSelectedConversations] = useState([])
  const [conversationDropdown, setConversationDropdown] = useState(null)
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [selectedTodoTask, setSelectedTodoTask] = useState(null)
  const [todoStats, setTodoStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0
  })
  const [data, setData] = useState({
    stats: {
      totalBookings: 0,
      totalRevenue: 0,
      activeUsers: 0,
      totalConversations: 0
    },
    bookings: [],
    conversations: [],
    packages: []
  })

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return <Check className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      case 'cancelled': return <X className="w-3 h-3" />
      case 'completed': return <Star className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', description: 'Overview & Analytics', icon: BarChart3 },
    { id: 'bookings', name: 'Bookings', description: 'Manage Bookings', icon: Calendar },
    { id: 'conversations', name: 'Conversations', description: 'Customer Messages', icon: MessageSquare },
    { id: 'todos', name: 'Todo List', description: 'Task Management', icon: ListTodo },
    { id: 'schedule', name: 'Schedule', description: 'Monthly Calendar', icon: Calendar },
    { id: 'packages', name: 'Packages', description: 'Service Packages', icon: Package },
    { id: 'settings', name: 'Settings', description: 'System Settings', icon: Settings }
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch dashboard stats
      const dashboardResponse = await adminAPI.getDashboard()
      const stats = dashboardResponse.data?.data?.stats || {}
      
      // Fetch bookings
      const bookingsResponse = await adminAPI.getBookings()
      const bookings = Array.isArray(bookingsResponse.data?.data?.bookings) ? bookingsResponse.data.data.bookings : []
      
      // Fetch conversations
      const conversationsResponse = await adminAPI.getConversations()
      const conversations = Array.isArray(conversationsResponse.data?.data?.conversations) ? conversationsResponse.data.data.conversations : []
      
      // Fetch packages
      const packagesResponse = await adminAPI.getAdminPackages()
      const packages = Array.isArray(packagesResponse.data?.data) ? packagesResponse.data.data : []
      
      setData({
        stats: {
          totalBookings: stats.totalBookings || bookings.length || 0,
          totalRevenue: stats.totalRevenue || 0,
          activeUsers: stats.activeUsers || 0,
          totalConversations: stats.totalConversations || conversations.length || 0,
          confirmedBookings: stats.confirmedBookings || 0,
          pendingBookings: stats.pendingBookings || 0,
          newConversations: stats.newConversations || 0,
          todayConversations: stats.todayConversations || 0,
          todayMessages: stats.todayMessages || 0
        },
        bookings,
        conversations,
        packages
      })
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    loadTodoStats()
  }, [])

  const loadTodoStats = () => {
    const savedTodos = localStorage.getItem('pg-todos')
    if (savedTodos) {
      const todos = JSON.parse(savedTodos)
      setTodoStats({
        total: todos.length,
        completed: todos.filter(t => t.status === 'completed').length,
        pending: todos.filter(t => t.status === 'pending').length,
        highPriority: todos.filter(t => t.priority === 'high' && t.status !== 'completed').length
      })
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdown && !event.target.closest('.status-dropdown')) {
        setStatusDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [statusDropdown])

  const handleLogout = () => {
    console.log('Logging out...')
  }

  const handleTodoTaskUpdate = (updatedTodos) => {
    loadTodoStats()
  }

  const handleTodoTaskSelect = (task) => {
    setSelectedTodoTask(task)
    setShowTodoForm(true)
  }

  const handleTodoFormSave = (taskData) => {
    const savedTodos = localStorage.getItem('pg-todos')
    let todos = savedTodos ? JSON.parse(savedTodos) : []
    
    if (selectedTodoTask) {
      // Update existing task
      todos = todos.map(t => t.id === taskData.id ? taskData : t)
    } else {
      // Add new task
      todos.push(taskData)
    }
    
    localStorage.setItem('pg-todos', JSON.stringify(todos))
    loadTodoStats()
    setShowTodoForm(false)
    setSelectedTodoTask(null)
  }

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('pg-admin-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Dashboard Stats Component
  const DashboardStats = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{data.stats.totalRevenue?.toLocaleString() || 0}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">+8%</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.stats.totalBookings || 0}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-purple-500" />
            <span className="text-xs text-purple-500 bg-purple-50 px-2 py-1 rounded-full">+15%</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.stats.totalConversations || 0}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Conversations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-8 h-8 text-orange-500" />
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full">+5%</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.stats.activeUsers || 0}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <ListTodo className="w-8 h-8 text-indigo-500" />
            <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">Tasks</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{todoStats.total}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Todo Tasks</p>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <Check className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">Confirmed</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.stats.confirmedBookings || 0}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirmed Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">Pending</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.stats.pendingBookings || 0}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">New</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.stats.newConversations || 0}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>New Conversations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-red-500" />
            <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">Today</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.stats.todayConversations || 0}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today's Conversations</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Revenue Trend</h3>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Revenue up 25% this month</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Bookings</h3>
          <div className="space-y-3">
            {data.bookings.slice(0, 3).map((booking, index) => (
              <div key={booking.id || index} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {booking.name || 'Unknown'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {booking.package || 'Service'} • {formatDate(booking.eventDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{(booking.value || 0).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status || 'none'}
                  </span>
                </div>
              </div>
            ))}
            {data.bookings.length === 0 && (
              <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No recent bookings</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )

  // Bookings Cards Component
  const BookingsCards = () => {
    const bookings = Array.isArray(data.bookings) ? data.bookings : []
    
    // Debug: Log booking data structure
    console.log('Bookings data structure:', bookings[0])
    
    // Filter bookings based on search and status
    const filteredBookings = bookings.filter(booking => {
      const matchesSearch = searchTerm === '' || 
        (booking.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.package || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.phone || '').includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    const handleViewDetails = (booking) => {
      // Create a detailed view modal or expand card
      alert(`Booking Details:\n\nCustomer: ${booking.name || 'Unknown'}\nService: ${booking.package || 'N/A'}\nDate: ${formatDate(booking.eventDate)}\nTime: Not specified\nEmail: ${booking.email || 'Not provided'}\nPhone: ${booking.phone || 'Not provided'}\nAmount: ₹${booking.value || 0}\nStatus: ${booking.status || 'none'}\nLocation: ${booking.location || 'Not specified'}\nSpecial Requests: ${booking.specialRequests || 'None'}`)
    }

    const handleEditBooking = (booking) => {
      // Check for missing information and show popup
      const missingFields = []
      if (!booking.eventDate) missingFields.push('Event Date')
      if (!booking.location || booking.location === 'No location') missingFields.push('Location')
      if (!booking.email || booking.email === 'No email') missingFields.push('Email')
      if (booking.value === 0) missingFields.push('Amount')
      if (booking.status === 'none') missingFields.push('Status')

      if (missingFields.length > 0) {
        const fillInfo = confirm(`Missing Information:\n${missingFields.join(', ')}\n\nWould you like to fill in the missing details?`)
        if (!fillInfo) return
      }

      // Create a comprehensive edit form
      const newDate = prompt('Event Date (YYYY-MM-DD):', booking.eventDate || '')
      const newLocation = prompt('Location:', booking.location || '')
      const newEmail = prompt('Email:', booking.email || '')
      const newAmount = prompt('Amount:', booking.value || '')
      const newStatus = prompt('Status (pending/confirmed/cancelled/completed):', booking.status || 'pending')
      
      updateBookingDetails(booking.id, {
        eventDate: newDate,
        location: newLocation,
        email: newEmail,
        value: newAmount ? parseFloat(newAmount) : 0,
        status: newStatus || 'pending'
      })
    }

    // Quick edit field handler
    const handleQuickEdit = async (bookingId, field, value) => {
      try {
        const response = await adminAPI.updateBooking(bookingId, { [field]: value })
        if (response.data.success) {
          setBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, [field]: value } : b
          ))
          toast.success(`${field} updated successfully!`)
        }
      } catch (error) {
        console.error('Quick edit error:', error)
        toast.error(`Failed to update ${field}`)
      }
    }

    const updateBookingDetails = async (bookingId, updates) => {
      try {
        await adminAPI.updateBooking(bookingId, updates)
        fetchData() // Refresh data
        alert('Booking updated successfully!')
      } catch (error) {
        console.error('Update error:', error)
        alert('Failed to update booking')
      }
    }

    const handleWhatsApp = (phone, customerName) => {
      const message = encodeURIComponent(`Hello ${customerName}! This is PG Films regarding your booking.`)
      const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`
      window.open(whatsappUrl, '_blank')
    }

    const handleCall = (phone) => {
      window.open(`tel:${phone}`, '_self')
    }

    const statusOptions = [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'confirmed', label: 'Confirmed', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' },
      { value: 'completed', label: 'Completed', color: 'blue' }
    ]
    
    return (
      <div className="space-y-6">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bookings Management</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Plus className="w-5 h-5" />
              Add Booking
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
          <button className="flex items-center gap-2 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {searchTerm || statusFilter !== 'all' ? 'No bookings match your filters' : 'No bookings found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id || booking.id || `booking-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all`}
              >
                {/* Header with Status Dropdown */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {booking.name || 'Unknown Customer'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status || 'none'}
                      </span>
                      {/* Missing info indicator */}
                      {(!booking.eventDate || !booking.location || booking.email === 'No email' || booking.value === 0 || booking.status === 'none') && (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Missing Info
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div className="relative status-dropdown">
                    <button
                      onClick={() => setStatusDropdown(statusDropdown === booking.id ? null : booking.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Change Status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {statusDropdown === booking.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`absolute right-0 top-full mt-2 w-40 rounded-lg shadow-lg border z-10 status-dropdown ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                          {statusOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => handleStatusChange(booking.id, option.value)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                                darkMode ? 'hover:bg-gray-700 text-white' : 'text-gray-700'
                              } ${booking.status === option.value ? 'font-semibold' : ''}`}
                            >
                              <div className={`w-2 h-2 rounded-full bg-${option.color}-500`}></div>
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Service Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {booking.package || 'Service Package'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(booking.eventDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {booking.location || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Client Info */}
                <div className="space-y-2 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Client Information
                  </h4>
                  
                  {booking.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {booking.email}
                      </span>
                    </div>
                  )}
                  
                  {booking.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {booking.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleWhatsApp(booking.phone, booking.customerName || booking.name || 'Customer')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Contact on WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCall(booking.phone)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Make Call"
                        >
                          <Phone className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {booking.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {booking.address}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Footer with Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Amount</span>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(booking.value || 0) > 0 
                        ? `₹${(booking.value || 0).toLocaleString()}`
                        : 'Price not set'
                      }
                    </p>
                    {(booking.value || 0) === 0 && (
                      <span className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ⚠️ Amount not specified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewDetails(booking)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditBooking(booking)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="Edit Booking"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Delete Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Conversations List Component
  const ConversationsList = () => {
    const filteredConversations = getFilteredConversations()
    const conversationTypes = [
      { value: 'all', label: 'All Conversations', color: 'gray' },
      { value: 'inquiry', label: 'Inquiries', color: 'blue' },
      { value: 'booking', label: 'Bookings', color: 'green' },
      { value: 'complaint', label: 'Complaints', color: 'red' },
      { value: 'pricing', label: 'Pricing', color: 'yellow' },
      { value: 'service', label: 'Service', color: 'purple' },
      { value: 'general', label: 'General', color: 'gray' }
    ]
    
    return (
      <div className="space-y-6">
        {/* Header with Filters and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Conversations Management</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={conversationFilter}
              onChange={(e) => setConversationFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {conversationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllConversations}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {selectedConversations.length === filteredConversations.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedConversations.length > 0 && (
                <button
                  onClick={handleBulkDeleteConversations}
                  className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedConversations.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredConversations.length} of {data.conversations.length} conversations
            {selectedConversations.length > 0 && ` • ${selectedConversations.length} selected`}
          </p>
          <button className="flex items-center gap-2 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {searchTerm || conversationFilter !== 'all' ? 'No conversations match your filters' : 'No conversations found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation, index) => {
              const convType = getConversationType(conversation)
              const isSelected = selectedConversations.includes(conversation._id || conversation.id)
              
              return (
                <motion.div
                  key={conversation._id || conversation.id || `conversation-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border cursor-pointer hover:shadow-xl transition-all ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectConversation(conversation._id || conversation.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Conversation Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {conversation.customerName || conversation.name || `Visitor ${formatVisitorTime(conversation.createdAt || conversation.time || conversation.timestamp)}`}
                        </h3>
                          
                          {/* Type Badge */}
                          <span className={`px-2 py-1 text-xs rounded-full bg-${convType.color}-100 text-${convType.color}-800 border border-${convType.color}-200`}>
                            {convType.label}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {conversation.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          
                          <div className="relative">
                            <button
                              onClick={() => setConversationDropdown(conversationDropdown === conversation._id ? null : conversation._id)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="More Actions"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            
                            <AnimatePresence>
                              {conversationDropdown === conversation._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className={`absolute right-0 top-full mt-2 w-40 rounded-lg shadow-lg border z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                >
                                  <button
                                    onClick={() => handleDeleteConversation(conversation._id || conversation.id)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 transition-colors flex items-center gap-2 ${
                                      darkMode ? 'hover:bg-red-900 text-red-400' : 'text-red-600'
                                    }`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Conversation
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                      
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                        {conversation.lastMessage || conversation.message || 'No message'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {conversation.time || conversation.createdAt || 'Unknown time'}
                        </p>
                        
                        {/* Contact Info */}
                        {conversation.phone && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleWhatsApp(conversation.phone, conversation.customerName || conversation.name || 'Customer')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Contact on WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleCall(conversation.phone)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Make Call"
                            >
                              <Phone className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Packages Manager Component
  const PackagesManager = () => {
    return (
      <PackageManagement 
        darkMode={darkMode}
        adminAPI={adminAPI}
      />
    )
  }

  // Settings Panel Component
  const SettingsPanel = () => (
    <div className="space-y-6">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 border`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toggle dark/light theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await adminAPI.deleteBooking(bookingId)
        fetchData() // Refresh data
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  // Conversation management functions
  const handleSelectConversation = (conversationId) => {
    setSelectedConversations(prev => 
      prev.includes(conversationId) 
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    )
  }

  const handleSelectAllConversations = () => {
    const filteredConversations = getFilteredConversations()
    setSelectedConversations(
      selectedConversations.length === filteredConversations.length 
        ? [] 
        : filteredConversations.map(conv => conv._id || conv.id)
    )
  }

  const handleBulkDeleteConversations = async () => {
    if (selectedConversations.length === 0) {
      alert('Please select conversations to delete')
      return
    }

    if (window.confirm(`Are you sure you want to delete ${selectedConversations.length} conversation(s)? This action cannot be undone.`)) {
      try {
        // Try different endpoints - the API might use a different endpoint
        let deleted = false
        
        try {
          // Try bulk delete first
          await adminAPI.bulkDeleteConversations(selectedConversations, { reason: 'admin cleanup' })
          deleted = true
        } catch (bulkError) {
          console.log('Bulk delete failed, trying individual deletes:', bulkError)
          
          // If bulk delete fails, try individual deletes
          for (const convId of selectedConversations) {
            try {
              await adminAPI.deleteConversation(convId, 'admin cleanup')
            } catch (individualError) {
              console.error(`Failed to delete conversation ${convId}:`, individualError)
            }
          }
          deleted = true
        }
        
        if (deleted) {
          setSelectedConversations([])
          fetchData()
          alert(`${selectedConversations.length} conversation(s) deleted successfully!`)
        }
      } catch (error) {
        console.error('Bulk delete error:', error)
        alert(`Failed to delete conversations: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await adminAPI.deleteConversation(conversationId)
        fetchData()
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const getFilteredConversations = () => {
    const conversations = Array.isArray(data.conversations) ? data.conversations : []
    
    return conversations.filter(conv => {
      const matchesSearch = searchTerm === '' || 
        (conv.customerName || conv.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.lastMessage || conv.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.email || '').toLowerCase().includes(searchTerm.toLowerCase())

      // Get conversation type and check if it matches filter
      const convType = getConversationType(conv)
      const matchesType = conversationFilter === 'all' || convType.type === conversationFilter
      
      return matchesSearch && matchesType
    })
  }

  const getConversationType = (conversation) => {
    const message = (conversation.lastMessage || conversation.message || '').toLowerCase()
    
    // Priority-based type detection
    if (message.includes('complaint') || message.includes('issue') || message.includes('problem') || message.includes('error') || message.includes('bug')) {
      return { type: 'complaint', label: 'Complaint', color: 'red' }
    } else if (message.includes('booking') || message.includes('appointment') || message.includes('schedule') || message.includes('reserve')) {
      return { type: 'booking', label: 'Booking', color: 'green' }
    } else if (message.includes('price') || message.includes('cost') || message.includes('rate') || message.includes('charge') || message.includes('payment')) {
      return { type: 'pricing', label: 'Pricing', color: 'yellow' }
    } else if (message.includes('service') || message.includes('package') || message.includes('offer') || message.includes('deal')) {
      return { type: 'service', label: 'Service', color: 'purple' }
    } else if (message.includes('inquiry') || message.includes('question') || message.includes('information') || message.includes('query') || message.includes('ask')) {
      return { type: 'inquiry', label: 'Inquiry', color: 'blue' }
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('test') || message.includes('demo')) {
      return { type: 'general', label: 'General', color: 'gray' }
    } else if (message.includes('special') || message.includes('request') || message.includes('requirement') || message.includes('custom')) {
      return { type: 'general', label: 'General', color: 'gray' }
    } else {
      return { type: 'general', label: 'General', color: 'gray' }
    }
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateBooking(bookingId, { status: newStatus })
      setStatusDropdown(null) // Close dropdown
      fetchData() // Refresh data
    } catch (error) {
      console.error('Status change error:', error)
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified'
    
    // Handle various time formats
    if (typeof timeString === 'string') {
      // If it's already in a nice format, return it
      if (timeString.includes(':') && (timeString.includes('AM') || timeString.includes('PM'))) {
        return timeString
      }
      
      // If it's just a time like "14:30", format it
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour > 12 ? hour - 12 : hour
        return `${displayHour}:${minutes} ${ampm}`
      }
      
      // If it's a date string, extract time
      const dateObj = new Date(timeString)
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      }
    }
    
    return 'Not specified'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    
    try {
      const dateObj = new Date(dateString)
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    } catch (error) {
      console.error('Date formatting error:', error)
    }
    
    return dateString // Return original if formatting fails
  }

  const formatVisitorTime = (timeString) => {
    if (!timeString) return 'Unknown Time'
    
    try {
      const dateObj = new Date(timeString)
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
    } catch (error) {
      console.error('Time formatting error:', error)
    }
    
    return 'Unknown Time'
  }

  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-50 border-red-200 text-red-700'} rounded-lg p-6`}>
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p>{error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats />
      case 'bookings':
        return <BookingsCards />
      case 'conversations':
        return <ConversationsList />
      case 'todos':
        return <TodoList darkMode={darkMode} onTaskUpdate={handleTodoTaskUpdate} onTaskSelect={handleTodoTaskSelect} />
      case 'schedule':
        return <MonthlySchedule darkMode={darkMode} onTaskSelect={handleTodoTaskSelect} />
      case 'packages':
        return <PackagesManager />
      case 'settings':
        return <SettingsPanel />
      default:
        return <DashboardStats />
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className={`flex items-center justify-between h-16 px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>PG Films Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? darkMode 
                        ? 'bg-blue-900 text-blue-200 border-l-4 border-blue-500'
                        : 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs">{tab.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
          
          <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm border-b`}>
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Welcome back, Admin
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Todo Form Modal */}
      <AnimatePresence>
        {showTodoForm && (
          <TodoForm
            darkMode={darkMode}
            task={selectedTodoTask}
            onSave={handleTodoFormSave}
            onClose={() => {
              setShowTodoForm(false)
              setSelectedTodoTask(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfessionalAdminDashboard
