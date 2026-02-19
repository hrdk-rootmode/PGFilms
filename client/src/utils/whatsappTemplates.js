// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Enhanced WhatsApp Templates
// Pre-filled professional messages for all scenarios
// ═══════════════════════════════════════════════════════════════

const FILMMAKER_NAME = 'PG Filmmaker'
const FILMMAKER_PHONE = '+91 98765 43210' // Replace with actual

// ═══════════════════════════════════════════════════════════════
// TEMPLATE GENERATORS
// ═══════════════════════════════════════════════════════════════

export const templates = {
  // Booking Confirmation
  confirmation: (booking) => {
    const date = booking.eventDate 
      ? new Date(booking.eventDate).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'To be confirmed'

    return `🎬 *${FILMMAKER_NAME} - Booking Confirmed* 🎬

Hello *${booking.name || 'there'}*! 

Great news! Your booking is confirmed! 🎉

📋 *Booking Details:*
📦 Package: ${booking.package || 'Photography Session'}
📅 Date: ${date}
${booking.eventTime ? `⏰ Time: ${booking.eventTime}` : ''}
${booking.location ? `📍 Location: ${booking.location}` : ''}
💰 Value: ₹${(booking.value || booking.estimatedValue || 0).toLocaleString()}

✅ *What's Next:*
• We'll contact you 2 days before to finalize details
• Prepare any specific requirements you have
• We'll bring all professional equipment

Thank you for choosing ${FILMMAKER_NAME}! 📸

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}
🌐 www.pgfilmmaker.com`
  },

  // Pre-Event Reminder (1-2 days before)
  reminder: (booking) => {
    const date = booking.eventDate 
      ? new Date(booking.eventDate).toLocaleDateString('en-IN', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })
      : 'your upcoming shoot'

    return `📸 *Event Reminder - Tomorrow!* 📸

Hi *${booking.name || 'there'}*!

Just a friendly reminder about your upcoming session! 🎬

📋 *Event Details:*
📦 Package: ${booking.package || 'Photography Session'}
📅 Date: ${date}
${booking.eventTime ? `⏰ Time: ${booking.eventTime}` : ''}
${booking.location ? `📍 Location: ${booking.location}` : ''}

✅ *Quick Checklist:*
• Confirm location access is arranged
• Have any specific outfit/prop requirements ready
• We'll handle all the equipment!

Looking forward to capturing your special moments! 😊

Reply if you have any last-minute questions!

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}`
  },

  // Request Missing Information
  missingInfo: (booking, missingFields = []) => {
    const fieldsList = missingFields.length > 0 
      ? missingFields.map(f => `• ${f}`).join('\n')
      : '• Event Date\n• Location\n• Preferred Time'

    return `👋 Hi *${booking.name || 'there'}*!

Thank you for your booking inquiry! 🎬

To proceed with your *${booking.package || 'Photography Session'}*, we need a few more details:

📝 *Please provide:*
${fieldsList}

This helps us prepare the best experience for you! 📸

Simply reply with the information, or feel free to call us directly.

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}`
  },

  // Follow-up (After Inquiry)
  followUp: (booking) => {
    return `👋 Hi *${booking.name || 'there'}*!

Following up on your inquiry about our *${booking.package || 'photography services'}*! 📸

Have you had a chance to think about it?

I'm happy to:
• Answer any questions you have
• Discuss package customization
• Check availability for your preferred dates

Looking forward to hearing from you! 😊

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}
🌐 www.pgfilmmaker.com`
  },

  // Post-Event Thank You
  thankYou: (booking) => {
    return `🎉 *Thank You!* 🎉

Hi *${booking.name || 'there'}*!

It was wonderful capturing your special moments at your *${booking.package || 'session'}*! 📸

📋 *What's Next:*
• Photo selection will be ready in 3-5 days
• You'll receive a preview link via WhatsApp
• Final edited photos within 2 weeks

Your memories are in safe hands! ✨

If you loved our work, we'd appreciate a review on Google! ⭐

Thank you for choosing ${FILMMAKER_NAME}! 🙏

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}`
  },

  // Conversation Follow-up
  conversationFollowUp: (conversation) => {
    const lastMessage = conversation.lastMessage || conversation.messages?.[conversation.messages.length - 1]?.text || ''
    const preview = lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : '')

    return `👋 Hi *${conversation.visitor?.name || conversation.name || 'there'}*!

Following up on your recent message:
"${preview}"

How can I help you today? 😊

I'm available to:
• Answer questions about our services
• Share our portfolio
• Discuss booking options

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}`
  },

  // Payment Reminder
  paymentReminder: (booking) => {
    return `💰 *Payment Reminder* 💰

Hi *${booking.name || 'there'}*!

This is a friendly reminder about your *${booking.package || 'booking'}*.

📋 *Booking Details:*
📦 Package: ${booking.package || 'Photography Session'}
💰 Amount: ₹${(booking.value || booking.estimatedValue || 0).toLocaleString()}

💳 *Payment Options:*
• UPI: pgfilmmaker@upi
• Bank Transfer (details on request)
• Cash (at session)

Please complete the payment to confirm your booking.

Questions? Just reply! 😊

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}`
  },

  // Reschedule Request
  reschedule: (booking) => {
    return `📅 *Reschedule Your Session* 📅

Hi *${booking.name || 'there'}*!

We understand plans can change! 

Your current booking:
📦 ${booking.package || 'Photography Session'}
📅 ${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN') : 'TBD'}

Would you like to reschedule?

Please share your new preferred:
• Date
• Time
• Location (if changed)

We'll do our best to accommodate you! 😊

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}`
  },

  // General Inquiry Response
  inquiry: (name = '') => {
    return `👋 Hello${name ? ` *${name}*` : ''}!

Thank you for reaching out to *${FILMMAKER_NAME}*! 📸

We offer professional photography services:

📦 *Our Packages:*
• Wedding Photography - ₹75,000
• Portrait Session - ₹25,000
• Pre-Wedding Shoot - ₹35,000
• Event Coverage - ₹50,000
• Maternity/Baby Shoot - ₹20,000

✨ All packages include:
• Professional editing
• Digital delivery
• Print-ready files

Would you like to know more about any package?

---
*${FILMMAKER_NAME}*
📱 ${FILMMAKER_PHONE}
🌐 www.pgfilmmaker.com`
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Open WhatsApp with pre-filled message
 * @param {string} phone - Phone number (with or without country code)
 * @param {string} message - Message text
 */
export const openWhatsApp = (phone, message) => {
  // Clean phone number (remove spaces, dashes, etc.)
  let cleanPhone = phone.replace(/\D/g, '')
  
  // Add India country code if not present
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone
  }
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message)
  
  // Open WhatsApp
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
  window.open(url, '_blank')
}

