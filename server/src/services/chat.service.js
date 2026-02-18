// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Chat Service
// VERSION: 3.0 - Production-Ready, Loop-Free Booking System
// ═══════════════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid'
import {
  Conversation,
  Config,
  incrementAnalytics,
  BOOKING_STATES,
  PACKAGES
} from '../models/index.js'
import {
  getChatResponse,
  extractBookingDetailsAI,
  AI_ERROR_TYPES,
  getAIStatus
} from './ai.service.js'
import {
  detectLanguage,
  sendBookingNotification,
  validatePhone,
  sanitizePhone
} from '../utils/helpers.js'

// ═══════════════════════════════════════════════════════════════
// 1. CONSTANTS & KEYWORDS
// ═══════════════════════════════════════════════════════════════

const MAX_PROMPT_ATTEMPTS = 3 // Max times to ask for the same field

const PACKAGE_KEYWORDS = {
  wedding: ['wedding', 'shaadi', 'shadi', 'marriage', 'vivah', 'લગ્ન', 'विवाह', 'शादी', 'wedding gold'],
  portrait: ['portrait', 'photo', 'photoshoot', 'headshot', 'profile', 'ફોટો', 'फोटो', 'portrait session'],
  prewedding: ['pre-wedding', 'prewedding', 'pre wedding', 'engagement', 'sagai', 'સગાઈ', 'सगाई', 'pre-wedding shoot'],
  event: ['event', 'party', 'function', 'celebration', 'birthday', 'anniversary', 'પાર્ટી', 'पार्टी', 'event coverage'],
  maternity: ['maternity', 'pregnancy', 'pregnant', 'baby bump', 'મેટરનિટી', 'मैटरनिटी', 'maternity shoot'],
  baby: ['baby', 'newborn', 'infant', 'child', 'બાળક', 'बच्चा', 'शिशु', 'baby shoot']
}

const TIME_KEYWORDS = {
  morning: { keywords: ['morning', 'subah', 'સવાર', 'सुबह', '9am', '10am', '11am'], value: '09:00', formatted: '9:00 AM' },
  afternoon: { keywords: ['afternoon', 'dopahar', 'બપોર', 'दोपहर', '12pm', '1pm', '2pm', '3pm'], value: '14:00', formatted: '2:00 PM' },
  evening: { keywords: ['evening', 'shaam', 'સાંજ', 'शाम', '4pm', '5pm', '6pm', '7pm'], value: '17:00', formatted: '5:00 PM' },
  night: { keywords: ['night', 'raat', 'રાત', 'रात', '8pm', '9pm'], value: '19:00', formatted: '7:00 PM' }
}

const CONFIRM_KEYWORDS = ['yes', 'ok', 'correct', 'right', 'confirm', 'done', 'haan', 'ha', 'હા', 'हां', 'sahi', 'theek', 'ठीक', 'sure', 'yep', 'yeah']
const CANCEL_KEYWORDS = ['no', 'wrong', 'cancel', 'stop', 'exit', 'quit', 'nahi', 'na', 'ના', 'नहीं', 'galat', 'गलत']
const CHANGE_KEYWORDS = ['change', 'modify', 'edit', 'update', 'different', 'badlo', 'બદલો', 'बदलो']

// Quick reply text → actual value mapping for package selection
const QUICK_REPLY_PACKAGE_MAP = {}
for (const [key, pkg] of Object.entries(PACKAGES)) {
  QUICK_REPLY_PACKAGE_MAP[pkg.name.toLowerCase()] = key
  QUICK_REPLY_PACKAGE_MAP[key.toLowerCase()] = key
}

// Quick reply text → actual value mapping for time selection
const QUICK_REPLY_TIME_MAP = {
  'morning (9 am)': { value: '09:00', formatted: '9:00 AM' },
  'morning': { value: '09:00', formatted: '9:00 AM' },
  'afternoon (2 pm)': { value: '14:00', formatted: '2:00 PM' },
  'afternoon': { value: '14:00', formatted: '2:00 PM' },
  'evening (5 pm)': { value: '17:00', formatted: '5:00 PM' },
  'evening': { value: '17:00', formatted: '5:00 PM' }
}

// ═══════════════════════════════════════════════════════════════
// 2. REGEX/PATTERN EXTRACTION (Fallback when AI unavailable)
// ═══════════════════════════════════════════════════════════════

