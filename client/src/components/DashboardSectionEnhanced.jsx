import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageCircle, Calendar, TrendingUp, TrendingDown, RefreshCw, BarChart3, Activity, Eye, Clock } from 'lucide-react'
import { adminAPI } from '../utils/api'

const StatCard = ({ title, value, change, icon: Icon, color = 'primary', loading = false }) => {
  const isPositive = change >= 0
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-500/5 border-primary-500/30',
    rose: 'from-accent-rose/20 to-accent-rose/5 border-accent-rose/30',
    gold: 'from-accent-gold/20 to-accent-gold/5 border-accent-gold/30',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30'
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
          <p className="text-3xl font-bold mt-2">
            {loading ? '...' : value}
          </p>
          {change !== 0 && !loading && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center ${loading ? 'animate-pulse' : ''}`}>
          <Icon size={24} className="text-gray-400" />
        </div>
      </div>
    </motion.div>
  )
}

const DailyTrafficChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Daily Traffic Trend</h3>
          <div className="w-6 h-6 bg-dark-700 rounded animate-pulse" />
        </div>
        <div className="h-48 flex items-center justify-center">
          <RefreshCw className="animate-spin" size={24} />
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.visits || 0), 1)
  const todayVisits = data[data.length - 1]?.visits || 0
  const yesterdayVisits = data[data.length - 2]?.visits || 0
  const change = yesterdayVisits > 0 ? ((todayVisits - yesterdayVisits) / yesterdayVisits * 100).toFixed(1) : 0

  return (
    <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Daily Traffic Trend</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Eye size={16} className="text-gray-400" />
            <span className="text-gray-400">Today: {todayVisits}</span>
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${Number(change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(change) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="h-48 flex items-end justify-between gap-2">
        {data.slice(-7).map((day, index) => {
          const height = maxValue > 0 ? (day.visits / maxValue) * 100 : 0
          const isToday = index === data.slice(-7).length - 1
          
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex flex-col items-center">
                <span className={`text-xs ${isToday ? 'text-primary-400 font-bold' : 'text-gray-400'}`}>
                  {day.visits}
                </span>
                <div 
                  className={`w-full rounded-t-md transition-colors ${
                    isToday 
                      ? 'bg-primary-500' 
                      : 'bg-primary-500/30 hover:bg-primary-500/50'
                  }`}
                  style={{ height: `${height * 1.5}px`, minHeight: '4px' }}
                />
              </div>
              <span className={`text-xs ${isToday ? 'text-primary-400' : 'text-gray-500'}`}>
                {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
              </span>
            </motion.div>
          )
        })}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span>Last 7 days</span>
        <span>Total: {data.slice(-7).reduce((sum, day) => sum + day.visits, 0)} visits</span>
      </div>
    </div>
  )
}

const VisitorAnalytics = ({ data = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Visitor Analytics</h3>
          <div className="w-6 h-6 bg-dark-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-dark-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const analytics = [
    { label: 'Unique Visitors', value: data.uniqueVisitors || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Page Views', value: data.pageViews || 0, icon: Eye, color: 'text-green-400' },
    { label: 'Avg. Session Duration', value: data.avgSessionDuration || '0s', icon: Clock, color: 'text-yellow-400' },
    { label: 'Bounce Rate', value: `${data.bounceRate || 0}%`, icon: Activity, color: 'text-red-400' }
  ]

  return (
    <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Visitor Analytics</h3>
        <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-full">
          Today
        </span>
      </div>
      
      <div className="space-y-4">
        {analytics.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={item.color} />
              <span className="text-sm text-gray-300">{item.label}</span>
            </div>
            <span className={`font-bold ${item.color}`}>{item.value}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-dark-600">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Peak Hour</span>
          <span className="text-primary-400">{data.peakHour || 'N/A'}</span>
        </div>
      </div>
    </div>
  )
}

const DashboardSectionEnhanced = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await adminAPI.getDashboard()
      console.log('Dashboard API Response:', response)
      console.log('Response data:', response.data)
      setData(response.data.data)
      setError(null)
    } catch (error) {
      console.error("Dashboard Load Error:", error)
      setError(error.message || 'Failed to load dashboard data')
      
      // Show user-friendly error for rate limiting
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment before refreshing.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleRefresh = () => {
    loadStats(true)
  }

  if (loading && !refreshing) {
    return (
      <div className="p-8 text-center text-gray-400">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin" size={32} />
          <p>Loading live data...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-red-400 font-medium mb-4">❌ {error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard Overview</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Display */}
      {error && data && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Real Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Conversations"
          value={data?.stats?.totalConversations || 0}
          change={data?.stats?.newConversations || 0}
          icon={MessageCircle}
          color="cyan"
          loading={refreshing}
        />
        <StatCard
          title="Total Bookings"
          value={data?.stats?.totalBookings || 0}
          change={data?.stats?.pendingBookings || 0}
          icon={Calendar}
          color="rose"
          loading={refreshing}
        />
        <StatCard
          title="Today's Messages"
          value={data?.stats?.todayMessages || 0}
          change={data?.stats?.todayConversations || 0}
          icon={Users}
          color="primary"
          loading={refreshing}
        />
        <StatCard
          title="New Conversations"
          value={data?.stats?.newConversations || 0}
          change={data?.stats?.confirmedBookings || 0}
          icon={TrendingUp}
          color="green"
          loading={refreshing}
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
            {(!data?.recentConversations || data?.recentConversations.length === 0) ? (
              <p className="text-gray-500 text-center py-8">No conversations yet.</p>
            ) : (
              (data?.recentConversations || []).map((conv) => (
                <div key={conv.id} className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-xl hover:bg-dark-700/70 transition-colors cursor-pointer">
                  <div className={`w-3 h-3 rounded-full ${conv.isBooking ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{conv.visitorName}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {conv.lastMessage} • {new Date(conv.lastMessageAt).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${conv.isBooking ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {conv.isBooking ? 'Booking' : 'Inquiry'}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {conv.messageCount} msgs
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily Traffic Chart */}
        <DailyTrafficChart 
          data={data?.dailyTraffic || []} 
          loading={refreshing} 
        />
      </div>

      {/* Analytics Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visitor Analytics */}
        <VisitorAnalytics 
          data={data?.visitorAnalytics || {}} 
          loading={refreshing} 
        />

        {/* Quick Stats */}
        <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Quick Stats</h3>
            <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-full">
              Live
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Confirmed Bookings</span>
              </div>
              <span className="font-bold text-green-400">{data?.stats?.confirmedBookings || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Pending Bookings</span>
              </div>
              <span className="font-bold text-yellow-400">{data?.stats?.pendingBookings || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-300">New Inquiries</span>
              </div>
              <span className="font-bold text-blue-400">{data?.stats?.newConversations || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Today's Activity</span>
              </div>
              <span className="font-bold text-purple-400">{data?.stats?.todayConversations || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">Activity Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">{data?.stats?.totalConversations || 0}</div>
            <div className="text-xs text-gray-400">Total Chats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{data?.stats?.totalBookings || 0}</div>
            <div className="text-xs text-gray-400">Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{data?.stats?.pendingBookings || 0}</div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{data?.stats?.newConversations || 0}</div>
            <div className="text-xs text-gray-400">New Today</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSectionEnhanced
