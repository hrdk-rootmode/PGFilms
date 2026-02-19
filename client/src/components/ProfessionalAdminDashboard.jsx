// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Professional Admin Dashboard (AI-Enhanced)
// ═══════════════════════════════════════════════════════════════

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
  Search,
  Bell,
  BarChart3,
  ListTodo,
  TrendingUp,
  LayoutDashboard,
  Mail,
  Calendar as CalendarIcon,
  Flag,
  AlertCircle,
  Check
} from 'lucide-react'

// Import components
import DailyBriefing from './DailyBriefing'
import TrendChart from './TrendChart'
import ActivityFeed from './ActivityFeed'
import PackageManagement from './PackageManagement'
import TodoList from './TodoList.new'
import TableScheduler from './Scheduler.table.jsx'
import IntegratedTodoSchedule from './Scheduler.enhanced'
import ExcelCalendar from './Calendar.excel'
import ProfessionalCalendar from './Calendar.pro'
import MonthlySchedule from './MonthlySchedule'
import EmailPreferences from './EmailPreferences'
import BookingManagement from './BookingManagement'
import ConversationManagement from './ConversationManagement'

const ProfessionalAdminDashboard = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('pg-admin-theme')
    return savedTheme === 'dark'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    stats: {},
    growth: {}
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const [todos, setTodos] = useState([])
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false)

  // Navigation Items
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', description: 'Overview & Analytics', icon: LayoutDashboard },
    { id: 'bookings', name: 'Bookings', description: 'Manage Bookings', icon: Calendar },
    { id: 'conversations', name: 'Conversations', description: 'Customer Messages', icon: MessageSquare },
    { id: 'todos', name: 'Todo List', description: 'Task Management', icon: ListTodo },
    { id: 'schedule', name: 'Schedule', description: 'Monthly Calendar', icon: Calendar },
    { id: 'packages', name: 'Packages', description: 'Service Packages', icon: Package },
    { id: 'notifications', name: 'Notifications', description: 'Email Settings', icon: Mail },
    { id: 'settings', name: 'Settings', description: 'System Settings', icon: Settings }
  ]

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch Dashboard Stats
      const statsPromise = adminAPI.getDashboard()
      
      // Fetch Growth Metrics
      const growthPromise = adminAPI.getGrowthMetrics()
      
      const [statsRes, growthRes] = await Promise.all([statsPromise, growthPromise])
      
      setData({
        stats: statsRes.data?.data?.stats || {},
        growth: growthRes.data?.data || {}
      })
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    loadTodos()
    
    // Theme application
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('pg-admin-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Todo Management
  const loadTodos = () => {
    const savedTodos = localStorage.getItem('pg-todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    } else {
      // Initialize with sample tasks
      const initialTodos = [
        {
          id: 1,
          title: 'Edit wedding photos - Johnson family',
          description: 'Complete editing 200+ photos from weekend wedding shoot',
          category: 'editing',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '4 hours',
          client: 'Johnson Family',
          reminder: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Client meeting - Corporate headshots',
          description: 'Discuss requirements and schedule for corporate photoshoot',
          category: 'meeting',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '1 hour',
          client: 'Tech Corp',
          reminder: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Backup this week\'s photos',
          description: 'Upload all photos from this week to cloud backup',
          category: 'backup',
          priority: 'medium',
          status: 'in_progress',
          dueDate: new Date().toISOString(),
          estimatedTime: '30 minutes',
          reminder: false,
          createdAt: new Date().toISOString()
        }
      ]
      setTodos(initialTodos)
      localStorage.setItem('pg-todos', JSON.stringify(initialTodos))
    }
  }

  const toggleTaskStatus = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, status: todo.status === 'completed' ? 'pending' : 'completed' }
        : todo
    )
    setTodos(updatedTodos)
    localStorage.setItem('pg-todos', JSON.stringify(updatedTodos))
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await adminAPI.logout()
      localStorage.removeItem('adminToken')
      window.location.href = '/admin'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Dashboard Tab Content
  const DashboardContent = () => (
    <div className="space-y-6">
      {/* 1. Daily Briefing Card (AI Powered) */}
      <DailyBriefing darkMode={darkMode} onNavigate={setActiveTab} />

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 border shadow-lg`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Revenue</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                ₹{data.growth?.revenue?.current?.toLocaleString() || 0}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`${data.growth?.revenue?.growth >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
              {data.growth?.revenue?.growth > 0 ? '+' : ''}{data.growth?.revenue?.growth || 0}%
            </span>
            <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>vs last month</span>
          </div>
        </motion.div>

        {/* Active Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 border shadow-lg`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Bookings</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {data.stats.pendingBookings + data.stats.confirmedBookings || 0}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`${data.growth?.bookings?.growth >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
              {data.growth?.bookings?.growth > 0 ? '+' : ''}{data.growth?.bookings?.growth || 0}%
            </span>
            <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>vs last month</span>
          </div>
        </motion.div>

        {/* Conversion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 border shadow-lg`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conversion Rate</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {data.growth?.conversionRate?.current || 0}%
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Based on inquiries
          </p>
        </motion.div>

        {/* Unread Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 border shadow-lg`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unread Messages</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {data.stats.newConversations || 0}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Waiting for response
          </p>
        </motion.div>
      </div>

        {/* 3. Charts & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <TrendChart 
            darkMode={darkMode} 
            type="bookings" 
            title="Booking Trends" 
          />
          <TrendChart 
            darkMode={darkMode} 
            type="revenue" 
            title="Revenue Growth" 
          />
        </div>

        {/* Activity Feed (1/3 width) */}
        <div className="lg:col-span-1">
          <ActivityFeed 
            darkMode={darkMode} 
            limit={8}
            onItemClick={(item) => {
              if (item.type === 'booking') setActiveTab('bookings')
              else if (item.type === 'conversation') setActiveTab('conversations')
            }}
          />
        </div>
      </div>

      {/* 4. Right-side Task Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Task Panel (3/4 width) */}
        <div className="lg:col-span-3">
          <div className={`rounded-xl p-6 border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          } shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Task Management
              </h3>
              <div className="flex gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  {todos.filter(t => t.status === 'pending').length} Pending
                </span>
                <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                  {todos.filter(t => t.status === 'completed').length} Completed
                </span>
              </div>
            </div>
            
            {/* Task Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Daily Tasks */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Daily Tasks</h4>
                  <span className={`ml-auto px-2 py-1 rounded text-xs ${
                    darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {todos.filter(t => t.category === 'editing' || t.category === 'backup' || t.category === 'maintenance').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {todos
                    .filter(t => ['editing', 'backup', 'maintenance'].includes(t.category))
                    .slice(0, 3)
                    .map(todo => (
                      <div key={todo.id} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTaskStatus(todo.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            todo.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : darkMode ? 'border-gray-500' : 'border-gray-300'
                          }`}
                        >
                          {todo.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-sm truncate ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        } ${todo.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                          {todo.title}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Monthly Targets */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Flag className="w-4 h-4 text-purple-500" />
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Targets</h4>
                  <span className={`ml-auto px-2 py-1 rounded text-xs ${
                    darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {todos.filter(t => t.category === 'marketing' || t.category === 'communication').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {todos
                    .filter(t => ['marketing', 'communication'].includes(t.category))
                    .slice(0, 3)
                    .map(todo => (
                      <div key={todo.id} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTaskStatus(todo.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            todo.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : darkMode ? 'border-gray-500' : 'border-gray-300'
                          }`}
                        >
                          {todo.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-sm truncate ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        } ${todo.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                          {todo.title}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* High Priority */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>High Priority</h4>
                  <span className={`ml-auto px-2 py-1 rounded text-xs ${
                    darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    {todos.filter(t => t.priority === 'high' && t.status !== 'completed').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {todos
                    .filter(t => t.priority === 'high' && t.status !== 'completed')
                    .slice(0, 3)
                    .map(todo => (
                      <div key={todo.id} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTaskStatus(todo.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            todo.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : darkMode ? 'border-gray-500' : 'border-gray-300'
                          }`}
                        >
                          {todo.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-sm truncate ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        } ${todo.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                          {todo.title}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('todos')}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  darkMode 
                    ? 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600'
                }`}
              >
                View All Tasks
              </button>
              <button
                onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  darkMode 
                    ? 'bg-purple-600 border-purple-700 text-white hover:bg-purple-700' 
                    : 'bg-purple-500 border-purple-600 text-white hover:bg-purple-600'
                }`}
              >
                AI Suggestions
              </button>
            </div>
          </div>
        </div>

        {/* Pending Tasks Widget (1/4 width) */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl p-4 border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          } shadow-lg sticky top-24`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Pending Tasks
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
              }`}>
                {todos.filter(t => t.status === 'pending').length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {todos
                .filter(t => t.status === 'pending')
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 }
                  return priorityOrder[a.priority] - priorityOrder[b.priority]
                })
                .slice(0, 8)
                .map(todo => (
                  <div key={todo.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleTaskStatus(todo.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        todo.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : darkMode ? 'border-gray-500 group-hover:border-green-500' : 'border-gray-300 group-hover:border-green-500'
                      }`}
                    >
                      {todo.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {todo.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className={`px-1 rounded ${
                          todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                          todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {todo.priority}
                        </span>
                        {todo.category && (
                          <span className={`${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            • {todo.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {todos.filter(t => t.status === 'pending').length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                All tasks completed! 🎉
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  {Math.round((todos.filter(t => t.status === 'completed').length / todos.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${todos.length > 0 ? (todos.filter(t => t.status === 'completed').length / todos.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Main Render Logic
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />
      case 'bookings':
        return <BookingManagement darkMode={darkMode} />
      case 'conversations':
        return <ConversationManagement darkMode={darkMode} />
      case 'todos':
        return <TodoList darkMode={darkMode} />
      case 'schedule':
        return <TableScheduler darkMode={darkMode} />
      case 'calendar-pro':
        return <ProfessionalCalendar darkMode={darkMode} />
      case 'packages':
        return <PackageManagement darkMode={darkMode} adminAPI={adminAPI} />
      case 'notifications':
        return <EmailPreferences darkMode={darkMode} />
      case 'settings':
        return <div>Settings Component Placeholder</div>
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            PG Films Admin
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                    : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs opacity-70">{tab.description}</div>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className={`h-16 flex items-center justify-between px-6 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} sticky top-0 z-40`}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Bell className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default ProfessionalAdminDashboard