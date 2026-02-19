// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Automation Routes (AI Assistant API)
// ═══════════════════════════════════════════════════════════════

import express from 'express'
import { verifyToken } from '../utils/helpers.js'
import {
  generateDailyBriefing,
  generateAIInsights,
  getSmartTaskSuggestions
} from '../services/automation.service.js'
import {
  getEmailPreferences,
  updateEmailPreferences,
  sendDailyBriefingEmail
} from '../services/email.service.js'
import { Conversation, Analytics } from '../models/index.js'

const router = express.Router()

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

const authMiddleware = (req, res, next) => {
  try {
    // Development bypass
    if (process.env.NODE_ENV !== 'production') {
      req.admin = { email: 'admin@pgfilms.com', role: 'admin' }
      return next()
    }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    req.admin = decoded
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication failed' })
  }
}

router.use(authMiddleware)

// ═══════════════════════════════════════════════════════════════
// DAILY BRIEFING
// ═══════════════════════════════════════════════════════════════

router.get('/briefing', async (req, res) => {
  try {
    const briefing = await generateDailyBriefing()
    res.json({ success: true, data: briefing })
  } catch (error) {
    console.error('Briefing error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate briefing' })
  }
})

// ═══════════════════════════════════════════════════════════════
// AI INSIGHTS
// ═══════════════════════════════════════════════════════════════

router.get('/insights', async (req, res) => {
  try {
    const insights = await generateAIInsights()
    res.json({ success: true, data: insights })
  } catch (error) {
    console.error('Insights error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate insights' })
  }
})

// ═══════════════════════════════════════════════════════════════
// SMART TASK SUGGESTIONS
// ═══════════════════════════════════════════════════════════════

router.get('/task-suggestions', async (req, res) => {
  try {
    const suggestions = await getSmartTaskSuggestions()
    res.json({ success: true, data: suggestions })
  } catch (error) {
    console.error('Task suggestions error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate suggestions' })
  }
})

// ═══════════════════════════════════════════════════════════════
// EMAIL PREFERENCES
// ═══════════════════════════════════════════════════════════════

router.get('/email-preferences', async (req, res) => {
  try {
    const preferences = await getEmailPreferences()
    res.json({ success: true, data: preferences })
  } catch (error) {
    console.error('Email preferences error:', error)
    res.status(500).json({ success: false, message: 'Failed to get preferences' })
  }
})

router.put('/email-preferences', async (req, res) => {
  try {
    const success = await updateEmailPreferences(req.body)
    res.json({ success, message: success ? 'Preferences updated' : 'Failed to update' })
  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({ success: false, message: 'Failed to update preferences' })
  }
})

router.post('/test-email', async (req, res) => {
  try {
    await sendDailyBriefingEmail()
    res.json({ success: true, message: 'Test email sent' })
  } catch (error) {
    console.error('Test email error:', error)
    res.status(500).json({ success: false, message: 'Failed to send test email' })
  }
})

// ═══════════════════════════════════════════════════════════════
// ANALYTICS DATA FOR CHARTS
// ═══════════════════════════════════════════════════════════════

