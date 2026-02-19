// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Trend Chart Component
// Beautiful data visualization for bookings and revenue
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { adminAPI } from '../utils/api'

const TrendChart = ({ darkMode, type = 'bookings', title = 'Trend' }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30) // days
  const [showDropdown, setShowDropdown] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    fetchChartData()
  }, [type, timeRange])

  useEffect(() => {
    if (data.length > 0 && canvasRef.current) {
      drawChart()
    }
  }, [data, darkMode])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getChartData(type, timeRange)
      
      if (response.data?.success) {
        setData(response.data.data)
      }
    } catch (err) {
      console.error('Chart data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const drawChart = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // Set canvas size for high DPI
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Get data values
    const values = data.map(d => type === 'bookings' ? d.bookings : (d.revenue || d.daily || 0))
    const maxValue = Math.max(...values, 1)
    const minValue = 0

    // Colors based on dark mode
    const gridColor = darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)'
    const textColor = darkMode ? '#9ca3af' : '#6b7280'
    const lineColor = type === 'bookings' ? '#3b82f6' : '#10b981'
    const fillColor = type === 'bookings' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)'

    // Draw grid lines
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Y-axis labels
      const value = maxValue - (maxValue / gridLines) * i
      ctx.fillStyle = textColor
      ctx.font = '11px Inter, system-ui, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(
        type === 'revenue' ? `₹${Math.round(value / 1000)}k` : Math.round(value).toString(),
        padding.left - 8,
        y + 4
      )
    }

    if (values.length < 2) return

    // Draw area fill
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top + chartHeight)
    values.forEach((value, index) => {
      const x = padding.left + (chartWidth / (values.length - 1)) * index
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight
      ctx.lineTo(x, y)
    })
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.closePath()
    ctx.fillStyle = fillColor
    ctx.fill()

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    values.forEach((value, index) => {
      const x = padding.left + (chartWidth / (values.length - 1)) * index
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw data points
    values.forEach((value, index) => {
      const x = padding.left + (chartWidth / (values.length - 1)) * index
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = darkMode ? '#1f2937' : '#ffffff'
      ctx.fill()
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // X-axis labels (show every nth label based on data length)
    const labelInterval = Math.ceil(data.length / 6)
    ctx.fillStyle = textColor
    ctx.font = '10px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    data.forEach((d, index) => {
      if (index % labelInterval === 0 || index === data.length - 1) {
        const x = padding.left + (chartWidth / (data.length - 1)) * index
        const date = new Date(d.date)
        ctx.fillText(
          `${date.getDate()}/${date.getMonth() + 1}`,
          x,
          height - padding.bottom + 20
        )
      }
    })
  }

  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return { value: 0, direction: 'neutral' }
    
    const recent = data.slice(-7)
    const older = data.slice(-14, -7)
    
    const recentSum = recent.reduce((sum, d) => sum + (type === 'bookings' ? d.bookings : (d.revenue || 0)), 0)
    const olderSum = older.reduce((sum, d) => sum + (type === 'bookings' ? d.bookings : (d.revenue || 0)), 0)
    
    if (olderSum === 0) return { value: recentSum > 0 ? 100 : 0, direction: 'up' }
    
    const change = ((recentSum - olderSum) / olderSum) * 100
    return {
      value: Math.abs(Math.round(change)),
      direction: change >= 0 ? 'up' : 'down'
    }
  }

  const trend = calculateTrend()
  const total = data.reduce((sum, d) => sum + (type === 'bookings' ? d.bookings : (d.revenue || 0)), 0)

  const timeRanges = [
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl border shadow-lg overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${type === 'bookings' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
            {type === 'bookings' ? (
              <Calendar className={`w-5 h-5 ${type === 'bookings' ? 'text-blue-600' : 'text-green-600'}`} />
            ) : (
              <DollarSign className={`w-5 h-5 ${type === 'bookings' ? 'text-blue-600' : 'text-green-600'}`} />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {type === 'revenue' ? `₹${total.toLocaleString()}` : total}
              </span>
              <span className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full ${
                trend.direction === 'up' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend.value}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
              } transition-colors text-sm`}
            >
              {timeRanges.find(r => r.value === timeRange)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showDropdown && (
              <div className={`absolute right-0 top-full mt-1 w-32 rounded-lg shadow-lg border z-10 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {timeRanges.map(range => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setTimeRange(range.value)
                      setShowDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${
                      timeRange === range.value 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={fetchChartData}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading chart...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No data available</p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-48"
            style={{ width: '100%', height: '200px' }}
          />
        )}
      </div>
    </motion.div>
  )
}

export default TrendChart