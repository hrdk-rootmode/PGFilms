// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - AI Service (Gemini Integration)
// ═══════════════════════════════════════════════════════════════

import { Config } from '../models/index.js'

// ═══════════════════════════════════════════════════════════════
// GEMINI API CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// ═══════════════════════════════════════════════════════════════
// CORE GEMINI API CALL
// ═══════════════════════════════════════════════════════════════

export const callGemini = async (prompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    console.warn('⚠️ Gemini API key not configured')
    return null
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 200,
          topP: options.topP || 0.8,
          topK: options.topK || 40
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Gemini API error:', error)
      return null
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim()
    }

    return null
  } catch (error) {
    console.error('❌ Gemini API call failed:', error.message)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// CHAT RESPONSE (When pattern matching fails)
// ═══════════════════════════════════════════════════════════════

export const getChatResponse = async (userMessage, context = {}) => {
  const filmmakerName = process.env.FILMMAKER_NAME || 'PG Films'
  const phone = process.env.FILMMAKER_PHONE || '+91 98765 43210'
  
  // Get packages for context
  let packagesInfo = ''
  try {
    const packagesConfig = await Config.findOne({ _id: 'packages' })
    if (packagesConfig?.data) {
      packagesInfo = packagesConfig.data
        .filter(p => p.active)
        .map(p => `• ${p.name}: ₹${p.price.toLocaleString()} (${p.duration})`)
        .join('\n')
    }
  } catch (e) {
    packagesInfo = '• Wedding Gold: ₹75,000\n• Portrait: ₹25,000\n• Event: ₹50,000'
  }

  const prompt = `You are a helpful assistant for ${filmmakerName}, a professional photographer/filmmaker.

BUSINESS INFO:
- Name: ${filmmakerName}
- Services: Wedding photography, Portrait sessions, Event coverage, Pre-wedding shoots
- Packages:
${packagesInfo}
- Location: ${process.env.FILMMAKER_LOCATION || 'Gujarat, India'}
- Phone: ${phone}

CONVERSATION CONTEXT:
- User's language: ${context.language || 'English'}
- Previous messages: ${context.conversationHistory || 'None'}

YOUR ROLE:
- Be friendly, professional, and enthusiastic about photography
- Keep responses SHORT (2-3 sentences max)
- If user wants to book, collect: name, event date, location, phone
- If question is unclear, suggest viewing packages or contacting directly
- Use emojis sparingly (1-2 max) 📸
- Respond in the same language the user is using

USER MESSAGE: "${userMessage}"

RESPOND (keep it brief and helpful):`

  const response = await callGemini(prompt, { maxTokens: 150 })
  
  return response || getFallbackResponse(context.language)
}

// ═══════════════════════════════════════════════════════════════
// ABUSE DETECTION
// ═══════════════════════════════════════════════════════════════

export const detectAbuse = async (message) => {
  // First, check against local abuse word list
  try {
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    const abuseWords = patternsConfig?.data?.abuseWords || {}
    
    const lowerMessage = message.toLowerCase()
    
    // Check severe words
    if (abuseWords.severe?.words?.some(word => lowerMessage.includes(word.toLowerCase()))) {
      return { isAbusive: true, type: 'severe', confidence: 1.0, action: 'block' }
    }
    
    // Check moderate words
    if (abuseWords.moderate?.words?.some(word => lowerMessage.includes(word.toLowerCase()))) {
      return { isAbusive: true, type: 'moderate', confidence: 0.9, action: 'mask' }
    }
    
    // Check mild words
    if (abuseWords.mild?.words?.some(word => lowerMessage.includes(word.toLowerCase()))) {
      return { isAbusive: true, type: 'mild', confidence: 0.7, action: 'log' }
    }
  } catch (e) {
    console.error('Error checking local abuse words:', e.message)
  }

  // If local check passes and AI detection is enabled, use Gemini
  try {
    const patternsConfig = await Config.findOne({ _id: 'patterns' })
    const enableAIDetection = patternsConfig?.data?.abuseSettings?.enableAIDetection
    
    if (!enableAIDetection) {
      return { isAbusive: false }
    }
  } catch (e) {
    // Continue with AI check if config unavailable
  }

  const prompt = `Analyze this message for inappropriate content in a photography booking context.

MESSAGE: "${message}"

Check for:
1. Profanity or vulgar language
2. Threats or harassment
3. Spam or promotional content
4. Inappropriate requests

Respond with ONLY a JSON object (no markdown, no code blocks):
{"isAbusive": true/false, "type": "profanity|threat|spam|harassment|none", "confidence": 0.0-1.0, "reason": "brief explanation"}`

  try {
    const response = await callGemini(prompt, { temperature: 0.3, maxTokens: 100 })
    
    if (response) {
      // Clean the response - remove any markdown formatting
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim()
      const result = JSON.parse(cleanedResponse)
      
      return {
        isAbusive: result.isAbusive || false,
        type: result.type || 'none',
        confidence: result.confidence || 0,
        reason: result.reason || '',
        action: result.isAbusive ? (result.confidence > 0.8 ? 'block' : 'mask') : 'none'
      }
    }
  } catch (e) {
    console.error('AI abuse detection error:', e.message)
  }

  return { isAbusive: false }
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ═══════════════════════════════════════════════════════════════

export const detectLanguageAI = async (message) => {
  // First try rule-based detection
  // Devanagari script (Hindi)
  if (/[\u0900-\u097F]/.test(message)) return 'hi'
  
  // Gujarati script
  if (/[\u0A80-\u0AFF]/.test(message)) return 'gu'
  
  // Check for common romanized words
  const hindiWords = ['kya', 'hai', 'kitna', 'kitne', 'chahiye', 'kaise', 'mujhe', 'aap', 'nahi', 'haan']
  const gujaratiWords = ['su', 'che', 'ketla', 'joiye', 'kem', 'nathi', 'haa', 'tamne', 'ame']
  
  const lowerMessage = message.toLowerCase()
  
  const hindiScore = hindiWords.filter(word => lowerMessage.includes(word)).length
  const gujaratiScore = gujaratiWords.filter(word => lowerMessage.includes(word)).length
  
  if (gujaratiScore > hindiScore && gujaratiScore >= 1) return 'gu'
  if (hindiScore > gujaratiScore && hindiScore >= 1) return 'hi'
  
  // If still unclear and message is short, use English
  if (message.length < 20) return 'en'
  
  // For longer messages, optionally use AI
  const prompt = `Detect the language of this message. It could be English, Hindi (including romanized Hindi/Hinglish), or Gujarati (including romanized Gujarati).

MESSAGE: "${message}"

Respond with ONLY one of these codes: en, hi, gu`

  try {
    const response = await callGemini(prompt, { temperature: 0.1, maxTokens: 10 })
    
    if (response) {
      const lang = response.toLowerCase().trim()
      if (['en', 'hi', 'gu'].includes(lang)) {
        return lang
      }
    }
  } catch (e) {
    console.error('Language detection error:', e.message)
  }

  return 'en' // Default to English
}

// ═══════════════════════════════════════════════════════════════
// INTENT SUGGESTION (For learning new patterns)
// ═══════════════════════════════════════════════════════════════

export const suggestIntent = async (query) => {
  const prompt = `For a photographer's chatbot, which intent category does this query belong to?

QUERY: "${query}"

AVAILABLE INTENTS:
- greeting: Hello, hi, welcome messages
- pricing: Questions about cost, packages, rates
- portfolio: Requests to see work, photos, videos
- availability: Questions about dates, booking availability
- contact: Requests for phone, email, WhatsApp
- booking: Intent to book/hire services
- thanks: Thank you, goodbye messages

Respond with ONLY the intent name (lowercase, single word):`

  try {
    const response = await callGemini(prompt, { temperature: 0.3, maxTokens: 20 })
    
    if (response) {
      const intent = response.toLowerCase().trim().replace(/[^a-z]/g, '')
      const validIntents = ['greeting', 'pricing', 'portfolio', 'availability', 'contact', 'booking', 'thanks']
      
      if (validIntents.includes(intent)) {
        return intent
      }
    }
  } catch (e) {
    console.error('Intent suggestion error:', e.message)
  }

  return null
}

// ═══════════════════════════════════════════════════════════════
// SMART REPLY (Context-aware responses)
// ═══════════════════════════════════════════════════════════════

export const getSmartReply = async (userMessage, conversationHistory, language = 'en') => {
  const filmmakerName = process.env.FILMMAKER_NAME || 'PG Films'
  
  // Build conversation context
  const historyText = conversationHistory
    .slice(-6) // Last 6 messages
    .map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.text}`)
    .join('\n')

  const languageInstruction = {
    en: 'Respond in English',
    hi: 'Respond in Hindi (you can use Hinglish)',
    gu: 'Respond in Gujarati (you can use Gujarati with English)'
  }

  const prompt = `You are a helpful assistant for ${filmmakerName}, a photographer.

CONVERSATION SO FAR:
${historyText}

USER'S NEW MESSAGE: "${userMessage}"

${languageInstruction[language] || 'Respond in English'}

Instructions:
- Keep response brief (2-3 sentences)
- Be helpful and friendly
- If they want to book, ask for: event date, location, name, phone
- Use 1-2 emojis max

YOUR RESPONSE:`

  try {
    const response = await callGemini(prompt, { maxTokens: 150 })
    return response
  } catch (e) {
    console.error('Smart reply error:', e.message)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK RESPONSES
// ═══════════════════════════════════════════════════════════════

const getFallbackResponse = (language = 'en') => {
  const fallbacks = {
    en: "I'm here to help! 😊 You can ask me about our packages, see our portfolio, or book a session. What would you like to know?",
    hi: "मैं मदद के लिए हूं! 😊 आप पैकेज के बारे में पूछ सकते हैं, पोर्टफोलियो देख सकते हैं, या सेशन बुक कर सकते हैं।",
    gu: "હું મદદ માટે છું! 😊 તમે પેકેજ વિશે પૂછી શકો, પોર્ટફોલિયો જોઈ શકો, અથવા સેશન બુક કરી શકો."
  }
  
  return fallbacks[language] || fallbacks.en
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  callGemini,
  getChatResponse,
  detectAbuse,
  detectLanguageAI,
  suggestIntent,
  getSmartReply
}