router.get('/chart-data', async (req, res) => {
  try {
    const { type = 'bookings', days = 30 } = req.query
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000)

    let data = []

    if (type === 'bookings') {
      // Get bookings per day
      const bookings = await Conversation.aggregate([
        {
          $match: {
            'booking.hasBooking': true,
            'createdAt': { $gte: startDate },
            'deletion.isDeleted': { $ne: true }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$booking.estimatedValue' }
          }
        },
        { $sort: { _id: 1 } }
      ])

      // Fill missing dates
      const dateMap = new Map(bookings.map(b => [b._id, b]))
      const filledData = []
      
      for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const existing = dateMap.get(dateStr)
        filledData.push({
          date: dateStr,
          bookings: existing?.count || 0,
          revenue: existing?.revenue || 0
        })
      }

      data = filledData
    } else if (type === 'packages') {
      // Get package popularity
      const packages = await Conversation.aggregate([
        {
          $match: {
            'booking.hasBooking': true,
            'createdAt': { $gte: startDate },
            'deletion.isDeleted': { $ne: true }
          }
        },
        {
          $group: {
            _id: '$booking.package',
            count: { $sum: 1 },
            revenue: { $sum: '$booking.estimatedValue' }
          }
        },
        { $sort: { count: -1 } }
      ])

      data = packages.map(p => ({
        name: p._id || 'Unknown',
        bookings: p.count,
        revenue: p.revenue
      }))
    } else if (type === 'conversations') {
      // Get conversations per day
      const conversations = await Conversation.aggregate([
        {
          $match: {
            'createdAt': { $gte: startDate },
            'deletion.isDeleted': { $ne: true }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])

      data = conversations.map(c => ({
        date: c._id,
        conversations: c.count
      }))
    } else if (type === 'revenue') {
      // Get revenue trend
      const revenue = await Conversation.aggregate([
        {
          $match: {
            'booking.hasBooking': true,
            'booking.status': { $in: ['confirmed', 'completed'] },
            'createdAt': { $gte: startDate },
            'deletion.isDeleted': { $ne: true }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$booking.estimatedValue' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])

      let cumulative = 0
      data = revenue.map(r => {
        cumulative += r.revenue
        return {
          date: r._id,
          daily: r.revenue,
          cumulative,
          bookings: r.count
        }
      })
    }

    res.json({ success: true, data })
  } catch (error) {
    console.error('Chart data error:', error)
    res.status(500).json({ success: false, message: 'Failed to get chart data' })
  }
})

// ═══════════════════════════════════════════════════════════════
// ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════

router.get('/activity-feed', async (req, res) => {
  try {
    const { limit = 20 } = req.query

    // Get recent bookings
    const recentBookings = await Conversation.find({
      'booking.hasBooking': true,
      'deletion.isDeleted': { $ne: true }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2)
      .select('visitor.name booking.package booking.status booking.estimatedValue createdAt')

    // Get recent conversations (non-booking)
    const recentConversations = await Conversation.find({
      'booking.hasBooking': false,
      'deletion.isDeleted': { $ne: true }
    })
      .sort({ 'meta.lastActiveAt': -1 })
      .limit(parseInt(limit) / 2)
      .select('visitor.name messages meta.lastActiveAt createdAt')

    // Combine and sort
    const activities = [
      ...recentBookings.map(b => ({
        id: b._id,
        type: 'booking',
        title: `New booking from ${b.visitor?.name || 'Unknown'}`,
        description: b.booking?.package || 'Service',
        value: b.booking?.estimatedValue,
        status: b.booking?.status,
        timestamp: b.createdAt,
        icon: 'calendar'
      })),
      ...recentConversations.map(c => ({
        id: c._id,
        type: 'conversation',
        title: `Message from ${c.visitor?.name || 'Visitor'}`,
        description: c.messages[c.messages.length - 1]?.text?.substring(0, 50) || 'New conversation',
        timestamp: c.meta?.lastActiveAt || c.createdAt,
        icon: 'message-square'
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit))

    res.json({ success: true, data: activities })
  } catch (error) {
    console.error('Activity feed error:', error)
    res.status(500).json({ success: false, message: 'Failed to get activity feed' })
  }
})

// ═══════════════════════════════════════════════════════════════
// GROWTH METRICS
// ═══════════════════════════════════════════════════════════════

router.get('/growth-metrics', async (req, res) => {
  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // This month's stats
    const thisMonth = await Conversation.aggregate([
      {
        $match: {
          'booking.hasBooking': true,
          'createdAt': { $gte: thisMonthStart },
          'deletion.isDeleted': { $ne: true }
        }
      },
      {
        $group: {
          _id: null,
          bookings: { $sum: 1 },
          revenue: { $sum: '$booking.estimatedValue' },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$booking.status', 'confirmed'] }, 1, 0] }
          }
        }
      }
    ])

    // Last month's stats
    const lastMonth = await Conversation.aggregate([
      {
        $match: {
          'booking.hasBooking': true,
          'createdAt': { $gte: lastMonthStart, $lte: lastMonthEnd },
          'deletion.isDeleted': { $ne: true }
        }
      },
      {
        $group: {
          _id: null,
          bookings: { $sum: 1 },
          revenue: { $sum: '$booking.estimatedValue' },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$booking.status', 'confirmed'] }, 1, 0] }
          }
        }
      }
    ])

    const current = thisMonth[0] || { bookings: 0, revenue: 0, confirmed: 0 }
    const previous = lastMonth[0] || { bookings: 0, revenue: 0, confirmed: 0 }

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    res.json({
      success: true,
      data: {
        bookings: {
          current: current.bookings,
          previous: previous.bookings,
          growth: calculateGrowth(current.bookings, previous.bookings)
        },
        revenue: {
          current: current.revenue,
          previous: previous.revenue,
          growth: calculateGrowth(current.revenue, previous.revenue)
        },
        confirmed: {
          current: current.confirmed,
          previous: previous.confirmed,
          growth: calculateGrowth(current.confirmed, previous.confirmed)
        },
        conversionRate: {
          current: current.bookings > 0 ? Math.round((current.confirmed / current.bookings) * 100) : 0,
          previous: previous.bookings > 0 ? Math.round((previous.confirmed / previous.bookings) * 100) : 0
        }
      }
    })
  } catch (error) {
    console.error('Growth metrics error:', error)
    res.status(500).json({ success: false, message: 'Failed to get growth metrics' })
  }
})

export default router