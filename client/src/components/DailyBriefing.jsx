// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Daily Briefing Component
// Smart AI-powered priority dashboard card
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminAPI } from '../utils/api'
import {
  Sun,
  Moon,
  Cloud,
  Calendar,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Bell,
  Lightbulb,
  ChevronRight,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Coffee,
  Zap
} from 'lucide-react'

const DailyBriefing = ({ darkMode, onNavigate }) => {
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [greeting, setGreeting] = useState('')
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    fetchBriefing()
    setGreeting(getGreeting())
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Good morning', icon: Coffee, emoji: '☀️' }
    if (hour < 17) return { text: 'Good afternoon', icon: Sun, emoji: '🌤️' }
    if (hour < 21) return { text: 'Good evening', icon: Cloud, emoji: '🌆' }
    return { text: 'Working late', icon: Moon, emoji: '🌙' }
  }

  const fetchBriefing = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getDailyBriefing()
      
      if (response.data?.success) {
        setBriefing(response.data.data)
      } else {
        setError('Failed to load briefing')
      }
    } catch (err) {
      console.error('Briefing fetch error:', err)
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'high':
        return {
          bg: darkMode ? 'bg-red-900/30' : 'bg-red-50',
          border: 'border-red-500',
          text: darkMode ? 'text-red-400' : 'text-red-700',
          icon: 'text-red-500'
        }
      case 'medium':
        return {
          bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50',
          border: 'border-amber-500',
          text: darkMode ? 'text-amber-400' : 'text-amber-700',
          icon: 'text-amber-500'
        }
      default:
        return {
          bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50',
          border: 'border-blue-500',
          text: darkMode ? 'text-blue-400' : 'text-blue-700',
          icon: 'text-blue-500'
        }
    }
  }

  const getIcon = (iconName) => {
    const icons = {
      'calendar': Calendar,
      'bell': Bell,
      'dollar-sign': DollarSign,
      'check-circle': CheckCircle,
      'message-square': MessageSquare,
      'lightbulb': Lightbulb,
      'alert-circle': AlertCircle
    }
    return icons[iconName] || AlertCircle
  }

  const handlePriorityClick = (priority) => {
    const navigationMap = {
      'event_today': 'schedule',
      'event_tomorrow': 'schedule',
      'high_value_pending': 'bookings',
      'pending_bookings': 'bookings',
      'unread_conversations': 'conversations',
      'ai_insight': 'dashboard'
    }
    
    if (onNavigate && navigationMap[priority.type]) {
      onNavigate(navigationMap[priority.type])
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 border shadow-lg`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
          <div className="flex-1">
            <div className={`h-5 w-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`} />
            <div className={`h-4 w-48 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 border shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Unable to load briefing
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
            </div>
          </div>
          <button
            onClick={fetchBriefing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    )
  }

  const GreetingIcon = greeting.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${darkMode ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-100'} rounded-xl border shadow-lg overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}
              >
                {greeting.emoji} {greeting.text}!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {briefing.priorities?.length > 0 
                  ? `You have ${briefing.priorities.length} item${briefing.priorities.length > 1 ? 's' : ''} that need${briefing.priorities.length === 1 ? 's' : ''} attention`
                  : "All caught up! No urgent items today 🎉"}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBriefing}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 mt-4 pt-4 border-t border-dashed"
          style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${briefing.stats?.pendingBookings > 0 ? 'bg-amber-500' : 'bg-green-500'}`} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>{briefing.stats?.pendingBookings || 0}</strong> pending
            </span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${briefing.stats?.todayEvents > 0 ? 'bg-blue-500' : 'bg-gray-400'}`} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>{briefing.stats?.todayEvents || 0}</strong> today
            </span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${briefing.stats?.unreadConversations > 0 ? 'bg-purple-500' : 'bg-gray-400'}`} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>{briefing.stats?.unreadConversations || 0}</strong> unread
            </span>
          </div>
        </motion.div>
      </div>

      {/* Priorities List */}
      <AnimatePresence>
        {expanded && briefing.priorities?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-6"
          >
            <div className="space-y-3">
              {briefing.priorities.map((priority, index) => {
                const styles = getUrgencyStyles(priority.urgency)
                const Icon = getIcon(priority.icon)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => handlePriorityClick(priority)}
                    className={`${styles.bg} border-l-4 ${styles.border} rounded-lg p-4 cursor-pointer hover:scale-[1.02] transition-transform`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                        <Icon className={`w-5 h-5 ${styles.icon}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold ${styles.text}`}>
                            {priority.message}
                          </h4>
                          {priority.count > 1 && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                              {priority.count}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          → {priority.action}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* AI Insights */}
            {briefing.insights?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    AI Insight
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                  {briefing.insights[0].message}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {expanded && (!briefing.priorities || briefing.priorities.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 pb-6"
        >
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} text-center`}>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
              All caught up! 🎉
            </h4>
            <p className={`text-sm mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              No urgent items. Great job staying on top of things!
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DailyBriefing