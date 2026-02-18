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
  Lightbulb,
  Zap
} from 'lucide-react'

const TodoList = ({ darkMode, onTaskUpdate, onTaskSelect }) => {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [sortBy, setSortBy] = useState('priority')
  const [showNotifications, setShowNotifications] = useState(true)

  // AI-powered task suggestions for photographers
  const photographerTasks = [
    { title: 'Review and edit today\'s photos', category: 'editing', priority: 'high', estimatedTime: '2 hours' },
    { title: 'Backup photos to cloud storage', category: 'backup', priority: 'high', estimatedTime: '30 mins' },
    { title: 'Respond to client inquiries', category: 'communication', priority: 'medium', estimatedTime: '1 hour' },
    { title: 'Prepare equipment for tomorrow\'s shoot', category: 'preparation', priority: 'high', estimatedTime: '45 mins' },
    { title: 'Update portfolio with recent work', category: 'marketing', priority: 'low', estimatedTime: '1 hour' },
    { title: 'Schedule social media posts', category: 'marketing', priority: 'low', estimatedTime: '30 mins' },
    { title: 'Clean camera lenses and sensors', category: 'maintenance', priority: 'medium', estimatedTime: '20 mins' },
    { title: 'Follow up with recent clients', category: 'communication', priority: 'medium', estimatedTime: '45 mins' }
  ]

  useEffect(() => {
    loadTodos()
    generateAISuggestions()
  }, [])

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

  const generateAISuggestions = () => {
    const suggestions = photographerTasks.filter(task => 
      !todos.some(todo => todo.title.toLowerCase().includes(task.title.toLowerCase()))
    ).slice(0, 3)
    setAiSuggestions(suggestions)
  }

  const saveTodos = (updatedTodos) => {
    setTodos(updatedTodos)
    localStorage.setItem('pg-todos', JSON.stringify(updatedTodos))
    onTaskUpdate && onTaskUpdate(updatedTodos)
  }

  const toggleTaskStatus = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, status: todo.status === 'completed' ? 'pending' : 'completed' }
        : todo
    )
    saveTodos(updatedTodos)
  }

  const deleteTask = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id)
    saveTodos(updatedTodos)
  }

  const addAISuggestion = (suggestion) => {
    const newTask = {
      id: Date.now(),
      title: suggestion.title,
      description: `AI-suggested task for ${suggestion.category}`,
      category: suggestion.category,
      priority: suggestion.priority,
      status: 'pending',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: suggestion.estimatedTime,
      reminder: true,
      aiSuggested: true,
      createdAt: new Date().toISOString()
    }
    const updatedTodos = [...todos, newTask]
    saveTodos(updatedTodos)
    setShowAISuggestions(false)
    generateAISuggestions()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'editing': return <Camera className="w-4 h-4" />
      case 'meeting': return <Users className="w-4 h-4" />
      case 'backup': return <Target className="w-4 h-4" />
      case 'communication': return <Phone className="w-4 h-4" />
      case 'marketing': return <TrendingUp className="w-4 h-4" />
      case 'maintenance': return <Zap className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-green-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesFilter = filter === 'all' || todo.status === filter || todo.priority === filter
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
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
    completed: todos.filter(t => t.status === 'completed').length,
    pending: todos.filter(t => t.status === 'pending').length,
    inProgress: todos.filter(t => t.status === 'in_progress').length,
    highPriority: todos.filter(t => t.priority === 'high' && t.status !== 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg p-4 border`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Tasks</span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg p-4 border`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completed</span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completed}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg p-4 border`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pending</span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg p-4 border`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>High Priority</span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.highPriority}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg p-4 border`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-purple-500" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI Suggestions</span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{aiSuggestions.length}</p>
        </motion.div>
      </div>

      {/* AI Suggestions Bar */}
      {aiSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode ? 'bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
          } rounded-lg p-4 border`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-500" />
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Task Suggestions</h3>
              <span className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Based on your photography workflow</span>
            </div>
            <button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className={`text-sm ${darkMode ? 'text-purple-300 hover:text-purple-100' : 'text-purple-600 hover:text-purple-800'} transition-colors`}
            >
              {showAISuggestions ? 'Hide' : 'Show'} Suggestions
            </button>
          </div>
          
          <AnimatePresence>
            {showAISuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? 'bg-purple-800/50 border-purple-600' : 'bg-white border-purple-200'
                    } border`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-700' : 'bg-purple-100'}`}>
                        {getCategoryIcon(suggestion.category)}
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{suggestion.title}</p>
                        <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                          {suggestion.estimatedTime} • {suggestion.priority} priority
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => addAISuggestion(suggestion)}
                      className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Add Task
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredAndSortedTodos.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filter !== 'all' ? 'No tasks match your filters' : 'No tasks yet. Start adding some!'}
            </p>
          </div>
        ) : (
          filteredAndSortedTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              } rounded-lg p-4 border hover:shadow-lg transition-all ${
                todo.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleTaskStatus(todo.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    todo.status === 'completed'
                      ? 'bg-green-500 border-green-500'
                      : darkMode
                      ? 'border-gray-600 hover:border-green-500'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {todo.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Task Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(todo.status)}
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} ${
                          todo.status === 'completed' ? 'line-through' : ''
                        }`}>
                          {todo.title}
                        </h3>
                        {todo.aiSuggested && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            AI Suggested
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                        {todo.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(todo.category)}
                          <span className={`capitalize ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {todo.category}
                          </span>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full border ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>

                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {todo.estimatedTime}
                          </span>
                        </div>

                        {todo.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {todo.client && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {todo.client}
                            </span>
                          </div>
                        )}

                        {todo.reminder && (
                          <div className="flex items-center gap-1">
                            <Bell className="w-3 h-3 text-yellow-500" />
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              Reminder set
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => onTaskSelect && onTaskSelect(todo)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Edit Task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(todo.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default TodoList
