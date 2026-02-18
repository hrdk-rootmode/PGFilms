// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Utility Helper Functions
// ═══════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import nodemailer from 'nodemailer'
import { Config } from '../models/index.js'

// ═══════════════════════════════════════════════════════════════
// PASSWORD UTILITIES
// ═══════════════════════════════════════════════════════════════

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}

// ═══════════════════════════════════════════════════════════════
// JWT UTILITIES
// ═══════════════════════════════════════════════════════════════

export const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// OTP UTILITIES
// ═══════════════════════════════════════════════════════════════

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const generateSessionId = () => {
  return uuidv4()
}

// ═══════════════════════════════════════════════════════════════
// EMAIL UTILITIES
// ═══════════════════════════════════════════════════════════════

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Skip if no SMTP configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email skipped (SMTP not configured):', subject)
      return { success: true, skipped: true }
    }

    const transporter = createTransporter()

    const mailOptions = {
      from: `"${process.env.FILMMAKER_NAME || 'PG Films'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    }

    await transporter.sendMail(mailOptions)
    console.log('📧 Email sent:', subject)
    return { success: true }
  } catch (error) {
    console.error('❌ Email error:', error.message)
    return { success: false, error: error.message }
  }
}

export const sendOTPEmail = async (email, otp, action) => {
  const subject = `🔐 ${process.env.FILMMAKER_NAME || 'PG Films'} - Security Code`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d946ef;">Security Verification</h2>
      <p>Your verification code is:</p>
      <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #d946ef; letter-spacing: 5px;">${otp}</span>
      </div>
      <p><strong>Action requested:</strong> ${action}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">
        This code expires in 5 minutes. If you didn't request this, please ignore this email and change your password.
      </p>
    </div>
  `

  return sendEmail({ to: email, subject, html })
}

export const sendBookingNotification = async (bookingData) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const filmmakerPhone = process.env.FILMMAKER_PHONE || '+91 98765 43210'

  const subject = `📸 New Booking Request from ${bookingData.name}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d946ef;">📸 New Booking Request!</h2>
      
      <div style="background: #1e293b; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #fff; margin-top: 0;">Client Details</h3>
        <table style="width: 100%; color: #ccc;">
          <tr><td style="padding: 5px 0;"><strong>Name:</strong></td><td>${bookingData.name}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Phone:</strong></td><td>${bookingData.phone}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td>${bookingData.email || 'Not provided'}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Package:</strong></td><td>${bookingData.package}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Date:</strong></td><td>${bookingData.eventDate}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Location:</strong></td><td>${bookingData.location}</td></tr>
        </table>
      </div>
      
      ${bookingData.specialRequests ? `
        <div style="background: #1e293b; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <strong style="color: #d946ef;">Special Requests:</strong>
          <p style="color: #ccc; margin: 10px 0 0 0;">${bookingData.specialRequests}</p>
        </div>
      ` : ''}
      
      <div style="margin-top: 20px;">
        <a href="https://wa.me/91${bookingData.phone.replace(/\D/g, '')}" style="display: inline-block; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 8px; margin-right: 10px;">
          💬 WhatsApp Client
        </a>
        <a href="tel:+91${bookingData.phone}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">
          📞 Call Client
        </a>
      </div>
      
      <p style="color: #888; font-size: 12px; margin-top: 30px;">
        This booking was received via your website chat. Please respond within 24 hours.
      </p>
    </div>
  `

  // Send confirmation to both admin and client
  await Promise.all([
    sendEmail({ to: adminEmail, subject, html }),
    bookingData.email ? sendBookingConfirmationToClient(bookingData) : Promise.resolve()
  ])
}

