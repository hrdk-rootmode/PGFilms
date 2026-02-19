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
  RotateCcw,
  Play,
  Pause,
  BarChart3
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'

const EnhancedTodoList = ({ darkMode, onTaskUpdate, onTaskSelect }) => {
  const { addNotification, checkTaskDeadlines } = useNotifications()
  const [todos, setTodos] = useState([])
  const [archivedTodos, setArchivedTodos] = useState([])
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
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [])

  useEffect(() => {
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
          progress: 0,
          workflow: [
            { id: 1, title: 'Pre-production Planning', status: 'completed', completedAt: new Date().toISOString() },
            { id: 2, title: 'Equipment Setup', status: 'in-progress' },
            { id: 3, title: 'Photoshoot Day', status: 'pending' },
            { id: 4, title: 'Post-production Editing', status: 'pending' },
            { id: 5, title: 'Final Delivery', status: 'pending' }
          ]
        },
        {
          id: 2,
          title: 'Corporate Headshots',
          description: 'Professional headshots for Tech Corp team',
          category: 'project',
          priority: 'medium',
          status: 'pending',
          isProject: true,
          level: 0,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '8 hours',
          client: 'Tech Corp',
          reminder: true,
          createdAt: new Date().toISOString(),
          progress: 25,
          workflow: [
            { id: 1, title: 'Client Meeting', status: 'completed', completedAt: new Date().toISOString() },
            { id: 2, title: 'Studio Booking', status: 'completed', completedAt: new Date().toISOString() },
            { id: 3, title: 'Photoshoot Session', status: 'pending' },
            { id: 4, title: 'Photo Selection', status: 'pending' },
            { id: 5, title: 'Retouching', status: 'pending' }
          ]
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

  const saveTodos = (updatedTodos) => {
    setTodos(updatedTodos)
    localStorage.setItem('pg-todos', JSON.stringify(updatedTodos))
    if (onTaskUpdate) {
      onTaskUpdate(updatedTodos)
    }
  }

  const archiveTask = (taskId) => {
    const taskToArchive = todos.find(task => task.id === taskId)
    if (taskToArchive) {
      const updatedTodos = todos.filter(task => task.id !== taskId)
      const updatedArchived = [...archivedTodos, { ...taskToArchive, archivedAt: new Date().toISOString() }]
      
      saveTodos(updatedTodos)
      setArchivedTodos(updatedArchived)
      localStorage.setItem('pg-archived-todos', JSON.stringify(updatedArchived))
      
      addNotification({
        type: 'task',
        title: 'Task Archived',
        message: `"${taskToArchive.title}" has been archived`,
        priority: 'low',
        icon: <Archive className="w-5 h-5" />
      })
    }
  }

  const restoreTask = (taskId) => {
    const taskToRestore = archivedTodos.find(task => task.id === taskId)
    if (taskToRestore) {
      const { archivedAt, ...restoredTask } = taskToRestore
      const updatedArchived = archivedTodos.filter(task => task.id !== taskId)
      const updatedTodos = [...todos, restoredTask]
      
      saveTodos(updatedTodos)
      setArchivedTodos(updatedArchived)
      localStorage.setItem('pg-archived-todos', JSON.stringify(updatedArchived))
      
      addNotification({
        type: 'task',
        title: 'Task Restored',
        message: `"${restoredTask.title}" has been restored`,
        priority: 'low',
        icon: <RotateCcw className="w-5 h-5" />
      })
    }
  }

  const updateWorkflowStep = (taskId, stepId, newStatus) => {
    const updatedTodos = todos.map(task => {
      if (task.id === taskId && task.workflow) {
        const updatedWorkflow = task.workflow.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : null
            }
          }
          return step
        })
        
        const completedSteps = updatedWorkflow.filter(step => step.status === 'completed').length
        const totalSteps = updatedWorkflow.length
        const progress = Math.round((completedSteps / totalSteps) * 100)
        
        return {
          ...task,
          workflow: updatedWorkflow,
          progress,
          status: progress === 100 ? 'completed' : 'in-progress'
        }
      }
      return task
    })
    
    saveTodos(updatedTodos)
  }

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      progress: 0,
      workflow: taskData.isProject ? [
        { id: 1, title: 'Planning', status: 'pending' },
        { id: 2, title: 'Execution', status: 'pending' },
        { id: 3, title: 'Review', status: 'pending' },
        { id: 4, title: 'Finalization', status: 'pending' }
      ] : null
    }
    
    const updatedTodos = [newTask, ...todos]
    saveTodos(updatedTodos)
    setShowAddForm(false)
    
    addNotification({
      type: 'task',
      title: 'Task Added',
      message: `"${newTask.title}" has been added`,
      priority: 'low',
      icon: <Plus className="w-5 h-5" />
    })
  }

  const updateTask = (updatedTask) => {
    const updatedTodos = todos.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    )
    saveTodos(updatedTodos)
    setEditingTask(null)
  }

  const deleteTask = (taskId) => {
    const taskToDelete = todos.find(task => task.id === taskId)
    const updatedTodos = todos.filter(task => task.id !== taskId)
    saveTodos(updatedTodos)
    
    addNotification({
      type: 'task',
      title: 'Task Deleted',
      message: `"${taskToDelete.title}" has been deleted`,
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
    saveTodos(updatedTodos)
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

  const filteredTodos = (showArchived ? archivedTodos : todos)
    .filter(task => {
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filter === 'completed' && task.status !== 'completed') return false
      if (filter === 'pending' && task.status !== 'pending') return false
      if (filter === 'high' && task.priority !== 'high') return false
      if (filter === 'projects' && !task.isProject) return false
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
      if (sortBy === 'progress') {
        return b.progress - a.progress
      }
      return 0
    })

  const renderWorkflowProgress = (task) => {
    if (!task.workflow) return null

    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Workflow Progress</span>
          <span className="text-xs">{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
        <div className="space-y-1">
          {task.workflow.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 text-xs">
              <button
                onClick={() => updateWorkflowStep(task.id, step.id, 
                  step.status === 'completed' ? 'pending' : 'completed')}
                className={`w-3 h-3 rounded border ${
                  step.status === 'completed'
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {step.status === 'completed' && <Check className="w-2 h-2 text-white" />}
              </button>
              <span className={`flex-1 ${
                step.status === 'completed' ? 'line-through opacity-60' : ''
              }`}>
                {step.title}
              </span>
              {step.completedAt && (
                <span className="text-gray-500">
                  {new Date(step.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTaskCard = (task, level = 0) => {
    const isExpanded = expandedTasks.has(task.id)
    const hasWorkflow = task.workflow && task.workflow.length > 0

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-lg border p-4 mb-3 ${level > 0 ? 'ml-6' : ''}`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTaskStatus(task.id)}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500'
                : darkMode ? 'border-gray-500 hover:border-green-500' : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold ${
                task.status === 'completed' ? 'line-through opacity-60' : ''
              }`}>
                {task.title}
              </h3>
              {task.isProject && (
                <span className={`px-2 py-1 rounded text-xs ${
                  darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                }`}>
                  Project
                </span>
              )}
              <span className={`px-2 py-1 rounded text-xs ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority}
              </span>
              {task.progress !== undefined && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <BarChart3 className="w-3 h-3" />
                  {task.progress}%
                </span>
              )}
            </div>

            {task.description && (
              <p className={`text-sm mb-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2">
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.estimatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.estimatedTime}
                </span>
              )}
              {task.client && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {task.client}
                </span>
              )}
            </div>

            {hasWorkflow && (
              <div className="mb-2">
                <button
                  onClick={() => toggleTaskExpansion(task.id)}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                >
                  <FolderTree className="w-3 h-3" />
                  Workflow Steps
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            )}

            {isExpanded && hasWorkflow && renderWorkflowProgress(task)}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditingTask(task)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            {!showArchived ? (
              <button
                onClick={() => archiveTask(task.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => restoreTask(task.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    } min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {showArchived ? 'Archived Tasks' : 'Task Management'}
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {showArchived 
                ? 'Restore or manage your archived tasks'
                : 'Manage your tasks and projects with workflow tracking'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                showArchived
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              {showArchived ? 'Active Tasks' : 'Archive'}
            </button>
            {!showArchived && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        </div>

        <div className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-lg border p-4 mb-6`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="high">High Priority</option>
              <option value="projects">Projects</option>
              <option value="today">Today</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="createdAt">Recent First</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="progress">Progress</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className={`${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-lg border p-8 text-center`}>
              <div className="text-gray-500">
                {showArchived ? 'No archived tasks found' : 'No tasks found'}
              </div>
            </div>
          ) : (
            filteredTodos.map(task => renderTaskCard(task))
          )}
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
                } rounded-lg p-6 w-full max-w-md shadow-xl`}
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
                    value={editingTask?.title || ''}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  
                  <textarea
                    placeholder="Description..."
                    value={editingTask?.description || ''}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    rows={3}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={editingTask?.priority || 'medium'}
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
                      value={editingTask?.category || 'general'}
                      onChange={(e) => setEditingTask({...editingTask, category: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="general">General</option>
                      <option value="project">Project</option>
                      <option value="editing">Editing</option>
                      <option value="shooting">Shooting</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isProject"
                      checked={editingTask?.isProject || false}
                      onChange={(e) => setEditingTask({...editingTask, isProject: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="isProject" className="text-sm">
                      This is a project with workflow steps
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      addTask(editingTask)
                      setEditingTask(null)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Add Task
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingTask(null)
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

        <AnimatePresence>
          {editingTask && !showAddForm && (
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
                } rounded-lg p-6 w-full max-w-md shadow-xl`}
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
                      value={editingTask.estimatedTime}
                      onChange={(e) => setEditingTask({...editingTask, estimatedTime: e.target.value})}
                      placeholder="Estimated time..."
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
    </div>
  )
}

export default EnhancedTodoList
