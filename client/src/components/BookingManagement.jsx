// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Booking Management Component
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminAPI } from '../utils/api'
import {
  Calendar,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Package,
  User
} from 'lucide-react'

const BookingManagement = ({ darkMode }) => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [updatingBooking, setUpdatingBooking] = useState(null)
  const [activeDropdown, setActiveDropdown] = useState(null)

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminAPI.getBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      })
      
      console.log('API Response:', response) // Debug log
      
      let bookingsData = []
      
      // Handle different response structures
      if (response.data?.data?.bookings && Array.isArray(response.data.data.bookings)) {
        bookingsData = response.data.data.bookings
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        bookingsData = response.data.data
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data
      } else if (response.data?.success && response.data?.data) {
        bookingsData = Array.isArray(response.data.data) ? response.data.data : []
      } else {
        console.warn('Unexpected API response structure:', response.data)
        bookingsData = []
      }
      
      // Enhanced data processing
      const processedBookings = bookingsData.map(booking => {
        // Ensure all required fields are present
        return {
          _id: booking._id || booking.id || Math.random().toString(36).substr(2, 9),
          name: booking.name || booking.customerName || 'Unknown Customer',
          phone: booking.phone || booking.phoneNumber || booking.contact || '',
          email: booking.email || '',
          eventDate: booking.eventDate || booking.date || booking.bookingDate || null,
          packageName: booking.packageName || booking.package || booking.service || 'Not specified',
          price: booking.price || booking.amount || booking.totalAmount || booking.packagePrice || booking.package?.price || booking.value || 0,
          paidAmount: booking.paidAmount || booking.advance || booking.paid || 0,
          balanceAmount: booking.balanceAmount || (booking.price || 0) - (booking.paidAmount || 0),
          status: booking.status || 'pending',
          location: booking.location || booking.venue || '',
          duration: booking.duration || booking.eventDuration || '',
          guestCount: booking.guestCount || booking.guests || booking.numberOfGuests || '',
          message: booking.message || booking.customerMessage || booking.notes || '',
          notes: booking.adminNotes || booking.internalNotes || '',
          createdAt: booking.createdAt || booking.created_at || new Date().toISOString(),
          updatedAt: booking.updatedAt || booking.updated_at || new Date().toISOString()
        }
      })
      
      console.log('Processed bookings:', processedBookings) // Debug log
      setBookings(processedBookings)
      
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError(error.message || 'Failed to fetch bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [statusFilter, searchTerm])

  // Enhanced filtering function
  const filteredBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return []
    
    let filtered = bookings
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => 
        booking.status === statusFilter
      )
    }
    
    // Search filter - search across multiple fields
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(booking => 
        booking.name?.toLowerCase().includes(searchLower) ||
        booking.phone?.includes(searchLower) ||
        booking.email?.toLowerCase().includes(searchLower) ||
        booking.packageName?.toLowerCase().includes(searchLower) ||
        booking.location?.toLowerCase().includes(searchLower) ||
        booking.message?.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered
  }, [bookings, statusFilter, searchTerm])

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Bookings', count: bookings.length },
    { value: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { value: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
  ]
  const updateBookingStatus = async (bookingId, newStatus, notes = '') => {
    try {
      setUpdatingBooking(bookingId)
      await adminAPI.updateBooking(bookingId, { status: newStatus, notes })
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus, notes, updatedAt: new Date() }
          : booking
      ))
      
      setUpdatingBooking(null)
      setExpandedBooking(null)
    } catch (err) {
      console.error('Error updating booking:', err)
      setError('Failed to update booking')
      setUpdatingBooking(null)
    }
  }

  // Delete booking
  const deleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    
    try {
      await adminAPI.deleteBooking(bookingId)
      setBookings(prev => prev.filter(booking => booking._id !== bookingId))
      setExpandedBooking(null)
    } catch (err) {
      console.error('Error deleting booking:', err)
      setError('Failed to delete booking')
    }
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock, label: 'Pending' },
      confirmed: { color: 'green', icon: CheckCircle, label: 'Confirmed' },
      cancelled: { color: 'red', icon: XCircle, label: 'Cancelled' },
      completed: { color: 'blue', icon: CheckCircle, label: 'Completed' }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  // Booking card component
  const BookingCard = ({ booking }) => {
    const isExpanded = expandedBooking === booking._id
    const isUpdating = updatingBooking === booking._id
    const isDropdownActive = activeDropdown === booking._id

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(amount || 0)
    }

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'Not specified'
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Status options for dropdown
    const statusOptions = [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'confirmed', label: 'Confirmed', color: 'green' },
      { value: 'completed', label: 'Completed', color: 'blue' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ]

    // WhatsApp message
    const openWhatsApp = () => {
      const message = `Hello ${booking.name || 'Customer'},\n\nI'm contacting you regarding your booking for ${booking.packageName || 'your event'} on ${formatDate(booking.eventDate)}.\n\nBooking Details:\n• Package: ${booking.packageName || 'Not specified'}\n• Date: ${formatDate(booking.eventDate)}\n• Price: ${formatCurrency(booking.price)}\n\nPlease let me know if you have any questions.\n\nThank you!`
      const phoneNumber = booking.phone?.replace(/\D/g, '') // Remove non-digits
      if (phoneNumber) {
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
      } else {
        alert('Phone number not available')
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-md hover:shadow-lg transition-all duration-200`}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {booking.name || 'Unknown Customer'}
                </h3>
                <StatusBadge status={booking.status} />
              </div>
              
              {/* Quick Info */}
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {booking.phone || 'No phone'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {formatDate(booking.eventDate)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {booking.packageName || 'No package'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right ml-4">
              <p className={`font-bold text-lg ${darkMode ? 'text-green-400' : 'text-green-600'} bg-green-500/10 rounded px-2 py-1 text-right`}>
                {formatCurrency(booking.price || 0)}
              </p>
              {booking.paidAmount && (
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 text-right`}>
                  Paid: {formatCurrency(booking.paidAmount)}
                </p>
              )}
              {booking.balanceAmount && (
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 text-right`}>
                  Balance: {formatCurrency(booking.balanceAmount)}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              {/* WhatsApp */}
              <button
                onClick={openWhatsApp}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.221-.446.347-.674.446-.297.149-.588.074-.644-.034-.056-.109-.657-1.653-.904-2.267-.242-.598-.487-.517-.674-.517-.173 0-.347 0-.521.015-.174.014-.446.149-.674.596-.227.447-.867 1.688-.867 2.386 0 .698.521 1.372.596 1.48.074.109.1.373.024.736-.076.363-.297 1.423-.446 1.941-.149.518-.149.966-.446 1.48-.297.514-.596.897-.596 1.48 0 .583.596 1.139 1.48 1.953.884.814 1.953 1.48 2.305.352.297.674.446 1.139.446.465 0 .897-.149 1.139-.446.242-.297.446-.897.446-1.48 0-.297-.149-.674-.446-1.139z"/>
                    <path d="M20.52 3.449C18.397 1.32 15.543 0 12.48 0 9.417 0 6.563 1.32 4.44 3.449 2.317 5.578 1 8.432 1 11.495c0 2.027.674 3.906 1.816 5.418l-.235.868-1.139 4.236 4.236-1.139.868-.235c1.512 1.142 3.391 1.816 5.418 1.816 3.063 0 5.917-1.32 8.04-3.449 2.123-2.129 3.449-4.983 3.449-8.046 0-3.063-1.326-5.917-3.449-8.04z"/>
                  </svg>
                  <span>Chat</span>
                </div>
              </button>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(isDropdownActive ? null : booking._id)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isUpdating 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Edit className="w-3 h-3" />
                      <span>Status</span>
                    </div>
                  )}
                </button>
                
                {/* Dropdown */}
                {isDropdownActive && !isUpdating && (
                  <div className={`absolute top-full left-0 mt-1 w-32 rounded-lg shadow-lg border z-10 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {statusOptions.map((option, index) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateBookingStatus(booking._id, option.value)
                          setActiveDropdown(null)
                        }}
                        disabled={booking.status === option.value}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          booking.status === option.value
                            ? darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
              className={`p-1.5 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`border-t border-gray-200 dark:border-gray-700 mt-3 pt-3`}
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email:</span>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-900'}>{booking.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location:</span>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-900'}>{booking.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duration:</span>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-900'}>{booking.duration || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Guests:</span>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-900'}>{booking.guestCount || 'Not specified'}</p>
                  </div>
                </div>

                {booking.message && (
                  <div className="mt-3">
                    <span className={`font-medium text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Message:</span>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{booking.message}</p>
                  </div>
                )}

                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => deleteBooking(booking._id)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    <div className="flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Booking Management
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
              {option.count > 0 && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20">
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Bookings List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!Array.isArray(filteredBookings) || filteredBookings.length === 0 ? (
            <div className={`col-span-full text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No bookings found
            </div>
          ) : (
            filteredBookings.map((booking, index) => (
              <BookingCard key={`booking-${booking._id || booking.id || index}`} booking={booking} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default BookingManagement
