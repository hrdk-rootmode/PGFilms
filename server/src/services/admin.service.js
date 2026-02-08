// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Admin Service (Dashboard & Management)
// ═══════════════════════════════════════════════════════════════

import { Conversation, Analytics, Config, getTodayDateString } from '../models/index.js'
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  generateOTP,
  sendOTPEmail 
} from '../utils/helpers.js'

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

export const authenticateAdmin = async (email, password) => {
  try {
    const adminConfig = await Config.findOne({ _id: 'admin' })
    
    if (!adminConfig) {
      throw new Error('Admin not configured')
    }

    const admin = adminConfig.data

    // Check email
    if (email !== admin.email) {
      throw new Error('Invalid credentials')
    }

    // Check password
    const isValid = await verifyPassword(password, admin.passwordHash)
    
    if (!isValid) {
      // Increment failed attempts
      admin.security.failedAttempts = (admin.security.failedAttempts || 0) + 1
      
      if (admin.security.failedAttempts >= 5) {
        admin.security.lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 min lockout
      }
      
      await adminConfig.save()
      throw new Error('Invalid credentials')
    }

    // Check if locked
    if (admin.security.lockedUntil && new Date() < new Date(admin.security.lockedUntil)) {
      throw new Error('Account locked. Try again later.')
    }

    // Reset failed attempts on successful login
    admin.security.failedAttempts = 0
    admin.security.lockedUntil = null
    admin.security.lastLogin = new Date()
    
    // Add to login history
    if (!admin.security.loginHistory) {
      admin.security.loginHistory = []
    }
    admin.security.loginHistory.unshift({
      date: new Date(),
      success: true
    })
    admin.security.loginHistory = admin.security.loginHistory.slice(0, 10)
    
    await adminConfig.save()

    // Generate token
    const token = generateToken({ 
      email: admin.email, 
      role: 'admin' 
    })

    return {
      token,
      admin: {
        email: admin.email,
        name: admin.profile?.name,
        role: 'admin'
      }
    }
  } catch (error) {
    console.error('Auth error:', error.message)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════

export const getDashboardStats = async () => {
  try {
    const today = getTodayDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Get today's analytics
    const todayAnalytics = await Analytics.findOne({ date: today }) || {}
    const yesterdayAnalytics = await Analytics.findOne({ date: yesterdayStr }) || {}

    // Calculate changes
    const calcChange = (today, yesterday) => {
      if (!yesterday || yesterday === 0) return today > 0 ? 100 : 0
      return Math.round(((today - yesterday) / yesterday) * 100)
    }

    // Get recent bookings
    const recentBookings = await Conversation.find({
      'booking.hasBooking': true,
      'deletion.isDeleted': false
    })
      .sort({ 'booking.statusHistory.changedAt': -1 })
      .limit(5)
      .select('visitor booking meta createdAt')

    // Get pending patterns
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    const pendingPatterns = patternsConfig?.data?.pendingPatterns?.slice(0, 5) || []

    // Get booking counts by status
    const bookingCounts = await Conversation.aggregate([
      { $match: { 'booking.hasBooking': true, 'deletion.isDeleted': false } },
      { $group: { _id: '$booking.status', count: { $sum: 1 } } }
    ])

    const bookingsByStatus = {}
    bookingCounts.forEach(b => { bookingsByStatus[b._id] = b.count })

    return {
      today: {
        visitors: todayAnalytics.traffic?.uniqueVisitors || 0,
        visitorsChange: calcChange(
          todayAnalytics.traffic?.uniqueVisitors || 0,
          yesterdayAnalytics.traffic?.uniqueVisitors || 0
        ),
        chats: todayAnalytics.chat?.conversationsStarted || 0,
        chatsChange: calcChange(
          todayAnalytics.chat?.conversationsStarted || 0,
          yesterdayAnalytics.chat?.conversationsStarted || 0
        ),
        bookings: todayAnalytics.bookings?.inquiriesCompleted || 0,
        bookingsChange: calcChange(
          todayAnalytics.bookings?.inquiriesCompleted || 0,
          yesterdayAnalytics.bookings?.inquiriesCompleted || 0
        ),
        revenue: todayAnalytics.bookings?.totalValue || 0,
        revenueChange: calcChange(
          todayAnalytics.bookings?.totalValue || 0,
          yesterdayAnalytics.bookings?.totalValue || 0
        )
      },
      recentBookings: recentBookings.map(b => ({
        id: b._id,
        name: b.visitor?.name || 'Unknown',
        phone: b.visitor?.phone,
        package: b.booking?.package,
        date: b.booking?.eventDate,
        location: b.booking?.eventLocation,
        status: b.booking?.status,
        value: b.booking?.estimatedValue,
        createdAt: b.createdAt
      })),
      pendingPatterns: pendingPatterns.map(p => ({
        id: p.id,
        word: p.word,
        occurrences: p.occurrences,
        suggestedIntent: p.suggestedIntent
      })),
      bookingsByStatus,
      chatStats: {
        instant: todayAnalytics.chat?.responseBreakdown?.instant || 0,
        pattern: todayAnalytics.chat?.responseBreakdown?.pattern || 0,
        ai: todayAnalytics.chat?.responseBreakdown?.ai || 0
      }
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// CONVERSATIONS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getConversations = async (options = {}) => {
  try {
    const {
      status,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      includeDeleted = false
    } = options

    const query = {}
    
    if (!includeDeleted) {
      query['deletion.isDeleted'] = false
    }

    if (status && status !== 'all') {
      if (status === 'booking') {
        query['booking.hasBooking'] = true
      } else if (status === 'spam') {
        query['abuse.hasAbuse'] = true
      }
    }

    if (search) {
      query.$or = [
        { 'visitor.name': { $regex: search, $options: 'i' } },
        { 'visitor.phone': { $regex: search, $options: 'i' } },
        { 'messages.text': { $regex: search, $options: 'i' } }
      ]
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const total = await Conversation.countDocuments(query)
    
    const conversations = await Conversation.find(query)
      .sort({ 'meta.lastActiveAt': -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('sessionId visitor booking abuse meta messages createdAt')

    return {
      conversations: conversations.map(c => ({
        id: c._id,
        sessionId: c.sessionId,
        visitor: c.visitor,
        lastMessage: c.messages[c.messages.length - 1]?.text?.substring(0, 100),
        messageCount: c.messages.length,
        status: c.booking?.hasBooking ? 'booking' : c.abuse?.hasAbuse ? 'spam' : 'inquiry',
        language: c.visitor?.language,
        createdAt: c.createdAt,
        lastActiveAt: c.meta?.lastActiveAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Get conversations error:', error)
    throw error
  }
}

export const deleteConversation = async (id, reason = 'unwanted') => {
  try {
    const conversation = await Conversation.findById(id)
    
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Check if it's a successful booking - warn but allow
    if (conversation.booking?.status === 'confirmed' || conversation.booking?.status === 'completed') {
      console.warn('Warning: Deleting a confirmed/completed booking conversation')
    }

    // Soft delete
    conversation.deletion = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: 'admin',
      reason,
      permanentDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }

    await conversation.save()

    return { success: true, message: 'Moved to trash' }
  } catch (error) {
    console.error('Delete conversation error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// BOOKINGS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getBookings = async (options = {}) => {
  try {
    const { status, page = 1, limit = 20 } = options

    const query = {
      'booking.hasBooking': true,
      'deletion.isDeleted': false
    }

    if (status && status !== 'all') {
      query['booking.status'] = status
    }

    const total = await Conversation.countDocuments(query)
    
    const bookings = await Conversation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return {
      bookings: bookings.map(b => ({
        id: b._id,
        name: b.visitor?.name,
        email: b.visitor?.email,
        phone: b.visitor?.phone,
        package: b.booking?.package,
        eventDate: b.booking?.eventDate,
        location: b.booking?.eventLocation,
        status: b.booking?.status,
        value: b.booking?.estimatedValue,
        specialRequests: b.booking?.specialRequests,
        adminNotes: b.booking?.adminNotes,
        createdAt: b.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Get bookings error:', error)
    throw error
  }
}

export const updateBookingStatus = async (id, status, notes = null) => {
  try {
    const conversation = await Conversation.findById(id)
    
    if (!conversation || !conversation.booking?.hasBooking) {
      throw new Error('Booking not found')
    }

    conversation.booking.status = status
    
    if (notes) {
      conversation.booking.adminNotes = notes
    }

    conversation.booking.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: 'admin'
    })

    await conversation.save()

    return { success: true, message: 'Booking updated' }
  } catch (error) {
    console.error('Update booking error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// PACKAGES MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getPackages = async () => {
  try {
    const packagesConfig = await Config.findOne({ _id: 'packages' })
    return packagesConfig?.data || []
  } catch (error) {
    console.error('Get packages error:', error)
    throw error
  }
}

export const updatePackage = async (packageId, data) => {
  try {
    const packagesConfig = await Config.findOne({ _id: 'packages' })
    
    if (!packagesConfig) {
      throw new Error('Packages not configured')
    }

    const packages = packagesConfig.data || []
    const index = packages.findIndex(p => p.id === packageId)
    
    if (index === -1) {
      // Add new package
      packages.push({
        id: packageId || `pkg-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } else {
      // Update existing
      packages[index] = {
        ...packages[index],
        ...data,
        updatedAt: new Date()
      }
    }

    packagesConfig.data = packages
    await packagesConfig.save()

    return { success: true, packages }
  } catch (error) {
    console.error('Update package error:', error)
    throw error
  }
}

export const deletePackage = async (packageId) => {
  try {
    const packagesConfig = await Config.findOne({ _id: 'packages' })
    
    if (!packagesConfig) {
      throw new Error('Packages not configured')
    }

    packagesConfig.data = packagesConfig.data.filter(p => p.id !== packageId)
    await packagesConfig.save()

    return { success: true }
  } catch (error) {
    console.error('Delete package error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// PATTERNS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getPatterns = async () => {
  try {
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    return patternsConfig?.data || {}
  } catch (error) {
    console.error('Get patterns error:', error)
    throw error
  }
}

export const approvePattern = async (patternId, intent) => {
  try {
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    
    if (!patternsConfig) {
      throw new Error('Patterns not configured')
    }

    const pendingPatterns = patternsConfig.data.pendingPatterns || []
    const pattern = pendingPatterns.find(p => p.id === patternId)
    
    if (!pattern) {
      throw new Error('Pattern not found')
    }

    // Add to learned keywords
    const learnedKeywords = patternsConfig.data.learnedKeywords || []
    learnedKeywords.push({
      word: pattern.word,
      intent: intent || pattern.suggestedIntent,
      score: 0.9,
      addedOn: new Date(),
      addedBy: 'admin'
    })

    // Remove from pending
    patternsConfig.data.pendingPatterns = pendingPatterns.filter(p => p.id !== patternId)
    patternsConfig.data.learnedKeywords = learnedKeywords

    await patternsConfig.save()

    return { success: true }
  } catch (error) {
    console.error('Approve pattern error:', error)
    throw error
  }
}

export const rejectPattern = async (patternId) => {
  try {
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    
    if (!patternsConfig) {
      throw new Error('Patterns not configured')
    }

    patternsConfig.data.pendingPatterns = (patternsConfig.data.pendingPatterns || [])
      .filter(p => p.id !== patternId)

    await patternsConfig.save()

    return { success: true }
  } catch (error) {
    console.error('Reject pattern error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// TRASH MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getTrash = async () => {
  try {
    const trashedConversations = await Conversation.find({
      'deletion.isDeleted': true
    }).sort({ 'deletion.deletedAt': -1 })

    return trashedConversations.map(c => ({
      id: c._id,
      type: 'conversation',
      visitor: c.visitor?.name || 'Unknown',
      deletedAt: c.deletion.deletedAt,
      reason: c.deletion.reason,
      expiresIn: Math.ceil((new Date(c.deletion.permanentDeleteAt) - new Date()) / (1000 * 60 * 60 * 24))
    }))
  } catch (error) {
    console.error('Get trash error:', error)
    throw error
  }
}

export const recoverFromTrash = async (id) => {
  try {
    const conversation = await Conversation.findById(id)
    
    if (!conversation) {
      throw new Error('Item not found')
    }

    conversation.deletion.isDeleted = false
    conversation.deletion.recoveredAt = new Date()
    conversation.deletion.recoveredCount = (conversation.deletion.recoveredCount || 0) + 1

    await conversation.save()

    return { success: true }
  } catch (error) {
    console.error('Recover from trash error:', error)
    throw error
  }
}

export const permanentDelete = async (id) => {
  try {
    await Conversation.findByIdAndDelete(id)
    return { success: true }
  } catch (error) {
    console.error('Permanent delete error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════

export const getAnalytics = async (options = {}) => {
  try {
    const { range = 'week' } = options
    
    let days = 7
    if (range === 'month') days = 30
    if (range === 'year') days = 365

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const analytics = await Analytics.find({
      date: { $gte: startDateStr }
    }).sort({ date: 1 })

    // Aggregate totals
    const totals = {
      visitors: 0,
      chats: 0,
      bookings: 0,
      revenue: 0
    }

    analytics.forEach(a => {
      totals.visitors += a.traffic?.uniqueVisitors || 0
      totals.chats += a.chat?.conversationsStarted || 0
      totals.bookings += a.bookings?.inquiriesCompleted || 0
      totals.revenue += a.bookings?.totalValue || 0
    })

    return {
      range,
      days,
      totals,
      daily: analytics.map(a => ({
        date: a.date,
        visitors: a.traffic?.uniqueVisitors || 0,
        chats: a.chat?.conversationsStarted || 0,
        bookings: a.bookings?.inquiriesCompleted || 0,
        revenue: a.bookings?.totalValue || 0
      }))
    }
  } catch (error) {
    console.error('Get analytics error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// OTP MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const sendAdminOTP = async (action) => {
  try {
    const adminConfig = await Config.findOne({ _id: 'admin' })
    
    if (!adminConfig) {
      throw new Error('Admin not configured')
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    adminConfig.data.otp = {
      lastCode: await hashPassword(otp),
      expiresAt,
      attempts: 0,
      lastSentAt: new Date()
    }

    await adminConfig.save()

    // Send OTP email
    await sendOTPEmail(adminConfig.data.email, otp, action)

    return { success: true, message: 'OTP sent to email' }
  } catch (error) {
    console.error('Send OTP error:', error)
    throw error
  }
}

export const verifyAdminOTP = async (otp) => {
  try {
    const adminConfig = await Config.findOne({ _id: 'admin' })
    
    if (!adminConfig?.data?.otp) {
      throw new Error('No OTP requested')
    }

    const otpData = adminConfig.data.otp

    // Check expiry
    if (new Date() > new Date(otpData.expiresAt)) {
      throw new Error('OTP expired')
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      throw new Error('Too many attempts')
    }

    // Verify OTP
    const isValid = await verifyPassword(otp, otpData.lastCode)
    
    if (!isValid) {
      adminConfig.data.otp.attempts += 1
      await adminConfig.save()
      throw new Error('Invalid OTP')
    }

    // Clear OTP
    adminConfig.data.otp = null
    await adminConfig.save()

    return { success: true }
  } catch (error) {
    console.error('Verify OTP error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════

export const getSettings = async () => {
  try {
    const adminConfig = await Config.findOne({ _id: 'admin' })
    
    if (!adminConfig) {
      throw new Error('Admin not configured')
    }

    const { passwordHash, otp, security, ...settings } = adminConfig.data

    return settings
  } catch (error) {
    console.error('Get settings error:', error)
    throw error
  }
}

export const updateSettings = async (settings) => {
  try {
    const adminConfig = await Config.findOne({ _id: 'admin' })
    
    if (!adminConfig) {
      throw new Error('Admin not configured')
    }

    // Update allowed fields only
    if (settings.profile) {
      adminConfig.data.profile = { ...adminConfig.data.profile, ...settings.profile }
    }
    if (settings.notifications) {
      adminConfig.data.notifications = { ...adminConfig.data.notifications, ...settings.notifications }
    }
    if (settings.business) {
      adminConfig.data.business = { ...adminConfig.data.business, ...settings.business }
    }

    await adminConfig.save()

    return { success: true }
  } catch (error) {
    console.error('Update settings error:', error)
    throw error
  }
}

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const adminConfig = await Config.findOne({ _id: 'admin' })
    
    if (!adminConfig) {
      throw new Error('Admin not configured')
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, adminConfig.data.passwordHash)
    
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    adminConfig.data.passwordHash = await hashPassword(newPassword)
    adminConfig.data.security.passwordChangedAt = new Date()

    await adminConfig.save()

    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// CLEANUP JOBS
// ═══════════════════════════════════════════════════════════════

export const runDailyCleanup = async () => {
  try {
    console.log('🧹 Running daily cleanup...')

    // Delete permanently expired trash items
    const result = await Conversation.deleteMany({
      'deletion.isDeleted': true,
      'deletion.permanentDeleteAt': { $lte: new Date() }
    })

    console.log(`🗑️ Permanently deleted ${result.deletedCount} items`)

    // Archive old conversations (> 90 days, no booking)
    const archiveDate = new Date()
    archiveDate.setDate(archiveDate.getDate() - 90)

    const archived = await Conversation.updateMany(
      {
        createdAt: { $lte: archiveDate },
        'booking.hasBooking': false,
        'deletion.isDeleted': false
      },
      {
        $set: {
          'deletion.isDeleted': true,
          'deletion.deletedAt': new Date(),
          'deletion.deletedBy': 'auto',
          'deletion.reason': 'auto_archive',
          'deletion.permanentDeleteAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    )

    console.log(`📦 Archived ${archived.modifiedCount} old conversations`)

    return { deleted: result.deletedCount, archived: archived.modifiedCount }
  } catch (error) {
    console.error('Daily cleanup error:', error)
    throw error
  }
}

export const runAnalyticsAggregation = async () => {
  try {
    // This runs hourly to ensure analytics are up to date
    // Most analytics are incremented in real-time, but this catches any gaps
    
    const today = getTodayDateString()
    
    // Ensure today's analytics document exists
    await Analytics.findOneAndUpdate(
      { date: today },
      { $setOnInsert: { date: today } },
      { upsert: true }
    )

    return { success: true }
  } catch (error) {
    console.error('Analytics aggregation error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  authenticateAdmin,
  getDashboardStats,
  getConversations,
  deleteConversation,
  getBookings,
  updateBookingStatus,
  getPackages,
  updatePackage,
  deletePackage,
  getPatterns,
  approvePattern,
  rejectPattern,
  getTrash,
  recoverFromTrash,
  permanentDelete,
  getAnalytics,
  sendAdminOTP,
  verifyAdminOTP,
  getSettings,
  updateSettings,
  changePassword,
  runDailyCleanup,
  runAnalyticsAggregation
}