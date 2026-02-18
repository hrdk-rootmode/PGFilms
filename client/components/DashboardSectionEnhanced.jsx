import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageCircle, Calendar, TrendingUp, RefreshCw } from 'lucide-react'
import { withDeduplication } from '../utils/apiCache'

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

const DashboardSectionEnhanced = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
      // Invalidate cache when manually refreshing
      withDeduplication.invalidateCache('dashboard')
    } else {
      setLoading(true)
    }

    try {
      const response = await withDeduplication.getDashboard()
      setData(response.data)
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
          value={data.stats?.totalConversations || 0}
          change={data.stats?.newConversations || 0}
          icon={MessageCircle}
          color="cyan"
          loading={refreshing}
        />
        <StatCard
          title="Total Bookings"
          value={data.stats?.totalBookings || 0}
          change={data.stats?.pendingBookings || 0}
          icon={Calendar}
          color="rose"
          loading={refreshing}
        />
        <StatCard
          title="Today's Messages"
          value={data.stats?.todayMessages || 0}
          change={0}
          icon={Users}
          color="primary"
          loading={refreshing}
        />
        <StatCard
          title="New Conversations"
          value={data.stats?.todayConversations || 0}
          change={0}
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
                      <RefreshCw size={16} />
                    </button>
                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      <RefreshCw size={16} />
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

export default DashboardSectionEnhanced
