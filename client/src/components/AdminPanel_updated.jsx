// ═══════════════════════════════════════════════════════════════
// CONVERSATIONS SECTION WITH FULL FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════

const ConversationsSection = () => {
  const [filter, setFilter] = useState('all')
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await adminAPI.getConversations()
        if (res.data.success) {
          setConversations(res.data.data.conversations)
        }
      } catch (error) {
        console.error("Error fetching conversations", error)
        setConversations([])
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  const handleViewConversation = async (conv) => {
    try {
      const res = await adminAPI.getConversation(conv.id)
      if (res.data.success) {
        setSelectedConversation(res.data.data)
        setShowViewModal(true)
      }
    } catch (error) {
      console.error("Error fetching conversation details", error)
    }
  }

  const handleDeleteConversation = async (conv) => {
    setConversationToDelete(conv)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!conversationToDelete) return
    
    try {
      await adminAPI.deleteConversation(conversationToDelete.id)
      setConversations(conversations.filter(c => c.id !== conversationToDelete.id))
      setShowDeleteModal(false)
      setConversationToDelete(null)
    } catch (error) {
      console.error("Error deleting conversation", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'booking': return 'bg-green-500/20 text-green-400'
      case 'inquiry': return 'bg-blue-500/20 text-blue-400'
      case 'completed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading conversations...</div>

  const filteredConversations = filter === 'all'
    ? conversations
    : conversations.filter(c => c.status === filter)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {['all', 'booking', 'inquiry', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No conversations found</div>
        ) : (
          filteredConversations.map((conv, index) => (
            <div
              key={conv.id}
              className={`flex items-center gap-4 p-4 hover:bg-dark-700/50 transition-colors cursor-pointer ${index !== filteredConversations.length - 1 ? 'border-b border-dark-700' : ''
                }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center flex-shrink-0">
                {conv.visitor?.name ? conv.visitor.name.charAt(0) : '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {conv.visitor?.name || 'Unknown Visitor'}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(conv.status)}`}>
                    {conv.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
              </div>

              {/* Meta */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-400">{conv.messages} msgs</p>
                <p className="text-xs text-gray-500">
                  {new Date(conv.date).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewConversation(conv)}
                  className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                  title="View conversation"
                >
                  <Eye size={18} className="text-gray-400" />
                </button>
                <button 
                  onClick={() => handleDeleteConversation(conv)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Conversation Modal */}
      <AnimatePresence>
        {showViewModal && selectedConversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Conversation with {selectedConversation.visitor?.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(selectedConversation.createdAt).toLocaleDateString()} • {selectedConversation.messages?.length || 0} messages
                    </p>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {selectedConversation.messages?.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-xl ${
                        msg.sender === 'user' 
                          ? 'bg-primary-500/20 text-primary-100' 
                          : 'bg-dark-700 text-gray-200'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && conversationToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Delete Conversation?</h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete the conversation with {conversationToDelete.visitor?.name || 'Unknown'}? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
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
