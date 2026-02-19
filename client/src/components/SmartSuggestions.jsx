// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Smart Task Suggestions Component
// AI-powered task recommendations
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  Plus,
  X,
  Camera,
  Users,
  Phone,
  Target,
  TrendingUp,
  Zap,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react'

const SmartSuggestions = ({ darkMode, onAddTask, onClose }) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [addedTasks, setAddedTasks] = useState(new Set())

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/automation/task-suggestions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.data)
      }
    } catch (err) {
      console.error('Suggestions fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'editing': Camera,
      'shooting': Camera,
      'meeting': Users,
      'communication': Phone,
      'backup': Target,
      'marketing': TrendingUp,
      'maintenance': Zap,
      'preparation': Calendar,
      'admin': Clock
    }
    return icons[category] || Calendar
  }

  const getCategoryColor = (category) => {
    const colors = {
      'editing': 'blue',
      'shooting': 'green',
      'meeting': 'purple',
      'communication': 'orange',
      'backup': 'red',
      'marketing': 'pink',
      'maintenance': 'yellow',
      'preparation': 'indigo',
      'admin': 'gray'
    }
    return colors[category] || 'gray'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleAddTask = (suggestion) => {
    const task = {
      id: Date.now(),
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      priority: suggestion.priority,
      status: 'pending',
      dueDate: suggestion.dueDate,
      estimatedTime: suggestion.estimatedTime,
      client: suggestion.client || '',
      phone: suggestion.phone || '',
      reminder: true,
      aiSuggested: true,
      tags: suggestion.tags || [],
      createdAt: new Date().toISOString()
    }

    // Add to localStorage
    const savedTodos = localStorage.getItem('pg-todos')
    const todos = savedTodos ? JSON.parse(savedTodos) : []
    todos.push(task)
    localStorage.setItem('pg-todos', JSON.stringify(todos))

    // Mark as added
    setAddedTasks(prev => new Set([...prev, suggestion.title]))

    // Callback
    if (onAddTask) {
      onAddTask(task)
    }
  }

  if (!expanded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-xl border p-4`}
      >
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className={`font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              AI Suggestions ({suggestions.length})
            </span>
          </div>
          <ChevronDown className="w-5 h-5 text-purple-500" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-800' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'} rounded-xl border overflow-hidden`}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: darkMode ? '#6b21a8' : '#c4b5fd' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Task Suggestions
              </h3>
              <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                Based on your bookings and workflow
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSuggestions}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-purple-800' : 'hover:bg-purple-100'} transition-colors`}
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setExpanded(false)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-purple-800' : 'hover:bg-purple-100'} transition-colors`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-purple-800' : 'hover:bg-purple-100'} transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`${darkMode ? 'bg-purple-800/30' : 'bg-white'} rounded-lg p-4 animate-pulse`}
              >
                <div className={`h-4 w-3/4 rounded ${darkMode ? 'bg-purple-700' : 'bg-gray-200'} mb-2`} />
                <div className={`h-3 w-1/2 rounded ${darkMode ? 'bg-purple-700' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-6">
            <Lightbulb className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
            <p className={`${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              No suggestions right now. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {suggestions.map((suggestion, index) => {
                const Icon = getCategoryIcon(suggestion.category)
                const color = getCategoryColor(suggestion.category)
                const isAdded = addedTasks.has(suggestion.title)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${darkMode ? 'bg-purple-800/30 border-purple-700' : 'bg-white border-purple-200'} rounded-lg p-4 border ${isAdded ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/50`}>
                        <Icon className={`w-4 h-4 text-${color}-600`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} ${isAdded ? 'line-through' : ''}`}>
                              {suggestion.title}
                            </h4>
                            {suggestion.client && (
                              <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'} mt-1`}>
                                Client: {suggestion.client}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddTask(suggestion)}
                            disabled={isAdded}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              isAdded
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3" />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                Add
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority}
                          </span>
                          {suggestion.estimatedTime && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                              <Clock className="w-3 h-3" />
                              {suggestion.estimatedTime}
                            </span>
                          )}
                          {suggestion.dueDate && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                              <Calendar className="w-3 h-3" />
                              {new Date(suggestion.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>

                        {suggestion.tags?.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {suggestion.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-700'}`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default SmartSuggestions