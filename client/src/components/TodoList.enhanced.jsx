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
  Calendar as CalendarViewIcon
} from 'lucide-react'

const TodoListEnhanced = ({ darkMode, onTaskUpdate, onTaskSelect }) => {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('priority')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [expandedProjects, setExpandedProjects] = useState(new Set())

  useEffect(() => {
    loadTodos()
  }, [])

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
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '20 hours',
          client: 'Johnson Family',
          reminder: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Edit wedding photos',
          description: 'Complete editing 200+ photos from weekend wedding shoot',
          category: 'editing',
          priority: 'high',
          status: 'pending',
          parentId: 1,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '4 hours',
          client: 'Johnson Family',
          reminder: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Create photo album',
          description: 'Design and create wedding photo album',
          category: 'editing',
          priority: 'medium',
          status: 'pending',
          parentId: 1,
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
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
          priority: 'high',
          status: 'pending',
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

  const toggleTaskStatus = (id) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
        return { ...todo, status: newStatus }
      }
      return todo
    })
    saveTodos(updatedTodos)
  }

  const addTask = (newTask) => {
    const task = {
      id: Date.now(),
      ...newTask,
      createdAt: new Date().toISOString()
    }
    const updatedTodos = [task, ...todos]
    saveTodos(updatedTodos)
    setShowAddForm(false)
  }

  const updateTask = (updatedTask) => {
    const updatedTodos = todos.map(todo => 
      todo.id === updatedTask.id ? updatedTask : todo
    )
    saveTodos(updatedTodos)
    setEditingTask(null)
  }

  const deleteTask = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id)
    // Also delete sub-tasks if this is a project
    const subTasks = todos.filter(todo => todo.parentId === id)
    const finalTodos = updatedTodos.filter(todo => !subTasks.some(sub => sub.id === todo.id))
    saveTodos(finalTodos)
  }

  const toggleProjectExpansion = (projectId) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
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

  const filteredAndSortedTodos = getRootTasks().filter(todo => {
    const matchesFilter = filter === 'all' || todo.status === filter || todo.priority === filter
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    } else if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    return 0
  })

  const stats = {
    total: todos.length,
    pending: todos.filter(t => t.status === 'pending').length,
    completed: todos.filter(t => t.status === 'completed').length,
    highPriority: todos.filter(t => t.priority === 'high' && t.status !== 'completed').length,
    projects: todos.filter(t => t.isProject).length
  }

  const renderTask = (todo, index, isSubTask = false) => (
    <motion.div
      key={todo.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } rounded-lg p-3 border transition-all ${
        todo.status === 'completed' ? 'opacity-60 bg-gray-50 dark:bg-gray-900/50' : ''
      } ${isSubTask ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-600' : ''}`}
    >
      <div className="flex items-center gap-3">
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {todo.isProject ? (
              <FolderPlus className="w-4 h-4 text-blue-500" />
            ) : (
              <FileText className="w-4 h-4 text-gray-500" />
            )}
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
          
          <div className="flex items-center gap-2 text-xs">
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
            {todo.dueDate && (
              <span className={`${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                • {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {todo.isProject && (
            <button
              onClick={() => toggleProjectExpansion(todo.id)}
              className={`p-1 rounded transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={expandedProjects.has(todo.id) ? 'Collapse' : 'Expand'}
            >
              {expandedProjects.has(todo.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => setEditingTask(todo)}
            className={`p-1 rounded transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Edit Task"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteTask(todo.id)}
            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )

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
      parentId: task?.parentId || null
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

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isProject}
                onChange={(e) => setFormData(prev => ({ ...prev, isProject: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                This is a project
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Task Management
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

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarViewIcon className="w-4 h-4" />
            Calendar View
          </button>
        </div>
        
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-sm ${
            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
            Total: {stats.total}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Task
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
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
      </div>

      <AnimatePresence>
        {(showAddForm || editingTask) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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

      <div className="space-y-2">
        <AnimatePresence>
          {filteredAndSortedTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <List className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm || filter !== 'all' ? 'No tasks match your filters' : 'No tasks yet. Start adding some!'}
              </p>
            </motion.div>
          ) : (
            filteredAndSortedTodos.map((todo, index) => {
              const subTasks = getSubTasks(todo.id)
              const isExpanded = expandedProjects.has(todo.id)
              
              return (
                <React.Fragment key={todo.id}>
                  {renderTask(todo, index, false)}
                  
                  {todo.isProject && isExpanded && subTasks.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {subTasks.map((subTask, subIndex) => (
                        renderTask(subTask, index + subIndex + 1, true)
                      ))}
                    </div>
                  )}
                </React.Fragment>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TodoListEnhanced
