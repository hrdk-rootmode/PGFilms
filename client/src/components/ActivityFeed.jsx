// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Activity Feed Component
// Real-time timeline of bookings, conversations, and tasks
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminAPI } from '../utils/api'
import {
  Calendar,
  MessageSquare,
  CheckCircle,
  DollarSign,
  User,
  Clock,
  Phone,
  ChevronRight,
  RefreshCw,
  Filter,
  Bell,
  Star,
  AlertCircle,
  Package
} from 'lucide-react'

const ActivityFeed = ({ darkMode, onItemClick, limit = 10 }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, bookings, conversations

  useEffect(() => {
    fetchActivities()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getActivityFeed(limit)
      
      if (response.data?.success) {
        setActivities(response.data.data)
      }
    } catch (err) {
      console.error('Activity feed fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking':
        return { icon: Calendar, color: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30' }
      case 'conversation':
        return { icon: MessageSquare, color: 'purple', bg: 'bg-purple-100 dark:bg-purple-900/30' }
      case 'task':
        return { icon: CheckCircle, color: 'green', bg: 'bg-green-100 dark:bg-green-900/30' }
      case 'payment':
        return { icon: DollarSign, color: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
      default:
        return { icon: Bell, color: 'gray', bg: 'bg-gray-100 dark:bg-gray-800' }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
      case 'confirmed':
        return { text: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
      case 'completed':
        return { text: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
      default:
        return null
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return time.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    return activity.type === filter
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl border shadow-lg overflow-hidden`}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h3>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Live updates from your dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className={`flex items-center rounded-lg p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {[
                { value: 'all', label: 'All' },
                { value: 'booking', label: 'Bookings' },
                { value: 'conversation', label: 'Chats' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === option.value
                      ? 'bg-blue-500 text-white'
                      : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchActivities}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y" style={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
        {loading && activities.length === 0 ? (
          // Loading skeleton
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className="flex-1">
                  <div className={`h-4 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mb-2`} />
                  <div className={`h-3 w-1/2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No recent activity
            </p>
          </div>
        ) : (
          // Activity items
          <AnimatePresence>
            {filteredActivities.map((activity, index) => {
              const { icon: Icon, color, bg } = getActivityIcon(activity.type)
              const statusBadge = getStatusBadge(activity.status)

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onItemClick && onItemClick(activity)}
                  className={`p-4 ${onItemClick ? 'cursor-pointer' : ''} ${
                    darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                      <Icon className={`w-5 h-5 text-${color}-500`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                            {activity.title}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                            {activity.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Value badge */}
                          {activity.value && (
                            <span className={`text-sm font-semibold ${
                              darkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              ₹{activity.value.toLocaleString()}
                            </span>
                          )}

                          {/* Status badge */}
                          {statusBadge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.color}`}>
                              {statusBadge.text}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    {onItemClick && (
                      <ChevronRight className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* View All Link */}
      {activities.length >= limit && (
        <div className={`p-3 text-center border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button
            onClick={() => onItemClick && onItemClick({ type: 'viewAll' })}
            className={`text-sm font-medium ${
              darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            } transition-colors`}
          >
            View all activity →
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default ActivityFeed