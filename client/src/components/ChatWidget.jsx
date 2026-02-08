import React, { useState, useRef, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Phone, 
  MessageSquare,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { PerformanceContext } from '../App'

// ═══════════════════════════════════════════════════════════════
// CHAT ENGINE - Pattern Matching + Responses
// ═══════════════════════════════════════════════════════════════

const chatEngine = {
  // Package data (will come from API later)
  packages: [
    {
      id: 'wedding-gold',
      name: 'Wedding Gold',
      price: '₹75,000',
      emoji: '💍',
      features: ['10 hours', '500+ photos', 'Cinematic video', '2 photographers']
    },
    {
      id: 'portrait',
      name: 'Portrait Session',
      price: '₹25,000',
      emoji: '📸',
      features: ['2-3 hours', '50+ photos', 'Location choice', '2 outfits']
    },
    {
      id: 'event',
      name: 'Event Coverage',
      price: '₹50,000',
      emoji: '🎉',
      features: ['6 hours', '300+ photos', 'Highlight video', 'Same-day preview']
    }
  ],

  // Pattern matching
  patterns: {
    greeting: {
      keywords: ['hi', 'hello', 'hey', 'namaste', 'hii', 'hlo', 'kem cho', 'su che'],
      response: 'greeting'
    },
    pricing: {
      keywords: ['price', 'cost', 'rate', 'kitna', 'kitne', 'ketla', 'package', 'budget', 'charge', 'fees'],
      response: 'showPackages'
    },
    portfolio: {
      keywords: ['work', 'portfolio', 'photo', 'video', 'sample', 'dikha', 'dekh', 'batav', 'show'],
      response: 'showPortfolio'
    },
    availability: {
      keywords: ['available', 'free', 'book', 'slot', 'date', 'khaali', 'milega', 'malshe'],
      response: 'checkAvailability'
    },
    contact: {
      keywords: ['call', 'phone', 'whatsapp', 'contact', 'number', 'baat', 'vaat'],
      response: 'showContact'
    },
    thanks: {
      keywords: ['thanks', 'thank', 'dhanyavaad', 'shukriya', 'aabhar', 'bye', 'ok', 'okay'],
      response: 'thankYou'
    }
  },

  // Detect intent from message
  detectIntent(message) {
    const lowerMsg = message.toLowerCase()
    
    for (const [intent, data] of Object.entries(this.patterns)) {
      for (const keyword of data.keywords) {
        if (lowerMsg.includes(keyword)) {
          return { intent, confidence: 0.9 }
        }
      }
    }
    
    return { intent: 'unknown', confidence: 0.3 }
  },

  // Generate response based on intent
  getResponse(intent) {
    const filmmakerName = import.meta.env.VITE_FILMMAKER_NAME || 'PG Films'
    
    switch (intent) {
      case 'greeting':
        return {
          text: `Hi! 👋 Welcome to ${filmmakerName}!\n\nI can help you with:\n• 📸 View our packages\n• 💰 Check pricing\n• 📅 Book a session\n• 💬 Contact us\n\nWhat would you like to know?`,
          quickReplies: ['Show Packages', 'View Portfolio', 'Contact']
        }
      
      case 'showPackages':
        return {
          text: 'Here are our photography packages! 📸✨',
          packages: this.packages,
          quickReplies: ['Book Now', 'More Details', 'Contact']
        }
      
      case 'showPortfolio':
        return {
          text: 'Check out our recent work in the Portfolio section above! 📷\n\nWe specialize in:\n• 💍 Weddings\n• 📸 Portraits\n• 🎉 Events\n• 💕 Pre-wedding shoots\n\nWant to book a session?',
          quickReplies: ['Book Now', 'Show Packages', 'Contact']
        }
      
      case 'checkAvailability':
        return {
          text: "I'd love to capture your special moments! 📅\n\nTo check availability, please share:\n• Event date\n• Event type\n• Location\n\nOr you can directly contact us on WhatsApp for faster response!",
          quickReplies: ['WhatsApp', 'Show Packages', 'Call Now']
        }
      
      case 'showContact':
        return {
          text: `You can reach ${filmmakerName} directly:\n\n📱 Phone: ${import.meta.env.VITE_FILMMAKER_PHONE || '+91 98765 43210'}\n💬 WhatsApp: Click below\n📧 Email: ${import.meta.env.VITE_FILMMAKER_EMAIL || 'pgfilms@gmail.com'}\n\nWe typically respond within 2 hours!`,
          quickReplies: ['WhatsApp', 'Call Now', 'Show Packages']
        }
      
      case 'thankYou':
        return {
          text: `Thank you! 🙏✨\n\nFeel free to reach out anytime. We'd love to capture your precious moments!\n\nHave a wonderful day! 📸`,
          quickReplies: ['View Packages', 'Contact']
        }
      
      default:
        return {
          text: `I'm here to help! 😊\n\nYou can ask me about:\n• 💰 Package pricing\n• 📸 Our portfolio\n• 📅 Availability\n• 💬 Contact details\n\nWhat would you like to know?`,
          quickReplies: ['Show Packages', 'View Portfolio', 'Contact']
        }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════

const BotMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-2 mb-4"
  >
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center flex-shrink-0">
      <Sparkles size={16} className="text-white" />
    </div>
    <div className="flex-1">
      <div className="chat-bubble-bot whitespace-pre-line">
        {message.text}
      </div>
      
      {/* Package Cards */}
      {message.packages && (
        <div className="mt-3 space-y-2">
          {message.packages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>
      )}
      
      {/* Quick Replies */}
      {message.quickReplies && (
        <div className="flex flex-wrap gap-2 mt-3">
          {message.quickReplies.map((reply, idx) => (
            <QuickReplyButton key={idx} text={reply} />
          ))}
        </div>
      )}
    </div>
  </motion.div>
)

const UserMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-end mb-4"
  >
    <div className="chat-bubble-user">
      {message.text}
    </div>
  </motion.div>
)

const PackageCard = ({ package: pkg }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-dark-700/50 rounded-xl p-3 border border-dark-600"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold">
        {pkg.emoji} {pkg.name}
      </span>
      <span className="text-primary-400 font-bold">{pkg.price}</span>
    </div>
    <div className="text-xs text-gray-400">
      {pkg.features.join(' • ')}
    </div>
  </motion.div>
)

const QuickReplyButton = ({ text }) => {
  const handleClick = () => {
    // This will be connected to the chat input
    const event = new CustomEvent('quickReply', { detail: text })
    window.dispatchEvent(event)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="px-3 py-1.5 bg-primary-500/20 border border-primary-500/50 rounded-full text-sm text-primary-300 hover:bg-primary-500/30 transition-colors"
    >
      {text}
    </motion.button>
  )
}

const TypingIndicator = () => (
  <div className="flex gap-2 mb-4">
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center">
      <Sparkles size={16} className="text-white" />
    </div>
    <div className="chat-bubble-bot flex items-center gap-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════
// MAIN CHAT WIDGET
// ═══════════════════════════════════════════════════════════════

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { enableAnimations } = useContext(PerformanceContext)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Show welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeResponse = chatEngine.getResponse('greeting')
      setMessages([{ type: 'bot', ...welcomeResponse }])
    }
  }, [isOpen])

  // Listen for quick reply clicks
  useEffect(() => {
    const handleQuickReply = (e) => {
      handleSend(e.detail)
    }
    window.addEventListener('quickReply', handleQuickReply)
    return () => window.removeEventListener('quickReply', handleQuickReply)
  }, [])

  // Handle sending message
  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: text.trim() }])
    setInputValue('')
    setIsTyping(true)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    // Get bot response
    const { intent } = chatEngine.detectIntent(text)
    const response = chatEngine.getResponse(intent)

    setIsTyping(false)
    setMessages(prev => [...prev, { type: 'bot', ...response }])
  }

  // Handle special quick reply actions
  const handleSpecialAction = (action) => {
    const phone = import.meta.env.VITE_FILMMAKER_WHATSAPP || '919876543210'
    
    switch (action.toLowerCase()) {
      case 'whatsapp':
        window.open(`https://wa.me/${phone}?text=Hi! I'm interested in your photography services.`, '_blank')
        break
      case 'call now':
        window.open(`tel:+${phone}`, '_self')
        break
      default:
        handleSend(action)
    }
  }

  // Modified quick reply handler
  useEffect(() => {
    const handleQuickReply = (e) => {
      handleSpecialAction(e.detail)
    }
    window.addEventListener('quickReply', handleQuickReply)
    return () => window.removeEventListener('quickReply', handleQuickReply)
  }, [])

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen)
          setUnreadCount(0)
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-accent-rose shadow-lg shadow-primary-500/30 flex items-center justify-center text-white"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-rose rounded-full text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: enableAnimations ? 0.2 : 0 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-dark-900 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden border border-dark-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-rose p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">FilmBot</h3>
                <p className="text-xs text-white/80">Online • Replies instantly</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronDown size={20} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, idx) => (
                msg.type === 'bot' ? (
                  <BotMessage key={idx} message={msg} />
                ) : (
                  <UserMessage key={idx} message={msg} />
                )
              ))}
              
              {isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-dark-800 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center text-white"
                >
                  <Send size={18} />
                </motion.button>
              </div>
              
              {/* Quick actions */}
              <div className="flex justify-center gap-4 mt-3">
                <button
                  onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_FILMMAKER_WHATSAPP || '919876543210'}`, '_blank')}
                  className="text-xs text-gray-400 hover:text-green-400 flex items-center gap-1 transition-colors"
                >
                  <MessageSquare size={12} />
                  WhatsApp
                </button>
                <button
                  onClick={() => window.open(`tel:+${import.meta.env.VITE_FILMMAKER_PHONE || '919876543210'}`, '_self')}
                  className="text-xs text-gray-400 hover:text-primary-400 flex items-center gap-1 transition-colors"
                >
                  <Phone size={12} />
                  Call
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatWidget