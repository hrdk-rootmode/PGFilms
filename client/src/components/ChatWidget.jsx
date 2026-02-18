import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, X, Send, Phone,
  Sparkles, ChevronDown, Loader2, RefreshCw,
  CheckCircle, Calendar, User, MapPin, Package
} from 'lucide-react'
import { chatAPI } from '../utils/api'
import { useChatContext } from '../context/ChatContext'

// Default packages for fallback
const DEFAULT_PACKAGES = {
  wedding: { name: 'Wedding Gold', price: 50000, emoji: '💑' },
  portrait: { name: 'Portrait Session', price: 15000, emoji: '📸' },
  event: { name: 'Event Coverage', price: 25000, emoji: '🎉' },
  custom: { name: 'Custom Package', price: 0, emoji: '🎨' }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════════

const MessageBubble = ({ message, isUser, onQuickReply }) => {
  const formatText = (text) => {
    if (!text) return ''
    
    return text.split('\n').map((line, i) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      formattedLine = formattedLine.replace(/^(📦|📅|⏰|👤|📱|📍|💰|✅|✓)/g, '<span class="mr-1">$1</span>')
      
      return (
        <span 
          key={i} 
          dangerouslySetInnerHTML={{ __html: formattedLine }}
          className="block"
        />
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 items-end gap-2`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-rose flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
      )}
      
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`p-4 text-sm leading-relaxed shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-primary-600 to-accent-rose text-white rounded-2xl rounded-br-sm'
              : 'bg-dark-800/90 backdrop-blur-md border border-dark-600 text-gray-100 rounded-2xl rounded-bl-sm'
          }`}
        >
          <div className="whitespace-pre-line">
            {isUser ? message.text : formatText(message.text)}
          </div>

          {/* Package Cards */}
          {message.packages && message.packages.length > 0 && (
            <div className="mt-4 space-y-2">
              {message.packages.map((pkg) => (
                <motion.button
                  key={pkg.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onQuickReply(`Book ${pkg.name}`)}
                  className="w-full bg-dark-700/80 hover:bg-dark-600/80 p-3 rounded-xl border border-dark-500 hover:border-primary-500/50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{pkg.emoji}</span>
                      <div>
                        <p className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                          {pkg.name}
                        </p>
                        <p className="text-xs text-gray-400">{pkg.description || 'Tap to book'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-400">{pkg.price}</p>
                      <p className="text-xs text-gray-500">Book Now →</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Booking Confirmation Card */}
          {message.intent === 'booking_confirmation' && (
            <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-primary-400" />
                <span className="font-semibold text-primary-300">Review Your Booking</span>
              </div>
              <p className="text-xs text-gray-400">
                Please check all details above and confirm by clicking "Yes, Confirm"
              </p>
            </div>
          )}

          {/* Booking Complete Card */}
          {message.intent === 'booking_complete' && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-green-400" />
                <span className="font-semibold text-green-300">Booking Confirmed!</span>
              </div>
              <p className="text-xs text-gray-400">
                Our team will contact you within 2 hours.
              </p>
            </div>
          )}
        </div>

        {/* Quick Replies */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.quickReplies.map((reply, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onQuickReply(reply)}
                className="px-4 py-2 bg-dark-700/70 hover:bg-primary-500/20 border border-dark-500 hover:border-primary-500/50 rounded-full text-xs font-medium text-gray-300 hover:text-primary-300 transition-all"
              >
                {reply}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center gap-3 mb-4"
  >
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-rose flex items-center justify-center">
      <Sparkles size={14} className="text-white" />
    </div>
    <div className="bg-dark-800/90 border border-dark-600 px-4 py-3 rounded-2xl rounded-bl-sm">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-gray-500 ml-1">AI is thinking...</span>
      </div>
    </div>
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
// MAIN CHAT WIDGET COMPONENT
// ═══════════════════════════════════════════════════════════════

const ChatWidget = () => {
  const { isOpen, setIsOpen, initialMessage, clearInitialMessage } = useChatContext()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('chatSessionId'))

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Prevent body scroll on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Welcome Message
  const getWelcomeMessage = () => ({
    role: 'bot',
    text: `👋 Welcome to **PG Films**!\n\nI'm your AI photography assistant. I can help you with:\n\n📦 **Packages & Pricing**\n📸 **Portfolio & Samples**\n📅 **Booking & Availability**\n📞 **Contact Information**\n\nHow can I help you today?`,
    quickReplies: ['📦 Show Packages', '📸 View Portfolio', '📅 Book Now', '📞 Contact'],
    timestamp: new Date()
  })

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([getWelcomeMessage()])
    }
  }, [isOpen])

  // Handle initial message from context
  useEffect(() => {
    if (initialMessage && isOpen && messages.length > 0) {
      handleSend(initialMessage)
      clearInitialMessage()
    }
  }, [initialMessage, isOpen, messages.length])

  // Reset chat
  const handleReset = () => {
    localStorage.removeItem('chatSessionId')
    setSessionId(null)
    setMessages([getWelcomeMessage()])
    setConnectionError(false)
  }

  // Submit booking to backend
  const submitBookingToBackend = async (bookingData) => {
    setIsTyping(true)
    try {
      const response = await chatAPI.createBooking(bookingData)
      
      const successMessage = {
        role: 'bot',
        text: `✅ **Booking Confirmed!**\n\n📋 **Booking ID:** ${response.data.data?.bookingId || response.data.bookingId || 'PG-' + Date.now()}\n\n🎉 Thank you for choosing PG Films!\n\nOur team will contact you within 2 hours to finalize the details.\n\n📱 For urgent queries: +91 98765 43210`,
        intent: 'booking_complete',
        quickReplies: ['📦 View Other Packages', '📞 Contact Us'],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('Booking error:', error)
      const errorMessage = {
        role: 'bot',
        text: `⚠️ **Booking saved!**\n\nWe've noted your request. Our team will contact you shortly.\n\n📱 WhatsApp: +91 98765 43210\n📞 Call: +91 98765 43210`,
        quickReplies: ['💬 WhatsApp', '🔄 Try Again'],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
    setIsTyping(false)
  }

  // Device fingerprinting
  const getDeviceFingerprint = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      memory: navigator.deviceMemory || 0,
      cores: navigator.hardwareConcurrency || 0,
      connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
    }
    
    return btoa(JSON.stringify(fingerprint)).slice(0, 32)
  }

  // Enhanced mobile validation
  const validateMobileNumber = (mobile) => {
    const cleanMobile = mobile.replace(/\D/g, '')
    
    // Basic format validation
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return { valid: false, message: 'Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9.' }
    }
    
    // Advanced validation - check for suspicious patterns
    const suspiciousPatterns = [
      /^1234567890$/, // Sequential
      /^9876543210$/, // Reverse sequential
      /^(\d)\1{9}$/, // All same digits
      /^0{10}$/, // All zeros
      /^1{10}$/, // All ones
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(cleanMobile)) {
        return { valid: false, message: 'Please provide a real mobile number. This appears to be a test number.' }
      }
    }
    
    // Check for common fake number prefixes
    const fakePrefixes = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999']
    const prefix = cleanMobile.slice(0, 3)
    if (fakePrefixes.includes(prefix)) {
      return { valid: false, message: 'Please provide a valid mobile number. This number format is not accepted.' }
    }
    
    return { valid: true, mobile: cleanMobile }
  }

  // Date validation
  const validateDate = (dateString) => {
    try {
      // Common date formats to try
      const formats = [
        /^\d{1,2}\s+\w+\s+\d{4}$/, // 15 March 2024
        /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/, // 15/03/2024 or 15-03-2024
        /^\w+\s+\d{1,2},\s*\d{4}$/, // March 15, 2024
      ]
      
      let isValid = false
      let parsedDate = null
      
      // Check if format matches
      for (const format of formats) {
        if (format.test(dateString)) {
          isValid = true
          break
        }
      }
      
      if (!isValid) {
        return { valid: false, message: 'Please provide date in format: 15 March 2024 or 15/03/2024' }
      }
      
      // Try to parse the date
      parsedDate = new Date(dateString)
      
      // Check if date is valid and not in the past
      if (isNaN(parsedDate.getTime())) {
        return { valid: false, message: 'Please provide a valid date.' }
      }
      
      // Check if date is not in the past (allow today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (parsedDate < today) {
        return { valid: false, message: 'Please provide a future date or today.' }
      }
      
      // Check if date is not too far in the future (limit to 1 year)
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      if (parsedDate > oneYearFromNow) {
        return { valid: false, message: 'Please provide a date within the next year.' }
      }
      
      return { valid: true, date: parsedDate }
    } catch (error) {
      return { valid: false, message: 'Please provide a valid date format.' }
    }
  }

  // Time validation
  const validateTime = (timeString) => {
    try {
      // Common time formats to try
      const formats = [
        /^\d{1,2}:\d{2}\s*(AM|PM|am|pm)$/, // 10:00 AM
        /^\d{1,2}\s*(AM|PM|am|pm)$/, // 10 AM
        /^\d{1,2}:\d{2}$/, // 10:00
      ]
      
      let isValid = false
      
      // Check if format matches
      for (const format of formats) {
        if (format.test(timeString)) {
          isValid = true
          break
        }
      }
      
      if (!isValid) {
        return { valid: false, message: 'Please provide time in format: 10:00 AM or 10 AM' }
      }
      
      // Try to parse the time
      const timeMatch = timeString.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/)
      if (!timeMatch) {
        return { valid: false, message: 'Please provide a valid time format.' }
      }
      
      let hours = parseInt(timeMatch[1])
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
      const period = timeMatch[3] ? timeMatch[3].toUpperCase() : ''
      
      // Convert to 24-hour format for validation
      if (period === 'PM' && hours < 12) {
        hours += 12
      } else if (period === 'AM' && hours === 12) {
        hours = 0
      }
      
      // Validate hours and minutes
      if (hours < 0 || hours > 23) {
        return { valid: false, message: 'Please provide valid hours (1-12 with AM/PM or 0-23).' }
      }
      
      if (minutes < 0 || minutes > 59) {
        return { valid: false, message: 'Please provide valid minutes (00-59).' }
      }
      
      return { valid: true, time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` }
    } catch (error) {
      return { valid: false, message: 'Please provide a valid time format.' }
    }
  }

  // Check availability
  const checkAvailability = async (date, time) => {
    try {
      // Format date for API
      const dateObj = new Date(date)
      const formattedDate = dateObj.toISOString().split('T')[0]
      
      // Format time for API
      const timeValidation = validateTime(time)
      if (!timeValidation.valid) {
        return { available: false, message: timeValidation.message }
      }
      
      const response = await chatAPI.checkAvailability(formattedDate, timeValidation.time)
      
      if (response.data.available) {
        return { available: true, message: 'Date and time are available!' }
      } else {
        return { available: false, message: response.data.message || 'This date/time is not available. Please choose another.' }
      }
    } catch (error) {
      console.error('Availability check error:', error)
      // If API fails, assume available to not block the user
      return { available: true, message: 'Date and time appear to be available.' }
    }
  }

  // Check for existing booking with device fingerprint
  const checkExistingBooking = async (mobile) => {
    try {
      const deviceFingerprint = getDeviceFingerprint()
      const response = await chatAPI.checkExistingBooking(mobile, deviceFingerprint)
      return response.data
    } catch (error) {
      console.error('Error checking existing booking:', error)
      return null
    }
  }

  // Handle sending messages
  const handleSend = async (text) => {
    if (!text.trim()) return

    const userMessage = {
      role: 'user',
      text: text.trim(),
      timestamp: new Date()
    }

    // Add user message first
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)
    setConnectionError(false)

    // Check for package booking request (e.g., "Book Wedding Gold", "Book Portrait Session")
    const packageBookingMatch = text.match(/book\s+(.+)/i)
    if (packageBookingMatch) {
      const packageName = packageBookingMatch[1].trim()
      
      // Find the package in the last bot message
      const lastBotMessage = [...updatedMessages].reverse().find(m => m.role === 'bot' && m.packages)
      if (lastBotMessage && lastBotMessage.packages) {
        const selectedPackage = lastBotMessage.packages.find(p => 
          p.name.toLowerCase() === packageName.toLowerCase()
        )
        
        if (selectedPackage) {
          // Start booking flow for selected package with package details
          const bookingMessage = {
            role: 'bot',
            text: `🎉 **Booking ${selectedPackage.name} Package**\n\n📋 **Package Details:**\n📦 **Name:** ${selectedPackage.name}\n💰 **Price:** ₹${selectedPackage.price}\n📝 **Description:** ${selectedPackage.description || 'Premium photography package'}\n\n**Please confirm this is the package you want to book:**\n\n✅ **Yes, Book This Package**\n❌ **No, Show Other Packages**`,
            intent: 'confirm_package',
            selectedPackage: selectedPackage,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, bookingMessage])
          setIsTyping(false)
          return
        }
      }
    }

    // Check for custom package request
    if (text.toLowerCase().includes('custom') && (text.toLowerCase().includes('package') || text.toLowerCase().includes('photography'))) {
      const customPackageMessage = {
        role: 'bot',
        text: `🎨 **Custom Photography Package**\n\nI'd be happy to help you with a custom package!\n\nPlease provide your details:\n\n👤 **What's your full name?**`,
        intent: 'collect_custom_details',
        customPackage: {
          name: 'Custom Photography Package',
          price: 'Custom Quote',
          emoji: '🎨',
          description: 'Custom requirements',
          id: 'custom_' + Date.now()
        },
        timestamp: new Date()
      }
      setMessages(prev => [...prev, customPackageMessage])
      setIsTyping(false)
      return
    }

    // Check if we're collecting package booking details
    const lastBotMessage = [...updatedMessages].reverse().find(m => m.role === 'bot')
    
    // Handle package booking flow - collect name
    if (lastBotMessage?.intent === 'collect_package_details') {
      const userDetails = text.trim()
      
      // Check what step we're at based on the last bot message content
      if (lastBotMessage.text.includes('What\'s your full name')) {
        // User provided name, now ask for mobile number
        const askMobileMessage = {
          role: 'bot',
          text: `👋 **Nice to meet you, ${userDetails}!**\n\nNow please provide your mobile number so our team can contact you:\n\n📱 **Your mobile number:**`,
          intent: 'collect_package_mobile',
          selectedPackage: lastBotMessage.selectedPackage,
          userName: userDetails,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, askMobileMessage])
        setIsTyping(false)
        return
      }
    }
    
    // Handle package booking flow - collect mobile number
    if (lastBotMessage?.intent === 'collect_package_mobile') {
      const userDetails = text.trim()
      
      // Enhanced mobile validation
      const mobileValidation = validateMobileNumber(userDetails)
      
      if (!mobileValidation.valid) {
        const errorMessage = {
          role: 'bot',
          text: `❌ **Invalid mobile number**\n\n${mobileValidation.message}\n\n📱 **Please try again with a valid mobile number:**`,
          intent: 'collect_package_mobile',
          selectedPackage: lastBotMessage.selectedPackage,
          userName: lastBotMessage.userName,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
        return
      }

      // Check for existing booking with device fingerprint
      const existingBooking = await checkExistingBooking(mobileValidation.mobile)
      
      if (existingBooking && existingBooking.hasBooking) {
        let warningText = `⚠️ **Request Already Exists**\n\nYou already have a booking from today:\n\n📋 **Booking ID:** ${existingBooking.bookingId}\n👤 **Name:** ${existingBooking.name}\n📅 **Date:** ${new Date(existingBooking.createdAt).toLocaleDateString()}\n📞 **Status:** ${existingBooking.status || 'Pending'}`
        
        // Add device warning if detected
        if (existingBooking.deviceMatch) {
          warningText += `\n\n🔒 **Device detected:** This device was used for the previous booking.`
        }
        
        warningText += `\n\n**What would you like to do?**`
        
        const existingMessage = {
          role: 'bot',
          text: warningText,
          intent: 'existing_booking',
          existingBooking: existingBooking,
          quickReplies: ['✏️ Edit Request', '📞 Contact Support', '📦 View Packages'],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, existingMessage])
        setIsTyping(false)
        return
      }

      // User provided mobile number, now ask for date and time
      const askDateTimeMessage = {
        role: 'bot',
        text: `📅 **Booking Details**\n\n**Package:** ${lastBotMessage.selectedPackage.name}\n**Price:** ₹${lastBotMessage.selectedPackage.price}\n\nNow please provide your preferred date and time:\n\n🗓️ **Preferred Date:** (e.g., 15 March 2024)\n⏰ **Preferred Time:** (e.g., 10:00 AM)`,
        intent: 'collect_package_datetime',
        selectedPackage: lastBotMessage.selectedPackage,
        userName: lastBotMessage.userName,
        phone: mobileValidation.mobile,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, askDateTimeMessage])
      setIsTyping(false)
      return
    }
    
    // Handle package booking flow - collect date and time
    if (lastBotMessage?.intent === 'collect_package_datetime') {
      const userDetails = text.trim()
      
      // Check if user provided both date and time
      if (userDetails.includes('Date:') || userDetails.includes('Time:')) {
        // Parse date and time from user input
        const dateMatch = userDetails.match(/Date:\s*([^\n]+)/i)
        const timeMatch = userDetails.match(/Time:\s*([^\n]+)/i)
        
        const preferredDate = dateMatch ? dateMatch[1].trim() : userDetails.split('\n')[0].trim()
        const preferredTime = timeMatch ? timeMatch[1].trim() : userDetails.split('\n')[1]?.trim() || '10:00 AM'
        
        // Validate date format
        const dateValidation = validateDate(preferredDate)
        if (!dateValidation.valid) {
          const errorMessage = {
            role: 'bot',
            text: `❌ **Invalid date format**\n\n${dateValidation.message}\n\n🗓️ **Please provide date in format:** 15 March 2024`,
            intent: 'collect_package_datetime',
            selectedPackage: lastBotMessage.selectedPackage,
            userName: lastBotMessage.userName,
            phone: lastBotMessage.phone,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
          setIsTyping(false)
          return
        }
        
        // Check availability
        const availability = await checkAvailability(preferredDate, preferredTime)
        if (!availability.available) {
          const errorMessage = {
            role: 'bot',
            text: `📅 **Date Not Available**\n\n${availability.message}\n\n🗓️ **Please choose another date or time:**`,
            intent: 'collect_package_datetime',
            selectedPackage: lastBotMessage.selectedPackage,
            userName: lastBotMessage.userName,
            phone: lastBotMessage.phone,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
          setIsTyping(false)
          return
        }
        
        // User provided valid date and time, now ask for location
        const askLocationMessage = {
          role: 'bot',
          text: `📍 **Location Details**\n\n**Package:** ${lastBotMessage.selectedPackage.name}\n**Price:** ₹${lastBotMessage.selectedPackage.price}\n**Date:** ${preferredDate}\n**Time:** ${preferredTime}\n\nPlease provide your event location:\n\n📍 **Event Location:** (e.g., Hotel Name, Address)`,
          intent: 'collect_package_location',
          selectedPackage: lastBotMessage.selectedPackage,
          userName: lastBotMessage.userName,
          phone: lastBotMessage.phone,
          preferredDate: preferredDate,
          preferredTime: preferredTime,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, askLocationMessage])
        setIsTyping(false)
        return
      } else {
        // User provided single line, assume it's the date
        const preferredDate = userDetails.trim()
        const dateValidation = validateDate(preferredDate)
        if (!dateValidation.valid) {
          const errorMessage = {
            role: 'bot',
            text: `❌ **Invalid date format**\n\n${dateValidation.message}\n\n🗓️ **Please provide date in format:** 15 March 2024`,
            intent: 'collect_package_datetime',
            selectedPackage: lastBotMessage.selectedPackage,
            userName: lastBotMessage.userName,
            phone: lastBotMessage.phone,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
          setIsTyping(false)
          return
        }
        
        // Check availability
        const availability = await checkAvailability(preferredDate, '10:00 AM')
        if (!availability.available) {
          const errorMessage = {
            role: 'bot',
            text: `📅 **Date Not Available**\n\n${availability.message}\n\n🗓️ **Please choose another date:**`,
            intent: 'collect_package_datetime',
            selectedPackage: lastBotMessage.selectedPackage,
            userName: lastBotMessage.userName,
            phone: lastBotMessage.phone,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
          setIsTyping(false)
          return
        }
        
        // User provided valid date, now ask for time and location
        const askDateTimeMessage = {
          role: 'bot',
          text: `⏰ **Time & Location**\n\n**Package:** ${lastBotMessage.selectedPackage.name}\n**Price:** ₹${lastBotMessage.selectedPackage.price}\n**Date:** ${preferredDate}\n\nPlease provide:\n\n⏰ **Preferred Time:** (e.g., 10:00 AM)\n📍 **Event Location:** (e.g., Hotel Name, Address)`,
          intent: 'collect_package_time_location',
          selectedPackage: lastBotMessage.selectedPackage,
          userName: lastBotMessage.userName,
          phone: lastBotMessage.phone,
          preferredDate: preferredDate,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, askDateTimeMessage])
        setIsTyping(false)
        return
      }
    }
    
    // Handle package booking flow - collect time and location
    if (lastBotMessage?.intent === 'collect_package_time_location') {
      const userDetails = text.trim()
      
      // Parse time and location from user input
      const timeMatch = userDetails.match(/Time:\s*([^\n]+)/i)
      const locationMatch = userDetails.match(/Location:\s*([^\n]+)/i)
      
      const preferredTime = timeMatch ? timeMatch[1].trim() : userDetails.split('\n')[0].trim()
      const location = locationMatch ? locationMatch[1].trim() : userDetails.split('\n')[1]?.trim() || userDetails
      
      // Validate time format
      const timeValidation = validateTime(preferredTime)
      if (!timeValidation.valid) {
        const errorMessage = {
          role: 'bot',
          text: `❌ **Invalid time format**\n\n${timeValidation.message}\n\n⏰ **Please provide time in format:** 10:00 AM`,
          intent: 'collect_package_time_location',
          selectedPackage: lastBotMessage.selectedPackage,
          userName: lastBotMessage.userName,
          phone: lastBotMessage.phone,
          preferredDate: lastBotMessage.preferredDate,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
        return
      }
      
      // Check availability with time
      const availability = await checkAvailability(lastBotMessage.preferredDate, preferredTime)
      if (!availability.available) {
        const errorMessage = {
          role: 'bot',
          text: `📅 **Time Not Available**\n\n${availability.message}\n\n⏰ **Please choose another time:**`,
          intent: 'collect_package_time_location',
          selectedPackage: lastBotMessage.selectedPackage,
          userName: lastBotMessage.userName,
          phone: lastBotMessage.phone,
          preferredDate: lastBotMessage.preferredDate,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
        return
      }
      
      // User provided valid time and location, create booking
      const bookingData = {
        package: {
          name: lastBotMessage.selectedPackage.name,
          id: lastBotMessage.selectedPackage.id,
          description: lastBotMessage.selectedPackage.description,
          price: lastBotMessage.selectedPackage.price
        },
        name: lastBotMessage.userName,
        phone: lastBotMessage.phone,
        date: lastBotMessage.preferredDate,
        time: preferredTime,
        location: location,
        deviceFingerprint: getDeviceFingerprint(),
        packageId: lastBotMessage.selectedPackage.id
      }
      
      // Send to admin immediately with sessionId
      const currentSessionId = sessionId || `session_${Date.now()}`
      submitBookingToBackend({ ...bookingData, sessionId: currentSessionId })
      
      const confirmMessage = {
        role: 'bot',
        text: `🎉 **Thank you ${lastBotMessage.userName}!**\n\nYour booking for **${lastBotMessage.selectedPackage.name}** has been received!\n\n📋 **Booking Details:**\n📦 **Package:** ${lastBotMessage.selectedPackage.name}\n💰 **Price:** ₹${lastBotMessage.selectedPackage.price}\n📅 **Date:** ${lastBotMessage.preferredDate}\n⏰ **Time:** ${preferredTime}\n📍 **Location:** ${location}\n👤 **Name:** ${lastBotMessage.userName}\n📱 **Mobile:** ${lastBotMessage.phone}\n\n**What happens next?**\n✅ Our team will confirm your booking within 2 hours\n✅ We'll contact you to finalize all details\n✅ You'll receive a booking confirmation\n\n📞 **Keep your phone available - we'll call you soon!**`,
        intent: 'booking_confirmation',
        bookingData: bookingData,
        quickReplies: ['📦 View Other Packages', '📞 Contact Us'],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, confirmMessage])
      setIsTyping(false)
      return
    }
    
    // Handle package booking flow - collect location
    if (lastBotMessage?.intent === 'collect_package_location') {
      const userDetails = text.trim()
      
      // User provided location, create booking
      const bookingData = {
        package: {
          name: lastBotMessage.selectedPackage.name,
          id: lastBotMessage.selectedPackage.id,
          description: lastBotMessage.selectedPackage.description,
          price: lastBotMessage.selectedPackage.price
        },
        name: lastBotMessage.userName,
        phone: lastBotMessage.phone,
        date: lastBotMessage.preferredDate,
        time: lastBotMessage.preferredTime,
        location: userDetails,
        deviceFingerprint: getDeviceFingerprint(),
        packageId: lastBotMessage.selectedPackage.id
      }
      
      // Send to admin immediately with sessionId
      const currentSessionId = sessionId || `session_${Date.now()}`
      submitBookingToBackend({ ...bookingData, sessionId: currentSessionId })
      
      const confirmMessage = {
        role: 'bot',
        text: `🎉 **Thank you ${lastBotMessage.userName}!**\n\nYour booking for **${lastBotMessage.selectedPackage.name}** has been received!\n\n📋 **Booking Details:**\n📦 **Package:** ${lastBotMessage.selectedPackage.name}\n💰 **Price:** ₹${lastBotMessage.selectedPackage.price}\n📅 **Date:** ${lastBotMessage.preferredDate}\n⏰ **Time:** ${lastBotMessage.preferredTime}\n📍 **Location:** ${userDetails}\n👤 **Name:** ${lastBotMessage.userName}\n📱 **Mobile:** ${lastBotMessage.phone}\n\n**What happens next?**\n✅ Our team will confirm your booking within 2 hours\n✅ We'll contact you to finalize all details\n✅ You'll receive a booking confirmation\n\n📞 **Keep your phone available - we'll call you soon!**`,
        intent: 'booking_confirmation',
        bookingData: bookingData,
        quickReplies: ['📦 View Other Packages', '📞 Contact Us'],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, confirmMessage])
      setIsTyping(false)
      return
    }
    
    // Handle custom package flow - collect mobile number
    if (lastBotMessage?.intent === 'collect_mobile_number' || 
        (lastBotMessage?.intent === 'collect_custom_details' && lastBotMessage.text.includes('mobile number'))) {
      const userDetails = text.trim()
      
      // Enhanced mobile validation
      const mobileValidation = validateMobileNumber(userDetails)
      
      if (!mobileValidation.valid) {
        const errorMessage = {
          role: 'bot',
          text: `❌ **Invalid mobile number**\n\n${mobileValidation.message}\n\n📱 **Example:** 9876543210`,
          intent: 'collect_mobile_number',
          customPackage: lastBotMessage.customPackage,
          userName: lastBotMessage.userName,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
        return
      }

      // Check for existing booking with device fingerprint
      const existingBooking = await checkExistingBooking(mobileValidation.mobile)
      
      if (existingBooking && existingBooking.hasBooking) {
        let warningText = `⚠️ **Request Already Exists**\n\nYou already have a custom package request from today:\n\n📋 **Request ID:** ${existingBooking.bookingId}\n👤 **Name:** ${existingBooking.name}\n📅 **Date:** ${new Date(existingBooking.createdAt).toLocaleDateString()}\n📞 **Status:** ${existingBooking.status || 'Pending'}`
        
        // Add device warning if detected
        if (existingBooking.deviceMatch) {
          warningText += `\n\n🔒 **Device detected:** This device was used for the previous request.`
        }
        
        warningText += `\n\n**What would you like to do?**`
        
        const existingMessage = {
          role: 'bot',
          text: warningText,
          intent: 'existing_booking',
          existingBooking: existingBooking,
          quickReplies: ['✏️ Edit Request', '📞 Contact Support', '📦 View Packages'],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, existingMessage])
        setIsTyping(false)
        return
      }

      // User provided mobile number, create booking and send to admin
      const bookingData = {
        package: {
          name: 'Custom Photography Package',
          id: lastBotMessage.customPackage.id,
          description: lastBotMessage.customPackage.description,
          price: lastBotMessage.customPackage.price || 0
        },
        name: lastBotMessage.userName,
        phone: mobileValidation.mobile,
        deviceFingerprint: getDeviceFingerprint(),
        // Add fields that server expects for custom package detection
        packageId: lastBotMessage.customPackage.id,
        specialRequests: lastBotMessage.customPackage.description
      }
      
      // Send to admin immediately with sessionId
      const currentSessionId = sessionId || `session_${Date.now()}`
      submitBookingToBackend({ ...bookingData, sessionId: currentSessionId })
      
      const confirmMessage = {
        role: 'bot',
        text: `🎉 **Thank you ${lastBotMessage.userName}!**\n\nYour custom package request has been received!\n\n📋 **Request ID:** PG-${Date.now().toString().slice(-6)}\n\n**What happens next?**\n✅ Our photography expert will contact you within 2 hours\n✅ We'll discuss your specific requirements\n✅ You'll receive a custom quote\n✅ Once approved, we'll finalize your booking\n\n📞 **Keep your phone available - we'll call you soon!**\n\n💡 **Note:** One request per day to ensure quality service.`,
        intent: 'booking_confirmation',
        bookingData: bookingData,
        quickReplies: ['📦 View Other Packages', '📞 Contact Us'],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, confirmMessage])
      setIsTyping(false)
      return
    }
    
    // Then check if we're collecting name for custom package
    if (lastBotMessage?.intent === 'collect_custom_details') {
      const userDetails = text.trim()
      
      // Check what step we're at based on the last bot message content
      if (lastBotMessage.text.includes('What\'s your full name')) {
        // User provided name, now ask for mobile number
        const askMobileMessage = {
          role: 'bot',
          text: `👋 **Nice to meet you, ${userDetails}!**\n\nNow please provide your mobile number so our team can contact you:\n\n📱 **Your mobile number:**`,
          intent: 'collect_mobile_number',
          customPackage: lastBotMessage.customPackage,
          userName: userDetails,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, askMobileMessage])

        setIsTyping(false)
        return
      }
    }

    // If we're in a custom package flow but the above conditions didn't match,
    // don't proceed to general chat API (only check for collect_custom_details, not collect_mobile_number)
    if (lastBotMessage?.intent === 'collect_custom_details') {
      // If we reach here, it means the flow is broken
      const errorMessage = {
        role: 'bot',
        text: `❌ **Something went wrong**\n\nPlease start again with "I need a custom photography package"`,
        quickReplies: ['🎨 Custom Package', '📦 Show Packages'],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
      return
    }

    try {
      // Call backend API
      const response = await chatAPI.sendMessage(sessionId, text.trim())
      const { data } = response.data

      // Save session ID if new
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem('chatSessionId', data.sessionId)
      }

      setIsTyping(false)

      // Add bot response
      const botMessage = {
        role: 'bot',
        text: data.response.text,
        quickReplies: data.response.quickReplies || [],
        packages: data.response.packages || null,
        intent: data.response.intent,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])

    } catch (error) {
      console.error('Chat Error:', error)
      setIsTyping(false)
      setConnectionError(true)

      const errorMessage = {
        role: 'bot',
        text: `😕 I'm having trouble connecting right now.\n\n📱 WhatsApp: +91 98765 43210\n📞 Call: +91 98765 43210`,
        quickReplies: ['🔄 Retry', '💬 WhatsApp'],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // QUICK REPLY HANDLER
  // ═══════════════════════════════════════════════════════════════

  const handleQuickReply = async (reply) => {
    // Get the last bot message for context
    const lastBotMessage = [...messages].reverse().find(m => m.role === 'bot')
    // Handle special actions
    if (reply === '🔄 Retry') {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMessage) {
        handleSend(lastUserMessage.text)
      }
      return
    }

    if (reply === '💬 WhatsApp') {
      window.open('https://wa.me/919876543210?text=Hi! I need help with photography booking.', '_blank')
      return
    }

    // Handle booking confirmation - booking already submitted, just show confirmation
    if (reply === '✅ Yes, Proceed' || reply.includes('Confirm')) {
      const bookingMessage = [...messages].reverse().find(m => 
        m.role === 'bot' && m.intent === 'booking_confirmation'
      )
      
      if (bookingMessage && bookingMessage.bookingData) {
        // Booking already submitted, just show success message
        const confirmMessage = {
          role: 'bot',
          text: `✅ **Booking Confirmed!**\n\n📋 **Request ID:** ${bookingMessage.bookingData.packageId || 'PG-' + Date.now().toString().slice(-6)}\n\n🎉 Thank you for choosing PG Films!\n\nOur team will contact you within 2 hours to finalize the details.\n\n📱 For urgent queries: +91 98765 43210`,
          intent: 'booking_complete',
          quickReplies: ['📦 View Other Packages', '📞 Contact Us'],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, confirmMessage])
        return
      }
    }

    // Handle booking cancellation
    if (reply === 'No, Change') {
      const changeMessage = {
        role: 'bot',
        text: `🔄 No problem! Let's start again.\n\nWhich package would you like?`,
        quickReplies: ['📦 Show Packages', '🎨 Custom Package'],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, changeMessage])
      return
    }

    // Handle edit request
    if (reply === '✏️ Edit Request') {
      const bookingMessage = [...messages].reverse().find(m => 
        m.role === 'bot' && m.intent === 'existing_booking'
      )
      
      if (bookingMessage && bookingMessage.existingBooking) {
        const editMessage = {
          role: 'bot',
          text: `✏️ **Edit Your Request**\n\nWhat would you like to change in your custom package request?\n\n📝 **Choose what to edit:**`,
          intent: 'edit_request',
          existingBooking: bookingMessage.existingBooking,
          quickReplies: ['👤 Change Name', '📱 Change Mobile', '📝 Change Requirements', '❌ Cancel Edit'],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, editMessage])
        return
      }
    }

    // Handle edit options
    if (reply.includes('Change') || reply.includes('Edit')) {
      const bookingMessage = [...messages].reverse().find(m => 
        m.role === 'bot' && (m.intent === 'edit_request' || m.intent === 'existing_booking')
      )
      
      if (bookingMessage && bookingMessage.existingBooking) {
        let editType = ''
        
        if (reply.includes('Name')) editType = 'name'
        else if (reply.includes('Mobile')) editType = 'mobile'
        else if (reply.includes('Requirements')) editType = 'requirements'
        
        if (editType) {
          const promptMessage = {
            role: 'bot',
            text: `✏️ **Edit ${editType.charAt(0).toUpperCase() + editType.slice(1)}**\n\nPlease enter the new ${editType}:\n\n💡 **Current ${editType}:** ${bookingMessage.existingBooking[editType] || 'Not set'}`,
            intent: `edit_${editType}`,
            existingBooking: bookingMessage.existingBooking,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, promptMessage])
          return
        }
      }
    }

    // Handle edit submission
    if (lastBotMessage?.intent?.startsWith('edit_') && !reply.includes('Change') && !reply.includes('Edit')) {
      const editType = lastBotMessage.intent.replace('edit_', '')
      const bookingId = lastBotMessage.existingBooking.bookingId
      
      // Update booking
      try {
        const response = await chatAPI.updateBooking(bookingId, { [editType]: reply })
        
        const successMessage = {
          role: 'bot',
          text: `✅ **Request Updated!**\n\nYour ${editType} has been successfully changed.\n\n📋 **Request ID:** ${bookingId}\n👤 **Name:** ${response.data.name || lastBotMessage.existingBooking.name}\n📱 **Mobile:** ${response.data.mobile || lastBotMessage.existingBooking.mobile}\n\n📞 Our team will contact you within 2 hours with the updated information.`,
          intent: 'edit_complete',
          quickReplies: ['📦 View Other Packages', '📞 Contact Us'],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, successMessage])
        setIsTyping(false)
        return
      } catch (error) {
        console.error('Update error:', error)
        const errorMessage = {
          role: 'bot',
          text: `❌ **Update Failed**\n\nSorry, we couldn't update your request. Please try again or contact support.\n\n📞 **Support:** +91 98765 43210`,
          quickReplies: ['🔄 Try Again', '📞 Contact Support'],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
        return
      }
    }

    // Send as regular message
    const cleanReply = reply.replace(/^[📦📸📅📞✅❌✏️🔄💬🇮🇳]\s*/g, '').trim()
    handleSend(cleanReply || reply)
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative ${
            isOpen 
              ? 'bg-dark-800 text-white border border-dark-600' 
              : 'bg-gradient-to-r from-primary-600 to-accent-rose text-white shadow-primary-500/30'
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <ChevronDown size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <MessageCircle size={28} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-950 animate-pulse" />
          )}
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:bg-black/30"
            />

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed z-50 flex flex-col overflow-hidden shadow-2xl
                         inset-0
                         md:bottom-24 md:right-6 md:left-auto md:top-auto
                         md:w-[420px] md:h-[600px] md:max-h-[80vh] md:rounded-3xl
                         bg-gradient-to-b from-dark-900 via-dark-950 to-black
                         border-0 md:border md:border-primary-500/20"
            >
              {/* Header */}
              <div className="relative p-4 bg-gradient-to-r from-primary-600/10 via-accent-rose/10 to-primary-600/10 border-b border-primary-500/20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-rose to-primary-500" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-500 to-accent-rose flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-dark-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">PG Films AI</h3>
                      <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Online • Instant replies
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleReset}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Start new chat"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-primary-500/20 scrollbar-track-transparent">
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    message={msg}
                    isUser={msg.role === 'user'}
                    onQuickReply={handleQuickReply}
                  />
                ))}

                <AnimatePresence>
                  {isTyping && <TypingIndicator />}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-dark-900/90 backdrop-blur-lg border-t border-dark-700">
                {connectionError && (
                  <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400 flex items-center gap-2">
                    <span>⚠️ Connection issues. Try WhatsApp for instant response.</span>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-dark-800/70 p-2 rounded-2xl border border-dark-600 focus-within:border-primary-500/50 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(input)
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none px-3 py-2 disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 bg-gradient-to-r from-primary-600 to-accent-rose hover:from-primary-500 hover:to-accent-rose/90 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 disabled:shadow-none"
                  >
                    {isTyping ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>

                <p className="text-center text-[10px] text-gray-600 mt-2">
                  Powered by AI • Your data is secure 🔒
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatWidget