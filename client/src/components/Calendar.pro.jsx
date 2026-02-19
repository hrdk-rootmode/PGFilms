import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  Users,
  Camera,
  Target,
  Phone,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  Minus,
  Maximize2,
  Minimize2,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Save
} from 'lucide-react'

const ProfessionalCalendar = ({ darkMode, todos = [], onTaskUpdate, onTaskSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [draggedTask, setDraggedTask] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [viewMode, setViewMode] = useState('habits') // 'habits' or 'tasks'
  const [showSettings, setShowSettings] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAddRow, setShowAddRow] = useState(false)
  const [showAddColumn, setShowAddColumn] = useState(false)

  // Professional habits/tracking configuration
  const [habitsConfig, setHabitsConfig] = useState(() => {
    const saved = localStorage.getItem('pg-habits-config')
    return saved ? JSON.parse(saved) : {
      protocols: [
        { id: 'meditation', name: 'Meditation', icon: '🧘', points: 10, color: 'purple' },
        { id: 'workout', name: 'Workout', icon: '💪', points: 15, color: 'red' },
        { id: 'no-junk', name: 'No junk/Fast Food', icon: '🥗', points: 10, color: 'green' },
        { id: 'reading', name: 'Read 10 page Daily', icon: '📚', points: 10, color: 'blue' },
        { id: 'screen-time', name: 'Under 2.5Hrs of Screen Time', icon: '📱', points: 10, color: 'yellow' },
        { id: 'deep-work', name: '6Hrs Of Deep Work', icon: '🎯', points: 20, color: 'indigo' }
      ],
      sleep: [
        { id: '9h', name: '9 hours', icon: '😴', points: 15, color: 'blue' },
        { id: '8h', name: '8 hours', icon: '😊', points: 12, color: 'green' },
        { id: '7h', name: '7 hours', icon: '🙂', points: 8, color: 'yellow' },
        { id: '6h', name: '6 hours', icon: '😐', points: 5, color: 'orange' },
        { id: '5h', name: '5 hours', icon: '😰', points: 2, color: 'red' }
      ]
    }
  })

  // Daily tracking data
  const [habitsData, setHabitsData] = useState(() => {
    const saved = localStorage.getItem('pg-habits-data')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        protocols: parsed.protocols || {},
        sleep: parsed.sleep || {},
        customTasks: parsed.customTasks || {}
      }
    }
    return {
      protocols: {},
      sleep: {},
      customTasks: {}
    }
  })

  // Custom rows and columns management
  const [customRows, setCustomRows] = useState(() => {
    const saved = localStorage.getItem('pg-custom-rows')
    return saved ? JSON.parse(saved) : []
  })
  
  const [customColumns, setCustomColumns] = useState(() => {
    const saved = localStorage.getItem('pg-custom-columns')
    return saved ? JSON.parse(saved) : []
  })

  // Custom tasks management
  const [customTasks, setCustomTasks] = useState(() => {
    const saved = localStorage.getItem('pg-custom-tasks')
    return saved ? JSON.parse(saved) : []
  })

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate))
      startDate.setDate(startDate.getDate() + 1)
    }
    return days
  }

  const getTasksForDate = (date) => {
    return todos.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date) => {
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    )
  }

  const getDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const toggleHabit = (category, habitId, date) => {
    const dateStr = getDateString(date)
    setHabitsData(prev => {
      const updated = { ...prev }
      if (!updated[category][dateStr]) {
        updated[category][dateStr] = {}
      }
      if (!updated[category][dateStr][habitId]) {
        updated[category][dateStr][habitId] = true
      } else {
        delete updated[category][dateStr][habitId]
      }
      localStorage.setItem('pg-habits-data', JSON.stringify(updated))
      return updated
    })
  }

  const getHabitStatus = (category, habitId, date) => {
    const dateStr = getDateString(date)
    return habitsData[category][dateStr]?.[habitId] || false
  }

  const calculateTotalPoints = (date) => {
    const dateStr = getDateString(date)
    let points = 0
    
    // Protocol points
    habitsConfig.protocols.forEach(protocol => {
      if (getHabitStatus('protocols', protocol.id, date)) {
        points += protocol.points
      }
    })
    
    // Sleep points
    habitsConfig.sleep.forEach(sleep => {
      if (getHabitStatus('sleep', sleep.id, date)) {
        points += sleep.points
      }
    })
    
    // Custom task points - safe check
    if (habitsData.customTasks && habitsData.customTasks[dateStr]) {
      Object.values(habitsData.customTasks[dateStr]).forEach(task => {
        if (task && task.completed) {
          points += task.points || 5
        }
      })
    }
    
    return points
  }

  const addCustomTask = (task) => {
    const newTask = {
      id: Date.now(),
      ...task,
      createdAt: new Date().toISOString()
    }
    const updatedTasks = [...customTasks, newTask]
    setCustomTasks(updatedTasks)
    localStorage.setItem('pg-custom-tasks', JSON.stringify(updatedTasks))
  }

  const addCustomRow = (row) => {
    const newRow = {
      id: Date.now(),
      ...row,
      createdAt: new Date().toISOString()
    }
    const updatedRows = [...customRows, newRow]
    setCustomRows(updatedRows)
    localStorage.setItem('pg-custom-rows', JSON.stringify(updatedRows))
  }
  
  const addCustomColumn = (column) => {
    const newColumn = {
      id: Date.now(),
      ...column,
      createdAt: new Date().toISOString()
    }
    const updatedColumns = [...customColumns, newColumn]
    setCustomColumns(updatedColumns)
    localStorage.setItem('pg-custom-columns', JSON.stringify(updatedColumns))
  }
  
  const deleteCustomRow = (id) => {
    const updatedRows = customRows.filter(row => row.id !== id)
    setCustomRows(updatedRows)
    localStorage.setItem('pg-custom-rows', JSON.stringify(updatedRows))
  }
  
  const deleteCustomColumn = (id) => {
    const updatedColumns = customColumns.filter(col => col.id !== id)
    setCustomColumns(updatedColumns)
    localStorage.setItem('pg-custom-columns', JSON.stringify(updatedColumns))
  }

  const toggleCustomTask = (taskId, date) => {
    const dateStr = getDateString(date)
    setHabitsData(prev => {
      const updated = { ...prev }
      if (!updated.customTasks[dateStr]) {
        updated.customTasks[dateStr] = {}
      }
      if (!updated.customTasks[dateStr][taskId]) {
        updated.customTasks[dateStr][taskId] = { completed: true, completedAt: new Date().toISOString() }
      } else {
        delete updated.customTasks[dateStr][taskId]
      }
      localStorage.setItem('pg-habits-data', JSON.stringify(updated))
      return updated
    })
  }

  const getCustomTaskStatus = (taskId, date) => {
    const dateStr = getDateString(date)
    return habitsData.customTasks[dateStr]?.[taskId]?.completed || false
  }

  const exportData = () => {
    const data = {
      habitsData,
      habitsConfig,
      customTasks,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habits-tracker-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          setHabitsData(data.habitsData || {})
          setHabitsConfig(data.habitsConfig || habitsConfig)
          setCustomTasks(data.customTasks || [])
          localStorage.setItem('pg-habits-data', JSON.stringify(data.habitsData || {}))
          localStorage.setItem('pg-habits-config', JSON.stringify(data.habitsConfig || habitsConfig))
          localStorage.setItem('pg-custom-tasks', JSON.stringify(data.customTasks || []))
        } catch (error) {
          console.error('Error importing data:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const resetMonth = () => {
    if (confirm('Are you sure you want to reset this month\'s data?')) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      setHabitsData(prev => {
        const updated = { ...prev }
        for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
          const dateStr = getDateString(new Date(d))
          delete updated.protocols[dateStr]
          delete updated.sleep[dateStr]
          delete updated.customTasks[dateStr]
        }
        localStorage.setItem('pg-habits-data', JSON.stringify(updated))
        return updated
      })
    }
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetDate) => {
    e.preventDefault()
    if (draggedTask) {
      const updatedTask = {
        ...draggedTask,
        dueDate: targetDate.toISOString()
      }
      onTaskUpdate && onTaskUpdate(todos.map(task => 
        task.id === draggedTask.id ? updatedTask : task
      ))
      setDraggedTask(null)
    }
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={`${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } rounded-xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Professional Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={exportData}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Export Data"
            >
              <Download className="w-5 h-5" />
            </button>
            <label className={`p-2 rounded-lg cursor-pointer ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`} title="Import Data">
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            <button
              onClick={resetMonth}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Reset Month"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Motivational Title */}
        <div className="text-center mb-4">
          <h3 className={`text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent`}>
            Getting 1% Better Each Day
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Track your daily habits and build consistency
          </p>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    View Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('habits')}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        viewMode === 'habits'
                          ? 'bg-purple-600 text-white'
                          : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Habits
                    </button>
                    <button
                      onClick={() => setViewMode('tasks')}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        viewMode === 'tasks'
                          ? 'bg-purple-600 text-white'
                          : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Tasks
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Display
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        isExpanded
                          ? 'bg-blue-600 text-white'
                          : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isExpanded ? 'Expanded' : 'Compact'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Manage
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddRow(!showAddRow)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        showAddRow
                          ? 'bg-green-600 text-white'
                          : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Add Row
                    </button>
                    <button
                      onClick={() => setShowAddColumn(!showAddColumn)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        showAddColumn
                          ? 'bg-blue-600 text-white'
                          : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Add Column
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Calendar Grid */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Add Row Form */}
          <AnimatePresence>
            {showAddRow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add Custom Row
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Row name..."
                    className={`px-3 py-2 rounded border text-sm ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    id="rowName"
                  />
                  <input
                    type="text"
                    placeholder="Icon (emoji)..."
                    className={`px-3 py-2 rounded border text-sm ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    id="rowIcon"
                  />
                  <button
                    onClick={() => {
                      const name = document.getElementById('rowName').value
                      const icon = document.getElementById('rowIcon').value || '📋'
                      if (name) {
                        addCustomRow({ name, icon, type: 'custom' })
                        document.getElementById('rowName').value = ''
                        document.getElementById('rowIcon').value = ''
                        setShowAddRow(false)
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Row
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Column Form */}
          <AnimatePresence>
            {showAddColumn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add Custom Column
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Column name..."
                    className={`px-3 py-2 rounded border text-sm ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    id="columnName"
                  />
                  <input
                    type="date"
                    className={`px-3 py-2 rounded border text-sm ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    id="columnDate"
                  />
                  <button
                    onClick={() => {
                      const name = document.getElementById('columnName').value
                      const date = document.getElementById('columnDate').value
                      if (name && date) {
                        addCustomColumn({ name, date, type: 'custom' })
                        document.getElementById('columnName').value = ''
                        document.getElementById('columnDate').value = ''
                        setShowAddColumn(false)
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Column
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {viewMode === 'habits' ? (
            /* Professional Habits Tracking View */
            <div className="space-y-6">
              {/* Protocols Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Daily Protocols
                  </h4>
                  <span className={`text-sm px-2 py-1 rounded ${
                    darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {habitsConfig.protocols.length} protocols
                  </span>
                </div>
                <div className="space-y-3">
                  {habitsConfig.protocols.map((protocol) => (
                    <div key={protocol.id} className="flex items-center gap-3">
                      <div className={`w-56 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-lg">{protocol.icon}</span>
                        <div>
                          <div className="font-medium">{protocol.name}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {protocol.points} points
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-1">
                        {days.slice(0, 31).map((day, dayIndex) => {
                          const isCompleted = getHabitStatus('protocols', protocol.id, day)
                          const isCurrentMonthDay = isCurrentMonth(day)
                          const isTodayDay = isToday(day)
                          
                          return (
                            <div
                              key={dayIndex}
                              className={`w-8 h-8 border flex items-center justify-center text-xs cursor-pointer transition-all ${
                                isTodayDay 
                                  ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50' 
                                  : isCurrentMonthDay
                                  ? darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                                  : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                              } ${!isCurrentMonthDay ? 'opacity-50' : ''} ${
                                isCompleted ? `bg-${protocol.color}-100 border-${protocol.color}-500` : ''
                              }`}
                              onClick={() => toggleHabit('protocols', protocol.id, day)}
                              title={`${protocol.name} - ${day.toLocaleDateString()}`}
                            >
                              {isCompleted ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <span className={isCurrentMonthDay ? '' : 'opacity-50'}>
                                  {day.getDate()}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sleep Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Sleep Tracking
                  </h4>
                  <span className={`text-sm px-2 py-1 rounded ${
                    darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {habitsConfig.sleep.length} options
                  </span>
                </div>
                <div className="space-y-3">
                  {habitsConfig.sleep.map((sleep) => (
                    <div key={sleep.id} className="flex items-center gap-3">
                      <div className={`w-56 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-lg">{sleep.icon}</span>
                        <div>
                          <div className="font-medium">{sleep.name}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {sleep.points} points
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-1">
                        {days.slice(0, 31).map((day, dayIndex) => {
                          const isCompleted = getHabitStatus('sleep', sleep.id, day)
                          const isCurrentMonthDay = isCurrentMonth(day)
                          const isTodayDay = isToday(day)
                          
                          return (
                            <div
                              key={dayIndex}
                              className={`w-8 h-8 border flex items-center justify-center text-xs cursor-pointer transition-all ${
                                isTodayDay 
                                  ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50' 
                                  : isCurrentMonthDay
                                  ? darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                                  : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                              } ${!isCurrentMonthDay ? 'opacity-50' : ''} ${
                                isCompleted ? `bg-${sleep.color}-100 border-${sleep.color}-500` : ''
                              }`}
                              onClick={() => toggleHabit('sleep', sleep.id, day)}
                              title={`${sleep.name} - ${day.toLocaleDateString()}`}
                            >
                              {isCompleted ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <span className={isCurrentMonthDay ? '' : 'opacity-50'}>
                                  {day.getDate()}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Tasks Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Custom Tasks
                  </h4>
                  <button
                    onClick={() => {
                      const name = prompt('Enter custom task name:')
                      if (name) {
                        addCustomTask({ name, points: 5, color: 'gray' })
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Add Task
                  </button>
                </div>
                <div className="space-y-3">
                  {customTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <div className={`w-56 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                          📋
                        </div>
                        <div>
                          <div className="font-medium">{task.name}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {task.points} points
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-1">
                        {days.slice(0, 31).map((day, dayIndex) => {
                          const isCompleted = getCustomTaskStatus(task.id, day)
                          const isCurrentMonthDay = isCurrentMonth(day)
                          const isTodayDay = isToday(day)
                          
                          return (
                            <div
                              key={dayIndex}
                              className={`w-8 h-8 border flex items-center justify-center text-xs cursor-pointer transition-all ${
                                isTodayDay 
                                  ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50' 
                                  : isCurrentMonthDay
                                  ? darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                                  : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                              } ${!isCurrentMonthDay ? 'opacity-50' : ''} ${
                                isCompleted ? 'bg-green-100 border-green-500' : ''
                              }`}
                              onClick={() => toggleCustomTask(task.id, day)}
                              title={`${task.name} - ${day.toLocaleDateString()}`}
                            >
                              {isCompleted ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <span className={isCurrentMonthDay ? '' : 'opacity-50'}>
                                  {day.getDate()}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Rows Section */}
              {customRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Custom Rows
                    </h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                    }`}>
                      {customRows.length} rows
                    </span>
                  </div>
                  <div className="space-y-3">
                    {customRows.map((row) => (
                      <div key={row.id} className="flex items-center gap-3">
                        <div className={`w-56 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className="w-6 h-6 rounded bg-green-200 dark:bg-green-800 flex items-center justify-center text-xs">
                            {row.icon || '📋'}
                          </div>
                          <div>
                            <div className="font-medium">{row.name}</div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Custom row
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-1">
                          {days.slice(0, 31).map((day, dayIndex) => {
                            const isCurrentMonthDay = isCurrentMonth(day)
                            const isTodayDay = isToday(day)
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`w-8 h-8 border flex items-center justify-center text-xs cursor-pointer transition-all ${
                                  isTodayDay 
                                    ? 'border-green-500 bg-green-500/20 ring-2 ring-green-500/50' 
                                    : isCurrentMonthDay
                                    ? darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                                    : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                                } ${!isCurrentMonthDay ? 'opacity-50' : ''}`}
                                title={`${row.name} - ${day.toLocaleDateString()}`}
                              >
                                <span className={isCurrentMonthDay ? '' : 'opacity-50'}>
                                  {day.getDate()}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        <button
                          onClick={() => deleteCustomRow(row.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete row"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Points Row */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Daily Performance
                  </h4>
                  <div className={`text-sm px-2 py-1 rounded ${
                    darkMode ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-400' : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700'
                  }`}>
                    Total Points
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-56 flex items-center gap-2 font-bold ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs">
                      🏆
                    </div>
                    <div>
                      <div>Daily Score</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Points earned
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-1">
                    {days.slice(0, 31).map((day, dayIndex) => {
                      const points = calculateTotalPoints(day)
                      const isCurrentMonthDay = isCurrentMonth(day)
                      const isTodayDay = isToday(day)
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`w-8 h-8 border flex items-center justify-center text-xs font-bold transition-all ${
                            isTodayDay 
                              ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/50 text-purple-600' 
                              : isCurrentMonthDay
                              ? darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                              : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                          } ${!isCurrentMonthDay ? 'opacity-50' : ''} ${
                            points > 0 ? 'bg-gradient-to-br from-purple-50 to-blue-50' : ''
                          }`}
                        >
                          {points > 0 ? points : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tasks Calendar View */
            <div>
              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const tasks = getTasksForDate(day)
                  const isCurrentMonthDay = isCurrentMonth(day)
                  const isTodayDay = isToday(day)
                  
                  return (
                    <motion.div
                      key={index}
                      className={`min-h-20 p-2 rounded-lg border-2 transition-all ${
                        isTodayDay 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : isCurrentMonthDay
                          ? darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                          : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                      } ${!isCurrentMonthDay ? 'opacity-50' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day)}
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          isTodayDay ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                        }`}>
                          {day.getDate()}
                        </span>
                        {tasks.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {tasks.length}
                          </span>
                        )}
                      </div>

                      {/* Tasks */}
                      <div className="space-y-1">
                        {tasks.slice(0, isExpanded ? 3 : 2).map((task, taskIndex) => (
                          <motion.div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            className={`p-1 rounded text-xs cursor-pointer border-l-2 ${
                              task.priority === 'high' ? 'border-red-500 bg-red-500/10' :
                              task.priority === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                              'border-green-500 bg-green-500/10'
                            } ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                            onClick={() => onTaskSelect && onTaskSelect(task)}
                            whileHover={{ scale: 1.02 }}
                            whileDrag={{ scale: 1.1 }}
                          >
                            <div className="flex items-center gap-1">
                              {task.category === 'editing' && <Camera className="w-3 h-3" />}
                              {task.category === 'meeting' && <Users className="w-3 h-3" />}
                              {task.category === 'backup' && <Target className="w-3 h-3" />}
                              {task.category === 'communication' && <Phone className="w-3 h-3" />}
                              {task.category === 'marketing' && <TrendingUp className="w-3 h-3" />}
                              {!['editing', 'meeting', 'backup', 'communication', 'marketing'].includes(task.category) && <CalendarIcon className="w-3 h-3" />}
                              <span className="truncate">{task.title}</span>
                            </div>
                            {task.status === 'completed' && (
                              <Check className="w-3 h-3 text-green-500 ml-auto" />
                            )}
                          </motion.div>
                        ))}
                        
                        {tasks.length > (isExpanded ? 3 : 2) && (
                          <div className="text-xs text-gray-500 text-center pt-1">
                            +{tasks.length - (isExpanded ? 3 : 2)} more
                          </div>
                        )}
                      </div>

                      {/* Add Task Button */}
                      <div className="mt-1">
                        <button
                          onClick={() => {
                            setSelectedDate(day)
                            setShowTaskForm(true)
                          }}
                          className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                          {isExpanded ? 'Add' : '+'}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTaskForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-lg p-6 w-full max-w-md shadow-xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Task for {selectedDate.toLocaleDateString()}</h3>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Task Title</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfessionalCalendar
