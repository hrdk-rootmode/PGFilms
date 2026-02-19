// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Automation Service (AI Task Generation & Insights)
// ═══════════════════════════════════════════════════════════════

import { Conversation, Analytics, Config } from '../models/index.js'
import { sendEmail } from '../utils/helpers.js'

// ═══════════════════════════════════════════════════════════════
// DAILY BRIEFING GENERATOR
// ═══════════════════════════════════════════════════════════════

export const generateDailyBriefing = async () => {
  try {
    console.log('🤖 Generating daily briefing...')
    
    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0))
    const todayEnd = new Date(today.setHours(23, 59, 59, 999))
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    // 1. PENDING BOOKINGS (need confirmation)
    const pendingBookings = await Conversation.find({
      'booking.hasBooking': true,
      'booking.status': 'pending',
      'deletion.isDeleted': { $ne: true }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('visitor.name booking.package booking.eventDate')
    
    // 2. UNREAD CONVERSATIONS (waiting > 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const unreadConversations = await Conversation.find({
      'deletion.isDeleted': { $ne: true },
      'meta.lastActiveAt': { $lt: oneHourAgo },
      'messages.role': 'user', // Has user messages
      'booking.hasBooking': false // Not yet converted to booking
    })
      .sort({ 'meta.lastActiveAt': 1 }) // Oldest first
      .limit(5)
      .select('visitor.name messages')
    
    // 3. TODAY'S EVENTS
    const todayEvents = await Conversation.find({
      'booking.hasBooking': true,
      'booking.eventDate': { $gte: todayStart, $lte: todayEnd },
      'deletion.isDeleted': { $ne: true }
    })
      .select('visitor.name booking.package booking.eventDate booking.eventTime')
    
    // 4. UPCOMING EVENTS (tomorrow)
    const upcomingEvents = await Conversation.find({
      'booking.hasBooking': true,
      'booking.eventDate': { 
        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        $lte: new Date(tomorrow.setHours(23, 59, 59, 999))
      },
      'deletion.isDeleted': { $ne: true }
    })
      .select('visitor.name booking.package booking.eventDate')
    
    // 5. OVERDUE TASKS (from localStorage - frontend will fetch)
    // We'll return a flag to check frontend todos
    
    // 6. HIGH-VALUE BOOKINGS (> ₹50,000)
    const highValueBookings = await Conversation.find({
      'booking.hasBooking': true,
      'booking.status': { $in: ['pending', 'confirmed'] },
      'booking.estimatedValue': { $gt: 50000 },
      'deletion.isDeleted': { $ne: true }
    })
      .select('visitor.name booking.package booking.estimatedValue booking.status')
    
    // 7. AI INSIGHTS (based on trends)
    const insights = await generateAIInsights()
    
    const briefing = {
      date: new Date().toISOString(),
      priorities: [],
      stats: {
        pendingBookings: pendingBookings.length,
        unreadConversations: unreadConversations.length,
        todayEvents: todayEvents.length,
        upcomingEvents: upcomingEvents.length,
        highValueBookings: highValueBookings.length
      },
      details: {
        pendingBookings: pendingBookings.map(b => ({
          id: b._id,
          name: b.visitor?.name || 'Unknown',
          package: b.booking?.package || 'N/A',
          date: b.booking?.eventDate
        })),
        unreadConversations: unreadConversations.map(c => ({
          id: c._id,
          name: c.visitor?.name || 'Unknown',
          lastMessage: c.messages[c.messages.length - 1]?.text?.substring(0, 50) || '',
          waitingTime: Math.floor((Date.now() - new Date(c.meta?.lastActiveAt)) / (1000 * 60)) // minutes
        })),
        todayEvents: todayEvents.map(e => ({
          id: e._id,
          name: e.visitor?.name || 'Unknown',
          package: e.booking?.package || 'N/A',
          time: e.booking?.eventTime || 'Not specified'
        })),
        upcomingEvents: upcomingEvents.map(e => ({
          id: e._id,
          name: e.visitor?.name || 'Unknown',
          package: e.booking?.package || 'N/A',
          date: e.booking?.eventDate
        })),
        highValueBookings: highValueBookings.map(b => ({
          id: b._id,
          name: b.visitor?.name || 'Unknown',
          package: b.booking?.package || 'N/A',
          value: b.booking?.estimatedValue,
          status: b.booking?.status
        }))
      },
      insights
    }
    
    // BUILD PRIORITY LIST (top 5 most urgent items)
    if (todayEvents.length > 0) {
      briefing.priorities.push({
        type: 'event_today',
        urgency: 'high',
        message: `${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} scheduled for today`,
        action: 'Prepare equipment and confirm details',
        count: todayEvents.length,
        icon: 'calendar'
      })
    }
    
    if (upcomingEvents.length > 0) {
      briefing.priorities.push({
        type: 'event_tomorrow',
        urgency: 'medium',
        message: `${upcomingEvents.length} event${upcomingEvents.length > 1 ? 's' : ''} scheduled for tomorrow`,
        action: 'Send reminder to clients',
        count: upcomingEvents.length,
        icon: 'bell'
      })
    }
    
    if (highValueBookings.filter(b => b.booking.status === 'pending').length > 0) {
      const count = highValueBookings.filter(b => b.booking.status === 'pending').length
      briefing.priorities.push({
        type: 'high_value_pending',
        urgency: 'high',
        message: `${count} high-value booking${count > 1 ? 's' : ''} pending confirmation`,
        action: 'Confirm bookings to secure revenue',
        count,
        icon: 'dollar-sign'
      })
    }
    
    if (pendingBookings.length > 0) {
      briefing.priorities.push({
        type: 'pending_bookings',
        urgency: 'medium',
        message: `${pendingBookings.length} booking${pendingBookings.length > 1 ? 's' : ''} need${pendingBookings.length === 1 ? 's' : ''} confirmation`,
        action: 'Review and confirm bookings',
        count: pendingBookings.length,
        icon: 'check-circle'
      })
    }
    
    if (unreadConversations.length > 0) {
      briefing.priorities.push({
        type: 'unread_conversations',
        urgency: 'medium',
        message: `${unreadConversations.length} conversation${unreadConversations.length > 1 ? 's' : ''} waiting for response`,
        action: 'Reply to inquiries to maintain engagement',
        count: unreadConversations.length,
        icon: 'message-square'
      })
    }
    
    // Add insight as priority if significant
    if (insights.length > 0 && insights[0].type === 'warning') {
      briefing.priorities.push({
        type: 'ai_insight',
        urgency: 'low',
        message: insights[0].message,
        action: insights[0].suggestion,
        count: 1,
        icon: 'lightbulb'
      })
    }
    
    // Sort by urgency
    const urgencyOrder = { high: 0, medium: 1, low: 2 }
    briefing.priorities.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
    
    // Keep top 5
    briefing.priorities = briefing.priorities.slice(0, 5)
    
    console.log('✅ Daily briefing generated:', briefing.priorities.length, 'priorities')
    return briefing
    
  } catch (error) {
    console.error('❌ Error generating daily briefing:', error)
    return {
      date: new Date().toISOString(),
      priorities: [],
      stats: {},
      details: {},
      insights: [],
      error: error.message
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AI INSIGHTS GENERATOR
// ═══════════════════════════════════════════════════════════════

export const generateAIInsights = async () => {
  try {
    const insights = []
    
    // Get last 30 days of data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // 1. BOOKING TREND ANALYSIS
    const recentBookings = await Conversation.countDocuments({
      'booking.hasBooking': true,
      'createdAt': { $gte: thirtyDaysAgo },
      'deletion.isDeleted': { $ne: true }
    })
    
    const previousPeriodStart = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previousBookings = await Conversation.countDocuments({
      'booking.hasBooking': true,
      'createdAt': { $gte: previousPeriodStart, $lt: thirtyDaysAgo },
      'deletion.isDeleted': { $ne: true }
    })
    
    if (recentBookings > previousBookings) {
      const growthPercent = Math.round(((recentBookings - previousBookings) / previousBookings) * 100)
      insights.push({
        type: 'success',
        category: 'growth',
        message: `Bookings up ${growthPercent}% this month! Great momentum.`,
        suggestion: 'Consider raising prices or promoting premium packages.',
        icon: 'trending-up',
        color: 'green'
      })
    } else if (recentBookings < previousBookings) {
      const dropPercent = Math.round(((previousBookings - recentBookings) / previousBookings) * 100)
      insights.push({
        type: 'warning',
        category: 'growth',
        message: `Bookings down ${dropPercent}% compared to last month.`,
        suggestion: 'Review marketing strategy or offer seasonal promotions.',
        icon: 'trending-down',
        color: 'red'
      })
    }
    
    // 2. PACKAGE POPULARITY
    const packageStats = await Conversation.aggregate([
      {
        $match: {
          'booking.hasBooking': true,
          'createdAt': { $gte: thirtyDaysAgo },
          'deletion.isDeleted': { $ne: true }
        }
      },
      {
        $group: {
          _id: '$booking.package',
          count: { $sum: 1 },
          totalValue: { $sum: '$booking.estimatedValue' }
        }
      },
      { $sort: { count: -1 } }
    ])
    
    if (packageStats.length > 0) {
      const topPackage = packageStats[0]
      insights.push({
        type: 'info',
        category: 'packages',
        message: `${topPackage._id || 'Unknown'} package is most popular (${topPackage.count} bookings).`,
        suggestion: 'Focus marketing on this package or create similar offerings.',
        icon: 'package',
        color: 'blue'
      })
    }
    
    // 3. RESPONSE TIME ANALYSIS
    const slowResponses = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'meta.lastActiveAt': { $lt: new Date(Date.now() - 3 * 60 * 60 * 1000) }, // 3 hours old
      'booking.hasBooking': false
    })
    
    if (slowResponses > 3) {
      insights.push({
        type: 'warning',
        category: 'response_time',
        message: `${slowResponses} conversations have slow response times.`,
        suggestion: 'Quick responses improve conversion. Reply within 1 hour for best results.',
        icon: 'clock',
        color: 'amber'
      })
    }
    
    // 4. REVENUE TRACKING
    const totalRevenue = await Conversation.aggregate([
      {
        $match: {
          'booking.hasBooking': true,
          'booking.status': { $in: ['confirmed', 'completed'] },
          'createdAt': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$booking.estimatedValue' }
        }
      }
    ])
    
    if (totalRevenue.length > 0 && totalRevenue[0].total > 0) {
      const revenue = totalRevenue[0].total
      insights.push({
        type: 'success',
        category: 'revenue',
        message: `₹${revenue.toLocaleString()} revenue this month!`,
        suggestion: revenue > 200000 
          ? 'Excellent performance! Consider expanding your team.'
          : 'Good progress. Focus on upselling premium packages.',
        icon: 'dollar-sign',
        color: 'green'
      })
    }
    
    // 5. BEST BOOKING DAYS
    const bookingsByDay = await Conversation.aggregate([
      {
        $match: {
          'booking.hasBooking': true,
          'createdAt': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])
    
    if (bookingsByDay.length > 0) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const bestDay = dayNames[bookingsByDay[0]._id - 1]
      insights.push({
        type: 'info',
        category: 'patterns',
        message: `Most bookings happen on ${bestDay}s.`,
        suggestion: 'Schedule marketing posts for Thursday-Friday to catch weekend planners.',
        icon: 'calendar',
        color: 'purple'
      })
    }
    
    return insights.slice(0, 3) // Return top 3 insights
    
  } catch (error) {
    console.error('❌ Error generating AI insights:', error)
    return []
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTO-TASK GENERATOR
// ═══════════════════════════════════════════════════════════════

export const generateTasksFromBooking = (booking) => {
  const tasks = []
  const eventDate = new Date(booking.eventDate)
  const today = new Date()
  const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
  
  // 1. IMMEDIATE TASKS (booking confirmed)
  if (booking.status === 'confirmed') {
    tasks.push({
      title: `Prepare equipment for ${booking.customerName || 'client'}'s ${booking.package}`,
      description: `Ensure all cameras, lenses, batteries, and memory cards are ready`,
      category: 'preparation',
      priority: daysUntilEvent <= 2 ? 'high' : 'medium',
      dueDate: new Date(eventDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before
      estimatedTime: '1 hour',
      client: booking.customerName,
      aiSuggested: true,
      tags: ['equipment', 'preparation', booking.package]
    })
  }
  
  // 2. REMINDER TASKS (1 day before event)
  if (daysUntilEvent >= 1 && daysUntilEvent <= 7) {
    tasks.push({
      title: `Send reminder to ${booking.customerName || 'client'}`,
      description: `Confirm event details, location, and timing via WhatsApp`,
      category: 'communication',
      priority: 'medium',
      dueDate: new Date(eventDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day before
      estimatedTime: '15 minutes',
      client: booking.customerName,
      phone: booking.phone,
      aiSuggested: true,
      tags: ['reminder', 'communication']
    })
  }
  
  // 3. BATTERY CHARGING (1 day before)
  if (daysUntilEvent >= 1 && daysUntilEvent <= 3) {
    tasks.push({
      title: 'Charge all camera batteries',
      description: 'Charge main camera batteries, backup batteries, and power banks',
      category: 'preparation',
      priority: 'high',
      dueDate: new Date(eventDate.getTime() - 1 * 24 * 60 * 60 * 1000),
      estimatedTime: '30 minutes',
      client: booking.customerName,
      aiSuggested: true,
      tags: ['equipment', 'batteries']
    })
  }
  
  // 4. LOCATION SCOUTING (for outdoor shoots, 3+ days before)
  if (daysUntilEvent >= 3 && daysUntilEvent <= 7 && 
      (booking.package?.toLowerCase().includes('pre-wedding') || 
       booking.package?.toLowerCase().includes('outdoor'))) {
    tasks.push({
      title: `Scout location: ${booking.location || 'venue'}`,
      description: 'Visit location to plan shots, check lighting, and identify best angles',
      category: 'preparation',
      priority: 'medium',
      dueDate: new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      estimatedTime: '1.5 hours',
      client: booking.customerName,
      location: booking.location,
      aiSuggested: true,
      tags: ['scouting', 'planning']
    })
  }
  
  // 5. POST-EVENT TASKS (day after event)
  if (daysUntilEvent === -1) { // Event was yesterday
    tasks.push({
      title: `Backup photos from ${booking.customerName}'s ${booking.package}`,
      description: 'Upload all RAW files to cloud storage and external hard drive',
      category: 'backup',
      priority: 'high',
      dueDate: new Date(eventDate.getTime() + 1 * 24 * 60 * 60 * 1000),
      estimatedTime: '1 hour',
      client: booking.customerName,
      aiSuggested: true,
      tags: ['backup', 'post-event']
    })
    
    tasks.push({
      title: `Edit photos for ${booking.customerName}`,
      description: `Select and edit best shots from ${booking.package} session`,
      category: 'editing',
      priority: 'high',
      dueDate: new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week after
      estimatedTime: '4 hours',
      client: booking.customerName,
      aiSuggested: true,
      tags: ['editing', 'post-production']
    })
  }
  
  return tasks
}

// ═══════════════════════════════════════════════════════════════
// SMART TASK SUGGESTIONS
// ═══════════════════════════════════════════════════════════════

export const getSmartTaskSuggestions = async () => {
  try {
    const suggestions = []
    
    // 1. CHECK FOR UPCOMING EVENTS WITHOUT PREP TASKS
    const upcomingEvents = await Conversation.find({
      'booking.hasBooking': true,
      'booking.status': { $in: ['confirmed', 'pending'] },
      'booking.eventDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      },
      'deletion.isDeleted': { $ne: true }
    }).select('visitor.name booking.package booking.eventDate booking.eventLocation')
    
    upcomingEvents.forEach(event => {
      const tasks = generateTasksFromBooking({
        customerName: event.visitor?.name,
        package: event.booking?.package,
        eventDate: event.booking?.eventDate,
        location: event.booking?.eventLocation,
        status: event.booking?.status
      })
      suggestions.push(...tasks)
    })
    
    // 2. ROUTINE MAINTENANCE TASKS
    const lastBackupCheck = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    suggestions.push({
      title: 'Weekly backup check',
      description: 'Verify all recent photos are backed up to cloud and external drive',
      category: 'backup',
      priority: 'medium',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      estimatedTime: '30 minutes',
      aiSuggested: true,
      tags: ['backup', 'maintenance', 'routine']
    })
    
    // 3. MARKETING TASKS (if no bookings in last 7 days)
    const recentBookings = await Conversation.countDocuments({
      'booking.hasBooking': true,
      'createdAt': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    
    if (recentBookings === 0) {
      suggestions.push({
        title: 'Post portfolio update on social media',
        description: 'Share recent work on Instagram/Facebook to attract new clients',
        category: 'marketing',
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedTime: '45 minutes',
        aiSuggested: true,
        tags: ['marketing', 'social-media']
      })
    }
    
    // 4. CLIENT FOLLOW-UP TASKS
    const oldInquiries = await Conversation.find({
      'booking.hasBooking': false,
      'meta.lastActiveAt': {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1-7 days old
      },
      'deletion.isDeleted': { $ne: true }
    }).limit(3).select('visitor.name visitor.phone')
    
    oldInquiries.forEach(inquiry => {
      suggestions.push({
        title: `Follow up with ${inquiry.visitor?.name || 'potential client'}`,
        description: 'Check if they have any questions or need more information',
        category: 'communication',
        priority: 'low',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        estimatedTime: '15 minutes',
        client: inquiry.visitor?.name,
        phone: inquiry.visitor?.phone,
        aiSuggested: true,
        tags: ['follow-up', 'sales']
      })
    })
    
    // Remove duplicates and sort by priority
    const uniqueSuggestions = suggestions
      .filter((task, index, self) => 
        index === self.findIndex(t => t.title === task.title)
      )
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    
    return uniqueSuggestions.slice(0, 5) // Return top 5
    
  } catch (error) {
    console.error('❌ Error generating task suggestions:', error)
    return []
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  generateDailyBriefing,
  generateAIInsights,
  generateTasksFromBooking,
  getSmartTaskSuggestions
}