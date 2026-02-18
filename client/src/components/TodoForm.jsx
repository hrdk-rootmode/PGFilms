import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  Clock,
  Users,
  Camera,
  Target,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Bell,
  Star,
  AlertCircle,
  Check,
  Plus,
  Lightbulb,
  Zap,
  Save,
  Eye
} from 'lucide-react'

const TodoForm = ({ darkMode, task, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'editing',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    estimatedTime: '1 hour',
    client: '',
    location: '',
    phone: '',
    email: '',
    reminder: true,
    reminderTime: '1 hour before',
    tags: [],
    notes: ''
  })

  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const categories = [
    { value: 'editing', label: 'Photo Editing', icon: Camera, color: 'blue' },
    { value: 'shooting', label: 'Photoshoot', icon: Camera, color: 'green' },
    { value: 'meeting', label: 'Client Meeting', icon: Users, color: 'purple' },
    { value: 'communication', label: 'Communication', icon: Phone, color: 'orange' },
    { value: 'backup', label: 'Backup & Storage', icon: Target, color: 'red' },
    { value: 'marketing', label: 'Marketing', icon: TrendingUp, color: 'pink' },
    { value: 'maintenance', label: 'Equipment Maintenance', icon: Zap, color: 'yellow' },
    { value: 'admin', label: 'Administrative', icon: AlertCircle, color: 'gray' }
  ]

  const aiTaskTemplates = [
    {
      title: 'Edit wedding photos',
      description: 'Complete post-processing for wedding ceremony and reception photos',
      category: 'editing',
      priority: 'high',
      estimatedTime: '4 hours',
      tags: ['wedding', 'editing', 'priority']
    },
    {
      title: 'Client consultation call',
      description: 'Discuss project requirements, timeline, and deliverables with client',
      category: 'communication',
      priority: 'medium',
      estimatedTime: '45 minutes',
      tags: ['client', 'consultation', 'call']
    },
    {
      title: 'Equipment check and cleaning',
      description: 'Clean camera sensors, lenses, and check all equipment functionality',
      category: 'maintenance',
      priority: 'medium',
      estimatedTime: '30 minutes',
      tags: ['maintenance', 'equipment', 'routine']
    },
    {
      title: 'Backup photos to cloud',
      description: 'Upload recent photoshoots to cloud storage and verify backup integrity',
      category: 'backup',
      priority: 'high',
      estimatedTime: '1 hour',
      tags: ['backup', 'cloud', 'security']
    },
    {
      title: 'Update portfolio website',
      description: 'Add recent work to portfolio and update pricing information',
      category: 'marketing',
      priority: 'low',
      estimatedTime: '2 hours',
      tags: ['website', 'portfolio', 'marketing']
    }
  ]

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        reminderTime: task.reminderTime || '1 hour before',
        tags: task.tags || [] // Ensure tags is always an array
      })
    }
  }, [task])

  const generateAISuggestions = () => {
    const suggestions = aiTaskTemplates.filter(template => 
      !formData.title.toLowerCase().includes(template.title.toLowerCase())
    ).slice(0, 3)
    setAiSuggestions(suggestions)
    setShowAISuggestions(true)
  }

  const applyAISuggestion = (suggestion) => {
    setFormData({
      ...formData,
      ...suggestion,
      tags: suggestion.tags || []
    })
    setShowAISuggestions(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const taskData = {
      ...formData,
      id: task?.id || Date.now(),
      updatedAt: new Date().toISOString(),
      createdAt: task?.createdAt || new Date().toISOString()
    }

    if (!formData.dueDate) {
      delete taskData.dueDate
    }

    onSave(taskData)
    onClose()
  }

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.color : 'gray'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (previewMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}
        onClick={() => setPreviewMode(false)}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Task Preview
            </h2>
            <button
              onClick={() => setPreviewMode(false)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {formData.title || 'Untitled Task'}
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formData.description || 'No description provided'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full border ${getPriorityColor(formData.priority)}`}>
                {formData.priority} priority
              </span>
              <span className={`px-3 py-1 rounded-full bg-${getCategoryColor(formData.category)}-100 text-${getCategoryColor(formData.category)}-800 border border-${getCategoryColor(formData.category)}-200`}>
                {categories.find(c => c.value === formData.category)?.label}
              </span>
              <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                {formData.status}
              </span>
            </div>

            {formData.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Due: {new Date(formData.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {formData.estimatedTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Estimated time: {formData.estimatedTime}
                </span>
              </div>
            )}

            {(formData.client || formData.phone || formData.email) && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Client Information
                </h4>
                {formData.client && <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Client: {formData.client}</p>}
                {formData.phone && <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Phone: {formData.phone}</p>}
                {formData.email && <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Email: {formData.email}</p>}
                {formData.location && <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Location: {formData.location}</p>}
              </div>
            )}

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {formData.notes && (
              <div>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notes
                </h4>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formData.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setPreviewMode(false)}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Back to Edit
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Task
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(true)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Preview Task"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        <AnimatePresence>
          {showAISuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'bg-purple-900/50 border-purple-700' : 'bg-purple-50 border-purple-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-purple-500" />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Task Suggestions
                </h3>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      darkMode ? 'bg-purple-800/50 border-purple-600' : 'bg-white border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {suggestion.title}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                          {suggestion.description}
                        </p>
                      </div>
                      <button
                        onClick={() => applyAISuggestion(suggestion)}
                        className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Use This
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title and Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter task title..."
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Describe the task in detail..."
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date and Estimated Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Estimated Time
              </label>
              <input
                type="text"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., 2 hours, 30 minutes"
              />
            </div>
          </div>

          {/* Client Information */}
          <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Client Information (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Client Name
                </label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Client name..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Phone number..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Email address..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Location..."
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Add tags..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Any additional notes or reminders..."
            />
          </div>

          {/* Reminder Settings */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="reminder"
                checked={formData.reminder}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Enable reminder
              </span>
            </label>
            
            {formData.reminder && (
              <select
                name="reminderTime"
                value={formData.reminderTime}
                onChange={handleInputChange}
                className={`px-3 py-1 text-sm rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="15 minutes before">15 minutes before</option>
                <option value="30 minutes before">30 minutes before</option>
                <option value="1 hour before">1 hour before</option>
                <option value="2 hours before">2 hours before</option>
                <option value="1 day before">1 day before</option>
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={generateAISuggestions}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                darkMode ? 'border-purple-600 text-purple-400 hover:bg-purple-900/50' : 'border-purple-300 text-purple-600 hover:bg-purple-50'
              } transition-colors flex items-center justify-center gap-2`}
            >
              <Lightbulb className="w-4 h-4" />
              AI Suggestions
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg border ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {task ? 'Update' : 'Create'} Task
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default TodoForm
