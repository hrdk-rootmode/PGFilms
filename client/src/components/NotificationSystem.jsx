import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, AlertTriangle, Info } from 'lucide-react'
import { adminAPI } from '../utils/api'

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get real-time data from dashboard
        const res = await adminAPI.getDashboard()
        if (res.data.success) {
          const data = res.data.data
          const newNotifications = []

          // Add booking notifications
          if (data.stats?.pendingBookings > 0) {
            newNotifications.push({
              id: 'pending-bookings',
              type: 'warning',
              title: 'Pending Bookings',
              message: `You have ${data.stats.pendingBookings} pending booking(s)`,
              timestamp: new Date(),
              icon: AlertTriangle,
              color: 'text-yellow-400'
            })
          }

          // Add new conversation notifications
          if (data.stats?.newConversations > 0) {
            newNotifications.push({
              id: 'new-conversations',
              type: 'info',
              title: 'New Conversations',
              message: `${data.stats.newConversations} new conversation(s) today`,
              timestamp: new Date(),
              icon: Info,
              color: 'text-blue-400'
            })
          }

          // Add learning pattern notifications
          if (data.pendingPatterns?.length > 0) {
            newNotifications.push({
              id: 'pending-patterns',
              type: 'info',
              title: 'Learning Patterns',
              message: `${data.pendingPatterns.length} pattern(s) need review`,
              timestamp: new Date(),
              icon: Check,
              color: 'text-green-400'
            })
          }

          setNotifications(newNotifications)
          setUnreadCount(newNotifications.length)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const getNotificationIcon = (notification) => {
    const Icon = notification.icon
    return <Icon size={16} className={notification.color} />
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button 
        className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl hover:bg-dark-700 transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-rose text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-400 hover:text-primary-300"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-dark-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-dark-700/50 transition-colors cursor-pointer"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                            {getNotificationIcon(notification)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-1 hover:bg-dark-600 rounded transition-colors"
                          >
                            <X size={14} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationSystem
