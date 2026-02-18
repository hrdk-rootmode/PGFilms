/**
 * Utility functions for WhatsApp integration
 */

export const generateBookingWhatsAppMessage = (booking) => {
  const message = `🎬 *PG Filmmaker - Booking Confirmation* 🎬

Hello *${booking.name}*! 

📋 *Booking Details:*
• Package: ${booking.package}
• Event Date: ${new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
• Location: ${booking.location}
• Status: ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}

💰 *Value:* ₹${booking.value?.toLocaleString() || 'To be discussed'}

📞 *Contact:* +91${booking.phone}

---
*PG Filmmaker Team*
📱 +91XXXXXXXXXX
🌐 www.pgfilmmaker.com`

  return encodeURIComponent(message)
}

export const openWhatsAppWithBooking = (booking) => {
  const message = generateBookingWhatsAppMessage(booking)
  window.open(`https://wa.me/91${booking.phone}?text=${message}`, '_blank')
}

export const generateConversationWhatsAppMessage = (conversation) => {
  const message = `🎬 *PG Filmmaker - Conversation Follow-up* 🎬

Hello *${conversation.visitor?.name || 'Valued Client'}*!

Following up on your recent conversation about:
"${conversation.lastMessage || 'Your inquiry with PG Filmmaker'}"

📞 *Contact:* +91${conversation.visitor?.phone || 'XXXXXXXXXX'}

How can I help you today?

---
*PG Filmmaker Team*
📱 +91XXXXXXXXXX
🌐 www.pgfilmmaker.com`

  return encodeURIComponent(message)
}

export const openWhatsAppWithConversation = (conversation) => {
  const message = generateConversationWhatsAppMessage(conversation)
  const phone = conversation.visitor?.phone || 'XXXXXXXXXX'
  window.open(`https://wa.me/91${phone}?text=${message}`, '_blank')
}
