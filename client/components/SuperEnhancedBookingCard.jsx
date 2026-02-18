import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Trash2, Calendar, MapPin, MessageSquare, Clock, Loader } from 'lucide-react'
import { openBookingWhatsAppWithHistory, openWhatsAppWithChatHistory } from '../utils/enhancedWhatsApp'

const SuperEnhancedBookingCard = ({ booking, onStatusChange, onDelete, conversationId = null }) => {
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false)
  const [whatsappError, setWhatsappError] = useState(null)

  const handleWhatsAppClick = async () => {
    setLoadingWhatsApp(true)
    setWhatsappError(null)
    
    try {
      if (conversationId) {
        // Open WhatsApp with full chat history
        await openWhatsAppWithChatHistory(conversationId, booking)
      } else {
        // Open WhatsApp with booking details
        await openBookingWhatsAppWithHistory(booking.id)
      }
    } catch (error) {
      console.error('WhatsApp error:', error)
      setWhatsappError('Failed to load chat history. Please try again.')
    } finally {
      setLoadingWhatsApp(false)
    }
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

  const formatEventDate = (dateString) => {
    if (!dateString) return 'To be confirmed'
    return new Date(dateString).toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <motion.div
      layout
      className="bg-dark-800/50 rounded-2xl border border-dark-700 p-5 hover:border-primary-500/30 transition-colors flex flex-col h-full"
    >
      <div className="flex justify-between mb-4">
        <div>
          <p className="font-semibold text-white truncate max-w-[150px]">{booking.name}</p>
          <p className="text-sm text-primary-400 truncate max-w-[150px]">{booking.package}</p>
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

      <div className="space-y-2 text-sm text-gray-400 mb-4 flex-1">
        <p className="flex items-center gap-2">
          <Phone size={14} className="shrink-0" /> {booking.phone}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={14} className="shrink-0" /> <span className="truncate">{booking.location}</span>
        </p>
        <p className="flex items-center gap-2">
          <Calendar size={14} className="shrink-0" /> {formatEventDate(booking.eventDate)}
        </p>
        {booking.adminNotes && (
          <p className="mt-2 text-xs italic bg-dark-900/50 p-2 rounded border border-dark-700">
            "{booking.adminNotes}"
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-dark-600 mb-3">
        <span className="text-lg font-bold text-primary-400">
          ₹{booking.value?.toLocaleString() || '0'}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(booking.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* WhatsApp Error Display */}
      {whatsappError && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{whatsappError}</p>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleWhatsAppClick}
          disabled={loadingWhatsApp}
          className="flex-1 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm hover:bg-green-600/30 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          title={conversationId ? "WhatsApp with chat history" : "WhatsApp with booking details"}
        >
          {loadingWhatsApp ? (
            <>
              <Loader size={14} className="animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <MessageSquare size={14} />
              <span className="hidden sm:inline">
                {conversationId ? 'Chat History' : 'WhatsApp'}
              </span>
            </>
          )}
        </button>
        
        <button
          onClick={() => window.open(`tel:+91${booking.phone}`)}
          className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 flex items-center justify-center gap-2 transition-colors"
          title="Call"
        >
          <Phone size={14} />
          <span className="hidden sm:inline">Call</span>
        </button>
        
        <button
          onClick={() => onDelete(booking.id)}
          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Info Badge */}
      <div className="mt-3 pt-3 border-t border-dark-700">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} />
          <span>
            {conversationId 
              ? 'Includes previous chat history' 
              : 'Booking details only'
            }
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default SuperEnhancedBookingCard