const extractWithRegex = (message, currentContext = {}, lastAskedField = null) => {
  const msg = message.toLowerCase().trim()
  const originalMsg = message.trim()
  const extracted = {
    name: null, phone: null, date: null, date_formatted: null,
    time: null, time_formatted: null, package: null, intent: null,
    confidence: 0.7, extractionMethod: 'regex'
  }

  // ── INTENT DETECTION ──
  const confirmPattern = new RegExp(`\\b(${CONFIRM_KEYWORDS.join('|').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i')
  const cancelPattern = new RegExp(`\\b(${CANCEL_KEYWORDS.join('|').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i')

  if (confirmPattern.test(msg) || msg.includes('✅')) {
    extracted.intent = 'confirm'
  } else if (cancelPattern.test(msg) || msg.includes('❌')) {
    extracted.intent = 'cancel'
  } else if (CHANGE_KEYWORDS.some(k => msg.includes(k))) {
    extracted.intent = 'change'
  }

  // ── PACKAGE DETECTION (including quick reply buttons) ──
  // First check exact quick-reply matches
  const quickPkgKey = QUICK_REPLY_PACKAGE_MAP[msg]
  if (quickPkgKey) {
    extracted.package = quickPkgKey
    extracted.confidence = 0.99
  } else {
    for (const [pkgType, keywords] of Object.entries(PACKAGE_KEYWORDS)) {
      if (keywords.some(k => msg.includes(k.toLowerCase()))) {
        extracted.package = pkgType
        extracted.confidence = 0.85
        break
      }
    }
  }

  // ── PHONE NUMBER DETECTION ──
  const phonePatterns = [
    /(?:\+91[\s-]?)?([6-9]\d{9})\b/,
    /(?:0)?([6-9]\d{9})\b/,
    /([6-9]\d{4}[\s-]?\d{5})\b/,
    /([6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4})\b/
  ]
  for (const pattern of phonePatterns) {
    const match = msg.replace(/[\s-]/g, '').match(pattern)
    if (match) {
      const phone = match[1] ? match[1].replace(/[\s-]/g, '') : match[0].replace(/[\s-]/g, '')
      if (/^[6-9]\d{9}$/.test(phone)) {
        extracted.phone = phone
        extracted.confidence = 0.95
        break
      }
    }
  }

  // ── DATE DETECTION ──
  const today = new Date()
  if (/\b(tomorrow|kal|કાલે|कल|agle din)\b/i.test(msg)) {
    const d = new Date(today); d.setDate(d.getDate() + 1)
    extracted.date = d.toISOString().split('T')[0]
    extracted.date_formatted = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    extracted.confidence = 0.9
  } else if (/\b(day after tomorrow|parso|પરમ દિવસે|परसों|parson)\b/i.test(msg)) {
    const d = new Date(today); d.setDate(d.getDate() + 2)
    extracted.date = d.toISOString().split('T')[0]
    extracted.date_formatted = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    extracted.confidence = 0.9
  } else if (/\b(today|aaj|આજે|आज)\b/i.test(msg)) {
    extracted.date = today.toISOString().split('T')[0]
    extracted.date_formatted = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    extracted.confidence = 0.9
  } else if (/\b(next week|agle hafte|આવતા અઠવાડિયે|अगले हफ्ते)\b/i.test(msg)) {
    const d = new Date(today); d.setDate(d.getDate() + 7)
    extracted.date = d.toISOString().split('T')[0]
    extracted.date_formatted = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    extracted.confidence = 0.8
  } else if (/\b(this weekend|is weekend|weekend)\b/i.test(msg)) {
    const daysUntilSat = (6 - today.getDay() + 7) % 7 || 7
    const d = new Date(today); d.setDate(today.getDate() + daysUntilSat)
    extracted.date = d.toISOString().split('T')[0]
    extracted.date_formatted = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    extracted.confidence = 0.8
  } else if (/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(msg)) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const m = msg.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
    if (m) {
      const target = dayNames.indexOf(m[1].toLowerCase())
      let delta = target - today.getDay(); if (delta <= 0) delta += 7; delta += 7
      const d = new Date(today); d.setDate(today.getDate() + delta)
      extracted.date = d.toISOString().split('T')[0]
      extracted.date_formatted = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      extracted.confidence = 0.85
    }
  } else if (/\bthis\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(msg)) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const m = msg.match(/this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
    if (m) {
      const target = dayNames.indexOf(m[1].toLowerCase())
      let delta = target - today.getDay(); if (delta < 0) delta += 7
      const d = new Date(today); d.setDate(today.getDate() + delta)
      extracted.date = d.toISOString().split('T')[0]
      extracted.date_formatted = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      extracted.confidence = 0.85
    }
  } else {
    // Specific date formats
    const datePatterns = [
      { regex: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, format: 'DMY' },
      { regex: /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, format: 'YMD' },
      { regex: /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})?/i, format: 'DMon' }
    ]
    for (const { regex, format } of datePatterns) {
      const m = msg.match(regex)
      if (m) {
        let parsed
        if (format === 'DMY') parsed = new Date(m[3], m[2] - 1, m[1])
        else if (format === 'YMD') parsed = new Date(m[1], m[2] - 1, m[3])
        else if (format === 'DMon') {
          const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }
          const yr = m[3] ? parseInt(m[3]) : today.getFullYear()
          parsed = new Date(yr, months[m[2].toLowerCase().substring(0, 3)], parseInt(m[1]))
        }
        if (parsed && !isNaN(parsed)) {
          extracted.date = parsed.toISOString().split('T')[0]
          extracted.date_formatted = parsed.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          extracted.confidence = 0.9
          break
        }
      }
    }
  }

  // ── TIME DETECTION ──
  // Quick reply buttons first
  const quickTimeVal = QUICK_REPLY_TIME_MAP[msg]
  if (quickTimeVal) {
    extracted.time = quickTimeVal.value
    extracted.time_formatted = quickTimeVal.formatted
    extracted.confidence = 0.99
  } else {
    for (const [, data] of Object.entries(TIME_KEYWORDS)) {
      if (data.keywords.some(k => msg.includes(k.toLowerCase()))) {
        extracted.time = data.value
        extracted.time_formatted = data.formatted
        extracted.confidence = Math.max(extracted.confidence, 0.85)
        break
      }
    }
  }
  if (!extracted.time && !quickTimeVal) {
    const timePatterns = [/(\\d{1,2}):(\\d{2})\s*(am|pm)?/i, /(\\d{1,2})\s*(am|pm)/i, /(\\d{1,2})\s*o'?clock/i]
    for (const pattern of timePatterns) {
      const m = msg.match(pattern)
      if (m) {
        let hours = parseInt(m[1])
        const minutes = m[2] && !isNaN(parseInt(m[2])) ? parseInt(m[2]) : 0
        const meridiem = (m[3] || m[2] || '').toLowerCase()
        if (meridiem === 'pm' && hours < 12) hours += 12
        if (meridiem === 'am' && hours === 12) hours = 0
        if (hours >= 0 && hours <= 23) {
          extracted.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
          const dh = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
          extracted.time_formatted = `${dh}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
          extracted.confidence = 0.9
          break
        }
      }
    }
  }

  // ── NAME DETECTION (context-aware) ──
  if (lastAskedField === 'name') {
    let potentialName = originalMsg
      .replace(/^(my name is|i am|i'm|mera naam|maru naam|मेरा नाम|મારું નામ|naam hai|name is)\s*/i, '')
      .replace(/^(mr\.?|mrs\.?|ms\.?|dr\.?|shri|smt)\s*/i, '')
      .trim()
    const nameRegex = /^[a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s'.]{2,50}$/
    const notCmd = !/(book|cancel|price|package|wedding|portrait|contact|help|yes|no|ok|start|view)/i.test(potentialName)
    if (nameRegex.test(potentialName) && notCmd && potentialName.length >= 2) {
      extracted.name = potentialName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      extracted.confidence = 0.85
    }
  }
  if (!extracted.name) {
    const nameMatch = msg.match(/(?:my name is|i am|i'm|mera naam|maru naam|मेरा नाम|મારું નામ)\s+([a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s'.]+)/i)
    if (nameMatch && nameMatch[1]) {
      extracted.name = nameMatch[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      extracted.confidence = 0.9
    }
  }

  return extracted
}

// ═══════════════════════════════════════════════════════════════
// 3. SMART EXTRACTION (AI + Regex Hybrid)
// ═══════════════════════════════════════════════════════════════

const extractBookingDetails = async (message, context = {}, lastAskedField = null) => {
  console.log('🔍 Extracting booking details... lastAskedField:', lastAskedField)

  // Try AI first
  const aiResult = await extractBookingDetailsAI(message, context)
  if (aiResult.success && aiResult.data) {
    console.log('✅ AI extraction successful')
    return { ...aiResult.data, extractionMethod: 'ai' }
  }

  // AI failed → regex fallback
  console.log(`⚠️ AI failed (${aiResult.error}), using regex fallback`)
  const regexResult = extractWithRegex(message, context, lastAskedField)

  // Smart context: if we asked for a specific field and regex didn't get it,
  // treat the whole message as the answer for that field
  if (lastAskedField && !regexResult[lastAskedField]) {
    const cleanMsg = message.trim()
    switch (lastAskedField) {
      case 'name':
        if (cleanMsg.length >= 2 && cleanMsg.length <= 50 &&
          !/^(book|yes|no|ok|cancel|wedding|portrait|hi|hello|\d|start|view|contact|help|change|✅|❌)/i.test(cleanMsg)) {
          regexResult.name = cleanMsg.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
          regexResult.confidence = 0.75
          console.log('   → Context-assumed name:', regexResult.name)
        }
        break
      case 'phone': {
        const digits = cleanMsg.replace(/\D/g, '')
        if (/^[6-9]\d{9}$/.test(digits)) {
          regexResult.phone = digits
          regexResult.confidence = 0.9
          console.log('   → Context-extracted phone:', regexResult.phone)
        }
        break
      }
      case 'package': {
        const word = cleanMsg.toLowerCase().replace(/[^a-z\s]/g, '').trim()
        // Check quick reply map first
        const qKey = QUICK_REPLY_PACKAGE_MAP[word]
        if (qKey) {
          regexResult.package = qKey
          regexResult.confidence = 0.95
          console.log('   → Context-matched package:', qKey)
        } else {
          for (const [pkgType, keywords] of Object.entries(PACKAGE_KEYWORDS)) {
            if (keywords.some(k => word.includes(k) || k.includes(word))) {
              regexResult.package = pkgType
              regexResult.confidence = 0.8
              console.log('   → Context-matched package:', pkgType)
              break
            }
          }
        }
        break
      }
      case 'date':
        // If they typed a number like "15", assume it's a date this month or next
        if (/^\d{1,2}$/.test(cleanMsg)) {
          const day = parseInt(cleanMsg)
          if (day >= 1 && day <= 31) {
            const now = new Date()
            let d = new Date(now.getFullYear(), now.getMonth(), day)
            if (d < now) d.setMonth(d.getMonth() + 1)
            regexResult.date = d.toISOString().split('T')[0]
            regexResult.date_formatted = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            regexResult.confidence = 0.7
            console.log('   → Context-assumed date:', regexResult.date_formatted)
          }
        }
        break
      case 'time':
        // If they typed just a number like "3" or "5", assume PM
        if (/^\d{1,2}$/.test(cleanMsg)) {
          let h = parseInt(cleanMsg)
          if (h >= 1 && h <= 12) {
            if (h < 7) h += 12 // assume PM for small numbers
            const formatted = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`
            regexResult.time = `${h.toString().padStart(2, '0')}:00`
            regexResult.time_formatted = formatted
            regexResult.confidence = 0.7
            console.log('   → Context-assumed time:', formatted)
          }
        }
        break
    }
  }

  return regexResult
}

