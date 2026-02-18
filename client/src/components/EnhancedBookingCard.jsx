import React from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Trash2, Calendar, MapPin, User } from 'lucide-react'

const EnhancedBookingCard = ({ booking, onStatusChange, onDelete }) => {
  const generateWhatsAppMessage = (booking) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'contacted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleWhatsAppClick = () => {
    const message = generateWhatsAppMessage(booking)
    window.open(`https://wa.me/91${booking.phone}?text=${message}`, '_blank')
  }

  return (
    <motion.div
      layout
      className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 hover:border-primary-500/30 transition-all duration-200"
    >
      {/* Header with name, package and status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-gray-400" />
            <p className="font-semibold text-white text-sm">{booking.name}</p>
          </div>
          <p className="text-xs text-primary-400">{booking.package}</p>
        </div>
        
        <select
          value={booking.status}
          onChange={(e) => onStatusChange(booking.id, e.target.value)}
          className={`px-2 py-1 rounded-lg text-xs border bg-dark-900 focus:outline-none appearance-none cursor-pointer ${getStatusColor(booking.status)}`}
        >
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Key details - compact */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Phone size={12} className="shrink-0" />
          <span className="truncate">{booking.phone}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} className="shrink-0" />
          <span className="truncate">{new Date(booking.eventDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1 col-span-2">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{booking.location}</span>
        </div>
      </div>

      {/* Admin notes - if any */}
      {booking.adminNotes && (
        <div className="mb-3 p-2 bg-dark-900/50 rounded border border-dark-600">
          <p className="text-xs italic text-gray-400">"{booking.adminNotes}"</p>
        </div>
      )}

      {/* Footer with value and actions */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-600">
        <div>
          <span className="text-sm font-bold text-primary-400">
            ₹{booking.value?.toLocaleString() || '0'}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={handleWhatsAppClick}
            className="p-1.5 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle size={12} />
          </button>
          <button
            onClick={() => window.open(`tel:+91${booking.phone}`)}
            className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
            title="Call"
          >
            <Phone size={12} />
          </button>
          <button
            onClick={() => onDelete(booking.id)}
            className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default EnhancedBookingCard
