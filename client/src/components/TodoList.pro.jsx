import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Bell,
  Star,
  TrendingUp,
  Target,
  Camera,
  Users,
  MapPin,
  Phone,
  Mail,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Lightbulb,
  Zap,
  List,
  Flag,
  CheckSquare,
  Square,
  Save,
  X,
  PlusCircle,
  FolderPlus,
  FileText,
  Calendar as CalendarViewIcon,
  FolderTree,
  MoreVertical,
  Copy,
  Archive,
  RotateCcw
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'

const ProfessionalTodoList = ({ darkMode, onTaskUpdate, onTaskSelect }) => {
  const { addNotification, checkTaskDeadlines } = useNotifications()
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [expandedTasks, setExpandedTasks] = useState(new Set())
  const [selectedTask, setSelectedTask] = useState(null)
  const [showQuickAdd, setShowQuickAdd] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [showTimeLocation, setShowTimeLocation] = useState(false)
  const [archivedTodos, setArchivedTodos] = useState([])
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [])

  useEffect(() => {
    // Check for task deadlines every minute
    const interval = setInterval(() => {
      checkTaskDeadlines(todos)
    }, 60000)
    
    return () => clearInterval(interval)
  }, [todos, checkTaskDeadlines])

  const loadTodos = () => {
    const savedTodos = localStorage.getItem('pg-todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    } else {
      const initialTodos = [
        {
          id: 1,
          title: 'Wedding Photography Project',
          description: 'Complete wedding photography project for Johnson family',
          category: 'project',
          priority: 'high',
          status: 'pending',
          isProject: true,
          level: 0,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '20 hours',
          client: 'Johnson Family',
          reminder: true,
          createdAt: new Date().toISOString(),
          progress: 0
        }
      ]
      setTodos(initialTodos)
      localStorage.setItem('pg-todos', JSON.stringify(initialTodos))
    }
    
    const savedArchived = localStorage.getItem('pg-archived-todos')
    if (savedArchived) {
      setArchivedTodos(JSON.parse(savedArchived))
    }
  }
          reminder: true,
          createdAt: new Date().toISOString(),
          progress: 0
        },
        {
          id: 2,
          title: 'Pre-production Planning',
          description: 'Plan photoshoot schedule and locations',
          category: 'planning',
          priority: 'high',
          status: 'pending',
          parentId: 1,
          level: 1,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '2 hours',
          client: 'Johnson Family',
          reminder: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Equipment Preparation',
          description: 'Check and prepare all photography equipment',
          category: 'preparation',
          priority: 'high',
          status: 'pending',
          parentId: 1,
          level: 1,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '3 hours',
          client: 'Johnson Family',
          reminder: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          title: 'Backup photos to cloud',
          description: 'Upload all photos to cloud backup',
          category: 'backup',
          priority: 'medium',
          status: 'pending',
          level: 0,
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

  const saveTodos = (updatedTodos) => {
    setTodos(updatedTodos)
    localStorage.setItem('pg-todos', JSON.stringify(updatedTodos))
    onTaskUpdate && onTaskUpdate(updatedTodos)
  }

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const getSubTasks = (parentId) => {
    return todos.filter(task => task.parentId === parentId)
  }

  const getRootTasks = () => {
    return todos.filter(task => !task.parentId)
  }

  const addSubTask = (parentId, taskData) => {
    const parentTask = todos.find(t => t.id === parentId)
    const newTask = {
      id: Date.now(),
      ...taskData,
      parentId: parentId,
      level: (parentTask?.level || 0) + 1,
      createdAt: new Date().toISOString()
    }
    const updatedTodos = [...todos, newTask]
    saveTodos(updatedTodos)
    
    // Auto-expand parent to show new sub-task
    setExpandedTasks(prev => new Set([...prev, parentId]))
    setShowQuickAdd(null)
  }

  const toggleTaskStatus = (id) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
        return { ...todo, status: newStatus }
      }
      return todo
    })
    
    // Update parent progress
    const taskWithChildren = updatedTodos.find(t => t.id === id)
    if (taskWithChildren) {
      const parent = updatedTodos.find(t => t.id === taskWithChildren.parentId)
      if (parent) {
        const siblings = getSubTasks(parent.id)
        const completedSiblings = siblings.filter(s => s.status === 'completed').length
        const progress = siblings.length > 0 ? Math.round((completedSiblings / siblings.length) * 100) : 0
        updatedTodos.forEach(t => {
          if (t.id === parent.id) {
            t.progress = progress
          }
        })
      }
    }
    
    saveTodos(updatedTodos)
    
    // Send notification for task completion
    if (taskWithChildren && taskWithChildren.status === 'completed') {
      addNotification({
        type: 'task',
        title: 'Task Completed!',
        message: `Great job! "${taskWithChildren.title}" has been completed`,
        priority: 'medium',
        icon: <Check className="w-5 h-5" />
      })
    }
  }

  const deleteTask = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id)
    // Also delete sub-tasks recursively
    const allDescendants = []
    const findDescendants = (parentId) => {
      const children = todos.filter(t => t.parentId === parentId)
      children.forEach(child => {
        allDescendants.push(child.id)
        findDescendants(child.id)
      })
    }
    findDescendants(id)
    
    const finalTodos = updatedTodos.filter(todo => !allDescendants.includes(todo.id))
    saveTodos(finalTodos)
    setContextMenu(null)
  }

  const duplicateTask = (id) => {
    const task = todos.find(t => t.id === id)
    if (task) {
      const newTask = {
        ...task,
        id: Date.now(),
        title: `${task.title} (Copy)`,
        createdAt: new Date().toISOString()
      }
      delete newTask.parentId // Make it a root task
      const updatedTodos = [...todos, newTask]
      saveTodos(updatedTodos)
    }
    setContextMenu(null)
  }

  const archiveTask = (id) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, archived: true } : todo
    )
    saveTodos(updatedTodos)
    setContextMenu(null)
  }

  const addTask = (newTask) => {
    const task = {
      id: Date.now(),
      ...newTask,
      level: 0,
      createdAt: new Date().toISOString()
    }
    const updatedTodos = [task, ...todos]
    saveTodos(updatedTodos)
    setShowAddForm(false)
    
    // Send notification for new task
    addNotification({
      type: 'task',
      title: 'New Task Added',
      message: `"${task.title}" has been added to your task list`,
      priority: 'low',
      icon: <Plus className="w-5 h-5" />
    })
  }

  const updateTask = (updatedTask) => {
    const updatedTodos = todos.map(todo => 
      todo.id === updatedTask.id ? updatedTask : todo
    )
    saveTodos(updatedTodos)
    setEditingTask(null)
  }

  const filteredAndSortedTodos = getRootTasks().filter(todo => {
    const matchesFilter = filter === 'all' || todo.status === filter || todo.priority === filter
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const notArchived = !todo.archived
    return matchesFilter && matchesSearch && notArchived
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    } else if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate)
    } else if (sortBy === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt) // Most recent first
    }
    return 0
  })

  const stats = {
    total: todos.filter(t => !t.archived).length,
    pending: todos.filter(t => t.status === 'pending' && !t.archived).length,
    completed: todos.filter(t => t.status === 'completed' && !t.archived).length,
    highPriority: todos.filter(t => t.priority === 'high' && t.status !== 'completed' && !t.archived).length,
    projects: todos.filter(t => t.isProject && !t.archived).length
  }

  const renderTask = (todo, index, isSubTask = false) => {
    const subTasks = getSubTasks(todo.id)
    const isExpanded = expandedTasks.has(todo.id)
    const hasSubTasks = subTasks.length > 0
    const progress = todo.progress || 0

    return (
      <motion.div
        key={todo.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-lg border transition-all ${
          todo.status === 'completed' ? 'opacity-60 bg-gray-50 dark:bg-gray-900/50' : ''
        } ${isSubTask ? `ml-${todo.level * 6} border-l-2 border-gray-200 dark:border-gray-600` : ''} ${
          selectedTask === todo.id ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="p-3">
          <div className="flex items-center gap-3">
            {/* Expand/Collapse Button */}
            {hasSubTasks && (
              <button
                onClick={() => toggleTaskExpansion(todo.id)}
                className={`p-1 rounded transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Checkbox */}
            <button
              onClick={() => toggleTaskStatus(todo.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                todo.status === 'completed'
                  ? 'bg-green-500 border-green-500'
                  : darkMode
                  ? 'border-gray-600 hover:border-green-500'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {todo.status === 'completed' && <CheckSquare className="w-4 h-4 text-white" />}
              {todo.status !== 'completed' && <Square className="w-4 h-4" />}
            </button>

            {/* Task Icon */}
            <div className="flex-shrink-0">
              {todo.isProject ? (
                <FolderTree className="w-4 h-4 text-blue-500" />
              ) : (
                <FileText className="w-4 h-4 text-gray-500" />
              )}
            </div>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium text-sm truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } ${todo.status === 'completed' ? 'line-through opacity-75' : ''}`}>
                  {todo.title}
                </h4>
                {todo.isProject && (
                  <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700 border border-blue-200">
                    Project
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className={`px-1.5 py-0.5 rounded ${
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
                {todo.estimatedTime && (
                  <span className={`${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    • {todo.estimatedTime}
                  </span>
                )}
                {todo.location && (
                  <span className={`flex items-center gap-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <MapPin className="w-3 h-3" />
                    {todo.location}
                  </span>
                )}
                {todo.startTime && todo.endTime && (
                  <span className={`flex items-center gap-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {todo.startTime} - {todo.endTime}
                  </span>
                )}
                {todo.dueDate && (
                  <span className={`${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    • {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Progress Bar for Projects */}
              {todo.isProject && hasSubTasks && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Progress
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Quick Add Sub-Task */}
              <button
                onClick={() => setShowQuickAdd(todo.id)}
                className={`p-1 rounded transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Add Sub-Task"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>

              {/* More Options */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    taskId: todo.id
                  })
                }}
                className={`p-1 rounded transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="More Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Add Sub-Task Form */}
          <AnimatePresence>
            {showQuickAdd === todo.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-3 p-3 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter sub-task title..."
                    className={`flex-1 px-3 py-2 rounded border text-sm ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        addSubTask(todo.id, {
                          title: e.target.value.trim(),
                          category: 'sub-task',
                          priority: 'medium',
                          status: 'pending'
                        })
                      }
                    }}
                  />
                  <button
                    onClick={() => setShowQuickAdd(null)}
                    className={`px-3 py-2 rounded text-sm ${
                      darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  const TaskForm = ({ task, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: task?.title || '',
      description: task?.description || '',
      category: task?.category || 'editing',
      priority: task?.priority || 'medium',
      status: task?.status || 'pending',
      dueDate: task?.dueDate || '',
      estimatedTime: task?.estimatedTime || '',
      client: task?.client || '',
      reminder: task?.reminder || false,
      isProject: task?.isProject || false,
      location: task?.location || '',
      startTime: task?.startTime || '',
      endTime: task?.endTime || ''
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      const newTask = {
        id: task?.id || Date.now(),
        ...formData,
        createdAt: task?.createdAt || new Date().toISOString()
      }
      onSave(newTask)
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-lg p-4 border shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {task ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onCancel}
            className={`p-1 rounded transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="editing">Editing</option>
                <option value="shooting">Shooting</option>
                <option value="meeting">Meeting</option>
                <option value="backup">Backup</option>
                <option value="communication">Communication</option>
                <option value="marketing">Marketing</option>
                <option value="project">Project</option>
                <option value="planning">Planning</option>
                <option value="preparation">Preparation</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Estimated Time
              </label>
              <input
                type="text"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., 2 hours, 30 minutes"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter location (e.g., Office, Client Site, Remote)"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isProject}
                onChange={(e) => setFormData(prev => ({ ...prev, isProject: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                This is a project (can have sub-tasks)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminder}
                onChange={(e) => setFormData(prev => ({ ...prev, reminder: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Enable reminder
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {task ? 'Update Task' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    )
  }

  // Render task tree recursively
  const renderTaskTree = (tasks, level = 0) => {
    return tasks.map((todo, index) => {
      const subTasks = getSubTasks(todo.id)
      const isExpanded = expandedTasks.has(todo.id)
      
      return (
        <React.Fragment key={todo.id}>
          {renderTask(todo, index, level > 0)}
          
          {isExpanded && subTasks.length > 0 && (
            <div className="space-y-2 mt-2">
              {renderTaskTree(subTasks, level + 1)}
            </div>
          )}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Professional Task Management
          </h2>
          <div className="flex gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {stats.pending} Pending
            </span>
            <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
              {stats.completed} Completed
            </span>
            <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              {stats.projects} Projects
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Task
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="high">High Priority</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="createdAt">Recent First</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {(showAddForm || editingTask) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <TaskForm
              task={editingTask}
              onSave={editingTask ? updateTask : addTask}
              onCancel={() => {
                setShowAddForm(false)
                setEditingTask(null)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredAndSortedTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm || filter !== 'all' ? 'No tasks match your filters' : 'No tasks yet. Start adding some!'}
              </p>
            </motion.div>
          ) : (
            renderTaskTree(filteredAndSortedTodos)
          )}
        </AnimatePresence>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed z-50 rounded-lg border shadow-xl p-2 min-w-48 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
          >
            <button
              onClick={() => {
                const task = todos.find(t => t.id === contextMenu.taskId)
                setEditingTask(task)
                setContextMenu(null)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => duplicateTask(contextMenu.taskId)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={() => archiveTask(contextMenu.taskId)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
            <hr className={`my-1 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
            <button
              onClick={() => deleteTask(contextMenu.taskId)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}

export default ProfessionalTodoList
