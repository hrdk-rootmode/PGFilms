import React, { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Camera,
  Users,
  Settings,
  AlertTriangle
} from 'lucide-react'
import { adminAPI } from '../utils/api'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pg-notification-settings')
    return saved ? JSON.parse(saved) : {
      taskReminders: true,
      deadlineAlerts: true,
      dailySummary: true,
      weeklyReport: true,
      habitReminders: true,
      soundEnabled: true,
      desktopNotifications: true
    }
  })

  useEffect(() => {
    localStorage.setItem('pg-notification-settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    // Request notification permission on user interaction
    const requestNotificationPermission = () => {
      if ('Notification' in window && settings.desktopNotifications && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission)
        })
      }
    }

    // Add click listener to request permission on first user interaction
    const handleUserInteraction = () => {
      requestNotificationPermission()
      document.removeEventListener('click', handleUserInteraction)
    }

    if (Notification.permission === 'default') {
      document.addEventListener('click', handleUserInteraction, { once: true })
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction)
    }
  }, [settings.desktopNotifications])

  const addNotification = (notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show desktop notification if enabled
    if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: id
      })
    }
    
    // Play sound if enabled
    if (settings.soundEnabled) {
      const audio = new Audio('/notification-sound.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {})
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Automation functions
  const checkTaskDeadlines = (tasks) => {
    if (!settings.deadlineAlerts) return
    
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    tasks.forEach(task => {
      if (task.dueDate && task.status !== 'completed') {
        const dueDate = new Date(task.dueDate)
        const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60)
        
        if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
          addNotification({
            type: 'deadline',
            title: 'Task Due Soon',
            message: `"${task.title}" is due in ${Math.round(hoursUntilDue)} hours`,
            priority: 'high',
            icon: <Clock className="w-5 h-5" />
          })
        }
      }
    })
  }

  const checkDailyHabits = (habitsData) => {
    if (!settings.habitReminders) return
    
    const today = new Date().toISOString().split('T')[0]
    const todayHabits = habitsData.protocols?.[today] || {}
    const completedCount = Object.keys(todayHabits).length
    
    if (completedCount === 0) {
      addNotification({
        type: 'habit',
        title: 'Daily Habits Reminder',
        message: 'Don\'t forget to track your daily habits!',
        priority: 'medium',
        icon: <Target className="w-5 h-5" />
      })
    }
  }

  const sendDailySummary = (todos, habitsData) => {
    if (!settings.dailySummary) return
    
    const completedTasks = todos.filter(t => t.status === 'completed').length
    const pendingTasks = todos.filter(t => t.status === 'pending').length
    const today = new Date().toISOString().split('T')[0]
    const todayPoints = Object.values(habitsData.customTasks?.[today] || {})
      .filter(task => task.completed).length * 5
    
    addNotification({
      type: 'summary',
      title: 'Daily Summary',
      message: `Completed: ${completedTasks} tasks, Pending: ${pendingTasks} tasks, Points: ${todayPoints}`,
      priority: 'low',
      icon: <TrendingUp className="w-5 h-5" />
    })
  }

  const sendWeeklyReport = (todos, habitsData) => {
    if (!settings.weeklyReport) return
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weekTasks = todos.filter(t => new Date(t.createdAt) >= weekAgo)
    const completedThisWeek = weekTasks.filter(t => t.status === 'completed').length
    
    addNotification({
      type: 'report',
      title: 'Weekly Report',
      message: `This week: ${completedThisWeek} tasks completed out of ${weekTasks.length}`,
      priority: 'low',
      icon: <Calendar className="w-5 h-5" />
    })
  }

  const value = {
    notifications,
    settings,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    checkTaskDeadlines,
    checkDailyHabits,
    sendDailySummary,
    sendWeeklyReport,
    updateSettings: setSettings
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

const NotificationContainer = () => {
  const { notifications, removeNotification, markAsRead } = useNotifications()
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.slice(0, 5).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`p-4 rounded-lg shadow-lg border cursor-pointer ${
              notification.priority === 'high' ? 'border-red-200 bg-red-50' :
              notification.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            } dark:border-gray-700 dark:bg-gray-800`}
            onClick={() => {
              markAsRead(notification.id)
              removeNotification(notification.id)
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${
                notification.priority === 'high' ? 'text-red-500' :
                notification.priority === 'medium' ? 'text-yellow-500' :
                'text-blue-500'
              }`}>
                {notification.icon || <Bell className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${
                  notification.priority === 'high' ? 'text-red-900 dark:text-red-100' :
                  notification.priority === 'medium' ? 'text-yellow-900 dark:text-yellow-100' :
                  'text-blue-900 dark:text-blue-100'
                }`}>
                  {notification.title}
                </h4>
                <p className={`text-sm mt-1 ${
                  notification.priority === 'high' ? 'text-red-700 dark:text-red-200' :
                  notification.priority === 'medium' ? 'text-yellow-700 dark:text-yellow-200' :
                  'text-blue-700 dark:text-blue-200'
                }`}>
                  {notification.message}
                </p>
                <div className={`text-xs mt-2 ${
                  notification.priority === 'high' ? 'text-red-600 dark:text-red-300' :
                  notification.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-300' :
                  'text-blue-600 dark:text-blue-300'
                }`}>
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeNotification(notification.id)
                }}
                className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  notification.priority === 'high' ? 'text-red-500' :
                  notification.priority === 'medium' ? 'text-yellow-500' :
                  'text-blue-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export const NotificationSettings = () => {
  const { settings, updateSettings } = useNotifications()
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Settings</h3>
      
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Task Reminders</span>
          <input
            type="checkbox"
            checked={settings.taskReminders}
            onChange={(e) => updateSettings({...settings, taskReminders: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
        
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Deadline Alerts</span>
          <input
            type="checkbox"
            checked={settings.deadlineAlerts}
            onChange={(e) => updateSettings({...settings, deadlineAlerts: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
        
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Daily Summary</span>
          <input
            type="checkbox"
            checked={settings.dailySummary}
            onChange={(e) => updateSettings({...settings, dailySummary: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
        
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Weekly Report</span>
          <input
            type="checkbox"
            checked={settings.weeklyReport}
            onChange={(e) => updateSettings({...settings, weeklyReport: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
        
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Habit Reminders</span>
          <input
            type="checkbox"
            checked={settings.habitReminders}
            onChange={(e) => updateSettings({...settings, habitReminders: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
        
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Sound Effects</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({...settings, soundEnabled: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
        
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Desktop Notifications</span>
          <input
            type="checkbox"
            checked={settings.desktopNotifications}
            onChange={(e) => updateSettings({...settings, desktopNotifications: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  )
}

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