// ═══════════════════════════════════════════════════════════════
// 4. BOOKING FLOW HANDLER (Loop-Free State Machine)
// ═══════════════════════════════════════════════════════════════

const handleBookingFlow = async (conversation, message, detectedLanguage) => {
  // Initialize booking context if needed
  if (!conversation.bookingContext) {
    conversation.bookingContext = {
      state: BOOKING_STATES.STARTED,
      startedAt: new Date(),
      lastAskedField: null,
      promptCounts: { package: 0, date: 0, time: 0, name: 0, phone: 0 }
    }
  }

  const ctx = conversation.bookingContext

  // Ensure promptCounts exists
  if (!ctx.promptCounts) {
    ctx.promptCounts = { package: 0, date: 0, time: 0, name: 0, phone: 0 }
  }

  // Extract details with hybrid system
  const extractedData = await extractBookingDetails(message, {
    current_name: ctx.name,
    current_phone: ctx.phone,
    current_package: ctx.package?.type,
    current_date: ctx.date?.raw,
    current_time: ctx.time?.raw
  }, ctx.lastAskedField)

  console.log('📦 Extracted:', JSON.stringify(extractedData, null, 2))

  // ── HANDLE CANCELLATION ──
  if (extractedData.intent === 'cancel') {
    ctx.state = BOOKING_STATES.CANCELLED
    ctx.lastAskedField = null
    conversation.markModified('bookingContext')
    await conversation.save()
    return {
      text: getLocalizedMessage('cancellation', detectedLanguage),
      intent: 'booking_cancelled',
      language: detectedLanguage,
      quickReplies: ['Start New Booking', 'View Packages', 'Contact Us']
    }
  }

  // ── HANDLE "START OVER" ──
  if (/\b(start over|restart|start again|new booking|reset)\b/i.test(message)) {
    conversation.bookingContext = {
      state: BOOKING_STATES.STARTED,
      startedAt: new Date(),
      lastAskedField: null,
      promptCounts: { package: 0, date: 0, time: 0, name: 0, phone: 0 }
    }
    conversation.markModified('bookingContext')
    await conversation.save()
    return {
      text: "🔄 No problem! Let's start fresh.\n\n📸 Which photography package would you like?\n\n" +
        Object.entries(PACKAGES).map(([, v]) => `${v.emoji || '📷'} *${v.name}* - ₹${v.price.toLocaleString()}`).join('\n'),
      intent: 'booking_restart',
      language: detectedLanguage,
      quickReplies: Object.values(PACKAGES).map(p => p.name)
    }
  }

  // ── HANDLE CONFIRMATION STATE ──
  if (ctx.state === BOOKING_STATES.CONFIRMING) {
    const cleanMsg = message.toLowerCase().trim()
    const isConfirm = extractedData.intent === 'confirm' ||
      CONFIRM_KEYWORDS.some(k => cleanMsg === k || cleanMsg.includes(k)) ||
      message.includes('✅')

    const isChange = extractedData.intent === 'change' ||
      CHANGE_KEYWORDS.some(k => cleanMsg.includes(k)) ||
      message.includes('❌') ||
      cleanMsg === 'no'

    if (isConfirm) {
      return await finalizeBooking(conversation, ctx, detectedLanguage)
    } else if (isChange) {
      ctx.state = BOOKING_STATES.STARTED
      ctx.lastAskedField = null
      // Clear all fields so user can re-enter
      ctx.package = undefined
      ctx.date = undefined
      ctx.time = undefined
      ctx.name = null
      ctx.phone = null
      ctx.promptCounts = { package: 0, date: 0, time: 0, name: 0, phone: 0 }
      conversation.markModified('bookingContext')
      await conversation.save()
      return {
        text: getLocalizedMessage('whatToChange', detectedLanguage),
        intent: 'booking_change',
        language: detectedLanguage,
        quickReplies: ['Start Over', 'View Packages', 'Contact Us']
      }
    } else {
      // Unclear response during confirmation → re-show confirmation
      return {
        text: "Please confirm your booking by tapping a button below, or type 'Yes' to confirm or 'No' to change.",
        intent: 'confirmation_retry',
        language: detectedLanguage,
        quickReplies: ['✅ Yes, Confirm', '❌ No, Change']
      }
    }
  }

  // ── UPDATE CONTEXT WITH EXTRACTED DATA ──
  // KEY FIX: Allow updates when lastAskedField matches (prevents loop)
  if (extractedData.name && (!ctx.name || ctx.lastAskedField === 'name')) {
    ctx.name = extractedData.name
    if (ctx.lastAskedField === 'name') ctx.lastAskedField = null
  }

  if (extractedData.phone && (!ctx.phone || ctx.lastAskedField === 'phone')) {
    const sanitized = sanitizePhone(extractedData.phone)
    if (validatePhone(sanitized)) {
      ctx.phone = sanitized
      if (ctx.lastAskedField === 'phone') ctx.lastAskedField = null
    }
  }

  if (extractedData.date && (!ctx.date?.raw || ctx.lastAskedField === 'date')) {
    ctx.date = {
      raw: extractedData.date,
      formatted: extractedData.date_formatted || extractedData.date,
      value: new Date(extractedData.date)
    }
    if (ctx.lastAskedField === 'date') ctx.lastAskedField = null
  }

  if ((extractedData.time || extractedData.time_formatted) && (!ctx.time?.raw || ctx.lastAskedField === 'time')) {
    ctx.time = {
      raw: extractedData.time,
      formatted: extractedData.time_formatted || extractedData.time
    }
    if (ctx.lastAskedField === 'time') ctx.lastAskedField = null
  }

  if (extractedData.package && (!ctx.package?.type || ctx.lastAskedField === 'package')) {
    const pkgKey = Object.keys(PACKAGES).find(k =>
      k.toLowerCase() === extractedData.package.toLowerCase() ||
      k.toLowerCase().includes(extractedData.package.toLowerCase())
    )
    if (pkgKey && PACKAGES[pkgKey]) {
      ctx.package = {
        type: pkgKey,
        name: PACKAGES[pkgKey].name,
        price: PACKAGES[pkgKey].price,
        emoji: PACKAGES[pkgKey].emoji || '📸'
      }
      if (ctx.lastAskedField === 'package') ctx.lastAskedField = null
    }
  }

  // ── CHECK FOR MISSING FIELDS ──
  const missingFields = []
  if (!ctx.package?.type) missingFields.push('package')
  if (!ctx.date?.value) missingFields.push('date')
  if (!ctx.time?.formatted) missingFields.push('time')
  if (!ctx.name) missingFields.push('name')
  if (!ctx.phone) missingFields.push('phone')

  console.log('📋 Missing fields:', missingFields)

  // All fields collected → show confirmation
  if (missingFields.length === 0) {
    ctx.state = BOOKING_STATES.CONFIRMING
    ctx.lastAskedField = null
    conversation.markModified('bookingContext')
    await conversation.save()
    return generateConfirmationSummary(ctx, detectedLanguage)
  }

  // ── ASK FOR NEXT MISSING FIELD ──
  const nextField = missingFields[0]

  // LOOP PREVENTION: Track prompt attempts
  ctx.promptCounts[nextField] = (ctx.promptCounts[nextField] || 0) + 1

  // If we've asked too many times for the same field → offer escape
  if (ctx.promptCounts[nextField] > MAX_PROMPT_ATTEMPTS) {
    ctx.lastAskedField = null
    conversation.markModified('bookingContext')
    await conversation.save()
    return {
      text: `😅 I'm having trouble understanding your ${nextField}. No worries!\n\nYou can:\n• Try typing it again\n• Start over with a fresh booking\n• Contact us directly for help\n\nWhat would you like to do?`,
      intent: 'extraction_help',
      language: detectedLanguage,
      quickReplies: ['Start Over', 'Contact Us', 'Try Again']
    }
  }

  ctx.state = `awaiting_${nextField}`
  ctx.lastAskedField = nextField
  conversation.markModified('bookingContext')
  await conversation.save()

  // If this is a RETRY for the same field, show a hint
  if (ctx.promptCounts[nextField] > 1) {
    return generateRetryPrompt(ctx, nextField, detectedLanguage)
  }

  return generateBookingPrompt(ctx, nextField, detectedLanguage)
}

