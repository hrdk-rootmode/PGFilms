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
  displayText: { type: String, default: null },
  intent: { type: String, default: null },
  confidence: { type: Number, default: 0 },
  responseType: { type: String, enum: ['instant', 'pattern', 'ai', 'booking', 'fallback'], default: 'instant' },
  abuseDetected: { type: Boolean, default: false },
  abuseType: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
})

// ═══════════════════════════════════════════════════════════════
// BOOKING CONTEXT SCHEMA (NEW!)
// Tracks the booking flow state across messages
// ═══════════════════════════════════════════════════════════════

const bookingContextSchema = new Schema({
  // Current state in booking flow
  state: {
    type: String,
    enum: [
      'none',           // Not in booking flow
      'started',        // Booking started, collecting info
      'awaiting_package', // Waiting for package selection
      'awaiting_date',  // Waiting for date
      'awaiting_time',  // Waiting for time
      'awaiting_name',  // Waiting for name
      'awaiting_phone', // Waiting for phone
      'awaiting_email', // Waiting for email (optional)
      'awaiting_location', // Waiting for location
      'confirming',     // All info collected, confirming
      'completed',      // Booking submitted
      'cancelled'       // User cancelled
    ],
    default: 'none'
  },

  // Selected package info
  package: {
    type: { type: String, default: null },  // 'portrait', 'wedding', etc.
    name: { type: String, default: null },
    price: { type: Number, default: null },
    emoji: { type: String, default: null }
  },

  // Extracted date info
  date: {
    raw: { type: String, default: null },      // Original user input
    formatted: { type: String, default: null }, // Formatted for display
    value: { type: Date, default: null }        // Actual Date object
  },

  // Extracted time info
  time: {
    raw: { type: String, default: null },
    formatted: { type: String, default: null }
  },

  // User details
  name: { type: String, default: null },
  phone: { type: String, default: null },
  email: { type: String, default: null },
  location: { type: String, default: null },
  specialRequests: { type: String, default: null },

  // Tracking
  startedAt: { type: Date, default: null },
  lastUpdated: { type: Date, default: null },
  completedAt: { type: Date, default: null },

  // CRITICAL: Track which field was last asked so extraction knows context
  lastAskedField: { type: String, default: null },

  // How many times user was prompted for each field
  promptCounts: {
    package: { type: Number, default: 0 },
    date: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
    name: { type: Number, default: 0 },
    phone: { type: Number, default: 0 }
  }
}, { _id: false })

