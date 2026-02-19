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
  Minimize2
} from 'lucide-react'

const EnhancedCalendar = ({ darkMode, todos = [], onTaskUpdate, onTaskSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [draggedTask, setDraggedTask] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [viewMode, setViewMode] = useState('tasks') // 'tasks' or 'habits'

  // Daily habits/tracking data
  const [habitsData, setHabitsData] = useState(() => {
    const saved = localStorage.getItem('pg-habits-data')
    return saved ? JSON.parse(saved) : {
      protocols: {
        'Meditation': {},
        'Workout': {},
        'No junk/Fast Food': {},
        'Read 10 page Daily': {},
        'Under 2.5Hrs of Screen Time': {},
        '6Hrs Of Deep Work': {}
      },
      sleep: {
        '9 hours': {},
        '8 hours': {},
        '7 hours': {},
        '6 hours': {},
        '5 hours': {}
      }
    }
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

  const toggleHabit = (category, habit, date) => {
    const dateStr = getDateString(date)
    setHabitsData(prev => {
      const updated = { ...prev }
      if (!updated[category][dateStr]) {
        updated[category][dateStr] = true
      } else {
        delete updated[category][dateStr]
      }
      localStorage.setItem('pg-habits-data', JSON.stringify(updated))
      return updated
    })
  }

  const getHabitStatus = (category, habit, date) => {
    const dateStr = getDateString(date)
    return habitsData[category][dateStr] || false
  }

  const calculateTotalPoints = (date) => {
    const dateStr = getDateString(date)
    let points = 0
    Object.keys(habitsData.protocols).forEach(protocol => {
      if (habitsData.protocols[protocol][dateStr]) {
        points += 10 // Each protocol gives 10 points
      }
    })
    return points
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'editing': return <Camera className="w-3 h-3" />
      case 'meeting': return <Users className="w-3 h-3" />
      case 'backup': return <Target className="w-3 h-3" />
      case 'communication': return <Phone className="w-3 h-3" />
      case 'marketing': return <TrendingUp className="w-3 h-3" />
      case 'maintenance': return <Zap className="w-3 h-3" />
      default: return <CalendarIcon className="w-3 h-3" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      case 'low': return 'border-green-500 bg-green-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
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
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date())}
              className={`px-3 py-1 rounded-lg text-sm ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'tasks' ? 'habits' : 'tasks')}
              className={`px-3 py-1 rounded-lg text-sm ${
                viewMode === 'habits'
                  ? 'bg-purple-600 text-white'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {viewMode === 'tasks' ? 'Habits' : 'Tasks'}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
          <h3 className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            Getting 1% Better Each Day
          </h3>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {viewMode === 'habits' ? (
          /* Habits Tracking View */
          <div className="space-y-6">
            {/* Protocols Section */}
            <div>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Protocols
              </h4>
              <div className="space-y-2">
                {Object.keys(habitsData.protocols).map((protocol, protocolIndex) => (
                  <div key={protocol} className="flex items-center gap-2">
                    <div className={`w-48 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {protocol}
                    </div>
                    <div className="flex gap-1 flex-1">
                      {days.slice(0, 31).map((day, dayIndex) => {
                        const dateStr = getDateString(day)
                        const isCompleted = habitsData.protocols[protocol][dateStr]
                        const isCurrentMonthDay = isCurrentMonth(day)
                        const isTodayDay = isToday(day)
                        
                        return (
                          <div
                            key={dayIndex}
                            className={`w-8 h-8 border flex items-center justify-center text-xs cursor-pointer transition-colors ${
                              isTodayDay 
                                ? 'border-blue-500 bg-blue-500/20' 
                                : isCurrentMonthDay
                                ? darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                                : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                            } ${!isCurrentMonthDay ? 'opacity-50' : ''}`}
                            onClick={() => toggleHabit('protocols', protocol, day)}
                            title={`${protocol} - ${day.toLocaleDateString()}`}
                          >
                            {isCompleted ? (
                              <Check className="w-3 h-3 text-green-500" />
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
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Sleep
              </h4>
              <div className="space-y-2">
                {Object.keys(habitsData.sleep).map((sleepDuration, sleepIndex) => (
                  <div key={sleepDuration} className="flex items-center gap-2">
                    <div className={`w-48 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {sleepDuration}
                    </div>
                    <div className="flex gap-1 flex-1">
                      {days.slice(0, 31).map((day, dayIndex) => {
                        const dateStr = getDateString(day)
                        const isCompleted = habitsData.sleep[sleepDuration][dateStr]
                        const isCurrentMonthDay = isCurrentMonth(day)
                        const isTodayDay = isToday(day)
                        
                        return (
                          <div
                            key={dayIndex}
                            className={`w-8 h-8 border flex items-center justify-center text-xs cursor-pointer transition-colors ${
                              isTodayDay 
                                ? 'border-blue-500 bg-blue-500/20' 
                                : isCurrentMonthDay
                                ? darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                                : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                            } ${!isCurrentMonthDay ? 'opacity-50' : ''}`}
                            onClick={() => toggleHabit('sleep', sleepDuration, day)}
                            title={`${sleepDuration} - ${day.toLocaleDateString()}`}
                          >
                            {isCompleted ? (
                              <Check className="w-3 h-3 text-green-500" />
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

            {/* Total Points Row */}
            <div>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Total Points
              </h4>
              <div className="flex items-center gap-2">
                <div className={`w-48 text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Daily Points
                </div>
                <div className="flex gap-1 flex-1">
                  {days.slice(0, 31).map((day, dayIndex) => {
                    const points = calculateTotalPoints(day)
                    const isCurrentMonthDay = isCurrentMonth(day)
                    const isTodayDay = isToday(day)
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-8 h-8 border flex items-center justify-center text-xs font-bold transition-colors ${
                          isTodayDay 
                                ? 'border-purple-500 bg-purple-500/20 text-purple-600' 
                                : isCurrentMonthDay
                                ? darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                                : darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'
                            } ${!isCurrentMonthDay ? 'opacity-50' : ''}`}
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
                            getPriorityColor(task.priority)
                          } ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                          onClick={() => onTaskSelect && onTaskSelect(task)}
                          whileHover={{ scale: 1.02 }}
                          whileDrag={{ scale: 1.1 }}
                        >
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(task.category)}
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

export default EnhancedCalendar
