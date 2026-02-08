// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Chat Routes
// ═══════════════════════════════════════════════════════════════

import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { processMessage, handleBooking, getConversation } from '../services/chat.service.js'
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
      package: packageName,
      packageId,
      eventDate, 
      location,
      specialRequests,
      value
    } = req.body

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