// ═══════════════════════════════════════════════════════════════
// 5. RESPONSE GENERATORS
// ═══════════════════════════════════════════════════════════════

const generateBookingPrompt = (context, nextField, language) => {
  // Build progress summary
  let summary = ''
  if (context.package?.name) summary += `📦 Package: ${context.package.name}\n`
  if (context.date?.formatted) summary += `📅 Date: ${context.date.formatted}\n`
  if (context.time?.formatted) summary += `⏰ Time: ${context.time.formatted}\n`
  if (context.name) summary += `👤 Name: ${context.name}\n`
  if (summary) summary = `✅ *Collected so far:*\n${summary}\n`

  const prompts = {
    package: {
      text: `${summary}📸 Which photography package would you like?\n\n${Object.entries(PACKAGES).map(([, v]) => `${v.emoji || '📷'} *${v.name}* - ₹${v.price.toLocaleString()}`).join('\n')}`,
      quickReplies: Object.values(PACKAGES).map(p => p.name)
    },
    date: {
      text: `${summary}📅 What date would you like to book?\n\nYou can say things like:\n• "Tomorrow"\n• "Next Saturday"\n• "15 March 2025"`,
      quickReplies: ['Tomorrow', 'This Weekend', 'Next Week']
    },
    time: {
      text: `${summary}⏰ What time should we start the shoot?\n\nYou can say:\n• "Morning" (9 AM)\n• "Afternoon" (2 PM)\n• "Evening" (5 PM)`,
      quickReplies: ['Morning (9 AM)', 'Afternoon (2 PM)', 'Evening (5 PM)']
    },
    name: {
      text: `${summary}👤 What is your full name?`,
      quickReplies: []
    },
    phone: {
      text: `${summary}📱 Please share your 10-digit phone number.\n\nWe'll use this to confirm your booking.`,
      quickReplies: []
    }
  }

  const prompt = prompts[nextField] || { text: 'How can I help you?', quickReplies: [] }
  return { text: prompt.text, intent: `booking_ask_${nextField}`, language, quickReplies: prompt.quickReplies }
}

