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
  ChevronRight,
  Calendar as CalendarViewIcon
} from 'lucide-react'

const TodoListBasic = ({ darkMode, onTaskUpdate, onTaskSelect }) => {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('priority')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('list')

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

  const filteredAndSortedTodos = todos.filter(todo => {
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
    highPriority: todos.filter(t => t.priority === 'high' && t.status !== 'completed').length
  }

  const renderTask = (todo, index) => (
    <motion.div
      key={todo.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } rounded-lg p-3 border transition-all ${
        todo.status === 'completed' ? 'opacity-60 bg-gray-50 dark:bg-gray-900/50' : ''
      }`}
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
            <h4 className={`font-medium text-sm truncate ${
              darkMode ? 'text-white' : 'text-gray-900'
            } ${todo.status === 'completed' ? 'line-through opacity-75' : ''}`}>
              {todo.title}
            </h4>
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
          </div>
        </div>

        <div className="flex items-center gap-1">
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
            filteredAndSortedTodos.map((todo, index) => renderTask(todo, index))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TodoListBasic
