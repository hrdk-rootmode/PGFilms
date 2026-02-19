// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Conversation Management Component
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminAPI } from '../utils/api'
import {
  MessageSquare,
  Search,
  Filter,
  User,
  Clock,
  Trash2,
  Eye,
  Reply,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react'

const ConversationManagement = ({ darkMode }) => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAnonymous, setShowAnonymous] = useState(true)
  const [expandedConversation, setExpandedConversation] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [sendingReply, setSendingReply] = useState(false)

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getConversations({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      })
      
      // Handle different response structures
      let conversationsData = []
      if (response.data?.data?.conversations && Array.isArray(response.data.data.conversations)) {
        conversationsData = response.data.data.conversations
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        conversationsData = response.data.data
      } else if (Array.isArray(response.data)) {
        conversationsData = response.data
      }
      
      setConversations(conversationsData)
      setError(null)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError('Failed to load conversations')
      setConversations([]) // Ensure it's always an array
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [statusFilter, searchTerm])

  // Enhanced filtering function
  const filteredConversations = useMemo(() => {
    if (!Array.isArray(conversations)) return []
    
    let filtered = conversations
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conversation => 
        conversation.status === statusFilter
      )
    }
    
    // Anonymous filter
    if (!showAnonymous) {
      filtered = filtered.filter(conversation => 
        conversation.visitor?.name && conversation.visitor.name !== 'Anonymous'
      )
    }
    
    // Search filter - search across multiple fields
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(conversation => 
        conversation.visitor?.name?.toLowerCase().includes(searchLower) ||
        conversation.visitor?.email?.toLowerCase().includes(searchLower) ||
        conversation.visitorId?.includes(searchLower) ||
        conversation.messages?.some(msg => msg.content.toLowerCase().includes(searchLower))
      )
    }
    
    return filtered
  }, [conversations, statusFilter, searchTerm, showAnonymous])

  // Delete conversation
  const deleteConversation = async (conversationId) => {
    if (!conversationId) {
      console.error('No conversation ID provided')
      setError('Cannot delete conversation: No ID')
      return
    }
    
    if (!confirm('Are you sure you want to delete this conversation?')) return
    
    try {
      await adminAPI.deleteConversation(conversationId)
      setConversations(prev => prev.filter(conv => conv._id !== conversationId && conv.id !== conversationId))
      setExpandedConversation(null)
    } catch (err) {
      console.error('Error deleting conversation:', err)
      setError('Failed to delete conversation')
    }
  }

  // Delete all anonymous conversations
  const deleteAllAnonymous = async () => {
    const anonymousConversations = conversations.filter(conv => 
      !conv.visitor?.name || conv.visitor.name === 'Anonymous'
    )
    
    if (anonymousConversations.length === 0) {
      alert('No anonymous conversations to delete')
      return
    }
    
    if (!confirm(`Are you sure you want to delete ${anonymousConversations.length} anonymous conversation(s)? This action cannot be undone.`)) return
    
    try {
      // Delete each anonymous conversation
      const deletePromises = anonymousConversations.map(conv => {
        const conversationId = conv._id || conv.id
        if (!conversationId) {
          console.warn('Conversation missing ID:', conv)
          return Promise.resolve()
        }
        return adminAPI.deleteConversation(conversationId)
      })
      
      await Promise.all(deletePromises)
      
      // Update local state
      setConversations(prev => prev.filter(conv => 
        conv.visitor?.name && conv.visitor.name !== 'Anonymous'
      ))
      setExpandedConversation(null)
      
      alert(`Successfully deleted ${anonymousConversations.length} anonymous conversation(s)`)
    } catch (err) {
      console.error('Error deleting anonymous conversations:', err)
      setError('Failed to delete anonymous conversations')
    }
  }

  // Send reply to conversation
  const sendReply = async (conversationId) => {
    if (!replyText.trim()) return

    try {
      setSendingReply(true)
      // Note: This would need to be implemented in the backend
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, {
                type: 'admin',
                content: replyText,
                timestamp: new Date()
              }],
              updatedAt: new Date(),
              status: 'replied'
            }
          : conv
      ))
      
      setReplyText('')
      setReplyingTo(null)
      setSendingReply(false)
    } catch (err) {
      console.error('Error sending reply:', err)
      setError('Failed to send reply')
      setSendingReply(false)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      new: { color: 'blue', icon: AlertCircle, label: 'New' },
      active: { color: 'green', icon: MessageSquare, label: 'Active' },
      replied: { color: 'yellow', icon: Reply, label: 'Replied' },
      closed: { color: 'gray', icon: CheckCircle, label: 'Closed' }
    }

    const config = statusConfig[status] || statusConfig.new
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Conversation card component
  const ConversationCard = ({ conversation }) => {
    const isExpanded = expandedConversation === conversation._id
    const isReplying = replyingTo === conversation._id
    const lastMessage = conversation.messages?.[conversation.messages.length - 1]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {conversation.visitor?.name || conversation.visitorId || 'Anonymous'}
                </h3>
                <StatusBadge status={conversation.status} />
                {!conversation.visitor?.name || conversation.visitor.name === 'Anonymous' ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                  }`}>
                    Visitor
                  </span>
                ) : null}
              </div>
              
              <div className="space-y-2 text-sm">
                {!conversation.visitor?.name || conversation.visitor.name === 'Anonymous' ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className={darkMode ? 'text-orange-300' : 'text-orange-600'}>
                      Visited: {formatTimestamp(conversation.createdAt)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {conversation.visitor?.email || 'No email'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        Last active: {formatTimestamp(conversation.updatedAt)}
                      </span>
                    </div>
                  </>
                )}
                
                {lastMessage && (
                  <div className={`mt-2 p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                      <strong>{lastMessage.type === 'admin' ? 'Admin:' : 'Customer:'}</strong> {lastMessage.content}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedConversation(isExpanded ? null : conversation._id)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4"
              >
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {conversation.messages?.map((message, index) => (
                      <div
                        key={`${message._id || index}`}
                        className={`flex ${message.type === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.type === 'admin'
                              ? 'bg-blue-500 text-white'
                              : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.type === 'admin' ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={isReplying ? replyText : ''}
                      onChange={(e) => setReplyText(e.target.value)}
                      onFocus={() => setReplyingTo(conversation._id)}
                      className={`flex-1 px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={() => sendReply(conversation._id)}
                      disabled={sendingReply || !replyText.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {sendingReply ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div key="actions" className="flex gap-2 pt-2">
                    <button
                      onClick={() => deleteConversation(conversation._id || conversation.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                      Delete Conversation
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Conversation Management
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Manage customer conversations and support requests
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
          
          <button
            onClick={() => setShowAnonymous(!showAnonymous)}
            className={`px-4 py-2 rounded-lg border ${showAnonymous ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
          >
            <Filter className="w-4 h-4" />
            <span className="ml-2">
              {showAnonymous ? 'Hide Anonymous' : 'Show Anonymous'}
            </span>
          </button>
          
          <button
            onClick={deleteAllAnonymous}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-red-600 border-red-700 text-white hover:bg-red-700' : 'bg-red-500 border-red-600 text-white hover:bg-red-600'}`}
          >
            <Trash2 className="w-4 h-4" />
            <span className="ml-2">Delete All Anonymous</span>
          </button>
          
          <button
            onClick={fetchConversations}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Anonymous Filter Info */}
          {!showAnonymous && (
            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 text-blue-300 border border-blue-800/30' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Anonymous conversations hidden</span>
                  <span className="text-sm opacity-80">
                    Showing only booked customers for better focus
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={deleteAllAnonymous}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      darkMode 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Anonymous Count Banner */}
          {(() => {
            const anonymousCount = conversations.filter(conv => 
              !conv.visitor?.name || conv.visitor.name === 'Anonymous'
            ).length
            
            if (anonymousCount === 0) return null
            
            return (
              <div key="anonymous-banner" className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-orange-900/20 text-orange-300 border border-orange-800/30' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {anonymousCount} anonymous conversation{anonymousCount > 1 ? 's' : ''} found
                    </span>
                    <span className="text-sm opacity-80">
                      Visitors who haven't booked yet
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAnonymous(false)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Filter className="w-3 h-3 inline mr-1" />
                      Hide
                    </button>
                    <button
                      onClick={deleteAllAnonymous}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        darkMode 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" />
                      Delete All
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
          
          {/* Conversations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!Array.isArray(filteredConversations) || filteredConversations.length === 0 ? (
              <div className={`col-span-full text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {showAnonymous ? 'No conversations found' : 'No booked customers found. Showing anonymous conversations...'}
              </div>
            ) : (
              filteredConversations.map((conversation, index) => (
                <ConversationCard key={conversation._id || conversation.id || `conversation-${index}`} conversation={conversation} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ConversationManagement