// Send booking confirmation to client
export const sendBookingConfirmationToClient = async (bookingData) => {
  const filmmakerName = process.env.FILMMAKER_NAME || 'PG Films'
  const filmmakerPhone = process.env.FILMMAKER_PHONE || '+91 98765 43210'
  const filmmakerEmail = process.env.FILMMAKER_EMAIL || 'pgfilms@gmail.com'

  const subject = `📸 Booking Confirmation - ${filmmakerName}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d946ef;">📸 Thank You for Your Booking!</h2>
      
      <p style="color: #333; line-height: 1.6;">
        Hi <strong>${bookingData.name}</strong>,
      </p>
      
      <p style="color: #333; line-height: 1.6;">
        Thank you for choosing <strong>${filmmakerName}</strong>! We've received your booking request and are excited to be part of your special day.
      </p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #d946ef;">
        <h3 style="margin-top: 0; color: #1e293b;">Your Booking Details</h3>
        <table style="width: 100%; color: #475569;">
          <tr><td style="padding: 5px 0;"><strong>Package:</strong></td><td>${bookingData.package}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Event Date:</strong></td><td>${bookingData.eventDate}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Location:</strong></td><td>${bookingData.location}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Contact:</strong></td><td>${bookingData.phone}</td></tr>
        </table>
      </div>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #78350f;">
          <strong>⏰ What's Next?</strong><br/>
          We'll contact you within <strong>24 hours</strong> via WhatsApp or phone to confirm availability and discuss details.
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <p style="color: #64748b; margin-bottom: 15px;">Have questions? Reach out to us:</p>
        <a href="https://wa.me/91${filmmakerPhone.replace(/\D/g, '')}" style="display: inline-block; padding: 12px 30px; background: #22c55e; color: white; text-decoration: none; border-radius: 8px; margin: 0 5px;">
          💬 WhatsApp Us
        </a>
        <a href="tel:+91${filmmakerPhone}" style="display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 0 5px;">
          📞 Call Us
        </a>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; margin-top: 40px; text-align: center;">
        ${filmmakerName} | ${filmmakerPhone} | ${filmmakerEmail}
      </p>
    </div>
  `

  return sendEmail({ to: bookingData.email, subject, html })
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════

export const validatePhone = (phone) => {
  // Indian mobile number validation
  const cleaned = phone.replace(/\D/g, '')
  const pattern = /^[6-9]\d{9}$/
  return pattern.test(cleaned)
}

export const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

export const validateDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 2)

  return date > now && date < maxDate
}

export const sanitizePhone = (phone) => {
  return phone.replace(/\D/g, '').slice(-10)
}

// ═══════════════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════════════

