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
  Check
} from 'lucide-react'
import { useAdminStore, useUIStore } from '../utils/store'

// ═══════════════════════════════════════════════════════════════
// DEMO DATA (Replace with API calls later)
// ═══════════════════════════════════════════════════════════════

const demoData = {
  dashboard: {
    today: {
      visitors: 145,
      visitorsChange: 12,
      chats: 38,
      chatsChange: 8,
      bookings: 8,
      bookingsChange: 25,
      revenue: 450000,
      revenueChange: 15
    },
    recentBookings: [
      { id: 1, name: 'Rahul Sharma', package: 'Wedding Gold', date: '2024-06-15', location: 'Mumbai', status: 'pending', phone: '9876543210', value: 75000 },
      { id: 2, name: 'Priya Patel', package: 'Portrait Session', date: '2024-02-20', location: 'Delhi', status: 'contacted', phone: '9123456780', value: 25000 },
      { id: 3, name: 'Amit Singh', package: 'Event Coverage', date: '2024-03-05', location: 'Ahmedabad', status: 'confirmed', phone: '9988776655', value: 50000 }
    ],
    pendingPatterns: [
      { id: 1, word: 'drone', occurrences: 23, suggestedIntent: 'portfolio' },
      { id: 2, word: 'reels', occurrences: 18, suggestedIntent: 'portfolio' },
      { id: 3, word: 'destination', occurrences: 12, suggestedIntent: 'availability' }
    ],
    chatStats: {
      instant: 85,
      pattern: 12,
      ai: 3
    }
  },
  conversations: [
    { id: 1, visitor: { name: 'Rahul Sharma', phone: '9876543210' }, lastMessage: 'I want to book wedding package', status: 'booking', messages: 12, date: '2024-01-15T10:30:00', language: 'hi' },
    { id: 2, visitor: { name: null, phone: null }, lastMessage: 'What are your prices?', status: 'inquiry', messages: 5, date: '2024-01-15T09:15:00', language: 'en' },
    { id: 3, visitor: { name: 'Priya Patel', phone: '9123456780' }, lastMessage: 'Thanks!', status: 'completed', messages: 8, date: '2024-01-14T18:45:00', language: 'en' }
  ],
  bookings: [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9876543210', package: 'Wedding Gold', date: '2024-06-15', location: 'Mumbai', status: 'pending', value: 75000, notes: 'Needs drone shots', score: 95 },
    { id: 2, name: 'Priya Patel', email: 'priya@email.com', phone: '9123456780', package: 'Portrait Session', date: '2024-02-20', location: 'Delhi', status: 'contacted', value: 25000, notes: '', score: 72 },
    { id: 3, name: 'Amit Singh', email: 'amit@email.com', phone: '9988776655', package: 'Event Coverage', date: '2024-03-05', location: 'Ahmedabad', status: 'confirmed', value: 50000, notes: 'Corporate event', score: 88 }
  ],
  packages: [
    { id: 'wedding-gold', name: 'Wedding Gold', price: 75000, features: ['10 hours', '500+ photos', 'Video', '2 photographers'], popular: true, active: true },
    { id: 'portrait', name: 'Portrait Session', price: 25000, features: ['2-3 hours', '50+ photos', 'Location choice'], popular: false, active: true },
    { id: 'event', name: 'Event Coverage', price: 50000, features: ['6 hours', '300+ photos', 'Video'], popular: false, active: true },
    { id: 'prewedding', name: 'Pre-Wedding', price: 40000, features: ['4-5 hours', '100+ photos', 'Video'], popular: true, active: true }
  ],
  trash: [
    { id: 1, type: 'conversation', visitor: 'Unknown', deletedAt: '2024-01-13', expiresIn: 28 },
    { id: 2, type: 'conversation', visitor: 'Spam User', deletedAt: '2024-01-10', expiresIn: 25 }
  ],
  abuseReports: [
    { id: 1, message: 'Offensive content here...', type: 'profanity', date: '2024-01-15T15:30:00', status: 'pending' },
    { id: 2, message: 'Threatening message...', type: 'threat', date: '2024-01-14T12:00:00', status: 'reviewed' }
  ]
}

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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id
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
          <button className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl hover:bg-dark-700 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-rose rounded-full" />
          </button>

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
          <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(change)}%</span>
            <span className="text-gray-500">vs yesterday</span>
          </div>
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
  const data = demoData.dashboard

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Visitors"
          value={data.today.visitors}
          change={data.today.visitorsChange}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Chat Sessions"
          value={data.today.chats}
          change={data.today.chatsChange}
          icon={MessageCircle}
          color="cyan"
        />
        <StatCard
          title="New Bookings"
          value={data.today.bookings}
          change={data.today.bookingsChange}
          icon={Calendar}
          color="rose"
        />
        <StatCard
          title="Revenue"
          value={`₹${(data.today.revenue / 1000).toFixed(0)}K`}
          change={data.today.revenueChange}
          icon={DollarSign}
          color="gold"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Bookings</h3>
            <button className="text-sm text-primary-400 hover:text-primary-300">View All</button>
          </div>
          <div className="space-y-3">
            {data.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${
                  booking.status === 'pending' ? 'bg-yellow-500' :
                  booking.status === 'contacted' ? 'bg-blue-500' :
                  'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{booking.name}</p>
                  <p className="text-sm text-gray-500">{booking.package}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{(booking.value / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">{booking.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bot Learning */}
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Learning Suggestions</h3>
            <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-full">
              {data.pendingPatterns.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {data.pendingPatterns.map((pattern) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Chat Performance */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Chat Response Breakdown</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-dark-700 rounded-full overflow-hidden flex">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: `${data.chatStats.instant}%` }} 
            />
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${data.chatStats.pattern}%` }} 
            />
            <div 
              className="bg-purple-500 h-full" 
              style={{ width: `${data.chatStats.ai}%` }} 
            />
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-400">Instant ({data.chatStats.instant}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-400">Pattern ({data.chatStats.pattern}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-sm text-gray-400">AI ({data.chatStats.ai}%)</span>
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
  const conversations = demoData.conversations

  const getStatusColor = (status) => {
    switch (status) {
      case 'booking': return 'bg-green-500/20 text-green-400'
      case 'inquiry': return 'bg-blue-500/20 text-blue-400'
      case 'completed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {['all', 'booking', 'inquiry', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f
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
        {conversations.map((conv, index) => (
          <div
            key={conv.id}
            className={`flex items-center gap-4 p-4 hover:bg-dark-700/50 transition-colors cursor-pointer ${
              index !== conversations.length - 1 ? 'border-b border-dark-700' : ''
            }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center flex-shrink-0">
              {conv.visitor.name ? conv.visitor.name.charAt(0) : '?'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">
                  {conv.visitor.name || 'Unknown Visitor'}
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
            <button className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
              <MoreVertical size={18} className="text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BOOKINGS SECTION
// ═══════════════════════════════════════════════════════════════

const BookingsSection = () => {
  const bookings = demoData.bookings
  const [selectedBooking, setSelectedBooking] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'contacted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <div className="grid grid-cols-4 gap-4">
        {['pending', 'contacted', 'confirmed', 'completed'].map((status) => {
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
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            layout
            className="bg-dark-800/50 rounded-2xl border border-dark-700 p-5 hover:border-primary-500/30 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold">{booking.name}</p>
                <p className="text-sm text-primary-400">{booking.package}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={14} />
                <span>{booking.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone size={14} />
                <span>{booking.phone}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-600">
              <span className="text-lg font-bold text-primary-400">₹{booking.value.toLocaleString()}</span>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/91${booking.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  <MessageCircle size={16} />
                </a>
                <a
                  href={`tel:+91${booking.phone}`}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>

            {/* Score Badge */}
            {booking.score >= 80 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle size={14} />
                <span>Verified ({booking.score}% score)</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PACKAGES SECTION
// ═══════════════════════════════════════════════════════════════

const PackagesSection = () => {
  const [packages, setPackages] = useState(demoData.packages)
  const [editingPackage, setEditingPackage] = useState(null)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">Manage your photography packages</p>
        <button className="btn-primary text-sm">
          <Plus size={18} className="mr-2" />
          Add Package
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6"
          >
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
                <p className="text-2xl font-bold gradient-text mt-1">₹{pkg.price.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
                  <Edit size={16} className="text-gray-400" />
                </button>
                <button className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            <ul className="space-y-2 mb-4">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle size={14} className="text-primary-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-dark-600">
              <span className={`text-sm ${pkg.active ? 'text-green-400' : 'text-gray-500'}`}>
                {pkg.active ? '● Active' : '○ Inactive'}
              </span>
              <button className="text-sm text-primary-400 hover:text-primary-300">
                Edit Features
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TRASH SECTION
// ═══════════════════════════════════════════════════════════════

const TrashSection = () => {
  const trash = demoData.trash

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
              className={`flex items-center gap-4 p-4 ${
                index !== trash.length - 1 ? 'border-b border-dark-700' : ''
              }`}
            >
              <Trash2 size={20} className="text-gray-500" />
              <div className="flex-1">
                <p className="font-medium">Conversation with {item.visitor}</p>
                <p className="text-sm text-gray-500">Deleted {item.deletedAt}</p>
              </div>
              <p className="text-sm text-yellow-400">
                Expires in {item.expiresIn} days
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors">
                  Recover
                </button>
                <button className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors">
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
// ANALYTICS SECTION
// ═══════════════════════════════════════════════════════════════

const AnalyticsSection = () => {
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
          <p className="text-2xl font-bold mt-1">12,456</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Chats</p>
          <p className="text-2xl font-bold mt-1">3,210</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold mt-1">156</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">₹45.2L</p>
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
// SETTINGS SECTION
// ═══════════════════════════════════════════════════════════════

const SettingsSection = () => {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Settings */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Profile Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Business Name</label>
            <input
              type="text"
              defaultValue="PG Films"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone</label>
            <input
              type="text"
              defaultValue="+91 98765 43210"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              defaultValue="pgfilms@gmail.com"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
        <button className="btn-primary mt-4">
          <Save size={16} className="mr-2" />
          Save Changes
        </button>
      </div>

      {/* Security */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Security</h3>
        <button className="w-full py-3 bg-dark-700 rounded-xl text-left px-4 hover:bg-dark-600 transition-colors flex items-center justify-between">
          <span>Change Password</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        <p className="text-xs text-gray-500 mt-2">Requires OTP verification</p>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 rounded-2xl border border-red-500/30 p-6">
        <h3 className="font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
        <p className="text-sm text-gray-400 mb-4">
          These actions are irreversible. Proceed with extreme caution.
        </p>
        <div className="space-y-3">
          <button className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors">
            Reset All Patterns to Default
          </button>
          <button className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors">
            Factory Reset (Delete Everything)
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">All dangerous actions require OTP + Password confirmation</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LEARNING SECTION (Bot Patterns)
// ═══════════════════════════════════════════════════════════════

const LearningSection = () => {
  const patterns = demoData.dashboard.pendingPatterns

  return (
    <div className="space-y-6">
      {/* Pending Patterns */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pending Patterns ({patterns.length})</h3>
          <button className="text-sm text-primary-400 hover:text-primary-300">Auto-approve all</button>
        </div>
        <div className="space-y-3">
          {patterns.map((pattern) => (
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
                <button className="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm">
                  Approve
                </button>
                <button className="px-4 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Stats */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Learning Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-dark-700/50 rounded-xl">
            <p className="text-2xl font-bold text-green-400">156</p>
            <p className="text-sm text-gray-400">Auto-learned</p>
          </div>
          <div className="text-center p-4 bg-dark-700/50 rounded-xl">
            <p className="text-2xl font-bold text-blue-400">23</p>
            <p className="text-sm text-gray-400">Admin Approved</p>
          </div>
          <div className="text-center p-4 bg-dark-700/50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-400">5</p>
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
  const reports = demoData.abuseReports

  return (
    <div className="space-y-6">
      {/* Reports List */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Flagged Messages ({reports.length})</h3>
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="p-4 bg-dark-700/50 rounded-xl border-l-4 border-red-500">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    report.type === 'profanity' ? 'bg-orange-500/20 text-orange-400' :
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
                  <button className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30">
                    Dismiss
                  </button>
                  <button className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">
                    Block User
                  </button>
                </div>
              </div>
            </div>
          ))}
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
// MAIN ADMIN PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════

const AdminPanel = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isMobile={false}
        isOpen={true}
        onClose={() => {}}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          onMenuClick={() => setSidebarOpen(true)}
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