/**
 * Open WhatsApp with specific template
 * @param {string} templateName - Template name from templates object
 * @param {object} data - Data to populate template
 */
export const openWhatsAppWithTemplate = (templateName, data) => {
  const template = templates[templateName]
  
  if (!template) {
    console.error(`Template "${templateName}" not found`)
    return
  }
  
  const message = template(data)
  const phone = data.phone || data.visitor?.phone || ''
  
  if (!phone) {
    console.error('No phone number provided')
    alert('No phone number available for this contact')
    return
  }
  
  openWhatsApp(phone, message)
}

/**
 * Get list of missing fields from booking
 * @param {object} booking - Booking object
 * @returns {string[]} - Array of missing field names
 */
export const getMissingFields = (booking) => {
  const fields = []
  
  if (!booking.eventDate) fields.push('Event Date')
  if (!booking.eventTime) fields.push('Preferred Time')
  if (!booking.location || booking.location === 'Not specified') fields.push('Location')
  if (!booking.email || booking.email === 'No email') fields.push('Email Address')
  
  return fields
}

/**
 * Check if event is tomorrow
 * @param {string|Date} eventDate - Event date
 * @returns {boolean}
 */
export const isEventTomorrow = (eventDate) => {
  if (!eventDate) return false
  
  const event = new Date(eventDate)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return event.toDateString() === tomorrow.toDateString()
}

/**
 * Check if event is within N days
 * @param {string|Date} eventDate - Event date
 * @param {number} days - Number of days
 * @returns {boolean}
 */
export const isEventWithinDays = (eventDate, days) => {
  if (!eventDate) return false
  
  const event = new Date(eventDate)
  const future = new Date()
  future.setDate(future.getDate() + days)
  
  return event <= future && event >= new Date()
}

/**
 * Check if booking has missing info
 * @param {object} booking - Booking object
 * @returns {boolean}
 */
export const hasMissingInfo = (booking) => {
  return getMissingFields(booking).length > 0
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════

export default {
  templates,
  openWhatsApp,
  openWhatsAppWithTemplate,
  getMissingFields,
  isEventTomorrow,
  isEventWithinDays,
  hasMissingInfo
}