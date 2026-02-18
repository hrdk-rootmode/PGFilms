// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Chat Routes
// ═══════════════════════════════════════════════════════════════

import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { processMessage, handleBooking, createBooking, getConversation } from '../services/chat.service.js'
import { incrementAnalytics } from '../models/index.js'

const router = express.Router()

// ═══════════════════════════════════════════════════════════════
// SEND MESSAGE
// ═══════════════════════════════════════════════════════════════

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, language } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      })
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message too long'
      })
    }

    // Generate session ID if not provided
    const chatSessionId = sessionId || uuidv4()

    // Extract metadata from request
    const metadata = {
      fingerprint: req.headers['x-fingerprint'],
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      device: req.headers['x-device'] || 'unknown',
      browser: req.headers['x-browser'] || 'unknown',
      referrer: req.headers['referer'] || 'direct',
      language: language || 'en'
    }

    const result = await processMessage(chatSessionId, message.trim(), metadata)

    res.json({
      success: true,
      data: {
        sessionId: chatSessionId,
        response: result.response,
        language: result.language,
        responseType: result.responseType
      }
    })
  } catch (error) {
    console.error('Chat message error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// GET CONVERSATION
// ═══════════════════════════════════════════════════════════════

router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    const conversation = await getConversation(sessionId)

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }

    res.json({
      success: true,
      data: {
        sessionId: conversation.sessionId,
        messages: conversation.messages.map(m => ({
          id: m.id,
          role: m.role,
          text: m.displayText || m.text,
          timestamp: m.timestamp
        })),
        visitor: {
          name: conversation.visitor?.name,
          language: conversation.visitor?.language
        },
        booking: conversation.booking?.hasBooking ? {
          package: conversation.booking.package,
          status: conversation.booking.status
        } : null
      }
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// SUBMIT BOOKING
// ═══════════════════════════════════════════════════════════════

router.post('/booking', async (req, res) => {
  try {
    const { 
      sessionId, 
      name, 
      phone, 
      email, 
      package: packageData,
      packageId,
      eventDate, 
      location,
      specialRequests,
      value
    } = req.body

    // DEBUG: Log what we're receiving
    console.log('🔍 DEBUG - Booking request received:', {
      sessionId,
      name,
      phone,
      packageData,
      packageId,
      specialRequests,
      value
    })

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      })
    }

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      })
    }

    // Extract package name from package object or use packageName
    const packageName = packageData?.name || packageId

    // Check if this is a custom package request (no packageName from form but has package object with custom details)
    if (packageData?.name === 'Custom Photography Package' && packageId && specialRequests) {
      // This is a custom package request from the chat widget
      const result = await createBooking({
        package: {
          name: packageData.name,
          id: packageId,
          description: specialRequests,
          price: value || 0
        },
        userDetails: {
          name,
          mobile: phone
        },
        deviceFingerprint: req.headers['x-fingerprint']
      })

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        })
      }

      res.json({
        success: true,
        data: {
          bookingId: result.bookingId,
          message: result.message
        }
      })
      return
    }

    // Regular booking flow
    const result = await handleBooking(sessionId, {
      name,
      phone,
      email,
      package: packageName,
      packageId,
      eventDate,
      location,
      specialRequests,
      value
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    res.json({
      success: true,
      data: {
        bookingId: result.bookingId,
        score: result.score,
        message: result.message
      }
    })
  } catch (error) {
    console.error('Submit booking error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit booking'
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// CHECK EXISTING BOOKING
// ═══════════════════════════════════════════════════════════════

router.post('/check-booking', async (req, res) => {
  try {
    const { mobile, deviceFingerprint } = req.body

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      })
    }

    // Check for existing booking with same mobile and device fingerprint
    const { Conversation } = await import('../models/index.js')
    
    const existingBooking = await Conversation.findOne({
      'booking.hasBooking': true,
      'visitor.phone': mobile,
      'visitor.fingerprint': deviceFingerprint
    }).sort({ createdAt: -1 })

    if (existingBooking) {
      res.json({
        success: true,
        data: {
          hasBooking: true,
          bookingId: existingBooking.booking.packageId || `PG-${existingBooking._id.toString().slice(-6)}`,
          name: existingBooking.visitor.name,
          mobile: existingBooking.visitor.phone,
          status: existingBooking.booking.status,
          createdAt: existingBooking.createdAt,
          deviceMatch: true
        }
      })
    } else {
      // Check for booking with same mobile (different device)
      const existingMobileBooking = await Conversation.findOne({
        'booking.hasBooking': true,
        'visitor.phone': mobile
      }).sort({ createdAt: -1 })

      if (existingMobileBooking) {
        res.json({
          success: true,
          data: {
            hasBooking: true,
            bookingId: existingMobileBooking.booking.packageId || `PG-${existingMobileBooking._id.toString().slice(-6)}`,
            name: existingMobileBooking.visitor.name,
            mobile: existingMobileBooking.visitor.phone,
            status: existingMobileBooking.booking.status,
            createdAt: existingMobileBooking.createdAt,
            deviceMatch: false
          }
        })
      } else {
        res.json({
          success: true,
          data: {
            hasBooking: false
          }
        })
      }
    }
  } catch (error) {
    console.error('Check existing booking error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check existing booking'
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// UPDATE BOOKING
// ═══════════════════════════════════════════════════════════════

router.put('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params
    const updateData = req.body

    const { Conversation } = await import('../models/index.js')
    
    const conversation = await Conversation.findOne({
      'booking.bookingId': bookingId
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    // Update booking details
    if (updateData.name) {
      conversation.visitor.name = updateData.name
    }
    if (updateData.mobile) {
      conversation.visitor.phone = updateData.mobile
    }
    if (updateData.requirements) {
      conversation.booking.specialRequests = updateData.requirements
    }

    await conversation.save()

    res.json({
      success: true,
      data: {
        name: conversation.visitor.name,
        mobile: conversation.visitor.phone,
        requirements: conversation.booking.specialRequests
      }
    })
  } catch (error) {
    console.error('Update booking error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// SUBMIT FEEDBACK
// ═══════════════════════════════════════════════════════════════

router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body

    if (!sessionId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and rating are required'
      })
    }

    const conversation = await getConversation(sessionId)

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }

    conversation.learning.feedbackGiven = rating
    await conversation.save()

    res.json({
      success: true,
      message: 'Feedback submitted'
    })
  } catch (error) {
    console.error('Submit feedback error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// TRACK ANALYTICS
// ═══════════════════════════════════════════════════════════════

router.post('/track', async (req, res) => {
  try {
    const { event, data } = req.body

    switch (event) {
      case 'widget_opened':
        await incrementAnalytics('chat.widgetOpened')
        break
      case 'page_view':
        await incrementAnalytics('traffic.totalPageViews')
        break
      default:
        break
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Track error:', error)
    res.status(500).json({ success: false })
  }
})

export default router