const generateRetryPrompt = (context, nextField, language) => {
  const hints = {
    package: `I didn't catch which package you'd like. Please tap one of the buttons below or type the package name:`,
    date: `I couldn't understand the date. Please try:\n• "Tomorrow"\n• "25 March"\n• "15/04/2025"`,
    time: `I couldn't understand the time. Please try:\n• "Morning"\n• "3 PM"\n• "Evening"`,
    name: `I need your full name. Please type just your name (e.g., "Rahul Sharma"):`,
    phone: `Please enter a valid 10-digit Indian mobile number starting with 6-9.\nExample: 9876543210`
  }

  const quickReplies = {
    package: Object.values(PACKAGES).map(p => p.name),
    date: ['Tomorrow', 'This Weekend', 'Next Week'],
    time: ['Morning (9 AM)', 'Afternoon (2 PM)', 'Evening (5 PM)'],
    name: [], phone: []
  }

  return {
    text: `🔄 ${hints[nextField] || 'Please try again.'}`,
    intent: `booking_retry_${nextField}`,
    language,
    quickReplies: quickReplies[nextField] || []
  }
}

const generateConfirmationSummary = (ctx, language) => {
  const summary = `📋 *Please Confirm Your Booking*

${ctx.package?.emoji || '📸'} *Package:* ${ctx.package?.name}
💰 *Price:* ₹${ctx.package?.price?.toLocaleString()}
📅 *Date:* ${ctx.date?.formatted}
⏰ *Time:* ${ctx.time?.formatted}
👤 *Name:* ${ctx.name}
📱 *Phone:* ${ctx.phone}

Is this information correct?`

  return {
    text: summary,
    intent: 'booking_confirmation',
    language,
    quickReplies: ['✅ Yes, Confirm', '❌ No, Change']
  }
}

