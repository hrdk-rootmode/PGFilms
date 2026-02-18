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
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999))

    // Get today's analytics (create if doesn't exist)
    let todayAnalytics = await Analytics.findOne({ date: today })
    if (!todayAnalytics) {
      todayAnalytics = await Analytics.create({ date: today })
    }

    // Count conversations
    const totalConversations = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true }
    })

    const newConversations = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      createdAt: { $gte: todayStart }
    })

    // Count bookings - FIXED: Use correct field name
    const totalBookings = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'booking.hasBooking': true
    })

    const pendingBookings = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'booking.hasBooking': true,
      'booking.status': 'pending'
    })

    const confirmedBookings = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'booking.hasBooking': true,
      'booking.status': 'confirmed'
    })

    // Calculate active users (unique visitors today)
    const activeUsers = await Conversation.distinct('visitor.fingerprint', {
      'deletion.isDeleted': { $ne: true },
      'meta.lastActiveAt': { $gte: todayStart, $lte: todayEnd }
    })

    // Calculate today's conversations (conversations with activity today)
    const todayConversations = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'meta.lastActiveAt': { $gte: todayStart, $lte: todayEnd }
    })

    // Get recent conversations - FIXED: Proper sorting by last activity
    const recentConversations = await Conversation
      .find({ 'deletion.isDeleted': { $ne: true } })
      .sort({ 
        'meta.lastActiveAt': -1,
        'lastMessageAt': -1,
        'createdAt': -1
      })
      .limit(5)
      .select('visitor messages lastMessageAt booking meta createdAt')

    return {
      stats: {
        totalConversations,
        newConversations,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        activeUsers: activeUsers.length,
        todayConversations,
        todayMessages: todayAnalytics.chat?.totalMessages || 0
      },
      recentConversations: recentConversations.map(c => ({
        id: c._id,
        visitorName: c.visitor?.name || 'Anonymous',
        lastMessage: c.messages[c.messages.length - 1]?.text?.substring(0, 50) || '',
        lastMessageAt: c.meta?.lastActiveAt || c.lastMessageAt || c.createdAt,
        messageCount: c.messages?.length || 0,
        isBooking: c.booking?.hasBooking || false,
        bookingStatus: c.booking?.status || null,
        status: c.booking?.hasBooking ? 'booking' : (c.abuse?.hasAbuse ? 'spam' : 'inquiry'),
        createdAt: c.createdAt
      })).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    // Return default values instead of throwing
    return {
      stats: {
        totalConversations: 0,
        newConversations: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        activeUsers: 0,
        todayConversations: 0,
        todayMessages: 0
      },
      recentConversations: []
    }
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
      .sort({ 
        'meta.lastActiveAt': -1,
        'lastMessageAt': -1,
        'createdAt': -1
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('sessionId visitor booking abuse meta messages createdAt lastMessageAt')

    return {
      conversations: conversations.map(c => ({
        id: c._id,
        sessionId: c.sessionId,
        visitor: c.visitor,
        lastMessage: c.messages[c.messages.length - 1]?.text?.substring(0, 100) || '',
        messageCount: c.messages.length,
        status: c.booking?.hasBooking ? 'booking' : c.abuse?.hasAbuse ? 'spam' : 'inquiry',
        language: c.visitor?.language,
        createdAt: c.createdAt,
        lastActiveAt: c.meta?.lastActiveAt || c.lastMessageAt || c.createdAt,
        lastMessageAt: c.lastMessageAt || c.createdAt,
        messages: c.messages || [] // Include full conversation history
      })).sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt)),
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
        name: b.visitor?.name || 'Unknown',
        email: b.visitor?.email || 'No email',
        phone: b.visitor?.phone || 'No phone',
        package: b.booking?.package || 'No package',
        eventDate: b.booking?.eventDate || null,
        location: b.booking?.eventLocation || 'No location',
        status: b.booking?.status || 'pending',
        value: b.booking?.estimatedValue || 0,
        specialRequests: b.booking?.specialRequests || '',
        adminNotes: b.booking?.adminNotes || '',
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

    const oldStatus = conversation.booking.status
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

    // Update analytics if status changed
    if (oldStatus !== status) {
      const today = getTodayDateString()
      const todayAnalytics = await Analytics.findOne({ date: today }) || await Analytics.create({ date: today })

      // Update booking counts
      if (oldStatus === 'pending') todayAnalytics.bookings.pending -= 1
      if (oldStatus === 'contacted') todayAnalytics.bookings.contacted -= 1
      if (oldStatus === 'confirmed') todayAnalytics.bookings.confirmed -= 1
      if (oldStatus === 'completed') todayAnalytics.bookings.completed -= 1
      if (oldStatus === 'cancelled') todayAnalytics.bookings.cancelled -= 1

      if (status === 'pending') todayAnalytics.bookings.pending += 1
      if (status === 'contacted') todayAnalytics.bookings.contacted += 1
      if (status === 'confirmed') todayAnalytics.bookings.confirmed += 1
      if (status === 'completed') todayAnalytics.bookings.completed += 1
      if (status === 'cancelled') todayAnalytics.bookings.cancelled += 1

      await todayAnalytics.save()
    }

    return { success: true, message: 'Booking updated' }
  } catch (error) {
    console.error('Update booking error:', error)
    throw error
  }
}

