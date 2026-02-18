/**
 * Instructions to update AdminPanel.jsx with pre-filled WhatsApp messages
 * 
 * 1. Import the WhatsApp helper at the top of AdminPanel.jsx:
 * 
 * import { openWhatsAppWithBooking } from '../utils/whatsappHelper'
 * 
 * 2. Replace the WhatsApp button onClick handler around line 740:
 * 
 * OLD CODE:
 * onClick={() => window.open(`https://wa.me/91${booking.phone}`, '_blank')}
 * 
 * NEW CODE:
 * onClick={() => openWhatsAppWithBooking(booking)}
 * 
 * 3. The helper function will generate a pre-filled message with:
 * - Client name
 * - Booking package
 * - Event date
 * - Location
 * - Status
 * - Value
 * - Contact details
 * - Professional branding
 * 
 * This makes it easy for both filmmaker and client to identify the context
 */

export const whatsappButtonUpdate = {
  oldLine: 'onClick={() => window.open(`https://wa.me/91${booking.phone}`, \'_blank\')}',
  newLine: 'onClick={() => openWhatsAppWithBooking(booking)}',
  importStatement: 'import { openWhatsAppWithBooking } from \'../utils/whatsappHelper\''
}

// Example of the pre-filled message that will be sent:
export const exampleMessage = `🎬 *PG Filmmaker - Booking Confirmation* 🎬

Hello *John Doe*! 

📋 *Booking Details:*
• Package: Wedding Photography
• Event Date: Saturday, December 25, 2024
• Location: Mumbai, Maharashtra
• Status: Pending

💰 *Value:* ₹50,000

📞 *Contact:* +919876543210

---
*PG Filmmaker Team*
📱 +91XXXXXXXXXX
🌐 www.pgfilmmaker.com`