export const formatDate = (date, format = 'short') => {
  const d = new Date(date)

  if (format === 'short') {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return d.toISOString()
}

export const getDateRange = (range) => {
  const now = new Date()
  const start = new Date()

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
    default:
      start.setDate(now.getDate() - 7)
  }

  return { start, end: now }
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ═══════════════════════════════════════════════════════════════

export const detectLanguage = (text) => {
  // Devanagari script (Hindi)
  if (/[\u0900-\u097F]/.test(text)) return 'hi'

  // Gujarati script
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'

  // Check for romanized Hindi/Gujarati words
  const hindiWords = ['kya', 'hai', 'kitna', 'kitne', 'chahiye', 'kaise', 'mujhe', 'aap', 'hum', 'yeh', 'woh']
  const gujaratiWords = ['su', 'che', 'ketla', 'joiye', 'kem', 'tamne', 'ame', 'aa', 'te']

  const lowerText = text.toLowerCase()

  const hasHindi = hindiWords.some(word => lowerText.includes(word))
  const hasGujarati = gujaratiWords.some(word => lowerText.includes(word))

  if (hasGujarati) return 'gu'
  if (hasHindi) return 'hi'

  return 'en'
}

// ═══════════════════════════════════════════════════════════════
// BOOKING SCORE CALCULATOR
// ═══════════════════════════════════════════════════════════════

export const calculateBookingScore = (bookingData) => {
  let score = 0

  // Complete info provided
  if (bookingData.name) score += 20
  if (bookingData.phone && validatePhone(bookingData.phone)) score += 25
  if (bookingData.email && validateEmail(bookingData.email)) score += 15
  if (bookingData.eventDate && validateDate(bookingData.eventDate)) score += 15
  if (bookingData.location) score += 10
  if (bookingData.package) score += 10

  // Bonus for special requests (shows genuine interest)
  if (bookingData.specialRequests && bookingData.specialRequests.length > 20) score += 5

  return Math.min(score, 100)
}

// ═══════════════════════════════════════════════════════════════
// DATABASE SEEDING
// ═══════════════════════════════════════════════════════════════

export const seedDatabase = async () => {
  try {
    // 1. Seed Admin
    const adminData = {
      _id: 'admin',
      type: 'admin',
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@pgfilms.com',
        passwordHash: await hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
        profile: {
          name: process.env.FILMMAKER_NAME || 'PG Films',
          phone: process.env.FILMMAKER_PHONE || '+919876543210',
          whatsapp: process.env.FILMMAKER_WHATSAPP || '919876543210',
          email: process.env.FILMMAKER_EMAIL || 'pgfilms@gmail.com',
          location: process.env.FILMMAKER_LOCATION || 'Gujarat, India',
          tagline: 'Capturing Moments, Creating Memories'
        },
        notifications: {
          email: { enabled: true, onNewBooking: true, onDailyReport: true },
          whatsapp: { enabled: true, onNewBooking: true },
          quietHours: { enabled: true, start: '22:00', end: '08:00' }
        },
        business: {
          hoursStart: process.env.BUSINESS_HOURS_START || '09:00',
          hoursEnd: process.env.BUSINESS_HOURS_END || '21:00',
          timezone: process.env.TIMEZONE || 'Asia/Kolkata',
          responseTimePromise: '2 hours',
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'hi', 'gu']
        },
        learning: {
          autoApproveEnabled: true,
          autoApproveThreshold: 20,
          autoApproveConfidence: 0.90
        },
        deletionSettings: {
          trashRetentionDays: 30,
          autoCleanupEnabled: true,
          protectSuccessfulBookings: true
        },
        security: {
          lastLogin: null,
          failedAttempts: 0
        }
      }
    }

    await Config.findOneAndUpdate(
      { _id: 'admin' },
      adminData,
      { upsert: true, new: true }
    )

    // 2. Seed Packages
    const packagesData = {
      _id: 'packages',
      type: 'packages',
      data: [
        {
          id: 'wedding-gold',
          name: 'Wedding Gold',
          price: 75000,
          duration: 'Full Day (10 hours)',
          features: [
            '500+ edited photos',
            'Cinematic highlight video (5-7 min)',
            '2 photographers',
            'Pre-wedding consultation',
            'Online gallery delivery'
          ],
          description: 'Complete wedding coverage',
          emoji: '💍',
          popular: true,
          active: true,
          order: 1
        },
        {
          id: 'portrait-session',
          name: 'Portrait Session',
          price: 25000,
          duration: '2-3 hours',
          features: [
            '50+ edited photos',
            'Location of your choice',
            '2 outfit changes',
            'Professional retouching',
            'Digital delivery'
          ],
          description: 'Professional portrait photography',
          emoji: '📸',
          popular: false,
          active: true,
          order: 2
        },
        {
          id: 'event-coverage',
          name: 'Event Coverage',
          price: 50000,
          duration: '6 hours',
          features: [
            '300+ edited photos',
            'Highlight video (3-5 min)',
            'Same-day preview',
            'All occasions covered',
            'Online gallery'
          ],
          description: 'Professional event coverage',
          emoji: '🎉',
          popular: false,
          active: true,
          order: 3
        },
        {
          id: 'pre-wedding',
          name: 'Pre-Wedding Shoot',
          price: 40000,
          duration: '4-5 hours',
          features: [
            '100+ edited photos',
            '1 location',
            'Creative concepts',
            'Props included',
            'Cinematic video'
          ],
          description: 'Beautiful pre-wedding memories',
          emoji: '💕',
          popular: true,
          active: true,
          order: 4
        }
      ]
    }

    await Config.findOneAndUpdate(
      { _id: 'packages' },
      packagesData,
      { upsert: true, new: true }
    )

    // 3. Seed Patterns
    const patternsData = {
      _id: 'patterns',
      type: 'patterns',
      data: {
        intents: {
          greeting: {
            keywords: {
              en: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'hii', 'hlo'],
              hi: ['namaste', 'namaskar', 'hello', 'hi', 'hii'],
              gu: ['namaste', 'kem cho', 'hello', 'hi', 'su che']
            },
            response: 'greeting',
            priority: 1
          },
          pricing: {
            keywords: {
              en: ['price', 'cost', 'rate', 'charge', 'fee', 'package', 'budget', 'amount'],
              hi: ['kitna', 'kitne', 'daam', 'paisa', 'kharcha', 'fees', 'rate', 'price'],
              gu: ['ketla', 'ketli', 'bhaav', 'paisa', 'kharcho', 'rate', 'price']
            },
            response: 'showPackages',
            priority: 2
          },
          portfolio: {
            keywords: {
              en: ['work', 'portfolio', 'photos', 'videos', 'sample', 'show', 'previous', 'gallery'],
              hi: ['kaam', 'photo', 'video', 'dikhao', 'dikha', 'pehle', 'dekh', 'dekhao'],
              gu: ['kaam', 'photo', 'video', 'batavo', 'batav', 'pehla', 'jovo', 'gallery']
            },
            response: 'showPortfolio',
            priority: 3
          },
          availability: {
            keywords: {
              en: ['available', 'free', 'book', 'slot', 'date', 'when', 'schedule'],
              hi: ['khaali', 'milega', 'book', 'kab', 'tareekh', 'available', 'free'],
              gu: ['khaali', 'malshe', 'book', 'kyare', 'tarikh', 'available']
            },
            response: 'checkAvailability',
            priority: 4
          },
          contact: {
            keywords: {
              en: ['call', 'phone', 'whatsapp', 'contact', 'reach', 'talk', 'number', 'email'],
              hi: ['call', 'phone', 'baat', 'contact', 'number', 'sampark', 'whatsapp'],
              gu: ['call', 'phone', 'vaat', 'contact', 'number', 'sampark']
            },
            response: 'showContact',
            priority: 5
          },
          booking: {
            keywords: {
              en: ['book', 'confirm', 'reserve', 'want', 'interested', 'hire', 'need'],
              hi: ['book', 'confirm', 'pakka', 'chahiye', 'interested', 'karna', 'karwana'],
              gu: ['book', 'confirm', 'pakku', 'joiye', 'interested', 'karvu', 'karavvu']
            },
            response: 'startBookingFlow',
            priority: 6
          },
          thanks: {
            keywords: {
              en: ['thanks', 'thank', 'okay', 'ok', 'great', 'perfect', 'bye', 'goodbye'],
              hi: ['dhanyavaad', 'shukriya', 'theek', 'accha', 'bye', 'alvida'],
              gu: ['aabhar', 'thank', 'barabar', 'saras', 'bye', 'aavjo']
            },
            response: 'thankYou',
            priority: 7
          }
        },
        learnedKeywords: [],
        synonyms: {
          'shaadi': 'wedding',
          'vivah': 'wedding',
          'lagna': 'wedding',
          'photo': 'photos',
          'pic': 'photos',
          'pics': 'photos',
          'vid': 'video'
        },
        autoCorrect: {
          'prise': 'price',
          'prce': 'price',
          'availble': 'available',
          'bookin': 'booking'
        },
        pendingPatterns: [],
        abuseWords: {
          severe: { words: [], action: 'block' },
          moderate: { words: [], action: 'mask' },
          mild: { words: [], action: 'log' }
        },
        abuseSettings: {
          enableFiltering: true,
          enableAIDetection: true,
          defaultAction: 'mask',
          autoBlockAfterCount: 3
        }
      }
    }

    await Config.findOneAndUpdate(
      { _id: 'patterns' },
      patternsData,
      { upsert: true, new: true }
    )

    // 4. Seed Responses
    const responsesData = {
      _id: 'responses',
      type: 'responses',
      data: {
        greetings: {
          en: "Hi! 👋 Welcome to {filmmakerName}!\n\nI can help you with:\n• 📸 View packages & pricing\n• 🖼️ See our portfolio\n• 📅 Check availability\n• 💬 Contact us\n\nWhat would you like to know?",
          hi: "नमस्ते! 👋 {filmmakerName} में आपका स्वागत है!\n\nमैं आपकी मदद कर सकता हूं:\n• 📸 पैकेज और कीमतें देखें\n• 🖼️ हमारा काम देखें\n• 📅 उपलब्धता जांचें\n• 💬 संपर्क करें\n\nआप क्या जानना चाहेंगे?",
          gu: "નમસ્તે! 👋 {filmmakerName} માં તમારું સ્વાગત છે!\n\nહું તમને મદદ કરી શકું:\n• 📸 પેકેજ અને કિંમતો જુઓ\n• 🖼️ અમારું કામ જુઓ\n• 📅 ઉપલબ્ધતા તપાસો\n• 💬 સંપર્ક કરો\n\nતમે શું જાણવા માંગો છો?"
        },
        showPackages: {
          en: "Here are our photography packages! 📸✨\n\nEach one is crafted to capture your special moments perfectly.",
          hi: "ये रहे हमारे फोटोग्राफी पैकेज! 📸✨\n\nहर एक आपके खास पलों को परफेक्ट तरीके से कैप्चर करने के लिए है।",
          gu: "આ અમારા ફોટોગ્રાફી પેકેજ છે! 📸✨\n\nદરેક તમારી ખાસ ક્ષણોને સંપૂર્ણ રીતે કેપ્ચર કરવા માટે છે."
        },
        showPortfolio: {
          en: "Check out our recent work! 📸✨\n\nWe specialize in:\n• 💍 Weddings\n• 📸 Portraits\n• 🎉 Events\n• 💕 Pre-wedding shoots\n\nWant to book a session?",
          hi: "हमारा हालिया काम देखिए! 📸✨\n\nहम इनमें विशेषज्ञ हैं:\n• 💍 शादियां\n• 📸 पोर्ट्रेट\n• 🎉 इवेंट्स\n• 💕 प्री-वेडिंग शूट\n\nसेशन बुक करना चाहेंगे?",
          gu: "અમારું તાજેતરનું કામ જુઓ! 📸✨\n\nઅમે આમાં નિષ્ણાત છીએ:\n• 💍 લગ્ન\n• 📸 પોર્ટ્રેટ\n• 🎉 ઇવેન્ટ્સ\n• 💕 પ્રી-વેડિંગ શૂટ\n\nસેશન બુક કરવા માંગો છો?"
        },
        checkAvailability: {
          en: "I'd love to capture your special moments! 📅\n\nTo check availability, please share:\n• Event date\n• Event type\n• Location",
          hi: "मुझे आपके खास पलों को कैप्चर करना अच्छा लगेगा! 📅\n\nउपलब्धता जांचने के लिए बताइए:\n• इवेंट की तारीख\n• इवेंट का प्रकार\n• लोकेशन",
          gu: "મને તમારી ખાસ ક્ષણો કેપ્ચર કરવાનું ગમશે! 📅\n\nઉપલબ્ધતા તપાસવા માટે જણાવો:\n• ઇવેન્ટની તારીખ\n• ઇવેન્ટનો પ્રકાર\n• લોકેશન"
        },
        showContact: {
          en: "You can reach {filmmakerName} directly:\n\n📱 Phone: {phone}\n💬 WhatsApp: Click below\n📧 Email: {email}\n\nWe typically respond within 2 hours!",
          hi: "आप {filmmakerName} से सीधे संपर्क कर सकते हैं:\n\n📱 फोन: {phone}\n💬 WhatsApp: नीचे क्लिक करें\n📧 ईमेल: {email}\n\nहम आमतौर पर 2 घंटे में जवाब देते हैं!",
          gu: "તમે {filmmakerName} નો સીધો સંપર્ક કરી શકો:\n\n📱 ફોન: {phone}\n💬 WhatsApp: નીચે ક્લિક કરો\n📧 ઇમેઇલ: {email}\n\nઅમે સામાન્ય રીતે 2 કલાકમાં જવાબ આપીએ છીએ!"
        },
        thankYou: {
          en: "Thank you! 🙏✨\n\nFeel free to reach out anytime. We'd love to capture your precious moments!\n\nHave a wonderful day! 📸",
          hi: "धन्यवाद! 🙏✨\n\nकभी भी संपर्क करें। हमें आपके खास पलों को कैप्चर करना अच्छा लगेगा!\n\nआपका दिन शुभ हो! 📸",
          gu: "આભાર! 🙏✨\n\nગમે ત્યારે સંપર્ક કરો. અમને તમારી કીમતી ક્ષણો કેપ્ચર કરવાનું ગમશે!\n\nતમારો દિવસ શુભ રહે! 📸"
        },
        fallback: {
          en: "I'm here to help! 😊\n\nYou can ask me about:\n• 💰 Package pricing\n• 📸 Our portfolio\n• 📅 Availability\n• 💬 Contact details\n\nWhat would you like to know?",
          hi: "मैं मदद के लिए हूं! 😊\n\nआप मुझसे पूछ सकते हैं:\n• 💰 पैकेज की कीमतें\n• 📸 हमारा पोर्टफोलियो\n• 📅 उपलब्धता\n• 💬 संपर्क विवरण\n\nआप क्या जानना चाहेंगे?",
          gu: "હું મદદ માટે છું! 😊\n\nતમે મને પૂછી શકો:\n• 💰 પેકેજ કિંમતો\n• 📸 અમારો પોર્ટફોલિયો\n• 📅 ઉપલબ્ધતા\n• 💬 સંપર્ક વિગતો\n\nતમે શું જાણવા માંગો છો?"
        },
        bookingStart: {
          en: "Great choice! 🎉 Let's book your session.\n\nFirst, which package interests you?",
          hi: "बढ़िया चुनाव! 🎉 आइए आपका सेशन बुक करें।\n\nपहले बताइए, कौन सा पैकेज पसंद है?",
          gu: "સરસ પસંદગી! 🎉 ચાલો તમારું સેશન બુક કરીએ।\n\nપહેલા જણાવો, કયું પેકેજ ગમે છે?"
        },
        bookingConfirmation: {
          en: "Perfect! 🎉 I've noted all your details.\n\n📋 Booking Summary:\n• Package: {package}\n• Date: {date}\n• Location: {location}\n• Name: {name}\n• Phone: {phone}\n\n{filmmakerName} will contact you within 2 hours! 📞",
          hi: "बहुत बढ़िया! 🎉 मैंने आपकी सभी जानकारी नोट कर ली है।\n\n📋 बुकिंग सारांश:\n• पैकेज: {package}\n• तारीख: {date}\n• लोकेशन: {location}\n• नाम: {name}\n• फोन: {phone}\n\n{filmmakerName} 2 घंटे में आपसे संपर्क करेंगे! 📞",
          gu: "સરસ! 🎉 મેં તમારી બધી વિગતો નોંધી લીધી છે।\n\n📋 બુકિંગ સારાંશ:\n• પેકેજ: {package}\n• તારીખ: {date}\n• લોકેશન: {location}\n• નામ: {name}\n• ફોન: {phone}\n\n{filmmakerName} 2 કલાકમાં તમારો સંપર્ક કરશે! 📞"
        },
        abuseWarning: {
          en: "Let's keep our conversation respectful! 🙏\n\nHow can I help you with your photography needs?",
          hi: "चलिए बातचीत को सम्मानजनक रखें! 🙏\n\nमैं आपकी फोटोग्राफी जरूरतों में कैसे मदद कर सकता हूं?",
          gu: "ચાલો આપણી વાતચીત માનપૂર્વક રાખીએ! 🙏\n\nહું તમારી ફોટોગ્રાફી જરૂરિયાતોમાં કેવી રીતે મદદ કરી શકું?"
        }
      }
    }

    await Config.findOneAndUpdate(
      { _id: 'responses' },
      responsesData,
      { upsert: true, new: true }
    )

    console.log('✅ Database seeded successfully')
    return true
  } catch (error) {
    console.error('❌ Seed error:', error)
    throw error
  }
}

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateOTP,
  generateSessionId,
  sendEmail,
  sendOTPEmail,
  sendBookingNotification,
  validatePhone,
  validateEmail,
  validateDate,
  sanitizePhone,
  formatDate,
  getDateRange,
  detectLanguage,
  calculateBookingScore,
  seedDatabase
}