export const deleteBooking = async (id, reason = 'cancelled') => {
  try {
    // Re-use deleteConversation logic since bookings are conversations
    return await deleteConversation(id, reason)
  } catch (error) {
    console.error('Delete booking error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// PACKAGES MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getPackages = async () => {
  try {
    console.log('🔍 getPackages called...')
    const packagesConfig = await Config.findOne({ _id: 'packages' })
    console.log('📦 Found packages config:', packagesConfig ? 'Yes' : 'No')
    
    if (!packagesConfig) {
      console.log('❌ No packages config found')
      return []
    }
    
    const packages = packagesConfig.data || []
    console.log('📋 Packages count:', packages.length)
    console.log('📋 First package:', packages.length > 0 ? `${packages[0].name} - ${packages[0].price}` : 'No packages')
    
    return packages
  } catch (error) {
    console.error('❌ Get packages error:', error)
    throw error
  }
}

export const updatePackage = async (packageId, data) => {
  try {
    console.log('🔧 updatePackage called with:', { packageId, data })
    
    // Handle creation (when packageId is null or undefined)
    if (!packageId) {
      console.log('➕ Creating new package')
      const newPackage = {
        id: `pkg-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await Config.findOneAndUpdate(
        { _id: 'packages' },
        { $push: { data: newPackage } },
        { upsert: true, new: true }
      )
      
      console.log('✅ New package created and saved to database')
      console.log('📦 Database result:', result ? 'Success' : 'Failed')
      return newPackage
    }

    // Handle update - use findOneAndUpdate for atomic operation
    console.log('🔄 Updating package with ID:', packageId)
    
    const updateData = {
      id: packageId, // Ensure the ID is preserved
      ...data,
      updatedAt: new Date()
    }
    
    console.log('🔄 Update data to save:', JSON.stringify(updateData, null, 2))
    
    // Try to find by ID first, if that fails, try to find by name (for broken data)
    let result = await Config.findOneAndUpdate(
      { _id: 'packages', 'data.id': packageId },
      { 
        $set: { 
          'data.$': updateData
        }
      },
      { new: true }
    )
    
    // If not found by ID, try to find by name (for fixing broken data)
    if (!result && data.name) {
      console.log('⚠️ Package not found by ID, trying by name...')
      result = await Config.findOneAndUpdate(
        { _id: 'packages', 'data.name': data.name },
        { 
          $set: { 
            'data.$': updateData
          }
        },
        { new: true }
      )
    }
    
    console.log('📝 Database update result:', result ? 'Success' : 'Failed')
    
    if (!result) {
      throw new Error(`Package with ID ${packageId} not found`)
    }
    
    // Find the updated package in the returned data
    const updatedPackage = result.data.find(p => p.id === packageId)
    console.log('✅ Package updated in database:', JSON.stringify(updatedPackage, null, 2))
    
    // If for some reason the package is not found, return the updateData
    if (!updatedPackage) {
      console.log('⚠️ Updated package not found in result, returning updateData')
      return { ...updateData, id: packageId }
    }
    
    return updatedPackage
  } catch (error) {
    console.error('❌ Update package error:', error)
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
// REAL-TIME DASHBOARD UPDATES
// ═══════════════════════════════════════════════════════════════

export const refreshDashboardStats = async () => {
  try {
    const today = getTodayDateString()
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999))

    // Get today's analytics (create if doesn't exist)
    let todayAnalytics = await Analytics.findOne({ date: today })
    if (!todayAnalytics) {
      todayAnalytics = await Analytics.create({ date: today })
    }

    // Recalculate all stats
    const totalConversations = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true }
    })

    const newConversations = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      createdAt: { $gte: todayStart }
    })

    const totalBookings = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'booking.hasBooking': true
    })

    const pendingBookings = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'booking.hasBooking': true,
      'booking.status': 'pending'
    })

    const confirmedBookings = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'booking.hasBooking': true,
      'booking.status': 'confirmed'
    })

    // Calculate active users (unique visitors today)
    const activeUsers = await Conversation.distinct('visitor.fingerprint', {
      'deletion.isDeleted': { $ne: true },
      'meta.lastActiveAt': { $gte: todayStart, $lte: todayEnd }
    })

    // Calculate today's conversations (conversations with activity today)
    const todayConversations = await Conversation.countDocuments({
      'deletion.isDeleted': { $ne: true },
      'meta.lastActiveAt': { $gte: todayStart, $lte: todayEnd }
    })

    // Update analytics with current counts
    todayAnalytics.bookings.total = totalBookings
    todayAnalytics.bookings.pending = pendingBookings
    todayAnalytics.bookings.confirmed = confirmedBookings
    todayAnalytics.newConversations = newConversations

    await todayAnalytics.save()

    return {
      stats: {
        totalConversations,
        newConversations,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        activeUsers: activeUsers.length,
        todayConversations,
        todayMessages: todayAnalytics.chat?.totalMessages || 0
      }
    }
  } catch (error) {
    console.error('Refresh dashboard stats error:', error)
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
  runAnalyticsAggregation,
  refreshDashboardStats
}
