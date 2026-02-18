/**
 * Enhanced WhatsApp Integration with Chat History
 * Pre-fills WhatsApp with complete conversation context
 */

export const generateWhatsAppWithChatHistory = async (conversationId, bookingData = null) => {
  try {
    // Fetch full conversation details
    const response = await fetch(`/api/admin/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversation details')
    }
    
    const conversation = await response.json()
    const messages = conversation.data?.messages || []
    const visitor = conversation.data?.visitor || {}
    
    // Build chat history context
    let chatHistory = ''
    if (messages.length > 0) {
      chatHistory = '*📱 Previous Chat History:*\n'
      messages.slice(-5).forEach((msg, index) => {
        const sender = msg.sender === 'user' ? '👤 You' : '🤖 PG Filmmaker'
        const time = new Date(msg.timestamp).toLocaleString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'short'
        })
        chatHistory += `\n${index + 1}. ${sender} (${time}):\n"${msg.text}"\n`
      })
      chatHistory += '\n'
    }

    // Add booking details if available
    let bookingInfo = ''
    if (bookingData || conversation.data?.booking) {
      const booking = bookingData || conversation.data.booking
      bookingInfo = `*📋 Current Booking Details:*\n`
      bookingInfo += `• Package: ${booking.package || 'Not specified'}\n`
      bookingInfo += `• Event Date: ${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'To be confirmed'}\n`
      bookingInfo += `• Location: ${booking.location || 'Not specified'}\n`
      bookingInfo += `• Status: ${booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}\n`
      if (booking.value) {
        bookingInfo += `• Value: ₹${booking.value.toLocaleString()}\n`
      }
      bookingInfo += '\n'
    }

    // Generate the complete WhatsApp message
    const message = `🎬 *PG Filmmaker - Follow-up Chat* 🎬

Hello *${visitor.name || 'Valued Client'}*! 

${chatHistory}${bookingInfo}*💬 How can I help you today?*

---
*PG Filmmaker Team*
📱 +91XXXXXXXXXX
🌐 www.pgfilmmaker.com
📧 contact@pgfilmmaker.com`

    return encodeURIComponent(message)
    
  } catch (error) {
    console.error('Error generating WhatsApp message:', error)
    
    // Fallback to basic message
    const fallbackMessage = `🎬 *PG Filmmaker - Follow-up* 🎬

Hello! 

Following up on your conversation with PG Filmmaker.

How can I help you today?

---
*PG Filmmaker Team*
📱 +91XXXXXXXXXX
🌐 www.pgfilmmaker.com`

    return encodeURIComponent(fallbackMessage)
  }
}

export const generateBookingWhatsAppWithHistory = async (bookingId) => {
  try {
    // Fetch booking details with conversation
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch booking details')
    }
    
    const booking = await response.json()
    const bookingData = booking.data
    
    // Try to get conversation history
    let chatHistory = ''
    try {
      if (bookingData.conversationId) {
        const convResponse = await fetch(`/api/admin/conversations/${bookingData.conversationId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
        
        if (convResponse.ok) {
          const conversation = await convResponse.json()
          const messages = conversation.data?.messages || []
          
          if (messages.length > 0) {
            chatHistory = '*📱 Previous Chat History:*\n'
            messages.slice(-3).forEach((msg, index) => {
              const sender = msg.sender === 'user' ? '👤 You' : '🤖 PG Filmmaker'
              const time = new Date(msg.timestamp).toLocaleString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              })
              chatHistory += `\n${index + 1}. ${sender} (${time}):\n"${msg.text}"\n`
            })
            chatHistory += '\n'
          }
        }
      }
    } catch (error) {
      console.log('Could not fetch conversation history for booking')
    }

    // Build complete booking message
    const message = `🎬 *PG Filmmaker - Booking Confirmation* 🎬

Hello *${bookingData.name || 'Valued Client'}*! 

${chatHistory}*📋 Booking Details:*
• Package: ${bookingData.package || 'Not specified'}
• Event Date: ${bookingData.eventDate ? new Date(bookingData.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'To be confirmed'}
• Location: ${bookingData.location || 'Not specified'}
• Status: ${bookingData.status ? bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1) : 'Pending'}
• Value: ₹${(bookingData.value || 0).toLocaleString()}

*📞 Contact:* +91${bookingData.phone || 'XXXXXXXXXX'}

*💬 Ready to proceed with your booking!*

---
*PG Filmmaker Team*
📱 +91XXXXXXXXXX
🌐 www.pgfilmmaker.com
📧 contact@pgfilmmaker.com`

    return encodeURIComponent(message)
    
  } catch (error) {
    console.error('Error generating booking WhatsApp message:', error)
    return null
  }
}

// Enhanced WhatsApp opener with loading states
export const openWhatsAppWithChatHistory = async (conversationId, bookingData = null) => {
  try {
    // Show loading state
    const loadingMessage = `🎬 *PG Filmmaker - Loading Chat History...* 🎬

Please wait while we fetch your conversation details...

---
*PG Filmmaker Team*`
    
    // Open WhatsApp with loading message first
    window.open(`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(loadingMessage)}`, '_blank')
    
    // Generate full message and update after a short delay
    setTimeout(async () => {
      const fullMessage = await generateWhatsAppWithChatHistory(conversationId, bookingData)
      // Re-open WhatsApp with full message (this will replace the loading message)
      window.open(`https://wa.me/91${bookingData?.phone || 'XXXXXXXXXX'}?text=${fullMessage}`, '_blank')
    }, 2000)
    
  } catch (error) {
    console.error('Error opening WhatsApp with chat history:', error)
  }
}

export const openBookingWhatsAppWithHistory = async (bookingId) => {
  try {
    const message = await generateBookingWhatsAppWithHistory(bookingId)
    if (message) {
      window.open(`https://wa.me/91XXXXXXXXXX?text=${message}`, '_blank')
    }
  } catch (error) {
    console.error('Error opening booking WhatsApp:', error)
  }
}
