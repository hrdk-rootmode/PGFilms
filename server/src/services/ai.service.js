import axios from 'axios';

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
  }

  async generateTodoTemplates(topic, processType) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = this.buildPrompt(topic, processType);
    
    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      return this.parseResponse(content, processType);
    } catch (error) {
      console.error('Error generating AI templates:', error);
      throw new Error('Failed to generate AI templates');
    }
  }

  buildPrompt(topic, processType) {
    const basePrompt = `Generate a professional todo list template for: "${topic}"`;
    
    if (processType === 'subprocess') {
      return `${basePrompt}

Please provide 2-3 main tasks with 2-3 subtasks each. Use this exact JSON format:

{
  "templates": [
    {
      "text": "Main task description",
      "priority": "high|medium|low",
      "category": "work|personal|health|finance|learning|family",
      "subtasks": [
        {
          "text": "Subtask description"
        }
      ]
    }
  ]
}

Requirements:
- Each template should be actionable and specific
- Priorities should be realistic (mix of high, medium, low)
- Categories should be relevant to the topic
- Subtasks should be detailed and achievable
- Return ONLY the JSON, no additional text`;
    } else {
      return `${basePrompt}

Please provide 1 comprehensive task template. Use this exact JSON format:

{
  "templates": [
    {
      "text": "Task description",
      "priority": "high|medium|low",
      "category": "work|personal|health|finance|learning|family",
      "subtasks": [
        {
          "text": "Subtask description"
        }
      ]
    }
  ]
}

Requirements:
- Task should be actionable and specific
- Priority should be realistic
- Category should be relevant to the topic
- Include 2-3 detailed subtasks
- Return ONLY the JSON, no additional text`;
    }
  }

  parseResponse(content, processType) {
    try {
      // Extract JSON from response (handle cases where AI includes markdown or additional text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      if (!parsed.templates || !Array.isArray(parsed.templates)) {
        throw new Error('Invalid template structure');
      }

      return parsed.templates.map(template => ({
        text: template.text || 'Untitled Task',
        priority: this.validatePriority(template.priority),
        category: this.validateCategory(template.category),
        subtasks: this.validateSubtasks(template.subtasks)
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  validatePriority(priority) {
    const validPriorities = ['high', 'medium', 'low'];
    return validPriorities.includes(priority) ? priority : 'medium';
  }

  validateCategory(category) {
    const validCategories = ['work', 'personal', 'health', 'finance', 'learning', 'family'];
    return validCategories.includes(category) ? category : 'work';
  }

  validateSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) return [];
    
    return subtasks
      .filter(st => st && st.text && st.text.trim())
      .map(st => ({ text: st.text.trim() }))
      .slice(0, 5); // Limit to 5 subtasks max
  }

  async analyzeTaskComplexity(taskText) {
    if (!this.apiKey) {
      return { complexity: 'medium', estimatedTime: '2 hours' };
    }

    const prompt = `Analyze this task for complexity and time estimation:

Task: "${taskText}"

Provide analysis in this JSON format:
{
  "complexity": "simple|medium|complex",
  "estimatedTime": "time estimate",
  "breakdown": ["key steps"],
  "recommendations": "suggestions"
}

Return ONLY the JSON.`;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { complexity: 'medium', estimatedTime: '2 hours' };
    } catch (error) {
      console.error('Error analyzing task complexity:', error);
      return { complexity: 'medium', estimatedTime: '2 hours' };
    }
  }

  async generateTaskSuggestions(category, priority) {
    if (!this.apiKey) {
      return [];
    }

    const prompt = `Generate 3-5 task suggestions for category: "${category}" with priority: "${priority}".

Use this JSON format:
{
  "suggestions": [
    {
      "text": "Task suggestion",
      "subtasks": ["subtask 1", "subtask 2"]
    }
  ]
}

Return ONLY JSON.`;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.suggestions || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      return [];
    }
  }

  async extractBookingDetailsAI(message, context = {}) {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API_KEY_MISSING',
        data: null
      };
    }

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
Extract booking information from user's message. Handle natural language, Hinglish, dates like "tomorrow", "next friday", "kal", "parso", etc.

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
2. If user says "next friday", calculate actual date
3. Convert "kal" (Hindi) to tomorrow's date
4. Convert "parso" (Hindi) to day after tomorrow
5. If time is "morning", use "09:00", "afternoon" = "14:00", "evening" = "17:00"
6. Package detection should be flexible (e.g., "shaadi" = wedding, "shadi" = wedding)
7. intent = "confirm" if user says yes/ok/correct/haan/ha during confirmation
8. intent = "change" if user wants to modify something
9. intent = "cancel" if user wants to stop/exit
10. confidence should reflect how certain you are (0.9+ for explicit data, 0.5-0.8 for implied)

**Output JSON only:**`;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      
      // Clean any markdown formatting Gemini might add
      let cleanJson = content.trim();
      
      // Remove ```json and ``` if present
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/```json\n?/g, '');
      }
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/```\n?/g, '');
      }
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.replace(/\n?```$/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      
      return {
        success: true,
        error: null,
        data: parsed
      };
      
    } catch (error) {
      console.error('❌ AI Extraction Parse Error:', error.message);
      return {
        success: false,
        error: 'INVALID_RESPONSE',
        data: null
      };
    }
  }

  async getChatResponse(userMessage, context = {}) {
    const filmmakerName = process.env.FILMMAKER_NAME || 'PG Films';
    const filmmakerPhone = process.env.FILMMAKER_PHONE || '+91 98765 43210';
    
    // Determine response language
    const langMap = {
      'en': 'English',
      'hi': 'Hindi',
      'gu': 'Gujarati'
    }
    const responseLang = langMap[context.language] || 'English';
    
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

**Your Response:**`;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const content = response.data.candidates[0].content.parts[0].text;
      return {
        success: true,
        data: content
          .replace(/\*\*/g, '')  // Remove markdown bold
          .replace(/##/g, '')    // Remove headers
          .replace(/\n{3,}/g, '\n\n') // Limit newlines
          .trim()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }
}

export default new AIService();