const finalizeBooking = async (conversation, context, language) => {
  context.state = BOOKING_STATES.COMPLETED
  context.completedAt = new Date()
  context.lastAskedField = null

  // Use the model's finalizeBooking method if available
  if (typeof conversation.finalizeBooking === 'function') {
    conversation.finalizeBooking()
  } else {
    conversation.booking = {
      hasBooking: true,
      package: context.package?.name,
      packageId: context.package?.type,
      eventDate: context.date?.value,
      eventTime: context.time?.formatted,
      estimatedValue: context.package?.price,
      status: 'pending',
      statusHistory: [{ status: 'pending', changedAt: new Date(), changedBy: 'system' }]
    }
    if (context.name) conversation.visitor = { ...conversation.visitor, name: context.name }
    if (context.phone) conversation.visitor = { ...conversation.visitor, phone: context.phone }
    conversation.meta = conversation.meta || {}
    conversation.meta.successful = true
  }

  conversation.markModified('bookingContext')
  conversation.markModified('booking')
  conversation.markModified('visitor')
  conversation.lastMessageAt = new Date() // Fix: Update lastMessageAt for dashboard
  await conversation.save()

  // Send notification (don't fail if it doesn't work)
  try {
    await sendBookingNotification({
      name: context.name,
      phone: context.phone,
      email: context.email || null,
      package: context.package?.name,
      eventDate: context.date?.formatted,
      location: context.location || 'TBD'
    })
  } catch (e) {
    console.warn('⚠️ Failed to send booking notification:', e.message)
  }

  try { await incrementAnalytics('bookings.inquiriesCompleted') } catch (e) { /* ignore */ }

  const confirmationText = `🎉 *Booking Confirmed!*

Thank you, ${context.name}! Your photography session has been booked.

📋 *Booking Details:*
${context.package?.emoji || '📸'} ${context.package?.name}
📅 ${context.date?.formatted}
⏰ ${context.time?.formatted}
💰 ₹${context.package?.price?.toLocaleString()}

📞 We will call you at ${context.phone} within 24 hours to confirm the final details.

Thank you for choosing us! 🙏`

  return {
    text: confirmationText,
    intent: 'booking_complete',
    language,
    quickReplies: ['View Portfolio', 'Contact Us', 'Book Another']
  }
}

const getLocalizedMessage = (key, language = 'en') => {
  const messages = {
    cancellation: {
      en: '❌ Booking cancelled. No problem! Feel free to start a new booking anytime.',
      hi: '❌ बुकिंग रद्द। कोई बात नहीं! जब चाहें नई बुकिंग शुरू करें।',
      gu: '❌ બુકિંગ રદ કરી. કોઈ વાંધો નહીં! ગમે ત્યારે નવી બુકિંગ શરૂ કરો.'
    },
    whatToChange: {
      en: '🔄 No problem! Let\'s start your booking again from scratch.',
      hi: '🔄 कोई बात नहीं! आइए फिर से बुकिंग शुरू करें।',
      gu: '🔄 કોઈ વાંધો નહીં! ચાલો ફરીથી બુકિંગ શરૂ કરીએ.'
    },
    greeting: {
      en: '👋 Hello! Welcome to PG Films. I can help you book a photography session. What would you like?',
      hi: '👋 नमस्ते! PG Films में आपका स्वागत है। मैं फोटोग्राफी सेशन बुक करने में मदद कर सकता हूं।',
      gu: '👋 નમસ્તે! PG Films માં આપનું સ્વાગત છે. હું ફોટોગ્રાફી સેશન બુક કરવામાં મદદ કરી શકું છું.'
    }
  }
  return messages[key]?.[language] || messages[key]?.['en'] || messages[key] || ''
}

// ═══════════════════════════════════════════════════════════════
// 6. INTENT DETECTION (Rule-based)
// ═══════════════════════════════════════════════════════════════

const detectIntent = (message) => {
  const msg = message.toLowerCase().trim()

  if (/^(hi|hello|hey|namaste|kem cho|namaskar|hii|hlo)\b/i.test(msg)) {
    return { intent: 'greeting', confidence: 1.0 }
  }
  if (/\b(book|booking|reserve|want to book|need)\b/i.test(msg)) {
    // Check if a package name was mentioned
    for (const [pkgType, keywords] of Object.entries(PACKAGE_KEYWORDS)) {
      if (keywords.some(k => msg.includes(k))) {
        return { intent: 'booking', confidence: 0.95, detectedPackage: pkgType }
      }
    }
    return { intent: 'booking', confidence: 0.95 }
  }
  if (/\b(package|price|cost|rate|kitna|ketla|pricing)\b/i.test(msg)) {
    return { intent: 'showPackages', confidence: 0.95 }
  }
  // Direct package name (without "book") → start booking with that package
  for (const [pkgType, keywords] of Object.entries(PACKAGE_KEYWORDS)) {
    if (keywords.some(k => msg.includes(k))) {
      return { intent: 'booking', confidence: 0.9, detectedPackage: pkgType }
    }
  }
  if (/\b(portfolio|sample|work|gallery|photos)\b/i.test(msg)) {
    return { intent: 'showPortfolio', confidence: 0.9 }
  }
  if (/\b(contact|phone|call|whatsapp|number)\b/i.test(msg)) {
    return { intent: 'showContact', confidence: 0.9 }
  }
  if (/\b(thank|thanks|dhanyavad|shukriya)\b/i.test(msg)) {
    return { intent: 'thankYou', confidence: 0.9 }
  }
  if (/\b(help|assist|support)\b/i.test(msg)) {
    return { intent: 'help', confidence: 0.9 }
  }
  // "Book another" or "new booking" after a completed booking
  if (/\b(book another|another booking|new booking)\b/i.test(msg)) {
    return { intent: 'booking', confidence: 0.95 }
  }

  return { intent: null, confidence: 0 }
}

