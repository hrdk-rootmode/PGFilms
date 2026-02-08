// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Admin Routes (Auth Required)
// ═══════════════════════════════════════════════════════════════

import express from 'express'
import { verifyToken } from '../utils/helpers.js'
import {
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
  changePassword
} from '../services/admin.service.js'

const router = express.Router()

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    req.admin = decoded
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTES (No middleware)
// ═══════════════════════════════════════════════════════════════

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    const result = await authenticateAdmin(email, password)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials'
    })
  }
})

router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: { admin: req.admin }
  })
})

// ═══════════════════════════════════════════════════════════════
// PROTECTED ROUTES (Require Auth)
// ═══════════════════════════════════════════════════════════════

// Apply auth middleware to all routes below
router.use(authMiddleware)

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

router.get('/dashboard', async (req, res) => {
  try {
    const stats = await getDashboardStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' })
  }
})

// ─────────────────────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────────────────────

router.get('/conversations', async (req, res) => {
  try {
    const result = await getConversations(req.query)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Conversations error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' })
  }
})

router.delete('/conversations/:id', async (req, res) => {
  try {
    const { reason } = req.body
    const result = await deleteConversation(req.params.id, reason)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Delete conversation error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ─────────────────────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────────────────────

router.get('/bookings', async (req, res) => {
  try {
    const result = await getBookings(req.query)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Bookings error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' })
  }
})

router.put('/bookings/:id', async (req, res) => {
  try {
    const { status, notes } = req.body
    const result = await updateBookingStatus(req.params.id, status, notes)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Update booking error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ─────────────────────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────────────────────

router.get('/packages', async (req, res) => {
  try {
    const packages = await getPackages()
    res.json({ success: true, data: packages })
  } catch (error) {
    console.error('Packages error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch packages' })
  }
})

router.post('/packages', async (req, res) => {
  try {
    const result = await updatePackage(null, req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Create package error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.put('/packages/:id', async (req, res) => {
  try {
    const result = await updatePackage(req.params.id, req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Update package error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/packages/:id', async (req, res) => {
  try {
    const result = await deletePackage(req.params.id)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Delete package error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ─────────────────────────────────────────────────────────────
// PATTERNS/LEARNING
// ─────────────────────────────────────────────────────────────

router.get('/patterns', async (req, res) => {
  try {
    const patterns = await getPatterns()
    res.json({ success: true, data: patterns })
  } catch (error) {
    console.error('Patterns error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch patterns' })
  }
})

router.post('/patterns/approve/:id', async (req, res) => {
  try {
    const { intent } = req.body
    const result = await approvePattern(req.params.id, intent)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Approve pattern error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/patterns/reject/:id', async (req, res) => {
  try {
    const result = await rejectPattern(req.params.id)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Reject pattern error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ─────────────────────────────────────────────────────────────
// TRASH
// ─────────────────────────────────────────────────────────────

router.get('/trash', async (req, res) => {
  try {
    const trash = await getTrash()
    res.json({ success: true, data: trash })
  } catch (error) {
    console.error('Trash error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch trash' })
  }
})

router.post('/trash/recover/:id', async (req, res) => {
  try {
    const result = await recoverFromTrash(req.params.id)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Recover error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/trash/:id', async (req, res) => {
  try {
    // Verify OTP first
    const { otp } = req.body
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP required for permanent delete'
      })
    }

    await verifyAdminOTP(otp)
    const result = await permanentDelete(req.params.id)
    
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Permanent delete error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────

router.get('/analytics', async (req, res) => {
  try {
    const analytics = await getAnalytics(req.query)
    res.json({ success: true, data: analytics })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' })
  }
})

// ─────────────────────────────────────────────────────────────
// OTP
// ─────────────────────────────────────────────────────────────

router.post('/otp/send', async (req, res) => {
  try {
    const { action } = req.body
    const result = await sendAdminOTP(action || 'verification')
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/otp/verify', async (req, res) => {
  try {
    const { otp } = req.body
    const result = await verifyAdminOTP(otp)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
})

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────

router.get('/settings', async (req, res) => {
  try {
    const settings = await getSettings()
    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Settings error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch settings' })
  }
})

router.put('/settings', async (req, res) => {
  try {
    const result = await updateSettings(req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/settings/password', async (req, res) => {
  try {
    const { currentPassword, newPassword, otp } = req.body

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP required for password change'
      })
    }

    await verifyAdminOTP(otp)
    const result = await changePassword(currentPassword, newPassword)
    
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
})

export default router