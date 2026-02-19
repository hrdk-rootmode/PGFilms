// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Email Preferences Component
// Customizable notification settings
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Bell,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Save,
  RefreshCw,
  Send,
  Settings,
  ChevronDown,
  ChevronUp,
  Info,
  Zap
} from 'lucide-react'

const EmailPreferences = ({ darkMode, onClose }) => {
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [message, setMessage] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    instant: true,
    scheduled: true,
    reports: false
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/automation/email-preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setPreferences(data.data)
      }
    } catch (err) {
      console.error('Preferences fetch error:', err)
      setMessage({ type: 'error', text: 'Failed to load preferences' })
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/automation/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(preferences)
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Preferences saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to save preferences' })
      }
    } catch (err) {
      console.error('Save preferences error:', err)
      setMessage({ type: 'error', text: 'Connection error' })
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async () => {
    try {
      setSendingTest(true)
      const response = await fetch('/api/automation/test-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Test email sent! Check your inbox.' })
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: 'error', text: 'Failed to send test email' })
      }
    } catch (err) {
      console.error('Test email error:', err)
      setMessage({ type: 'error', text: 'Connection error' })
    } finally {
      setSendingTest(false)
    }
  }

  const togglePreference = (category, key) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: key === 'enabled' ? !prev[category].enabled : prev[category].enabled,
        [key]: key !== 'enabled' ? !prev[category][key] : prev[category][key]
      }
    }))
  }

  const updatePreferenceValue = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const notificationTypes = {
    instant: [
      {
        key: 'newBooking',
        title: 'New Booking Alert',
        description: 'Get notified when a new booking is received',
        icon: Calendar,
        color: 'blue'
      },
      {
        key: 'highValueBooking',
        title: 'High-Value Booking',
        description: 'Special alert for bookings above threshold',
        icon: DollarSign,
        color: 'green',
        hasThreshold: true,
        thresholdKey: 'threshold',
        thresholdLabel: 'Minimum Value (₹)'
      },
      {
        key: 'bookingConfirmed',
        title: 'Booking Confirmed',
        description: 'When a booking status changes to confirmed',
        icon: CheckCircle,
        color: 'emerald'
      },
      {
        key: 'unreadMessages',
        title: 'Unread Messages',
        description: 'Alert when messages are waiting for response',
        icon: MessageSquare,
        color: 'purple',
        hasThreshold: true,
        thresholdKey: 'hoursWait',
        thresholdLabel: 'Wait Time (hours)'
      }
    ],
    scheduled: [
      {
        key: 'dailyBriefing',
        title: 'Daily Briefing',
        description: 'Morning summary of priorities and tasks',
        icon: Zap,
        color: 'amber',
        hasTime: true,
        timeKey: 'time'
      },
      {
        key: 'eventReminder',
        title: 'Event Reminder',
        description: 'Reminder before scheduled events',
        icon: Bell,
        color: 'orange',
        hasThreshold: true,
        thresholdKey: 'daysBefore',
        thresholdLabel: 'Days Before'
      },
      {
        key: 'overdueTasks',
        title: 'Overdue Tasks',
        description: 'Daily summary of overdue tasks',
        icon: AlertCircle,
        color: 'red',
        hasTime: true,
        timeKey: 'time'
      }
    ],
    reports: [
      {
        key: 'weeklySummary',
        title: 'Weekly Summary',
        description: 'Weekly performance report every Monday',
        icon: TrendingUp,
        color: 'indigo',
        hasTime: true,
        timeKey: 'time'
      },
      {
        key: 'monthlyReport',
        title: 'Monthly Report',
        description: 'Comprehensive monthly analytics report',
        icon: TrendingUp,
        color: 'violet',
        hasTime: true,
        timeKey: 'time'
      },
      {
        key: 'lowEngagement',
        title: 'Low Engagement Alert',
        description: 'Warning when booking activity drops',
        icon: AlertCircle,
        color: 'rose',
        hasThreshold: true,
        thresholdKey: 'daysThreshold',
        thresholdLabel: 'Days without bookings'
      }
    ]
  }

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl border shadow-lg p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading preferences...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl border shadow-lg overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Email Notifications
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Customize which notifications you receive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={sendTestEmail}
              disabled={sendingTest}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
              } transition-colors disabled:opacity-50`}
            >
              {sendingTest ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Test Email</span>
            </button>

            <button
              onClick={savePreferences}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Save</span>
            </button>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sections */}
      <div className="divide-y" style={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
        {Object.entries(notificationTypes).map(([sectionKey, notifications]) => (
          <div key={sectionKey}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(sectionKey)}
              className={`w-full p-4 flex items-center justify-between ${
                darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {sectionKey === 'instant' ? '⚡ Instant Notifications' : 
                   sectionKey === 'scheduled' ? '📅 Scheduled Notifications' : 
                   '📊 Reports'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {notifications.filter(n => preferences?.[n.key]?.enabled).length}/{notifications.length} enabled
                </span>
              </div>
              {expandedSections[sectionKey] ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Section Content */}
            <AnimatePresence>
              {expandedSections[sectionKey] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-4">
                    {notifications.map((notification) => {
                      const Icon = notification.icon
                      const isEnabled = preferences?.[notification.key]?.enabled

                      return (
                        <div
                          key={notification.key}
                          className={`p-4 rounded-lg border ${
                            darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
                          } ${!isEnabled ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-${notification.color}-100 dark:bg-${notification.color}-900/30`}>
                                <Icon className={`w-5 h-5 text-${notification.color}-600`} />
                              </div>
                              <div>
                                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h4>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {notification.description}
                                </p>

                                {/* Additional Settings */}
                                {isEnabled && (notification.hasThreshold || notification.hasTime) && (
                                  <div className="flex items-center gap-4 mt-3">
                                    {notification.hasThreshold && (
                                      <div className="flex items-center gap-2">
                                        <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {notification.thresholdLabel}:
                                        </label>
                                        <input
                                          type="number"
                                          value={preferences?.[notification.key]?.[notification.thresholdKey] || ''}
                                          onChange={(e) => updatePreferenceValue(
                                            notification.key,
                                            notification.thresholdKey,
                                            parseInt(e.target.value) || 0
                                          )}
                                          className={`w-20 px-2 py-1 text-sm rounded border ${
                                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                          }`}
                                        />
                                      </div>
                                    )}

                                    {notification.hasTime && (
                                      <div className="flex items-center gap-2">
                                        <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                          Time:
                                        </label>
                                        <input
                                          type="time"
                                          value={preferences?.[notification.key]?.[notification.timeKey] || '08:00'}
                                          onChange={(e) => updatePreferenceValue(
                                            notification.key,
                                            notification.timeKey,
                                            e.target.value
                                          )}
                                          className={`px-2 py-1 text-sm rounded border ${
                                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                          }`}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                              onClick={() => updatePreferenceValue(notification.key, 'enabled', !isEnabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isEnabled ? 'bg-blue-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'}`}>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Emails are sent to your admin email address. Times are in your local timezone (Asia/Kolkata).
            You can disable all emails by turning off individual notifications above.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default EmailPreferences