// Check if message contains a name
const extractNameFromMessage = (message) => {
  const msg = message.trim()
  // Simple name extraction - remove common prefixes and extract potential name
  const namePatterns = [
    /^(my name is|i am|i'm|mera naam|maru naam|मेरा नाम|મારું નામ|naam hai|name is)\s+([a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s'.]{2,50})$/i,
    /^([a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s'.]{2,50})$/
  ]

  for (const pattern of namePatterns) {
    const match = msg.match(pattern)
    if (match) {
      const potentialName = match[1] || match[0]
      // Validate it's not a command
      if (!/^(book|cancel|price|package|wedding|portrait|contact|help|yes|no|ok|start|view|change|confirm|hello|hi|hey|namaste)\b/i.test(potentialName)) {
        return potentialName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      }
    }
  }
  return null
}

const generateResponse = (intent, language = 'en') => {
  switch (intent) {
    case 'greeting':
      return {
        text: getLocalizedMessage('greeting', language),
        intent: 'greeting', language,
        quickReplies: ['View Packages', 'Book Now', 'View Portfolio', 'Contact']
      }
    case 'showPackages': {
      const packageList = Object.entries(PACKAGES)
        .map(([, v]) => `${v.emoji || '📷'} *${v.name}* - ₹${v.price.toLocaleString()}`)
        .join('\n')
      return {
        text: `📸 *Our Photography Packages:*\n\n${packageList}\n\n💡 All packages include professional editing and digital delivery.\n\nWhich package interests you?`,
        intent: 'showPackages', language,
        quickReplies: Object.values(PACKAGES).map(p => p.name)
      }
    }
    case 'showPortfolio':
      return {
        text: `📷 *Our Portfolio*\n\nCheck out our best work:\n🌐 Website: ${process.env.PORTFOLIO_URL || 'www.pgfilms.com'}\n📸 Instagram: @pgfilms\n\nWould you like to book a session?`,
        intent: 'showPortfolio', language,
        quickReplies: ['Book Now', 'View Packages', 'Contact']
      }
    case 'showContact':
      return {
        text: `📞 *Contact Us*\n\n📱 Phone: ${process.env.FILMMAKER_PHONE || '+91 98765 43210'}\n📧 Email: ${process.env.FILMMAKER_EMAIL || 'info@pgfilms.com'}\n📍 Location: Gujarat, India\n\nWe typically respond within 1 hour!`,
        intent: 'showContact', language,
        quickReplies: ['Book Now', 'View Packages']
      }
    case 'thankYou':
      return {
        text: '🙏 You\'re welcome! It was my pleasure to help. Feel free to reach out anytime you need our services!',
        intent: 'thankYou', language,
        quickReplies: ['Book Now', 'View Packages']
      }
    case 'help':
      return {
        text: `🤝 *How can I help you?*\n\nI can assist you with:\n📸 Viewing our packages\n📅 Booking a session\n📷 Showing our portfolio\n📞 Contact information\n\nJust tell me what you need!`,
        intent: 'help', language,
        quickReplies: ['View Packages', 'Book Now', 'Portfolio', 'Contact']
      }
    default:
      return {
        text: `Hello! I'm here to help you book a photography session. Would you like to see our packages or start booking?`,
        intent: 'default', language,
        quickReplies: ['View Packages', 'Book Now', 'Contact']
      }
  }
}

// ═══════════════════════════════════════════════════════════════
// 7. MAIN EXPORTED FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Process incoming message
 */
export const processMessage = async (sessionId, message, metadata = {}) => {
  try {
    console.log('\n════════════════════════════════════════')
    console.log(`📨 Session: ${sessionId}`)
    console.log(`💬 Message: "${message}"`)
    console.log('════════════════════════════════════════')

    // Find or create conversation
    let conversation = await Conversation.findOne({ sessionId })
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
        bookingContext: { state: BOOKING_STATES.NONE },
        messages: [],
        meta: { platform: metadata.platform || 'web' }
      })
      console.log('📝 Created new conversation')
    }

    const detectedLanguage = detectLanguage(message)

    // Add user message to history
    conversation.messages.push({
      id: uuidv4(), role: 'user', text: message, timestamp: new Date()
    })

    // Determine if we're in an active booking flow
    const ctx = conversation.bookingContext || { state: BOOKING_STATES.NONE }
    const isInBookingFlow = ctx && ![
      BOOKING_STATES.NONE,
      BOOKING_STATES.COMPLETED,
      BOOKING_STATES.CANCELLED
    ].includes(ctx.state)

    const intentData = detectIntent(message)
    console.log('🎯 Intent:', intentData, '| In booking flow:', isInBookingFlow)

    let response

    // Check if this is a new conversation and we should ask for name first
    const isNewConversation = conversation.messages.length === 1 // Only the current message
    const hasName = conversation.visitor?.name

    if (isNewConversation && !hasName && !isInBookingFlow) {
      // Extract name from the first message
      const extractedName = extractNameFromMessage(message)
      if (extractedName) {
        conversation.visitor = conversation.visitor || {}
        conversation.visitor.name = extractedName
        conversation.markModified('visitor')
        await conversation.save()
        console.log('👤 Extracted name from first message:', extractedName)
      }
    }

    if (isInBookingFlow) {
      // ACTIVELY in booking → route ALL messages through booking handler
      console.log('📌 Continuing booking flow (state:', ctx.state, ')')
      response = await handleBookingFlow(conversation, message, detectedLanguage)
    }
    else if (intentData.intent === 'booking' || intentData.detectedPackage) {
      console.log('📌 Starting new booking flow...')
      conversation.bookingContext = {
        state: BOOKING_STATES.STARTED,
        startedAt: new Date(),
        lastAskedField: null,
        promptCounts: { package: 0, date: 0, time: 0, name: 0, phone: 0 }
      }
      // Pre-fill detected package
      if (intentData.detectedPackage) {
        const pkgKey = Object.keys(PACKAGES).find(k =>
          k.toLowerCase() === intentData.detectedPackage.toLowerCase()
        )
        if (pkgKey && PACKAGES[pkgKey]) {
          conversation.bookingContext.package = {
            type: pkgKey,
            name: PACKAGES[pkgKey].name,
            price: PACKAGES[pkgKey].price,
            emoji: PACKAGES[pkgKey].emoji || '📸'
          }
        }
      }
      conversation.markModified('bookingContext')
      response = await handleBookingFlow(conversation, message, detectedLanguage)
    }
    else if (intentData.intent && intentData.confidence > 0.8) {
      console.log('📌 Handling intent:', intentData.intent)
      response = generateResponse(intentData.intent, detectedLanguage)
    }
    else {
      // Try AI for general chat
      console.log('📌 Using AI for general response...')
      try {
        const aiResult = await getChatResponse(message, {
          language: detectedLanguage,
          conversationHistory: conversation.messages.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n')
        })
        if (aiResult.success && aiResult.data) {
          response = {
            text: aiResult.data, intent: 'ai_chat', language: detectedLanguage,
            quickReplies: ['Book Now', 'View Packages', 'Contact']
          }
        } else {
          response = {
            text: "I'm here to help you book a photography session! Would you like to see our packages or start booking?",
            intent: 'fallback', language: detectedLanguage,
            quickReplies: ['View Packages', 'Book Now', 'Contact']
          }
        }
      } catch (e) {
        console.error('❌ AI chat error:', e.message)
        response = {
          text: "I can help you book a photography session. Type 'Book' to start or 'Packages' to see our services!",
          intent: 'fallback', language: detectedLanguage,
          quickReplies: ['View Packages', 'Book Now', 'Contact']
        }
      }
    }

    // Add bot response to history
    conversation.messages.push({
      id: uuidv4(), role: 'bot', text: response.text,
      timestamp: new Date(), intent: response.intent
    })

    conversation.meta = conversation.meta || {}
    conversation.meta.lastActivity = new Date()
    conversation.meta.messageCount = conversation.messages.length

    conversation.markModified('messages')
    conversation.markModified('meta')
    await conversation.save()

    console.log('✅ Response:', response.text.substring(0, 100) + '...')
    console.log('════════════════════════════════════════\n')

    return { response, sessionId, language: detectedLanguage, aiStatus: getAIStatus() }

  } catch (error) {
    console.error('❌ Process Error:', error)
    throw error
  }
}

