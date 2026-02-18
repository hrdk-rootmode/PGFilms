// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - AI Service (Gemini Integration)
// VERSION: 2.0 - Robust Hybrid Fallback System
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent'

// Error types for proper handling
export const AI_ERROR_TYPES = {
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  TIMEOUT: 'TIMEOUT',
  SAFETY_BLOCKED: 'SAFETY_BLOCKED',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_KEY_MISSING: 'API_KEY_MISSING',
  UNKNOWN: 'UNKNOWN'
}

// Track AI availability status
let aiStatus = {
  isAvailable: true,
  lastError: null,
  lastErrorTime: null,
  consecutiveFailures: 0,
  cooldownUntil: null
}

// Abuse word lists (expandable)
const ABUSE_WORDS = {
  profanity: [
    'fuck', 'shit', 'ass', 'damn', 'bitch', 'bastard',
    'gaali', 'gandu', 'chutiya', 'madarchod', 'bhenchod',
    'ગાળ', 'ભડવો', 'गाली', 'भड़वा'
  ],
  threats: [
    'kill', 'die', 'murder', 'attack', 'bomb', 'hurt',
    'मारूंगा', 'मार डालूंगा', 'મારી નાખીશ'
  ],
  spam: [
    'click here', 'free money', 'lottery', 'winner', 'prize',
    'earn money fast', 'work from home', 'bitcoin', 'crypto scam'
  ],
  insults: [
    'scam', 'fake', 'cheat', 'fraud', 'liar', 'thief',
    'idiot', 'stupid', 'dumb', 'fool', 'useless',
    'बेवकूफ', 'मूर्ख', 'ચોર', 'મૂરખ'
  ]
}

// ═══════════════════════════════════════════════════════════════
// AI STATUS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const getAIStatus = () => ({ ...aiStatus })

export const resetAIStatus = () => {
  aiStatus = {
    isAvailable: true,
    lastError: null,
    lastErrorTime: null,
    consecutiveFailures: 0,
    cooldownUntil: null
  }
  console.log('✅ AI status reset')
}

const handleAIFailure = (errorType, message = '') => {
  aiStatus.lastError = errorType
  aiStatus.lastErrorTime = new Date()
  aiStatus.consecutiveFailures++
  
  // If quota exceeded or too many failures, set cooldown
  if (errorType === AI_ERROR_TYPES.QUOTA_EXCEEDED || aiStatus.consecutiveFailures >= 3) {
    const cooldownMinutes = errorType === AI_ERROR_TYPES.QUOTA_EXCEEDED ? 60 : 5
    aiStatus.cooldownUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000)
    aiStatus.isAvailable = false
    console.warn(`⚠️ AI cooldown activated for ${cooldownMinutes} minutes: ${message}`)
  }
}

const handleAISuccess = () => {
  aiStatus.isAvailable = true
  aiStatus.consecutiveFailures = 0
  aiStatus.cooldownUntil = null
}

const isAICoolingDown = () => {
  if (!aiStatus.cooldownUntil) return false
  
  if (new Date() > aiStatus.cooldownUntil) {
    // Cooldown expired, reset
    aiStatus.isAvailable = true
    aiStatus.cooldownUntil = null
    aiStatus.consecutiveFailures = 0
    console.log('✅ AI cooldown expired, resuming service')
    return false
  }
  
  return true
}

// ═══════════════════════════════════════════════════════════════
// GEMINI API CALL (with robust error handling)
// ═══════════════════════════════════════════════════════════════

