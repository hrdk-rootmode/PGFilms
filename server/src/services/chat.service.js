// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Chat Service (Pattern Matching + Conversation)
// ═══════════════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid'
import { Conversation, Config, incrementAnalytics } from '../models/index.js'
import { getChatResponse, detectAbuse, detectLanguageAI, suggestIntent } from './ai.service.js'
import { 
  detectLanguage, 
  calculateBookingScore, 
  sendBookingNotification,
  validatePhone,
  validateEmail,
  sanitizePhone
} from '../utils/helpers.js'

// ═══════════════════════════════════════════════════════════════
// PATTERN MATCHING ENGINE
// ═══════════════════════════════════════════════════════════════

const matchPattern = async (message, language = 'en') => {
  try {
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    
    if (!patternsConfig?.data?.intents) {
      return { intent: null, confidence: 0 }
    }

    const intents = patternsConfig.data.intents
    const synonyms = patternsConfig.data.synonyms || {}
    const autoCorrect = patternsConfig.data.autoCorrect || {}
    
    // Normalize message
    let normalizedMessage = message.toLowerCase().trim()
    
    // Apply auto-corrections
    Object.entries(autoCorrect).forEach(([typo, correct]) => {
      normalizedMessage = normalizedMessage.replace(new RegExp(typo, 'gi'), correct)
    })
    
    // Apply synonyms
    Object.entries(synonyms).forEach(([from, to]) => {
      normalizedMessage = normalizedMessage.replace(new RegExp(from, 'gi'), to)
    })

    let bestMatch = { intent: null, confidence: 0, keyword: null }

    // Check each intent
    for (const [intentName, intentData] of Object.entries(intents)) {
      const keywords = intentData.keywords || {}
      
      // Check keywords for all languages
      const allKeywords = [
        ...(keywords.en || []),
        ...(keywords.hi || []),
        ...(keywords.gu || []),
        ...(keywords[language] || [])
      ]

      for (const keyword of allKeywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          const confidence = 0.9 // Base confidence for exact match
          
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              intent: intentName,
              confidence,
              keyword,
              response: intentData.response
            }
          }
        }
      }
    }

    // Check learned keywords
    const learnedKeywords = patternsConfig.data.learnedKeywords || []
    for (const learned of learnedKeywords) {
      if (normalizedMessage.includes(learned.word.toLowerCase())) {
        const confidence = learned.score || 0.85
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            intent: learned.intent,
            confidence,
            keyword: learned.word,
            learned: true
          }
        }
      }
    }

    return bestMatch
  } catch (error) {
    console.error('Pattern matching error:', error.message)
    return { intent: null, confidence: 0 }
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERATE BOT RESPONSE
// ═══════════════════════════════════════════════════════════════

const generateResponse = async (intent, language = 'en', context = {}) => {
  try {
    const responsesConfig = await Config.findOne({ _id: 'responses' })
    const packagesConfig = await Config.findOne({ _id: 'packages' })
    
    const responses = responsesConfig?.data || {}
    const packages = packagesConfig?.data || []
    
    const filmmakerName = process.env.FILMMAKER_NAME || 'PG Films'
    const phone = process.env.FILMMAKER_PHONE || '+91 98765 43210'
    const email = process.env.FILMMAKER_EMAIL || 'pgfilms@gmail.com'

    // Get response template
    let responseTemplate = responses[intent]?.[language] || responses[intent]?.en || responses.fallback?.[language] || responses.fallback?.en
    
    if (!responseTemplate) {
      responseTemplate = "I'm here to help! How can I assist you with your photography needs? 📸"
    }

    // Replace placeholders
    let text = responseTemplate
      .replace(/{filmmakerName}/g, filmmakerName)
      .replace(/{phone}/g, phone)
      .replace(/{email}/g, email)

    // Build response object
    const response = {
      text,
      intent,
      language
    }

    // Add packages if showing packages
    if (intent === 'showPackages' || intent === 'pricing') {
      response.packages = packages.filter(p => p.active).map(p => ({
        id: p.id,
        name: p.name,
        price: `₹${p.price.toLocaleString()}`,
        emoji: p.emoji,
        features: p.features?.slice(0, 4) || [],
        popular: p.popular
      }))
      response.showPackages = true
    }

    // Add quick replies based on intent
    response.quickReplies = getQuickReplies(intent, language)

    return response
  } catch (error) {
    console.error('Generate response error:', error.message)
    return {
      text: "I'm here to help! What would you like to know about our photography services?",
      intent: 'fallback',
      language
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// QUICK REPLIES
// ═══════════════════════════════════════════════════════════════

const getQuickReplies = (intent, language = 'en') => {
  const quickRepliesMap = {
    greeting: {
      en: ['Show Packages', 'View Portfolio', 'Book Now'],
      hi: ['पैकेज दिखाओ', 'पोर्टफोलियो देखो', 'बुक करो'],
      gu: ['પેકેજ બતાવો', 'પોર્ટફોલિયો જુઓ', 'બુક કરો']
    },
    showPackages: {
      en: ['Book Now', 'More Details', 'Contact'],
      hi: ['बुक करो', 'और जानकारी', 'संपर्क'],
      gu: ['બુક કરો', 'વધુ માહિતી', 'સંપર્ક']
    },
    showPortfolio: {
      en: ['Book Now', 'Show Packages', 'Contact'],
      hi: ['बुक करो', 'पैकेज दिखाओ', 'संपर्क'],
      gu: ['બુક કરો', 'પેકેજ બતાવો', 'સંપર્ક']
    },
    checkAvailability: {
      en: ['WhatsApp', 'Show Packages', 'Call Now'],
      hi: ['WhatsApp', 'पैकेज दिखाओ', 'कॉल करो'],
      gu: ['WhatsApp', 'પેકેજ બતાવો', 'કૉલ કરો']
    },
    showContact: {
      en: ['WhatsApp', 'Call Now', 'Show Packages'],
      hi: ['WhatsApp', 'कॉल करो', 'पैकेज दिखाओ'],
      gu: ['WhatsApp', 'કૉલ કરો', 'પેકેજ બતાવો']
    },
    thankYou: {
      en: ['View Packages', 'Contact'],
      hi: ['पैकेज देखो', 'संपर्क'],
      gu: ['પેકેજ જુઓ', 'સંપર્ક']
    },
    fallback: {
      en: ['Show Packages', 'View Portfolio', 'Contact'],
      hi: ['पैकेज दिखाओ', 'पोर्टफोलियो देखो', 'संपर्क'],
      gu: ['પેકેજ બતાવો', 'પોર્ટફોલિયો જુઓ', 'સંપર્ક']
    }
  }

  return quickRepliesMap[intent]?.[language] || quickRepliesMap[intent]?.en || quickRepliesMap.fallback.en
}

// ═══════════════════════════════════════════════════════════════
// MAIN MESSAGE PROCESSING
// ═══════════════════════════════════════════════════════════════

export const processMessage = async (sessionId, message, metadata = {}) => {
  const startTime = Date.now()
  
  try {
    // Get or create conversation
    let conversation = await Conversation.findOne({ sessionId })
    
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
        visitor: {
          fingerprint: metadata.fingerprint || null,
          language: metadata.language || 'en',
          ipAddress: metadata.ipAddress || null,
          userAgent: metadata.userAgent || null
        },
        meta: {
          device: metadata.device || 'unknown',
          browser: metadata.browser || 'unknown',
          referrer: metadata.referrer || 'direct',
          startedAt: new Date()
        }
      })
      
      // Increment analytics
      await incrementAnalytics('chat.conversationsStarted')
    }

    // Detect language
    const detectedLanguage = detectLanguage(message) || conversation.visitor.language || 'en'
    
    // Update conversation language if changed
    if (detectedLanguage !== conversation.visitor.language) {
      conversation.visitor.language = detectedLanguage
    }

    // Check for abuse
    const abuseCheck = await detectAbuse(message)
    
    let displayText = message
    let abuseDetected = false
    let abuseType = null
    
    if (abuseCheck.isAbusive) {
      abuseDetected = true
      abuseType = abuseCheck.type
      
      if (abuseCheck.action === 'block') {
        // Don't process, return warning
        const warningResponse = await generateResponse('abuseWarning', detectedLanguage)
        
        // Save message with abuse flag
        conversation.messages.push({
          id: uuidv4(),
          role: 'user',
          text: message,
          displayText: '[Blocked]',
          abuseDetected: true,
          abuseType,
          timestamp: new Date()
        })
        
        conversation.abuse.hasAbuse = true
        conversation.abuse.count += 1
        conversation.abuse.types.push(abuseType)
        
        await conversation.save()
        
        await incrementAnalytics('abuse.flaggedMessages')
        
        return {
          response: warningResponse,
          blocked: true,
          sessionId
        }
      } else if (abuseCheck.action === 'mask') {
        displayText = message.replace(/\b\w+\b/g, (word) => '****')
      }
    }

    // Add user message
    const userMessageId = uuidv4()
    conversation.messages.push({
      id: userMessageId,
      role: 'user',
      text: message,
      displayText: abuseDetected ? displayText : null,
      abuseDetected,
      abuseType,
      timestamp: new Date()
    })

    // Pattern matching
    const patternMatch = await matchPattern(message, detectedLanguage)
    
    let response
    let responseType = 'instant'

    if (patternMatch.confidence >= 0.7) {
      // High confidence - use pattern response
      response = await generateResponse(patternMatch.intent, detectedLanguage, { conversation })
      responseType = patternMatch.learned ? 'pattern' : 'instant'
      
      // Track pattern usage
      if (!conversation.learning.patternsUsed.includes(patternMatch.keyword)) {
        conversation.learning.patternsUsed.push(patternMatch.keyword)
      }
    } else {
      // Low confidence - use AI
      responseType = 'ai'
      
      const conversationHistory = conversation.messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }))
      
      const aiResponse = await getChatResponse(message, {
        language: detectedLanguage,
        conversationHistory: JSON.stringify(conversationHistory)
      })
      
      if (aiResponse) {
        response = {
          text: aiResponse,
          intent: 'ai_response',
          language: detectedLanguage,
          quickReplies: getQuickReplies('fallback', detectedLanguage)
        }
        
        conversation.meta.aiCallsUsed += 1
        conversation.learning.aiResponses += 1
        
        // Track unrecognized query for learning
        if (!conversation.learning.unrecognizedQueries.includes(message.substring(0, 100))) {
          conversation.learning.unrecognizedQueries.push(message.substring(0, 100))
        }
        
        // Try to suggest intent for learning
        const suggestedIntent = await suggestIntent(message)
        if (suggestedIntent) {
          await addPendingPattern(message, suggestedIntent)
        }
      } else {
        // Fallback response
        response = await generateResponse('fallback', detectedLanguage)
      }
      
      await incrementAnalytics('chat.responseBreakdown.ai')
    }

    // Add bot message
    conversation.messages.push({
      id: uuidv4(),
      role: 'bot',
      text: response.text,
      intent: patternMatch.intent || 'ai_response',
      confidence: patternMatch.confidence || 0,
      responseType,
      timestamp: new Date()
    })

    // Update metadata
    conversation.meta.lastActiveAt = new Date()
    conversation.meta.totalMessages = conversation.messages.length
    conversation.meta.userMessages = conversation.messages.filter(m => m.role === 'user').length
    conversation.meta.botMessages = conversation.messages.filter(m => m.role === 'bot').length
    
    const responseTime = (Date.now() - startTime) / 1000
    conversation.meta.avgResponseTime = (
      (conversation.meta.avgResponseTime * (conversation.meta.botMessages - 1) + responseTime) / 
      conversation.meta.botMessages
    )

    // Save conversation
    await conversation.save()

    // Update analytics
    await incrementAnalytics('chat.totalMessages', 2) // User + bot
    await incrementAnalytics('chat.userMessages')
    await incrementAnalytics('chat.botMessages')
    await incrementAnalytics(`chat.responseBreakdown.${responseType}`)
    await incrementAnalytics(`chat.languageBreakdown.${detectedLanguage}`)

    return {
      response,
      sessionId,
      language: detectedLanguage,
      responseType
    }
  } catch (error) {
    console.error('Process message error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// BOOKING HANDLING
// ═══════════════════════════════════════════════════════════════

export const handleBooking = async (sessionId, bookingData) => {
  try {
    const conversation = await Conversation.findOne({ sessionId })
    
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Validate booking data
    if (bookingData.phone && !validatePhone(bookingData.phone)) {
      return {
        success: false,
        error: 'Invalid phone number. Please provide a valid 10-digit Indian mobile number.'
      }
    }

    if (bookingData.email && !validateEmail(bookingData.email)) {
      return {
        success: false,
        error: 'Invalid email address.'
      }
    }

    // Update visitor info
    if (bookingData.name) conversation.visitor.name = bookingData.name
    if (bookingData.phone) conversation.visitor.phone = sanitizePhone(bookingData.phone)
    if (bookingData.email) conversation.visitor.email = bookingData.email
    if (bookingData.location) conversation.visitor.location = bookingData.location

    // Update booking info
    conversation.booking = {
      hasBooking: true,
      package: bookingData.package || null,
      packageId: bookingData.packageId || null,
      eventDate: bookingData.eventDate ? new Date(bookingData.eventDate) : null,
      eventLocation: bookingData.location || null,
      estimatedValue: bookingData.value || null,
      specialRequests: bookingData.specialRequests || null,
      status: 'pending',
      adminNotes: null,
      statusHistory: [{
        status: 'pending',
        changedAt: new Date(),
        changedBy: 'system'
      }]
    }

    // Calculate booking score
    const score = calculateBookingScore({
      name: conversation.visitor.name,
      phone: conversation.visitor.phone,
      email: conversation.visitor.email,
      eventDate: bookingData.eventDate,
      location: bookingData.location,
      package: bookingData.package,
      specialRequests: bookingData.specialRequests
    })

    conversation.meta.successful = true

    await conversation.save()

    // Send notification to admin
    await sendBookingNotification({
      name: conversation.visitor.name,
      phone: conversation.visitor.phone,
      email: conversation.visitor.email,
      package: bookingData.package,
      eventDate: bookingData.eventDate,
      location: bookingData.location,
      specialRequests: bookingData.specialRequests,
      score
    })

    // Update analytics
    await incrementAnalytics('bookings.inquiriesCompleted')
    await incrementAnalytics('bookings.byStatus.pending')
    if (bookingData.value) {
      await incrementAnalytics('bookings.totalValue', bookingData.value)
    }

    return {
      success: true,
      bookingId: conversation._id,
      score,
      message: 'Booking request submitted successfully!'
    }
  } catch (error) {
    console.error('Handle booking error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// ADD PENDING PATTERN (For learning)
// ═══════════════════════════════════════════════════════════════

const addPendingPattern = async (query, suggestedIntent) => {
  try {
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    
    if (!patternsConfig) return

    const pendingPatterns = patternsConfig.data.pendingPatterns || []
    
    // Extract keywords from query
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    
    for (const word of words) {
      // Check if already exists
      const existing = pendingPatterns.find(p => p.word === word)
      
      if (existing) {
        existing.occurrences += 1
        existing.lastSeen = new Date()
        if (!existing.contexts.includes(query.substring(0, 50))) {
          existing.contexts.push(query.substring(0, 50))
        }
      } else if (pendingPatterns.length < 100) {
        // Add new pending pattern
        pendingPatterns.push({
          id: uuidv4(),
          word,
          suggestedIntent,
          occurrences: 1,
          contexts: [query.substring(0, 50)],
          firstSeen: new Date(),
          lastSeen: new Date(),
          status: 'pending',
          confidence: 0.5
        })
      }
    }

    patternsConfig.data.pendingPatterns = pendingPatterns
    await patternsConfig.save()
  } catch (error) {
    console.error('Add pending pattern error:', error.message)
  }
}

// ═══════════════════════════════════════════════════════════════
// GET CONVERSATION
// ═══════════════════════════════════════════════════════════════

export const getConversation = async (sessionId) => {
  try {
    const conversation = await Conversation.findOne({ 
      sessionId,
      'deletion.isDeleted': false 
    })
    
    return conversation
  } catch (error) {
    console.error('Get conversation error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// LEARNING JOB (Run periodically)
// ═══════════════════════════════════════════════════════════════

export const runLearningJob = async () => {
  try {
    console.log('🧠 Starting learning job...')
    
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    
    if (!patternsConfig) return

    const settings = patternsConfig.data.abuseSettings || {}
    const autoApproveThreshold = settings.autoApproveThreshold || 20
    const autoApproveConfidence = settings.autoApproveConfidence || 0.9
    
    const pendingPatterns = patternsConfig.data.pendingPatterns || []
    const learnedKeywords = patternsConfig.data.learnedKeywords || []
    
    let approvedCount = 0
    const remainingPatterns = []

    for (const pattern of pendingPatterns) {
      // Auto-approve if meets threshold
      if (pattern.occurrences >= autoApproveThreshold && pattern.confidence >= autoApproveConfidence) {
        learnedKeywords.push({
          word: pattern.word,
          intent: pattern.suggestedIntent,
          score: pattern.confidence,
          addedOn: new Date(),
          addedBy: 'auto'
        })
        approvedCount++
        
        await incrementAnalytics('learning.patternsApproved')
      } else {
        remainingPatterns.push(pattern)
      }
    }

    patternsConfig.data.pendingPatterns = remainingPatterns
    patternsConfig.data.learnedKeywords = learnedKeywords
    
    await patternsConfig.save()

    console.log(`🧠 Learning job complete: ${approvedCount} patterns auto-approved`)
    
    return { approvedCount }
  } catch (error) {
    console.error('Learning job error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  processMessage,
  handleBooking,
  getConversation,
  runLearningJob
}