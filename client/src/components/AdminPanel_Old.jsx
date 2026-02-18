import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Package,
  Brain,
  ShieldAlert,
  BarChart3,
  Trash2,
  Upload,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  MoreVertical,
  RefreshCw,
  Download,
  Filter,
  Plus,
  Save,
  ArrowLeft,
  User,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  DollarSign,
  Star,
  ExternalLink,
  Copy,
  Check,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  MapPin as MapPinIcon,
  Clock as ClockIcon,
  MessageCircle as MessageCircleIcon,
  Eye as EyeIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon
} from 'lucide-react'
import { adminAPI } from '../utils/api'
import NotificationSystem from './NotificationSystem'
import DashboardSectionEnhanced from './DashboardSectionEnhanced'
import EnhancedBookingCard from './EnhancedBookingCard'

// ═══════════════════════════════════════════════════════════════
// SIDEBAR COMPONENT
// ═══════════════════════════════════════════════════════════════

const Sidebar = ({ activeTab, setActiveTab, onLogout, isMobile, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare, badge: 3 },
    { id: 'bookings', label: 'Bookings', icon: Calendar, badge: 5 },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'learning', label: 'Learning', icon: Brain, badge: 3 },
    { id: 'abuse', label: 'Abuse Reports', icon: ShieldAlert, badge: 2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'trash', label: 'Trash', icon: Trash2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center">
            <span className="text-lg">🎬</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">PG Films</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id)
              if (isMobile) onClose()
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`}
          >
            <item.icon size={20} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-accent-rose text-white rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-dark-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  // Mobile sidebar
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-dark-900 border-r border-dark-700 z-50 lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Desktop sidebar
  return (
    <aside className="hidden lg:block w-[280px] bg-dark-900 border-r border-dark-700 h-screen sticky top-0">
      {sidebarContent}
    </aside>
  )
}

// ═══════════════════════════════════════════════════════════════
// HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════

const Header = ({ activeTab, onMenuClick, admin }) => {
  const tabTitles = {
    dashboard: 'Dashboard',
    conversations: 'Conversations',
    bookings: 'Bookings',
    packages: 'Packages',
    learning: 'Bot Learning',
    abuse: 'Abuse Reports',
    analytics: 'Analytics',
    trash: 'Trash',
    settings: 'Settings'
  }

  return (
    <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold">{tabTitles[activeTab]}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationSystem />
          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-dark-700">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{admin?.email || 'admin@pgfilms.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => {
  const isPositive = change >= 0
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-500/5 border-primary-500/30',
    rose: 'from-accent-rose/20 to-accent-rose/5 border-accent-rose/30',
    gold: 'from-accent-gold/20 to-accent-gold/5 border-accent-gold/30',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center`}>
          <Icon size={24} className="text-gray-400" />
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD SECTION
// ═══════════════════════════════════════════════════════════════

const DashboardSection = () => {
  return <DashboardSectionEnhanced />
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD SECTION (ENHANCED)
// ═══════════════════════════════════════════════════════════════

const DashboardSectionEnhanced = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await adminAPI.getDashboard() // Calls backend
        if (res.data.success) {
          setData(res.data.data)
        }
      } catch (error) {
        console.error("Dashboard Load Error:", error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-400">Loading live data...</div>
  if (!data) return <div className="p-8 text-center text-red-400">Failed to load data.</div>

  return (
    <div className="space-y-6">
      {/* Real Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Conversations"
          value={data.stats?.totalConversations || 0}
          change={data.stats?.newConversations || 0}
          icon={MessageCircle}
          color="cyan"
        />
        <StatCard
          title="Total Bookings"
          value={data.stats?.totalBookings || 0}
          change={data.stats?.pendingBookings || 0}
          icon={Calendar}
          color="rose"
        />
        <StatCard
          title="Today's Messages"
          value={data.stats?.todayMessages || 0}
          change={0}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="New Conversations"
          value={data.stats?.todayConversations || 0}
          change={0}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Real Recent Conversations */}
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Conversations (Live)</h3>
            <button
              onClick={() => window.location.href = '#conversations'}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(!data.recentConversations || data.recentConversations.length === 0) ? (
              <p className="text-gray-500 text-center py-8">No conversations yet.</p>
            ) : (
              (data.recentConversations || []).map((conv) => (
                <div key={conv.id} className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-xl">
                  <div className={`w-2 h-2 rounded-full ${conv.isBooking ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.visitorName}</p>
                    <p className="text-sm text-gray-500">
                      {conv.lastMessage} • {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${conv.isBooking ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {conv.isBooking ? 'Booking' : 'Inquiry'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bot Learning */}
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Learning Suggestions</h3>
            <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-full">
              {data.pendingPatterns?.length || 0} pending
            </span>
          </div>
          <div className="space-y-3">
            {(!data.pendingPatterns || data.pendingPatterns.length === 0) ? (
              <p className="text-gray-500 text-sm text-center py-8">No pending patterns</p>
            ) : (
              (data.pendingPatterns || []).map((pattern) => (
                <div key={pattern.id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl">
                  <div>
                    <p className="font-medium">"{pattern.word}"</p>
                    <p className="text-sm text-gray-500">
                      Asked {pattern.occurrences} times → {pattern.suggestedIntent}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Check size={16} />
                    </button>
                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Performance */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Chat Response Breakdown</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-dark-700 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all"
              style={{ width: `${data.chatStats?.instant || 0}%` }}
            />
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${data.chatStats?.pattern || 0}%` }}
            />
            <div
              className="bg-purple-500 h-full transition-all"
              style={{ width: `${data.chatStats?.ai || 0}%` }}
            />
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-400">Instant ({data.chatStats?.instant || 0}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-400">Pattern ({data.chatStats?.pattern || 0}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-sm text-gray-400">AI ({data.chatStats?.ai || 0}%)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💰 Total AI Cost: ₹0 (Free tier)
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CONVERSATIONS SECTION
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
    // Only allow deletion of inquiries, not bookings
    if (conv.status === 'booking') {
      alert('Cannot delete booking conversations. Please cancel the booking first.')
      return
    }
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
                <p className="text-sm text-gray-500 truncate">
                  {typeof conv.lastMessage === 'string' 
                    ? conv.lastMessage 
                    : conv.lastMessage?.text || conv.lastMessage?.displayText || 'No message'
                  }
                </p>
              </div>

              {/* Meta */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-400">{conv.messageCount || conv.messages?.length || 0} msgs</p>
                <p className="text-xs text-gray-500">
                  {new Date(conv.createdAt || conv.lastActiveAt || conv.date).toLocaleDateString()}
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BOOKINGS SECTION (UPDATED WITH REAL API)
// ═══════════════════════════════════════════════════════════════

const BookingsSection = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showTodoModal, setShowTodoModal] = useState(false)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await adminAPI.getBookings() // Calls backend
        if (res.data.success) {
          setBookings(res.data.data.bookings)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistically update
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b))

      const res = await adminAPI.updateBooking(id, { status: newStatus })
      if (!res.data.success) {
        // Revert on failure
        // Need to fetch again or store previous state
        const refresh = await adminAPI.getBookings()
        if (refresh.data.success) setBookings(refresh.data.data.bookings)
      }
    } catch (err) {
      console.error('Error updating status', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return

    try {
      const res = await adminAPI.deleteBooking(id) // Now implemented in API and Backend
      if (res.data.success) {
        setBookings(bookings.filter(b => b.id !== id))
      }
    } catch (err) {
      console.error('Error deleting booking', err)
      alert('Failed to delete booking')
    }
  }

  const openTodoModal = (booking) => {
    setSelectedBooking(booking)
    setShowTodoModal(true)
  }

  const closeTodoModal = () => {
    setShowTodoModal(false)
    setSelectedBooking(null)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'contacted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <div className="grid grid-cols-5 gap-4">
        {['pending', 'contacted', 'confirmed', 'completed', 'cancelled'].map((status) => {
          const count = bookings.filter(b => b.status === status).length
          return (
            <div key={status} className="bg-dark-800/50 rounded-xl p-4 text-center border border-dark-700">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-400 capitalize">{status}</p>
            </div>
          )
        })}
      </div>

      {/* Bookings Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-10">No bookings found.</p>
        )}

        {bookings.map((booking) => (
          <EnhancedBookingCard
            key={booking.id}
            booking={booking}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            conversationId={booking.conversationId}
          />
        ))}
      </div>

      {/* User Information Todo List Modal */}
      <AnimatePresence>
        {showTodoModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={closeTodoModal}
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
                    <h3 className="font-semibold">Task Management for {selectedBooking.name}</h3>
                    <p className="text-sm text-gray-400">
                      Package: {selectedBooking.package} • Status: {selectedBooking.status}
                    </p>
                  </div>
                  <button
                    onClick={closeTodoModal}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <UserInformationTodoList booking={selectedBooking} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// USER INFORMATION TODO LIST COMPONENT
// ═══════════════════════════════════════════════════════════════

const UserInformationTodoList = ({ booking }) => {
  const [tasks, setTasks] = useState([
    { id: 'contact', title: 'Contact User', description: 'Reach out to the user to confirm their interest and gather initial information', completed: false, priority: 'high' },
    { id: 'details', title: 'Gather Event Details', description: 'Collect event date, location, and specific requirements', completed: false, priority: 'high' },
    { id: 'package', title: 'Confirm Package Details', description: 'Verify package selection and discuss any customizations', completed: false, priority: 'medium' },
    { id: 'contract', title: 'Send Contract/Agreement', description: 'Prepare and send the booking agreement for signature', completed: false, priority: 'medium' },
    { id: 'payment', title: 'Process Payment', description: 'Handle deposit and payment arrangements', completed: false, priority: 'high' },
    { id: 'schedule', title: 'Schedule Pre-Event Meeting', description: 'Arrange a meeting to discuss final details and expectations', completed: false, priority: 'low' },
    { id: 'prep', title: 'Prepare Equipment', description: 'Ensure all necessary equipment is ready for the event', completed: false, priority: 'low' }
  ])

  const [currentTask, setCurrentTask] = useState(null)

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ))
  }

  const setTaskAsCurrent = (taskId) => {
    setCurrentTask(taskId)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCompletedTasksCount = () => tasks.filter(task => task.completed).length
  const getTotalTasksCount = () => tasks.length

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-400">
            {getCompletedTasksCount()} / {getTotalTasksCount()} completed
          </span>
        </div>
        <div className="w-full bg-dark-600 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all"
            style={{ width: `${(getCompletedTasksCount() / getTotalTasksCount()) * 100}%` }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl border transition-all ${
              currentTask === task.id 
                ? 'border-primary-500/50 bg-primary-500/10' 
                : task.completed 
                  ? 'border-green-500/30 bg-green-500/10' 
                  : 'border-dark-600 bg-dark-700/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 text-primary-500 bg-dark-600 border-dark-500 rounded focus:ring-primary-500"
                  />
                  <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-400 ml-6">{task.description}</p>
              </div>
              <button
                onClick={() => setTaskAsCurrent(task.id)}
                className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                  currentTask === task.id 
                    ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' 
                    : 'bg-dark-600 text-gray-400 border-dark-500 hover:bg-dark-500'
                }`}
              >
                Focus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Current Task Details */}
      {currentTask && (
        <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
          <h4 className="font-semibold text-primary-400 mb-2">Current Focus</h4>
          <p className="text-white">
            {tasks.find(task => task.id === currentTask)?.title}
          </p>
          <p className="text-sm text-gray-300 mt-1">
            {tasks.find(task => task.id === currentTask)?.description}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 pt-4 border-t border-dark-600">
        <button
          onClick={() => setTasks(tasks.map(task => ({ ...task, completed: true })))}
          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
        >
          Mark All Complete
        </button>
        <button
          onClick={() => setTasks(tasks.map(task => ({ ...task, completed: false })))}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
        >
          Reset All
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PACKAGES SECTION
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// PACKAGES SECTION
// ═══════════════════════════════════════════════════════════════

const PackagesSection = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPkg, setEditingPkg] = useState(null) // null = list mode
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: [],
    image: '',
    active: true,
    popular: false
  })

  const fetchPackages = async () => {
    try {
      const res = await adminAPI.getAdminPackages()
      if (res.data.success) {
        setPackages(Array.isArray(res.data.data) ? res.data.data : (res.data.data.packages || []))
      }
    } catch (error) {
      console.error("Error fetching packages", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleEdit = (pkg) => {
    setEditingPkg(pkg || 'new')
    setFormData(pkg ? { ...pkg } : {
      name: '',
      price: '',
      description: '',
      features: [],
      image: '',
      active: true,
      popular: false
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return
    try {
      const res = await adminAPI.deletePackage(id)
      if (res.data.success) fetchPackages()
    } catch (e) {
      alert('Delete failed')
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price) return alert('Name and Price are required')

    try {
      let res
      if (editingPkg && editingPkg.id) {
        res = await adminAPI.updatePackage(editingPkg.id, formData)
      } else {
        res = await adminAPI.createPackage(formData)
      }

      if (res.data.success) {
        fetchPackages()
        setEditingPkg(null)
      }
    } catch (e) {
      console.error(e)
      alert('Save failed')
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      // Use generic uploadFile which works for images/videos
      const res = await adminAPI.uploadFile(file)
      if (res.data.success) {
        setFormData({ ...formData, image: res.data.data.url })
      }
    } catch (e) {
      alert('Upload failed')
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading packages...</div>

  // EDIT/ADD FORM
  if (editingPkg) {
    return (
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-dark-700 pb-4">
          <h3 className="font-semibold">{editingPkg.id ? 'Edit Package' : 'New Package'}</h3>
          <button onClick={() => setEditingPkg(null)} className="p-2 hover:bg-dark-700 rounded-lg">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Package Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Features (one per line)</label>
              <textarea
                rows={5}
                value={formData.features ? formData.features.join('\n') : ''}
                onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n') })}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500 font-mono text-sm"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded bg-dark-900 border-dark-700 text-primary-500"
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="rounded bg-dark-900 border-dark-700 text-primary-500"
                />
                <span className="text-sm">Popular Badge</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm text-gray-400 mb-1">Package Media (Image/Video)</label>
            <div className={`border-2 border-dashed border-dark-600 rounded-xl p-6 text-center transition-colors ${formData.image ? 'bg-dark-900' : 'hover:bg-dark-700/50'}`}>
              {formData.image ? (
                <div className="relative">
                  {/\.(mp4|webm|mov|avi|mkv)$/i.test(formData.image) ? (
                    <video src={formData.image} className="mx-auto max-h-48 rounded-lg object-cover" controls />
                  ) : (
                    <img src={formData.image} alt="Package" className="mx-auto max-h-48 rounded-lg object-cover" />
                  )}
                  <button
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block h-full flex flex-col items-center justify-center">
                  <Upload size={32} className="text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload</p>
                  <p className="text-xs text-gray-600 mt-1">Images or Videos</p>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-dark-700">
          <button onClick={handleSave} className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2">
            <Save size={18} /> Save Package
          </button>
          <button onClick={() => setEditingPkg(null)} className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // LIST VIEW
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400">Manage your photography packages</p>
        <button onClick={() => handleEdit(null)} className="btn-primary text-sm">
          <Plus size={18} className="mr-2" />
          Add Package
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-10 text-center text-gray-500">
          No packages configured yet. Click "Add Package" to create one.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6 flex flex-col h-full"
            >
              {pkg.image && (
                <div className="mb-4 h-48 rounded-xl bg-dark-900 overflow-hidden relative">
                  {/\.(mp4|webm|mov|avi|mkv)$/i.test(pkg.image) ? (
                    <video
                      src={pkg.image}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    {pkg.popular && (
                      <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold gradient-text mt-1">₹{pkg.price?.toLocaleString() || 0}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(pkg)} className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
                    <Edit size={16} className="text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group">
                    <Trash2 size={16} className="text-gray-400 group-hover:text-red-400" />
                  </button>
                </div>
              </div>

              <ul className="space-y-2 mb-4 flex-1">
                {pkg.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle size={14} className="text-primary-400 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                <span className={`text-sm ${pkg.active ? 'text-green-400' : 'text-gray-500'}`}>
                  {pkg.active ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LEARNING SECTION
// ═══════════════════════════════════════════════════════════════

const LearningSection = () => {
  const [patterns, setPatterns] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        const res = await adminAPI.getLearning()
        if (res.data.success) {
          setPatterns(res.data.data.patterns)
          setStats(res.data.data.stats)
        }
      } catch (error) {
        console.error("Error fetching learning data", error)
        setPatterns([])
        setStats({})
      } finally {
        setLoading(false)
      }
    }
    fetchLearning()
  }, [])

  const approvePattern = async (patternId) => {
    try {
      const res = await adminAPI.approvePattern(patternId)
      if (res.data.success) {
        setPatterns(patterns.filter(p => p.id !== patternId))
      }
    } catch (error) {
      console.error("Error approving pattern", error)
    }
  }

  const rejectPattern = async (patternId) => {
    try {
      const res = await adminAPI.rejectPattern(patternId)
      if (res.data.success) {
        setPatterns(patterns.filter(p => p.id !== patternId))
      }
    } catch (error) {
      console.error("Error rejecting pattern", error)
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading learning data...</div>

  return (
    <div className="space-y-6">
      {/* Pending Patterns */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pending Patterns ({patterns.length})</h3>
          <button className="text-sm text-primary-400 hover:text-primary-300">Auto-approve all</button>
        </div>
        <div className="space-y-3">
          {patterns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending patterns</p>
          ) : (
            patterns.map((pattern) => (
              <div key={pattern.id} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                <div>
                  <p className="font-medium">"{pattern.word}"</p>
                  <p className="text-sm text-gray-500">
                    Asked {pattern.occurrences} times • Suggested: <span className="text-primary-400">{pattern.suggestedIntent}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-1.5 bg-dark-600 border border-dark-500 rounded-lg text-sm focus:outline-none">
                    <option value="portfolio">portfolio</option>
                    <option value="pricing">pricing</option>
                    <option value="availability">availability</option>
                    <option value="contact">contact</option>
                  </select>
                  <button
                    onClick={() => approvePattern(pattern.id)}
                    className="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectPattern(pattern.id)}
                    className="px-4 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Learning Stats */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Learning Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-dark-700/50 rounded-xl">
            <p className="text-2xl font-bold text-green-400">{stats.autoLearned || 0}</p>
            <p className="text-sm text-gray-400">Auto-learned</p>
          </div>
          <div className="text-center p-4 bg-dark-700/50 rounded-xl">
            <p className="text-2xl font-bold text-blue-400">{stats.adminApproved || 0}</p>
            <p className="text-sm text-gray-400">Admin Approved</p>
          </div>
          <div className="text-center p-4 bg-dark-700/50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingReview || patterns.length}</p>
            <p className="text-sm text-gray-400">Pending Review</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ABUSE SECTION
// ═══════════════════════════════════════════════════════════════

const AbuseSection = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAbuse = async () => {
      try {
        const res = await adminAPI.getAbuseReports()
        if (res.data.success) {
          setReports(res.data.data.reports)
        }
      } catch (error) {
        console.error("Error fetching abuse reports", error)
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    fetchAbuse()
  }, [])

  const handleDismiss = async (id) => {
    try {
      const res = await adminAPI.dismissAbuse(id)
      if (res.data.success) {
        setReports(reports.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error("Error dismissing report", error)
    }
  }

  const handleBlock = async (report) => {
    if (!window.confirm('Are you sure you want to block this user? They will be unable to chat.')) return
    try {
      // Block user
      await adminAPI.blockUser(report.visitorId)
      // Automatically dismiss the report
      const res = await adminAPI.dismissAbuse(report.id)
      if (res.data.success) {
        setReports(reports.filter(r => r.id !== report.id))
        alert('User blocked and report dismissed')
      }
    } catch (error) {
      console.error("Error blocking user", error)
      alert('Failed to block user')
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading abuse reports...</div>

  return (
    <div className="space-y-6">
      {/* Reports List */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Flagged Messages ({reports.length})</h3>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No abuse reports</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-4 bg-dark-700/50 rounded-xl border-l-4 border-red-500">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs ${report.type === 'profanity' ? 'bg-orange-500/20 text-orange-400' :
                      report.type === 'threat' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {report.type}
                    </span>
                    <p className="mt-2 text-gray-300">{report.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(report.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDismiss(report.id)}
                      className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleBlock(report)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                    >
                      Block User
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Abuse Word List */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Abuse Word List</h3>
          <button className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
            <Plus size={14} />
            Add Word
          </button>
        </div>
        <p className="text-sm text-gray-400">
          Manage the list of words that trigger abuse detection. Words are categorized by severity.
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS SECTION
// ═══════════════════════════════════════════════════════════════

const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminAPI.getAnalytics()
        if (res.data.success) {
          setAnalytics(res.data.data)
        }
      } catch (error) {
        console.error("Error fetching analytics", error)
        setAnalytics({
          totalVisitors: 0,
          totalChats: 0,
          totalBookings: 0,
          totalRevenue: 0
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div className="p-10 text-center text-gray-500">Loading analytics...</div>

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-green-400 font-medium">Analytics are Protected</p>
          <p className="text-sm text-gray-400 mt-1">
            Analytics data cannot be deleted to preserve your business history and growth tracking.
          </p>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-4">
        <select className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-sm focus:outline-none focus:border-primary-500">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>This Year</option>
        </select>
        <button className="btn-secondary text-sm">
          <Download size={16} className="mr-2" />
          Export Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Visitors</p>
          <p className="text-2xl font-bold mt-1">{analytics?.totalVisitors || 0}</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Chats</p>
          <p className="text-2xl font-bold mt-1">{analytics?.totalChats || 0}</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold mt-1">{analytics?.totalBookings || 0}</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">₹{(analytics?.totalRevenue / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>Chart visualization will be added here</p>
          <p className="text-sm mt-1">Connect backend to see real data</p>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TRASH SECTION
// ═══════════════════════════════════════════════════════════════

const TrashSection = () => {
  const [trash, setTrash] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const res = await adminAPI.getTrash()
        if (res.data.success) {
          setTrash(res.data.data.trash)
        }
      } catch (error) {
        console.error("Error fetching trash", error)
        setTrash([])
      } finally {
        setLoading(false)
      }
    }
    fetchTrash()
  }, [])

  const recoverItem = async (itemId) => {
    try {
      const res = await adminAPI.recoverFromTrash(itemId)
      if (res.data.success) {
        setTrash(trash.filter(item => item.id !== itemId))
      }
    } catch (error) {
      console.error("Error recovering item", error)
    }
  }

  const deleteItem = async (itemId) => {
    try {
      const res = await adminAPI.permanentDelete(itemId)
      if (res.data.success) {
        setTrash(trash.filter(item => item.id !== itemId))
      }
    } catch (error) {
      console.error("Error deleting item", error)
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading trash...</div>

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-400 font-medium">Trash Retention: 30 Days</p>
          <p className="text-sm text-gray-400 mt-1">
            Items in trash will be permanently deleted after 30 days. You can recover them before that.
          </p>
        </div>
      </div>

      {/* Trash Items */}
      {trash.length > 0 ? (
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 overflow-hidden">
          {trash.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 ${index !== trash.length - 1 ? 'border-b border-dark-700' : ''
                }`}
            >
              <Trash2 size={20} className="text-gray-500" />
              <div className="flex-1">
                <p className="font-medium">Conversation with {item.visitor || 'Unknown'}</p>
                <p className="text-sm text-gray-500">Deleted {new Date(item.deletedAt).toLocaleDateString()}</p>
              </div>
              <p className="text-sm text-yellow-400">
                Expires in {item.expiresIn} days
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => recoverItem(item.id)}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Recover
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Delete Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-12 text-center">
          <Trash2 size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Trash is empty</p>
        </div>
      )}

      {/* Empty Trash Button */}
      {trash.length > 0 && (
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-red-500/20 text-red-400 text-sm rounded-xl hover:bg-red-500/30 transition-colors flex items-center gap-2">
            <Trash2 size={16} />
            Empty Trash (Requires OTP)
          </button>
        </div>
      )}
    </div>
  )
}
// ═══════════════════════════════════════════════════════════════

const SettingsSection = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      location: '',
      tagline: ''
    },
    business: {
      workingHours: '9:00 AM - 6:00 PM',
      services: [],
      pricing: {}
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true
    },
    security: {
      sessionTimeout: 24,
      requireOTP: true
    }
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminAPI.getSettings()
        if (res.data.success) {
          setSettings(res.data.data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await adminAPI.updateSettings(settings)
      if (res.data.success) {
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading settings...</div>

  return (
    <div className="max-w-4xl space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-dark-700 pb-2">
        {['general', 'business', 'notifications', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 text-sm font-medium transition-colors capitalize ${activeTab === tab
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6 space-y-4">
          <h3 className="font-semibold mb-4">General Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Business Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, name: e.target.value } })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tagline</label>
              <input
                type="text"
                value={settings.profile.tagline}
                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, tagline: e.target.value } })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
              <input
                type="text"
                value={settings.profile.phone}
                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, phone: e.target.value } })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">WhatsApp</label>
              <input
                type="text"
                value={settings.profile.whatsapp}
                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, whatsapp: e.target.value } })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, email: e.target.value } })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Location</label>
              <input
                type="text"
                value={settings.profile.location}
                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, location: e.target.value } })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-4">
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Business Settings */}
      {activeTab === 'business' && (
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6 space-y-4">
          <h3 className="font-semibold mb-4">Business Settings</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Working Hours</label>
            <input
              type="text"
              value={settings.business.workingHours}
              onChange={(e) => setSettings({ ...settings, business: { ...settings.business, workingHours: e.target.value } })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
            />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-4">
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6 space-y-4">
          <h3 className="font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl">
                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: e.target.checked }
                  })}
                  className="w-5 h-5 text-primary-500 bg-dark-600 border-dark-500 rounded focus:ring-primary-500"
                />
              </label>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-4">
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
            <h3 className="font-semibold mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Session Timeout (hours)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, security: { ...settings.security, sessionTimeout: parseInt(e.target.value) } })}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>
              <label className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl">
                <span className="text-sm">Require OTP for sensitive actions</span>
                <input
                  type="checkbox"
                  checked={settings.security.requireOTP}
                  onChange={(e) => setSettings({ ...settings, security: { ...settings.security, requireOTP: e.target.checked } })}
                  className="w-5 h-5 text-primary-500 bg-dark-600 border-dark-500 rounded focus:ring-primary-500"
                />
              </label>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary mt-4">
              <Save size={16} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="bg-red-500/5 rounded-2xl border border-red-500/30 p-6">
            <h3 className="font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
            <div className="space-y-3">
              <button className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors">
                Change Password
              </button>
              <button className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors">
                Reset All Patterns to Default
              </button>
              <button className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors">
                Factory Reset (Delete Everything)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ... rest of the code remains the same ...
const AdminPanel = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Real-time polling for live data updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Refresh dashboard data
        await adminAPI.getDashboard()
        // Refresh bookings data  
        await adminAPI.getBookings()
        // Refresh conversations data
        await adminAPI.getConversations()
      } catch (error) {
        console.error('Real-time polling error:', error)
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSection />
      case 'conversations':
        return <ConversationsSection />
      case 'bookings':
        return <BookingsSection />
      case 'packages':
        return <PackagesSection />
      case 'learning':
        return <LearningSection />
      case 'abuse':
        return <AbuseSection />
      case 'analytics':
        return <AnalyticsSection />
      case 'trash':
        return <TrashSection />
      case 'settings':
        return <SettingsSection />
      default:
        return <DashboardSection />
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isMobile={true}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isMobile={false}
        isOpen={true}
        onClose={() => { }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          onMenuClick={() => setIsSidebarOpen(true)}
          admin={admin}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default AdminPanel