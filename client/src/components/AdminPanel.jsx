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
  User,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  DollarSign,
  Eye,
  Edit,
  Check,
  Save,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Plus,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Copy,
  Star,
  ExternalLink,
  Upload
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
    { id: 'custom-packages', label: 'Custom Packages', icon: Star, badge: 2 },
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
    'custom-packages': 'Custom Packages',
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
// DASHBOARD SECTION
// ═══════════════════════════════════════════════════════════════

const DashboardSection = () => {
  return <DashboardSectionEnhanced />
}

// ═══════════════════════════════════════════════════════════════
// CONVERSATIONS SECTION
// ═══════════════════════════════════════════════════════════════

const ConversationsSection = () => {
  const [filter, setFilter] = useState('all')
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 0 })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await adminAPI.getConversations({
          page: pagination.page,
          limit: pagination.limit,
          status: filter === 'all' ? undefined : filter,
          search: searchTerm || undefined
        })
        if (res.data.success) {
          setConversations(res.data.data.conversations)
          setPagination(res.data.data.pagination)
        }
      } catch (error) {
        console.error("Error fetching conversations", error)
        setConversations([])
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [filter, pagination.page, searchTerm])

  const getStatusColor = (status) => {
    switch (status) {
      case 'booking': return 'bg-green-500/20 text-green-400'
      case 'inquiry': return 'bg-blue-500/20 text-blue-400'
      case 'completed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on search
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading conversations...</div>

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
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Conversations Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.length === 0 ? (
          <div className="col-span-full p-10 text-center text-gray-500">
            {loading ? 'Loading conversations...' : 'No conversations found'}
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6 hover:bg-dark-700/50 transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold">
                      {conv.visitor?.name ? conv.visitor.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {conv.visitor?.name || 'Unknown Visitor'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {conv.visitor?.phone || conv.visitor?.email || 'No contact'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conv.status)}`}>
                  {conv.status}
                </span>
              </div>

              {/* Last Message */}
              <div className="mb-4">
                <p className="text-sm text-gray-300 line-clamp-2">
                  {typeof conv.lastMessage === 'string' 
                    ? conv.lastMessage 
                    : conv.lastMessage?.text || conv.lastMessage?.displayText || 'No message'
                  }
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    {conv.messageCount || conv.messages?.length || 0} msgs
                  </span>
                  {conv.language && (
                    <span className="px-2 py-0.5 bg-dark-600 rounded">
                      {conv.language.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {new Date(conv.lastActiveAt || conv.lastMessageAt || conv.createdAt).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(conv.lastActiveAt || conv.lastMessageAt || conv.createdAt).toLocaleTimeString('en-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum
              if (pagination.pages <= 5) {
                pageNum = i + 1
              } else if (pagination.page <= 3) {
                pageNum = i + 1
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i
              } else {
                pageNum = pagination.page - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 border border-dark-600 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <span>
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} conversations
        </span>
        <select
          value={pagination.limit}
          onChange={(e) => {
            setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))
          }}
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm"
        >
          <option value={9}>9 per page</option>
          <option value={18}>18 per page</option>
          <option value={36}>36 per page</option>
        </select>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BOOKINGS SECTION
// ═══════════════════════════════════════════════════════════════

const BookingsSection = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await adminAPI.getBookings()
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
        const refresh = await adminAPI.getBookings()
        if (refresh.data.success) setBookings(refresh.data.data.bookings)
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      // Revert on error
      const refresh = await adminAPI.getBookings()
      if (refresh.data.success) setBookings(refresh.data.data.bookings)
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading bookings...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bookings Management</h2>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
          <button className="btn-primary text-sm">
            <Plus size={16} className="mr-2" />
            Add Booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.length === 0 ? (
          <div className="col-span-full p-10 text-center text-gray-500">No bookings found</div>
        ) : (
          bookings.map((booking) => (
            <EnhancedBookingCard
              key={booking.id}
              booking={booking}
              onStatusChange={handleStatusChange}
              onDelete={() => {}}
              conversationId={booking.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PLACEHOLDER SECTIONS
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
      console.log('Fetched packages response:', res.data)
      if (res.data.success) {
        const packagesData = res.data.data || []
        console.log('Processed packages data:', packagesData)
        
        // Sort packages: active first, inactive at end
        const sortedPackages = [...packagesData].sort((a, b) => {
          // Both active - maintain original order or sort by name
          if (a.active && b.active) {
            return (a.popular === b.popular) ? 0 : b.popular ? -1 : 1
          }
          // One active, one inactive - active comes first
          if (a.active && !b.active) return -1
          if (!a.active && b.active) return 1
          // Both inactive - maintain original order
          return 0
        })
        
        setPackages(sortedPackages)
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
        console.log('Updating package:', editingPkg.id, formData)
        res = await adminAPI.updatePackage(editingPkg.id, formData)
      } else {
        console.log('Creating new package:', formData)
        res = await adminAPI.createPackage(formData)
      }

      if (res.data.success) {
        console.log('Package saved successfully:', res.data)
        fetchPackages()
        setEditingPkg(null)
        // Show success message
        alert(editingPkg.id ? 'Package updated successfully!' : 'Package created successfully!')
      } else {
        throw new Error(res.data.message || 'Save failed')
      }
    } catch (error) {
      console.error('Save error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Save failed'
      alert(`Failed to save package: ${errorMessage}`)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-dark-800/50 rounded-2xl border p-6 flex flex-col h-full transition-all ${
                pkg.active 
                  ? 'border-primary-500/30 hover:border-primary-500/50' 
                  : 'border-gray-600/30 opacity-60 hover:border-gray-500/50'
              }`}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                  pkg.active 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {pkg.active ? 'Active' : 'Inactive'}
                </div>
                {pkg.popular && (
                  <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                    Popular
                  </span>
                )}
              </div>

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
                  {!pkg.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">Inactive</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold text-lg ${pkg.active ? 'text-white' : 'text-gray-500'}`}>
                      {pkg.name}
                    </h3>
                  </div>
                  <p className={`text-2xl font-bold mt-1 ${pkg.active ? 'gradient-text' : 'text-gray-500'}`}>
                    ₹{pkg.price?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(pkg)} 
                    className={`p-2 rounded-lg transition-colors ${
                      pkg.active 
                        ? 'hover:bg-dark-600' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <Edit size={16} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => handleDelete(pkg.id)} 
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                  >
                    <Trash2 size={16} className="text-gray-400 group-hover:text-red-400" />
                  </button>
                </div>
              </div>

              <ul className="space-y-2 mb-4 flex-1">
                {pkg.features?.map((feature, idx) => (
                  <li key={idx} className={`flex items-center gap-2 text-sm ${
                    pkg.active ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <CheckCircle size={14} className={pkg.active ? 'text-primary-400' : 'text-gray-600'} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                <span className={`text-xs ${
                  pkg.active ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {pkg.active ? 'Visible to customers' : 'Hidden from customers'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  pkg.active ? 'bg-green-400' : 'bg-gray-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const LearningSection = () => (
  <div className="p-10 text-center text-gray-500">
    <Brain size={48} className="mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-medium mb-2">Bot Learning</h3>
    <p>AI learning features coming soon...</p>
  </div>
)

const AbuseSection = () => (
  <div className="p-10 text-center text-gray-500">
    <ShieldAlert size={48} className="mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-medium mb-2">Abuse Reports</h3>
    <p>Abuse management features coming soon...</p>
  </div>
)

const AnalyticsSection = () => (
  <div className="p-10 text-center text-gray-500">
    <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-medium mb-2">Analytics</h3>
    <p>Analytics dashboard coming soon...</p>
  </div>
)

const TrashSection = () => (
  <div className="p-10 text-center text-gray-500">
    <Trash2 size={48} className="mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-medium mb-2">Trash</h3>
    <p>Trash management features coming soon...</p>
  </div>
)

const SettingsSection = () => (
  <div className="p-10 text-center text-gray-500">
    <Settings size={48} className="mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-medium mb-2">Settings</h3>
    <p>Settings management features coming soon...</p>
  </div>
)

// ═══════════════════════════════════════════════════════════════
// CUSTOM PACKAGES SECTION
// ═══════════════════════════════════════════════════════════════

const CustomPackagesSection = () => {
  const [customPackages, setCustomPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, pending, contacted, confirmed

  useEffect(() => {
    const fetchCustomPackages = async () => {
      try {
        // For now, we'll simulate fetching custom packages
        // In a real implementation, this would call an API endpoint
        const mockCustomPackages = [
          {
            id: 'custom_1',
            customerName: 'Divyesh Thakur',
            phone: '9963563336',
            email: 'divyesh@example.com',
            status: 'pending',
            requestDate: new Date('2025-02-16'),
            requirements: 'Custom photography package - admin will discuss directly',
            lastMessage: 'I need a custom photography package',
            contactAttempts: 0,
            notes: '',
            languagePreference: 'gujarati',
            languageCode: 'gu'
          },
          {
            id: 'custom_2',
            customerName: 'John Doe',
            phone: '9876543210',
            email: 'john@example.com',
            status: 'contacted',
            requestDate: new Date('2025-02-15'),
            requirements: 'Wedding photography with custom requirements',
            lastMessage: 'Need custom wedding package',
            contactAttempts: 1,
            notes: 'Called customer - interested in premium wedding package',
            languagePreference: 'english',
            languageCode: 'en'
          },
          {
            id: 'custom_3',
            customerName: 'Rahul Sharma',
            phone: '9123456789',
            email: 'rahul@example.com',
            status: 'pending',
            requestDate: new Date('2025-02-16'),
            requirements: 'Event photography for corporate function',
            lastMessage: 'I need a custom photography package',
            contactAttempts: 0,
            notes: '',
            languagePreference: 'hindi',
            languageCode: 'hi'
          }
        ]
        setCustomPackages(mockCustomPackages)
      } catch (error) {
        console.error('Error fetching custom packages:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomPackages()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'contacted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'contacted': return <Phone size={16} />
      case 'confirmed': return <CheckCircle size={16} />
      case 'cancelled': return <XCircle size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  const filteredPackages = customPackages.filter(pkg => {
    const matchesSearch = !searchTerm || 
      pkg.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.phone.includes(searchTerm) ||
      pkg.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (packageId, newStatus) => {
    setCustomPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, status: newStatus } : pkg
    ))
  }

  const handleAddNote = (packageId, note) => {
    setCustomPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, notes: pkg.notes + '\n' + note } : pkg
    ))
  }

  const getLanguageSpecificMessage = (pkg) => {
    const customerName = pkg.customerName
    const companyName = 'PG Films'
    
    switch (pkg.languagePreference) {
      case 'hindi':
        return `नमस्ते ${customerName} जी! मैं ${companyName} से बात कर रहा हूं। आपकी custom photography package inquiry के बारे में। हम आपकी requirements को discuss करना चाहते हैं और आपके लिए perfect package बनाना चाहते हैं। बात करने के लिए सबसे अच्छा time क्या होगा?`
      
      case 'gujarati':
        return `નમસ્કાર ${customerName}! હું ${companyName} માંથી વાત કરી રહ્યો છું. તમારી custom photography package inquiry વિશે. અમે તમારી requirements discuss કરવા માંગીએ છીએ અને તમારા માટે perfect package બનાવવા માંગીએ છીએ. વાત કરવા માટે શું સમય સૌથી સારો હશે?`
      
      default: // english
        return `Hi ${customerName}! This is ${companyName} regarding your custom photography package inquiry. We'd love to discuss your requirements and create the perfect package for you. When would be a good time to talk?`
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading custom packages...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Custom Package Requests</h2>
            <p className="text-gray-400">Manage custom photography package inquiries and follow-ups</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-amber-400 text-sm font-medium">
              {customPackages.filter(pkg => pkg.status === 'pending').length} Pending
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Status:</span>
            {['all', 'pending', 'contacted', 'confirmed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === status
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:outline-none focus:border-primary-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Custom Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPackages.length === 0 ? (
          <div className="col-span-full p-10 text-center text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            No custom package requests found
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800/50 rounded-2xl border border-dark-700 overflow-hidden hover:border-primary-500/30 transition-all"
            >
              {/* Header */}
              <div className={`p-4 border-b ${getStatusColor(pkg.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(pkg.status)}
                    <span className="font-semibold capitalize">{pkg.status}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {pkg.requestDate.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{pkg.customerName}</h3>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pkg.languagePreference === 'hindi' ? 'bg-orange-500/20 text-orange-400' :
                      pkg.languagePreference === 'gujarati' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {pkg.languagePreference === 'hindi' ? '🇮🇳 Hindi' :
                       pkg.languagePreference === 'gujarati' ? '🇮🇳 Gujarati' :
                       '🇮🇳 English'}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone size={14} />
                      <span>{pkg.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={14} />
                      <span>{pkg.email}</span>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Requirements</h4>
                  <p className="text-sm text-gray-400">{pkg.requirements}</p>
                </div>

                {/* Last Message */}
                <div className="bg-dark-700/30 rounded-xl p-3">
                  <p className="text-xs text-gray-500 italic">"{pkg.lastMessage}"</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <select
                    value={pkg.status}
                    onChange={(e) => handleStatusChange(pkg.id, e.target.value)}
                    className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={() => window.open(`https://wa.me/91${pkg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getLanguageSpecificMessage(pkg))}`, '_blank')}
                    className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                    title={`Open WhatsApp in ${pkg.languagePreference}`}
                  >
                    <MessageCircle size={14} />
                  </button>
                  <button 
                    onClick={() => window.open(`tel:${pkg.phone.replace(/[^0-9]/g, '')}`)}
                    className="px-3 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm hover:bg-primary-500/30 transition-colors"
                    title="Call Customer"
                  >
                    <Phone size={14} />
                  </button>
                  <button 
                    onClick={() => window.open(`mailto:${pkg.email}?subject=PG Films - Custom Photography Package Inquiry&body=Hi ${pkg.customerName},\n\nThank you for your interest in our custom photography packages. We'd love to discuss your requirements and create a personalized package for you.\n\nBest regards,\nPG Films Team`)}
                    className="px-3 py-2 bg-dark-700 text-gray-400 rounded-lg text-sm hover:bg-dark-600 transition-colors"
                    title="Send Email"
                  >
                    <Mail size={14} />
                  </button>
                </div>

                {/* Notes */}
                {pkg.notes && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                    <p className="text-xs text-blue-400">{pkg.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════

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
      case 'custom-packages':
        return <CustomPackagesSection />
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