/**
 * Handle direct booking submission (from external forms)
 */
export const handleBooking = async (sessionId, bookingData) => {
  try {
    let conversation = await Conversation.findOne({ sessionId })
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
        bookingContext: { state: BOOKING_STATES.COMPLETED },
        messages: []
      })
    }

    conversation.booking = {
      hasBooking: true,
      ...bookingData,
      status: 'pending',
      statusHistory: [{ status: 'pending', changedAt: new Date(), changedBy: 'system' }]
    }
    conversation.bookingContext = { state: BOOKING_STATES.COMPLETED, completedAt: new Date() }
    conversation.meta = conversation.meta || {}
    conversation.meta.successful = true

    conversation.markModified('booking')
    conversation.markModified('bookingContext')
    conversation.lastMessageAt = new Date() // Fix: Update lastMessageAt for dashboard
    await conversation.save()

    try { await sendBookingNotification(bookingData) } catch (e) { console.warn('⚠️ Notification failed:', e.message) }

    return { success: true, bookingId: conversation._id, message: 'Booking created successfully' }
  } catch (error) {
    console.error('❌ Handle booking error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create booking (for custom packages from chat widget)
 */
export const createBooking = async (bookingData) => {
  try {
    // Generate a new session ID for this booking
    const sessionId = uuidv4()
    
    // Create new conversation for this booking
    const conversation = await Conversation.create({
      sessionId,
      bookingContext: { state: BOOKING_STATES.COMPLETED, completedAt: new Date() },
      messages: [],
      visitor: {
        name: bookingData.userDetails?.name,
        phone: bookingData.userDetails?.mobile,
        fingerprint: bookingData.deviceFingerprint
      },
      booking: {
        hasBooking: true,
        package: typeof bookingData.package === 'string' ? bookingData.package : bookingData.package?.name,
        packageId: bookingData.package?.id || bookingData.package?.type,
        eventDate: null, // Not provided for custom packages
        eventTime: null,
        eventLocation: null,
        estimatedValue: bookingData.package?.price || 0,
        specialRequests: bookingData.package?.description || '',
        status: 'pending',
        statusHistory: [{ status: 'pending', changedAt: new Date(), changedBy: 'system' }]
      },
      meta: {
        successful: true,
        lastActivity: new Date()
      }
    })

    // Send notification
    try { 
      await sendBookingNotification({
        name: bookingData.userDetails?.name,
        phone: bookingData.userDetails?.mobile,
        email: null,
        package: bookingData.package?.name,
        eventDate: null,
        location: null
      }) 
    } catch (e) { 
      console.warn('⚠️ Notification failed:', e.message) 
    }

    return { 
      success: true, 
      bookingId: conversation._id, 
      message: 'Custom package request created successfully' 
    }
  } catch (error) {
    console.error('❌ Create booking error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get conversation by session ID
 */
export const getConversation = async (sessionId) => {
  try {
    return await Conversation.findOne({ sessionId, 'deletion.isDeleted': { $ne: true } })
  } catch (error) {
    console.error('❌ Get conversation error:', error)
    return null
  }
}

/**
 * Run learning job (placeholder)
 */
export const runLearningJob = async () => {
  try {
    console.log('🎓 Running learning job...')
    return { success: true, approvedCount: 0, message: 'Learning job completed' }
  } catch (error) {
    console.error('❌ Learning job error:', error)
    return { success: false, approvedCount: 0, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// 8. DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════

export default {
  processMessage,
  handleBooking,
  createBooking,
  getConversation,
  runLearningJob
}