// ═══════════════════════════════════════════════════════════════
// MAIN CONVERSATION SCHEMA
// ═══════════════════════════════════════════════════════════════

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

  // Messages (max 200 per conversation for storage efficiency)
  messages: {
    type: [messageSchema],
    validate: [
      { validator: (v) => v.length <= 200, message: 'Max 200 messages per conversation' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // BOOKING CONTEXT (NEW!) - Tracks booking flow state
  // ═══════════════════════════════════════════════════════════
  bookingContext: {
    type: bookingContextSchema,
    default: () => ({ state: 'none' })
  },

  // Booking Information (Final booking record)
  booking: {
    hasBooking: { type: Boolean, default: false },
    package: { type: mongoose.Schema.Types.Mixed, default: null },
    packageId: { type: String, default: null },
    eventDate: { type: Date, default: null },
    eventTime: { type: String, default: null },
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
    messages: [String],
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
conversationSchema.index({ 'bookingContext.state': 1 })
conversationSchema.index({ 'meta.successful': 1 })
conversationSchema.index({ createdAt: -1 })

// ═══════════════════════════════════════════════════════════════
// VIRTUAL: Check if conversation is in active booking flow
// ═══════════════════════════════════════════════════════════════

conversationSchema.virtual('isInBookingFlow').get(function () {
  const activeStates = ['started', 'awaiting_package', 'awaiting_date', 'awaiting_time', 'awaiting_name', 'awaiting_phone', 'awaiting_email', 'awaiting_location', 'confirming']
  return activeStates.includes(this.bookingContext?.state)
})

// ═══════════════════════════════════════════════════════════════
// METHOD: Get missing booking fields
// ═══════════════════════════════════════════════════════════════

conversationSchema.methods.getMissingBookingFields = function () {
  const ctx = this.bookingContext
  const missing = []

  if (!ctx.package?.type) missing.push('package')
  if (!ctx.date?.value) missing.push('date')
  if (!ctx.time?.formatted) missing.push('time')
  if (!ctx.name) missing.push('name')
  if (!ctx.phone) missing.push('phone')

  return missing
}

// ═══════════════════════════════════════════════════════════════
// METHOD: Update booking context
// ═══════════════════════════════════════════════════════════════

conversationSchema.methods.updateBookingContext = function (updates) {
  if (!this.bookingContext) {
    this.bookingContext = { state: 'none' }
  }

  Object.assign(this.bookingContext, updates, { lastUpdated: new Date() })

  // If booking just started, set startedAt
  if (updates.state === 'started' && !this.bookingContext.startedAt) {
    this.bookingContext.startedAt = new Date()
  }

  // If booking completed, set completedAt
  if (updates.state === 'completed' && !this.bookingContext.completedAt) {
    this.bookingContext.completedAt = new Date()
  }

  return this
}

// ═══════════════════════════════════════════════════════════════
// METHOD: Finalize booking (copy context to booking record)
// ═══════════════════════════════════════════════════════════════

conversationSchema.methods.finalizeBooking = function () {
  const ctx = this.bookingContext

  this.booking = {
    hasBooking: true,
    package: ctx.package?.name || null,
    packageId: ctx.package?.type || null,
    eventDate: ctx.date?.value || null,
    eventTime: ctx.time?.formatted || null,
    eventLocation: ctx.location || null,
    estimatedValue: ctx.package?.price || null,
    specialRequests: ctx.specialRequests || null,
    status: 'pending',
    statusHistory: [{
      status: 'pending',
      changedAt: new Date(),
      changedBy: 'system'
    }]
  }

  // Also update visitor info
  if (ctx.name) this.visitor.name = ctx.name
  if (ctx.phone) this.visitor.phone = ctx.phone
  if (ctx.email) this.visitor.email = ctx.email
  if (ctx.location) this.visitor.location = ctx.location

  this.meta.successful = true
  this.bookingContext.state = 'completed'
  this.bookingContext.completedAt = new Date()

  return this
}

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
  },

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
      ai: { type: Number, default: 0 },
      booking: { type: Number, default: 0 },
      fallback: { type: Number, default: 0 }
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
// ═══════════════════════════════════════════════════════════════

const configSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  _id: false
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

export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]
}

export const getOrCreateTodayAnalytics = async () => {
  const today = getTodayDateString()

  let analytics = await Analytics.findOne({ date: today })

  if (!analytics) {
    analytics = await Analytics.create({ date: today })
  }

  return analytics
}

export const incrementAnalytics = async (path, value = 1) => {
  const today = getTodayDateString()

  await Analytics.findOneAndUpdate(
    { date: today },
    { $inc: { [path]: value } },
    { upsert: true, new: true }
  )
}

// ═══════════════════════════════════════════════════════════════
// BOOKING STATE CONSTANTS (Export for use in chat.service.js)
// ═══════════════════════════════════════════════════════════════

export const BOOKING_STATES = {
  NONE: 'none',
  STARTED: 'started',
  AWAITING_PACKAGE: 'awaiting_package',
  AWAITING_DATE: 'awaiting_date',
  AWAITING_TIME: 'awaiting_time',
  AWAITING_NAME: 'awaiting_name',
  AWAITING_PHONE: 'awaiting_phone',
  AWAITING_EMAIL: 'awaiting_email',
  AWAITING_LOCATION: 'awaiting_location',
  CONFIRMING: 'confirming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// ═══════════════════════════════════════════════════════════════
// PACKAGES CONSTANT (Export for use throughout app)
// ═══════════════════════════════════════════════════════════════

export const PACKAGES = {
  portrait: {
    type: 'portrait',
    name: 'Portrait Session',
    price: 25000,
    emoji: '📷',
    description: 'Professional portrait photography session'
  },
  wedding: {
    type: 'wedding',
    name: 'Wedding Package',
    price: 75000,
    emoji: '💒',
    description: 'Complete wedding day coverage'
  },
  prewedding: {
    type: 'prewedding',
    name: 'Pre-Wedding Shoot',
    price: 35000,
    emoji: '💑',
    description: 'Romantic pre-wedding photoshoot'
  },
  event: {
    type: 'event',
    name: 'Event Coverage',
    price: 50000,
    emoji: '🎉',
    description: 'Corporate & personal event coverage'
  },
  maternity: {
    type: 'maternity',
    name: 'Maternity Shoot',
    price: 20000,
    emoji: '🤰',
    description: 'Beautiful maternity photography'
  },
  baby: {
    type: 'baby',
    name: 'Baby Shoot',
    price: 15000,
    emoji: '👶',
    description: 'Newborn & baby photography'
  }
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════

export default {
  Conversation,
  Analytics,
  Config,
  getTodayDateString,
  getOrCreateTodayAnalytics,
  incrementAnalytics,
  BOOKING_STATES,
  PACKAGES
}