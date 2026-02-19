import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  MapPin,
  Users,
  Camera,
  Target,
  Settings,
  Download,
  Upload,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'

const ExcelCalendar = ({ darkMode, todos = [], onTaskUpdate, onTaskSelect }) => {
  const { addNotification } = useNotifications()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCell, setSelectedCell] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [viewMode, setViewMode] = useState('month') // 'month', 'week', 'day'
  const [showSettings, setShowSettings] = useState(false)
  const [cellTasks, setCellTasks] = useState({})

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getTasksForDate = (date) => {
    if (!date) return []
    const dateStr = getDateString(date)
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
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date) => {
    if (!date) return false
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    )
  }

  const handleCellClick = (date, cellIndex) => {
    if (!date) return
    setSelectedCell({ date, cellIndex })
    const tasks = getTasksForDate(date)
    if (tasks.length > 0) {
      setCellTasks({ [getDateString(date)]: tasks })
    }
  }

  const handleCellDoubleClick = (date) => {
    if (!date) return
    setSelectedCell({ date })
    setIsEditing(true)
    setEditValue('')
  }

  const handleAddTask = () => {
    if (!selectedCell || !selectedCell.date) return
    
    const newTask = {
      id: Date.now(),
      title: editValue || 'New Task',
      dueDate: selectedCell.date.toISOString(),
      status: 'pending',
      priority: 'medium',
      category: 'general',
      createdAt: new Date().toISOString()
    }
    
    onTaskUpdate && onTaskUpdate([...todos, newTask])
    addNotification({
      type: 'task',
      title: 'Task Added',
      message: `"${newTask.title}" scheduled for ${selectedCell.date.toLocaleDateString()}`,
      priority: 'low',
      icon: <Plus className="w-5 h-5" />
    })
    
    setIsEditing(false)
    setEditValue('')
    setSelectedCell(null)
  }

  const handleDeleteTask = (taskId) => {
    const updatedTasks = todos.filter(task => task.id !== taskId)
    onTaskUpdate && onTaskUpdate(updatedTasks)
    addNotification({
      type: 'task',
      title: 'Task Deleted',
      message: 'Task has been removed from the calendar',
      priority: 'medium',
      icon: <Trash2 className="w-5 h-5" />
    })
  }

  const exportToCSV = () => {
    const days = getDaysInMonth(currentDate)
    let csv = 'Date,Day,Task Title,Priority,Status,Location,Time\n'
    
    days.forEach(date => {
      if (date) {
        const tasks = getTasksForDate(date)
        if (tasks.length === 0) {
          csv += `${date.toLocaleDateString()},${weekDays[date.getDay()]},,,,\n`
        } else {
          tasks.forEach(task => {
            csv += `${date.toLocaleDateString()},${weekDays[date.getDay()]},${task.title},${task.priority},${task.status},${task.location || ''},${task.startTime || ''}\n`
          })
        }
      }
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calendar-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className={`${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } rounded-xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Header */}
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
              onClick={exportToCSV}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Export to CSV"
            >
              <Download className="w-5 h-5" />
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

        {/* View Mode Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-lg text-sm ${
              viewMode === 'month'
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-lg text-sm ${
              viewMode === 'week'
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded-lg text-sm ${
              viewMode === 'day'
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      {/* Excel-like Table */}
      <div className="p-4">
        <div className="overflow-auto">
          <table className={`w-full border-collapse ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {/* Header Row */}
            <thead>
              <tr>
                <th className={`border border-gray-300 dark:border-gray-600 p-2 text-left font-semibold ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Date
                </th>
                <th className={`border border-gray-300 dark:border-gray-600 p-2 text-left font-semibold ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Day
                </th>
                <th className={`border border-gray-300 dark:border-gray-600 p-2 text-left font-semibold ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Tasks
                </th>
                <th className={`border border-gray-300 dark:border-gray-600 p-2 text-left font-semibold ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Priority
                </th>
                <th className={`border border-gray-300 dark:border-gray-600 p-2 text-left font-semibold ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Status
                </th>
                <th className={`border border-gray-300 dark:border-gray-600 p-2 text-left font-semibold ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Location
                </th>
                <th className={`border border-gray-300 dark:border-gray-600 p-2 text-left font-semibold ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Time
                </th>
              </tr>
            </thead>
            
            {/* Body Rows */}
            <tbody>
              {days.map((date, index) => {
                const tasks = getTasksForDate(date)
                const isTodayDate = isToday(date)
                const isCurrentMonthDate = isCurrentMonth(date)
                
                return (
                  <tr key={index} className={
                    isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }>
                    <td className={`border border-gray-300 dark:border-gray-600 p-2 ${
                      !date ? 'bg-gray-50 dark:bg-gray-800' : ''
                    } ${isTodayDate ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                      {date ? date.getDate() : ''}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-2 ${
                      !date ? 'bg-gray-50 dark:bg-gray-800' : ''
                    }`}>
                      {date ? weekDays[date.getDay()] : ''}
                    </td>
                    <td 
                      className={`border border-gray-300 dark:border-gray-600 p-2 cursor-pointer ${
                        !date ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleCellClick(date, index)}
                      onDoubleClick={() => handleCellDoubleClick(date)}
                    >
                      {date && (
                        <div className="space-y-1">
                          {tasks.slice(0, 3).map(task => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded flex items-center justify-between group ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              <span className="flex-1 truncate">{task.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteTask(task.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 ml-1 text-red-600 hover:text-red-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {tasks.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{tasks.length - 3} more...
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-2 ${
                      !date ? 'bg-gray-50 dark:bg-gray-800' : ''
                    }`}>
                      {date && tasks.length > 0 && (
                        <div className="space-y-1">
                          {tasks.slice(0, 2).map(task => (
                            <span
                              key={task.id}
                              className={`text-xs px-1 py-0.5 rounded ${
                                task.priority === 'high' ? 'bg-red-200 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-green-200 text-green-800'
                              }`}
                            >
                              {task.priority}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-2 ${
                      !date ? 'bg-gray-50 dark:bg-gray-800' : ''
                    }`}>
                      {date && tasks.length > 0 && (
                        <div className="space-y-1">
                          {tasks.slice(0, 2).map(task => (
                            <span
                              key={task.id}
                              className={`text-xs px-1 py-0.5 rounded ${
                                task.status === 'completed' ? 'bg-green-200 text-green-800' :
                                task.status === 'in-progress' ? 'bg-blue-200 text-blue-800' :
                                'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {task.status}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-2 ${
                      !date ? 'bg-gray-50 dark:bg-gray-800' : ''
                    }`}>
                      {date && tasks.length > 0 && (
                        <div className="space-y-1">
                          {tasks.slice(0, 2).map(task => (
                            <div key={task.id} className="text-xs flex items-center gap-1">
                              {task.location && <MapPin className="w-3 h-3" />}
                              <span className="truncate">{task.location}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-2 ${
                      !date ? 'bg-gray-50 dark:bg-gray-800' : ''
                    }`}>
                      {date && tasks.length > 0 && (
                        <div className="space-y-1">
                          {tasks.slice(0, 2).map(task => (
                            <div key={task.id} className="text-xs flex items-center gap-1">
                              {task.startTime && <Clock className="w-3 h-3" />}
                              <span>{task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && selectedCell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-lg p-6 w-96 shadow-xl`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Add Task for {selectedCell.date.toLocaleDateString()}
              </h3>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter task title..."
                className={`w-full px-3 py-2 rounded-lg border mb-4 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddTask}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditValue('')
                    setSelectedCell(null)
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExcelCalendar
