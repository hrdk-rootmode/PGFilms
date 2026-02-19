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
  Zap
} from 'lucide-react'

const Calendar = ({ darkMode, todos = [], onTaskUpdate, onTaskSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [draggedTask, setDraggedTask] = useState(null)

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

  return (
    <div className={`${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } rounded-xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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
                  {tasks.slice(0, 3).map((task, taskIndex) => (
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
                  
                  {tasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      +{tasks.length - 3} more
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
                    Add
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
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

export default Calendar