export const callGemini = async (prompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY
  
  // Check API key
  if (!apiKey) {
    console.error('❌ FATAL: GEMINI_API_KEY is missing in .env file')
    return {
      success: false,
      error: AI_ERROR_TYPES.API_KEY_MISSING,
      data: null
    }
  }

  // Check if AI is cooling down
  if (isAICoolingDown()) {
    const remainingMs = aiStatus.cooldownUntil - new Date()
    const remainingMins = Math.ceil(remainingMs / 60000)
    console.log(`⏳ AI cooling down, ${remainingMins} minutes remaining`)
    return {
      success: false,
      error: AI_ERROR_TYPES.QUOTA_EXCEEDED,
      data: null,
      cooldownRemaining: remainingMins
    }
  }

  try {
    console.log('🤖 Sending request to Gemini...')
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 500,
          topP: 0.9,
          topK: 40
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    })

    clearTimeout(timeout)

    const data = await response.json()

    // Handle HTTP errors
    if (!response.ok) {
      console.error('❌ Gemini API Error:', response.status, JSON.stringify(data, null, 2))
      
      // Specifically handle 429 (quota exceeded)
      if (response.status === 429) {
        handleAIFailure(AI_ERROR_TYPES.QUOTA_EXCEEDED, 'Rate limit exceeded')
        return {
          success: false,
          error: AI_ERROR_TYPES.QUOTA_EXCEEDED,
          data: null
        }
      }
      
      // Handle other errors
      handleAIFailure(AI_ERROR_TYPES.UNKNOWN, `HTTP ${response.status}`)
      return {
        success: false,
        error: AI_ERROR_TYPES.UNKNOWN,
        data: null
      }
    }

    // Parse response
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      
      // Check for blocked content
      if (candidate.finishReason === 'SAFETY') {
        console.warn('⚠️ Gemini blocked response due to safety')
        return {
          success: false,
          error: AI_ERROR_TYPES.SAFETY_BLOCKED,
          data: null
        }
      }
      
      const text = candidate.content?.parts?.[0]?.text?.trim()
      if (text) {
        console.log('✅ Gemini Response:', text.substring(0, 100) + '...')
        handleAISuccess()
        return {
          success: true,
          error: null,
          data: text
        }
      }
    }
    
    console.warn('⚠️ Gemini returned no valid response:', data)
    handleAIFailure(AI_ERROR_TYPES.INVALID_RESPONSE, 'No valid content')
    return {
      success: false,
      error: AI_ERROR_TYPES.INVALID_RESPONSE,
      data: null
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Gemini API timeout (15s)')
      handleAIFailure(AI_ERROR_TYPES.TIMEOUT, 'Request timed out')
      return {
        success: false,
        error: AI_ERROR_TYPES.TIMEOUT,
        data: null
      }
    }
    
    console.error('❌ Network/Server Error calling Gemini:', error.message)
    handleAIFailure(AI_ERROR_TYPES.NETWORK_ERROR, error.message)
    return {
      success: false,
      error: AI_ERROR_TYPES.NETWORK_ERROR,
      data: null
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SMART BOOKING DATA EXTRACTION (AI-Powered)
// ═══════════════════════════════════════════════════════════════

export const extractBookingDetailsAI = async (message, context = {}) => {
  const currentDate = new Date()
  const currentDateStr = currentDate.toISOString().split('T')[0]
  const currentDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
  
  const prompt = `You are a professional booking assistant for a photography business.

**Current Date & Time:**
- Today is: ${currentDay}, ${currentDateStr}
- Current time: ${currentDate.toLocaleTimeString('en-US', { hour12: false })}

**Available Photography Packages:**
- Portrait (₹25,000)
- Wedding (₹75,000)
- Pre-wedding (₹35,000)
- Event (₹50,000)
- Maternity (₹20,000)
- Baby (₹15,000)

**Current Booking State (what we already know):**
${JSON.stringify(context, null, 2)}

**User's Message:**
"${message}"

**Your Task:**
Extract booking information from the user's message. Handle natural language, Hinglish, dates like "tomorrow", "next friday", "kal", "parso", etc.

**Output STRICT JSON format (no extra text, no markdown):**
{
  "name": "full name or null",
  "phone": "10-digit number or null",
  "date": "YYYY-MM-DD format or null",
  "date_formatted": "human readable date or null",
  "time": "HH:MM 24-hour format or null",
  "time_formatted": "human readable time or null",
  "package": "portrait|wedding|prewedding|event|maternity|baby or null",
  "location": "city/venue name or null",
  "intent": "booking|cancel|confirm|change|info|greeting|none",
  "confidence": 0.0 to 1.0
}

**Rules:**
1. If user says "tomorrow", calculate actual date
2. If user says "next friday", calculate the actual date
3. Convert "kal" (Hindi) to tomorrow's date
4. Convert "parso" (Hindi) to day after tomorrow
5. If time is "morning", use "09:00", "afternoon" = "14:00", "evening" = "17:00"
6. Package detection should be flexible (e.g., "shaadi" = wedding, "shadi" = wedding)
7. intent = "confirm" if user says yes/ok/correct/haan/ha during confirmation
8. intent = "change" if user wants to modify something
9. intent = "cancel" if user wants to stop/exit
10. confidence should reflect how certain you are (0.9+ for explicit data, 0.5-0.8 for implied)

**Output JSON only:**`

  try {
    const result = await callGemini(prompt, { 
      temperature: 0.1, // Very low for precision
      maxTokens: 300 
    })
    
    // Check if AI call failed
    if (!result.success) {
      console.warn(`⚠️ AI extraction failed: ${result.error}`)
      return {
        success: false,
        error: result.error,
        data: null,
        usedFallback: false
      }
    }

    // Clean any markdown formatting Gemini might add
    let cleanJson = result.data.trim()
    
    // Remove ```json and ``` if present
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json\n?/g, '')
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```\n?/g, '')
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.replace(/\n?```$/g, '')
    }
    
    const parsed = JSON.parse(cleanJson)
    
    console.log('✅ AI Extracted:', parsed)
    return {
      success: true,
      error: null,
      data: parsed,
      usedFallback: false
    }
    
  } catch (error) {
    console.error('❌ AI Extraction Parse Error:', error.message)
    return {
      success: false,
      error: AI_ERROR_TYPES.INVALID_RESPONSE,
      data: null,
      usedFallback: false
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CHAT RESPONSE (General Conversation)
// ═══════════════════════════════════════════════════════════════

export const getChatResponse = async (userMessage, context = {}) => {
  const filmmakerName = process.env.FILMMAKER_NAME || 'PG Films'
  const filmmakerPhone = process.env.FILMMAKER_PHONE || '+91 98765 43210'
  
  // Determine response language
  const langMap = {
    'en': 'English',
    'hi': 'Hindi',
    'gu': 'Gujarati'
  }
  const responseLang = langMap[context.language] || 'English'
  
  // Build context-aware prompt
  const prompt = `You are ${filmmakerName}'s friendly AI assistant chatbot for a photography business in Gujarat, India.

**Your Personality:**
- Professional yet warm and friendly
- Helpful and patient
- Knowledgeable about photography services
- Speaks naturally, not robotic

**Business Information:**
- Name: ${filmmakerName}
- Location: Gujarat, India
- Phone/WhatsApp: ${filmmakerPhone}
- Services & Pricing:
  • Wedding Photography: ₹75,000
  • Portrait Session: ₹25,000
  • Pre-Wedding Shoot: ₹35,000
  • Event Coverage: ₹50,000
  • Maternity Shoot: ₹20,000
  • Baby Shoot: ₹15,000
- All packages include: Edited photos, Online delivery, Professional equipment

**User's Message:** "${userMessage}"

**Conversation Context:**
${context.conversationHistory ? `Previous messages: ${context.conversationHistory}` : 'New conversation'}

**Instructions:**
1. Respond in ${responseLang} language
2. Keep response SHORT (2-4 sentences max)
3. Be helpful and guide toward booking
4. If user asks about prices, mention relevant packages
5. If user seems interested, encourage them to book or share contact
6. Don't use markdown formatting like ** or ##
7. Use emojis sparingly (1-2 max)
8. If you don't understand, politely ask for clarification
9. Never make up information not provided above

**Your Response:**`

  const result = await callGemini(prompt, {
    temperature: 0.7,
    maxTokens: 300
  })
  
  if (result.success && result.data) {
    return {
      success: true,
      data: result.data
        .replace(/\*\*/g, '')  // Remove markdown bold
        .replace(/##/g, '')    // Remove headers
        .replace(/\n{3,}/g, '\n\n') // Limit newlines
        .trim(),
      error: null
    }
  }
  
  return {
    success: false,
    data: null,
    error: result.error
  }
}

// ═══════════════════════════════════════════════════════════════
// ABUSE DETECTION
// ═══════════════════════════════════════════════════════════════

export const detectAbuse = async (message) => {
  if (!message || typeof message !== 'string') {
    return { isAbusive: false }
  }
  
  const lowerMessage = message.toLowerCase().trim()
  
  // Check each category
  for (const [category, words] of Object.entries(ABUSE_WORDS)) {
    for (const word of words) {
      if (lowerMessage.includes(word.toLowerCase())) {
        console.warn(`⚠️ Abuse detected [${category}]: "${word}" in message`)
        
        // Determine action based on severity
        let action = 'mask'
        if (category === 'threats') {
          action = 'block'
        } else if (category === 'profanity' && words.indexOf(word) < 6) {
          action = 'block'
        }
        
        return {
          isAbusive: true,
          type: category,
          word: word,
          action: action,
          severity: action === 'block' ? 'high' : 'medium'
        }
      }
    }
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{5,}/,  // Repeated characters
    /\b\d{10,}\b/g,  // Long number strings
    /(https?:\/\/[^\s]+){2,}/g  // Multiple URLs
  ]
  
  for (const pattern of spamPatterns) {
    if (pattern.test(lowerMessage)) {
      return {
        isAbusive: true,
        type: 'spam',
        action: 'warn',
        severity: 'low'
      }
    }
  }
  
  // Check message length
  if (message.length > 1000) {
    return {
      isAbusive: true,
      type: 'spam',
      action: 'warn',
      severity: 'low'
    }
  }
  
  return { isAbusive: false }
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ═══════════════════════════════════════════════════════════════

export const detectLanguageAI = async (message) => {
  if (!message) return 'en'
  
  // Hindi Unicode range
  if (/[\u0900-\u097F]/.test(message)) return 'hi'
  
  // Gujarati Unicode range
  if (/[\u0A80-\u0AFF]/.test(message)) return 'gu'
  
  // Check for common Gujarati words in Roman script
  const gujaratiWords = [
    'kem', 'cho', 'su', 'che', 'nathi', 'haan', 'na', 'tamne', 
    'mane', 'aapne', 'ketla', 'kyare', 'kya', 'joiye', 'karvu'
  ]
  const lowerMsg = message.toLowerCase()
  if (gujaratiWords.some(w => lowerMsg.includes(w))) {
    return 'gu'
  }
  
  // Check for common Hindi words in Roman script
  const hindiWords = [
    'kya', 'hai', 'haan', 'nahi', 'kitna', 'kab', 'kaise', 
    'chahiye', 'dijiye', 'batao', 'bolo', 'acha', 'theek'
  ]
  if (hindiWords.some(w => lowerMsg.includes(w))) {
    return 'hi'
  }
  
  return 'en'
}

// ═══════════════════════════════════════════════════════════════
// INTENT SUGGESTION
// ═══════════════════════════════════════════════════════════════

export const suggestIntent = async (message) => {
  if (!message) return null
  
  const lowerMsg = message.toLowerCase()
  
  const intentPatterns = [
    { pattern: /book|reserve|want|need|interest/i, intent: 'booking' },
    { pattern: /price|cost|rate|charge|kitna|ketla/i, intent: 'showPackages' },
    { pattern: /portfolio|sample|work|photo|gallery/i, intent: 'showPortfolio' },
    { pattern: /contact|phone|call|whatsapp|number/i, intent: 'showContact' },
    { pattern: /available|date|free|slot/i, intent: 'checkAvailability' },
    { pattern: /thank|thanks|dhanyavad/i, intent: 'thankYou' },
    { pattern: /hi|hello|hey|namaste/i, intent: 'greeting' }
  ]
  
  for (const { pattern, intent } of intentPatterns) {
    if (pattern.test(lowerMsg)) {
      return intent
    }
  }
  
  return null
}

// ═══════════════════════════════════════════════════════════════
// SMART REPLY SUGGESTIONS
// ═══════════════════════════════════════════════════════════════

export const getSmartReply = async (message, context = {}) => {
  const lowerMsg = message.toLowerCase()
  
  if (/price|package|cost/i.test(lowerMsg)) {
    return ['Book Now', 'View Portfolio', 'Contact Us']
  }
  
  if (/book|reserve/i.test(lowerMsg)) {
    return ['Portrait ₹25k', 'Wedding ₹75k', 'Contact Us']
  }
  
  if (/portfolio|sample/i.test(lowerMsg)) {
    return ['Show Packages', 'Book Now', 'Contact']
  }
  
  return ['Show Packages', 'View Portfolio', 'Book Now', 'Contact']
}

// ═══════════════════════════════════════════════════════════════
// SENTIMENT ANALYSIS
// ═══════════════════════════════════════════════════════════════

export const analyzeSentiment = (message) => {
  if (!message) return 'neutral'
  
  const lowerMsg = message.toLowerCase()
  
  const positiveWords = [
    'great', 'good', 'nice', 'love', 'awesome', 'beautiful', 'perfect',
    'thanks', 'thank', 'excellent', 'amazing', 'wonderful', 'best',
    'सुंदर', 'अच्छा', 'बढ़िया', 'સરસ', 'સુંદર', 'મસ્ત'
  ]
  
  const negativeWords = [
    'bad', 'poor', 'terrible', 'worst', 'hate', 'awful', 'expensive',
    'slow', 'boring', 'disappointed', 'waste', 'problem',
    'बुरा', 'खराब', 'ખરાબ', 'મોંઘું'
  ]
  
  let score = 0
  
  for (const word of positiveWords) {
    if (lowerMsg.includes(word)) score++
  }
  
  for (const word of negativeWords) {
    if (lowerMsg.includes(word)) score--
  }
  
  if (score > 0) return 'positive'
  if (score < 0) return 'negative'
  return 'neutral'
}

// ═══════════════════════════════════════════════════════════════
// NAMED EXPORTS (for ES modules)
// ═══════════════════════════════════════════════════════════════

export default {
  AI_ERROR_TYPES,
  getAIStatus,
  resetAIStatus,
  callGemini,
  extractBookingDetailsAI,
  getChatResponse,
  detectAbuse,
  detectLanguageAI,
  suggestIntent,
  getSmartReply,
  analyzeSentiment
}