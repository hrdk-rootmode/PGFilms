import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
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
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CheckSquare,
  Square,
  Flag,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'

const IntegratedTodoSchedule = ({ darkMode }) => {
  const { addNotification } = useNotifications()
  const [todos, setTodos] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [expandedTasks, setExpandedTasks] = useState(new Set())
  const [editingTask, setEditingTask] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    startTime: '',
    endTime: '',
    location: '',
    estimatedTime: '',
    parentId: null
  })

  useEffect(() => {
    const savedTodos = localStorage.getItem('pg-todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pg-todos', JSON.stringify(todos))
  }, [todos])

  const getWeekDays = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const getMonthDays = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return todos.filter(task => {
      if (!task.dueDate) return false
      return task.dueDate.startsWith(dateStr)
    })
  }

  const getSubTasks = (parentId) => {
    return todos.filter(task => task.parentId === parentId)
  }

  const toggleTaskExpansion = (taskId) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const addTask = () => {
    const task = {
      id: Date.now(),
      ...newTaskData,
      createdAt: new Date().toISOString()
    }
    const updatedTodos = [task, ...todos]
    setTodos(updatedTodos)
    setShowAddForm(false)
    setNewTaskData({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      status: 'pending',
      dueDate: '',
      startTime: '',
      endTime: '',
      location: '',
      estimatedTime: '',
      parentId: null
    })
    
    addNotification({
      type: 'task',
      title: 'Task Added',
      message: `"${task.title}" has been added`,
      priority: 'low',
      icon: <Plus className="w-5 h-5" />
    })
  }

  const updateTask = (updatedTask) => {
    const updatedTodos = todos.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    )
    setTodos(updatedTodos)
    setEditingTask(null)
  }

  const deleteTask = (taskId) => {
    const updatedTodos = todos.filter(task => task.id !== taskId)
    setTodos(updatedTodos)
    addNotification({
      type: 'task',
      title: 'Task Deleted',
      message: 'Task has been removed',
      priority: 'medium',
      icon: <Trash2 className="w-5 h-5" />
    })
  }

  const toggleTaskStatus = (taskId) => {
    const updatedTodos = todos.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed'
        return { ...task, status: newStatus }
      }
      return task
    })
    setTodos(updatedTodos)
  }

  const filteredTodos = todos
    .filter(task => {
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filter === 'completed' && task.status !== 'completed') return false
      if (filter === 'pending' && task.status !== 'pending') return false
      if (filter === 'high' && task.priority !== 'high') return false
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        if (!task.dueDate || !task.dueDate.startsWith(today)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      return 0
    })

  const renderTaskTree = (task, level = 0) => {
    const subTasks = getSubTasks(task.id)
    const isExpanded = expandedTasks.has(task.id)
    const hasSubTasks = subTasks.length > 0

    return (
      <div key={task.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className={`flex items-center gap-2 p-2 rounded-lg ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}>
          {hasSubTasks && (
            <button
              onClick={() => toggleTaskExpansion(task.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          <button
            onClick={() => toggleTaskStatus(task.id)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500'
                : darkMode ? 'border-gray-500' : 'border-gray-300'
            }`}
          >
            {task.status === 'completed' && <CheckSquare className="w-3 h-3 text-white" />}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${
                task.status === 'completed' ? 'line-through opacity-60' : ''
              }`}>
                {task.title}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority}
              </span>
              {task.startTime && task.endTime && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {task.startTime} - {task.endTime}
                </span>
              )}
              {task.location && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {task.location}
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditingTask(task)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {hasSubTasks && isExpanded && (
          <div className="mt-2">
            {subTasks.map(subTask => renderTaskTree(subTask, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const weekDays = getWeekDays(currentDate)
  const monthDays = getMonthDays(currentDate)

  return (
    <div className={`${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } rounded-xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Todo & Schedule</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Month
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-3 py-1 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-3 py-1 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="high">High Priority</option>
            <option value="today">Today</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-1 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="createdAt">Recent First</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <table className={`w-full border-collapse ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <thead>
              <tr>
                <th className={`border border-gray-300 dark:border-gray-600 p-2 text-left font-semibold ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Time
                </th>
                {(viewMode === 'week' ? weekDays : monthDays).map((date, index) => (
                  <th key={index} className={`border border-gray-300 dark:border-gray-600 p-2 text-center font-semibold ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  } ${
                      date.toDateString() === new Date().toDateString()
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : ''
                    }`}>
                    <div className="text-xs">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-bold">
                      {date.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 24 }, (_, hour) => (
                <tr key={hour}>
                  <td className={`border border-gray-300 dark:border-gray-600 p-2 text-center font-medium ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {hour.toString().padStart(2, '0')}:00
                  </td>
                  {(viewMode === 'week' ? weekDays : monthDays).map((date, index) => {
                    const tasks = getTasksForDate(date).filter(task => {
                      if (!task.startTime) return false
                      const taskHour = parseInt(task.startTime.split(':')[0])
                      return taskHour === hour
                    })

                    return (
                      <td
                        key={index}
                        className={`border border-gray-300 dark:border-gray-600 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          date.toDateString() === new Date().toDateString()
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="space-y-1">
                          {tasks.map(task => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded cursor-pointer ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTask(task)
                              }}
                            >
                              <div className="truncate font-medium">{task.title}</div>
                              {task.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{task.location}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Task List</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTodos.map(task => renderTaskTree(task))}
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
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
                Add New Task
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                
                <textarea
                  placeholder="Description..."
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={3}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData({...newTaskData, dueDate: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  
                  <input
                    type="text"
                    placeholder="Location..."
                    value={newTaskData.location}
                    onChange={(e) => setNewTaskData({...newTaskData, location: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  
                  <select
                    value={newTaskData.category}
                    onChange={(e) => setNewTaskData({...newTaskData, category: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="general">General</option>
                    <option value="editing">Editing</option>
                    <option value="shooting">Shooting</option>
                    <option value="meeting">Meeting</option>
                    <option value="backup">Backup</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={addTask}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save Task
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
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

      <AnimatePresence>
        {editingTask && (
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
                Edit Task
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={3}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  
                  <input
                    type="text"
                    value={editingTask.location}
                    onChange={(e) => setEditingTask({...editingTask, location: e.target.value})}
                    placeholder="Location..."
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateTask(editingTask)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Update Task
                </button>
                <button
                  onClick={() => setEditingTask(null)}
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

export default IntegratedTodoSchedule
