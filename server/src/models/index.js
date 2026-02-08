// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Database Models (All Schemas in One File)
// ═══════════════════════════════════════════════════════════════

import mongoose from 'mongoose'

const { Schema } = mongoose

// ═══════════════════════════════════════════════════════════════
// SCHEMA 1: CONVERSATION
// Stores all chat sessions, messages, and bookings
// ═══════════════════════════════════════════════════════════════

const messageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  displayText: { type: String, default: null }, // Filtered version if abuse
  intent: { type: String, default: null },
  confidence: { type: Number, default: 0 },
  responseType: { type: String, enum: ['instant', 'pattern', 'ai'], default: 'instant' },
  abuseDetected: { type: Boolean, default: false },
  abuseType: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
})

const conversationSchema = new Schema({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  // Visitor Information
  visitor: {
    fingerprint: { type: String, default: null },
    name: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    location: { type: String, default: null },
    language: { type: String, default: 'en' },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null }
  },
  
  // Messages (max 50 per conversation for storage efficiency)
  messages: {
    type: [messageSchema],
    validate: [
      { validator: (v) => v.length <= 50, message: 'Max 50 messages per conversation' }
    ]
  },
  
  // Booking Information
  booking: {
    hasBooking: { type: Boolean, default: false },
    package: { type: String, default: null },
    packageId: { type: String, default: null },
    eventDate: { type: Date, default: null },
    eventLocation: { type: String, default: null },
    estimatedValue: { type: Number, default: null },
    specialRequests: { type: String, default: null },
    status: { 
      type: String, 
      enum: ['none', 'inquiry', 'pending', 'contacted', 'confirmed', 'completed', 'cancelled'],
      default: 'none'
    },
    adminNotes: { type: String, default: null },
    statusHistory: [{
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: String, default: 'system' }
    }]
  },
  
  // Abuse Tracking
  abuse: {
    hasAbuse: { type: Boolean, default: false },
    count: { type: Number, default: 0 },
    types: [String],
    messages: [String], // Message IDs that were flagged
    reviewedByAdmin: { type: Boolean, default: false },
    adminAction: { type: String, default: null },
    blockedAt: { type: Date, default: null }
  },
  
  // Soft Delete Fields
  deletion: {
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
    permanentDeleteAt: { type: Date, default: null },
    recoveredAt: { type: Date, default: null },
    recoveredCount: { type: Number, default: 0 }
  },
  
  // Metadata
  meta: {
    device: { type: String, default: 'unknown' },
    browser: { type: String, default: 'unknown' },
    os: { type: String, default: 'unknown' },
    referrer: { type: String, default: 'direct' },
    landingPage: { type: String, default: '/' },
    startedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    totalMessages: { type: Number, default: 0 },
    userMessages: { type: Number, default: 0 },
    botMessages: { type: Number, default: 0 },
    aiCallsUsed: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 },
    successful: { type: Boolean, default: false }
  },
  
  // Learning Contribution
  learning: {
    patternsUsed: [String],
    patternSuccess: { type: Boolean, default: true },
    unrecognizedQueries: [String],
    aiResponses: { type: Number, default: 0 },
    feedbackGiven: { type: Number, default: null },
    contributedTo: [String]
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
conversationSchema.index({ 'visitor.phone': 1 })
conversationSchema.index({ 'booking.status': 1 })
conversationSchema.index({ 'meta.successful': 1 })
conversationSchema.index({ createdAt: -1 })

// ═══════════════════════════════════════════════════════════════
// SCHEMA 2: ANALYTICS
// Daily aggregated statistics (One document per day)
// ═══════════════════════════════════════════════════════════════

const analyticsSchema = new Schema({
  date: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  }, // Format: YYYY-MM-DD
  
  // Traffic Metrics
  traffic: {
    uniqueVisitors: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    newVisitors: { type: Number, default: 0 },
    returningVisitors: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 }
  },
  
  // Chat Metrics
  chat: {
    widgetOpened: { type: Number, default: 0 },
    conversationsStarted: { type: Number, default: 0 },
    conversationsCompleted: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    userMessages: { type: Number, default: 0 },
    botMessages: { type: Number, default: 0 },
    avgMessagesPerConversation: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    responseBreakdown: {
      instant: { type: Number, default: 0 },
      pattern: { type: Number, default: 0 },
      ai: { type: Number, default: 0 }
    },
    languageBreakdown: {
      en: { type: Number, default: 0 },
      hi: { type: Number, default: 0 },
      gu: { type: Number, default: 0 }
    }
  },
  
  // Booking Metrics
  bookings: {
    inquiriesStarted: { type: Number, default: 0 },
    inquiriesCompleted: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    byPackage: { type: Map, of: Number, default: {} },
    byStatus: {
      pending: { type: Number, default: 0 },
      contacted: { type: Number, default: 0 },
      confirmed: { type: Number, default: 0 },
      completed: { type: Number, default: 0 }
    },
    totalValue: { type: Number, default: 0 },
    avgValue: { type: Number, default: 0 }
  },
  
  // Intent Analytics
  intents: {
    topIntents: [{
      intent: String,
      count: Number,
      success: Number
    }],
    unrecognized: [{
      query: String,
      count: Number
    }],
    failedMatches: { type: Number, default: 0 }
  },
  
  // Device & Source
  sources: {
    devices: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    },
    browsers: { type: Map, of: Number, default: {} },
    referrers: {
      instagram: { type: Number, default: 0 },
      google: { type: Number, default: 0 },
      direct: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      facebook: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    os: { type: Map, of: Number, default: {} }
  },
  
  // Hourly Activity
  hourly: { type: Map, of: { visitors: Number, chats: Number }, default: {} },
  
  // Abuse Metrics
  abuse: {
    flaggedMessages: { type: Number, default: 0 },
    blockedUsers: { type: Number, default: 0 },
    byType: {
      profanity: { type: Number, default: 0 },
      spam: { type: Number, default: 0 },
      threat: { type: Number, default: 0 }
    },
    actionsTaken: {
      blocked: { type: Number, default: 0 },
      warned: { type: Number, default: 0 },
      dismissed: { type: Number, default: 0 }
    }
  },
  
  // Learning Metrics
  learning: {
    patternsUsed: { type: Number, default: 0 },
    patternSuccessRate: { type: Number, default: 0 },
    newPatternsDetected: { type: Number, default: 0 },
    patternsApproved: { type: Number, default: 0 },
    patternsRejected: { type: Number, default: 0 },
    aiCallsMade: { type: Number, default: 0 },
    aiCost: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

// ═══════════════════════════════════════════════════════════════
// SCHEMA 3: CONFIG
// Stores admin settings, packages, patterns, responses
// Uses fixed _id for each document type
// ═══════════════════════════════════════════════════════════════

const configSchema = new Schema({
  _id: { type: String, required: true }, // 'admin', 'packages', 'patterns', 'responses'
  type: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  _id: false // We're setting _id manually
})

// ═══════════════════════════════════════════════════════════════
// CREATE MODELS
// ═══════════════════════════════════════════════════════════════

export const Conversation = mongoose.model('Conversation', conversationSchema)
export const Analytics = mongoose.model('Analytics', analyticsSchema)
export const Config = mongoose.model('Config', configSchema)

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Get today's date string
export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]
}

// Get or create today's analytics document
export const getOrCreateTodayAnalytics = async () => {
  const today = getTodayDateString()
  
  let analytics = await Analytics.findOne({ date: today })
  
  if (!analytics) {
    analytics = await Analytics.create({ date: today })
  }
  
  return analytics
}

// Increment analytics counter
export const incrementAnalytics = async (path, value = 1) => {
  const today = getTodayDateString()
  
  await Analytics.findOneAndUpdate(
    { date: today },
    { $inc: { [path]: value } },
    { upsert: true, new: true }
  )
}

export default {
  Conversation,
  Analytics,
  Config,
  getTodayDateString,
  getOrCreateTodayAnalytics,
  incrementAnalytics
}