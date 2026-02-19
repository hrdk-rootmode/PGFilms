// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Main Server Entry Point
// ═══════════════════════════════════════════════════════════════

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import cron from 'node-cron'
import automationRoutes from './routes/automation.routes.js'
import { sendDailyBriefingEmail } from './services/email.service.js'

// Load environment variables
dotenv.config()

// Import routes
import publicRoutes from './routes/public.routes.js'
import chatRoutes from './routes/chat.routes.js'
import adminRoutes from './routes/admin.routes.js'
import adminAIRoutes from './routes/admin.ai.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import aiRoutes from './routes/ai.routes.js'

// Import services for cron jobs
import { runDailyCleanup, runAnalyticsAggregation } from './services/admin.service.js'
import { 
  processMessage, 
  handleBooking, 
  getConversation, 
  runLearningJob 
} from './services/chat.service.js'

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
// CORS configuration - More permissive for development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:5173',
      'http://localhost:5000', // Add server's own origin
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5000'
    ]
    
    // For development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Version', 'X-Requested-With', 'Accept', 'Origin', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
}))

// Handle preflight requests
app.options('*', cors())

// Automation routes (AI Assistant) - moved after CORS middleware
app.use('/api/automation', automationRoutes)

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static file serving for uploads
app.use('/uploads', express.static('uploads'))

// Rate limiting - General
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

cron.schedule('0 8 * * *', async () => {
  try {
    await sendDailyBriefingEmail()
  } catch (error) {
    console.error('❌ Daily briefing email failed:', error.message)
  }
}, {
  timezone: process.env.TIMEZONE || 'Asia/Kolkata'
})

// Weekly summary - Monday 9:00 AM
cron.schedule('0 9 * * 1', async () => {
  try {
    // Import function when needed
    const { sendWeeklySummaryEmail } = await import('./services/email.service.js')
    await sendWeeklySummaryEmail()
  } catch (error) {
    console.error('❌ Weekly summary email failed:', error.message)
  }
}, {
  timezone: process.env.TIMEZONE || 'Asia/Kolkata'
})

// Rate limiting - Chat (more lenient)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: {
    success: false,
    message: 'Slow down! Too many messages.'
  }
})

// Rate limiting - Admin (more lenient for dashboard)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Increased from 200 to 500 requests per 15 minutes for dashboard
  message: {
    success: false,
    message: 'Too many admin requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Apply rate limiters
app.use('/api/public', generalLimiter)
app.use('/api/chat', chatLimiter)
app.use('/api/admin', adminLimiter)
app.use('/api/automation', generalLimiter)

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// API Routes
app.use('/api/public', publicRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin', adminAIRoutes)
app.use('/api/admin/upload', uploadRoutes)
app.use('/api/ai', aiRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'PG Filmmaker API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      public: '/api/public',
      chat: '/api/chat',
      admin: '/api/admin'
    }
  })
})

// Initialize packages endpoint (for development/testing)
app.post('/api/init/packages', async (req, res) => {
  try {
    const { Config } = await import('./models/index.js')
    
    const packagesData = {
      _id: 'packages',
      type: 'packages',
      data: [
        {
          id: 'pkg-portrait',
          name: 'Portrait Session',
          price: 25000,
          emoji: '📷',
          description: 'Professional portrait photography session',
          duration: '1-2 hours',
          features: [
            'Professional studio setup',
            'High-resolution digital images',
            'Basic retouching included',
            'Print-ready files'
          ],
          image: null,
          popular: false,
          isActive: true,
          order: 1
        },
        {
          id: 'pkg-wedding',
          name: 'Wedding Package',
          price: 75000,
          emoji: '💒',
          description: 'Complete wedding day coverage',
          duration: 'Full day',
          features: [
            'Full day coverage',
            'Professional editing',
            'Prints included',
            'Online gallery access'
          ],
          image: null,
          popular: true,
          isActive: true,
          order: 2
        },
        {
          id: 'pkg-prewedding',
          name: 'Pre-Wedding Shoot',
          price: 35000,
          emoji: '💑',
          description: 'Romantic pre-wedding photoshoot',
          duration: '2-3 hours',
          features: [
            'Location scouting',
            'Professional styling',
            'Multiple outfit changes',
            'Album design'
          ],
          image: null,
          popular: false,
          isActive: true,
          order: 3
        },
        {
          id: 'pkg-event',
          name: 'Event Coverage',
          price: 50000,
          emoji: '🎉',
          description: 'Corporate & personal event coverage',
          duration: '4-6 hours',
          features: [
            'Event documentation',
            'Candid moments',
            'Group photos',
            'Quick delivery'
          ],
          image: null,
          popular: false,
          isActive: true,
          order: 4
        },
        {
          id: 'pkg-maternity',
          name: 'Maternity Shoot',
          price: 20000,
          emoji: '🤰',
          description: 'Beautiful maternity photography',
          duration: '1-2 hours',
          features: [
            'Studio or outdoor',
            'Multiple poses',
            'Family included',
            'Digital delivery'
          ],
          image: null,
          popular: false,
          isActive: true,
          order: 5
        },
        {
          id: 'pkg-baby',
          name: 'Baby Shoot',
          price: 15000,
          emoji: '👶',
          description: 'Newborn & baby photography',
          duration: '1-2 hours',
          features: [
            'Safe handling',
            'Props included',
            'Family photos',
            'High-quality prints'
          ],
          image: null,
          popular: false,
          isActive: true,
          order: 6
        }
      ]
    }

    const existingConfig = await Config.findOne({ _id: 'packages' })
    
    if (existingConfig) {
      existingConfig.data = packagesData.data
      await existingConfig.save()
      res.json({ success: true, message: 'Packages updated successfully' })
    } else {
      const packagesConfig = new Config(packagesData)
      await packagesConfig.save()
      res.json({ success: true, message: 'Packages created successfully' })
    }
  } catch (error) {
    console.error('❌ Init packages error:', error)
    res.status(500).json({ success: false, message: 'Failed to initialize packages' })
  }
})

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// ═══════════════════════════════════════════════════════════════
// DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+
      // But keeping for compatibility
    })

    // Initialize default data if needed
    await initializeDefaultData()

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message)
    process.exit(1)
  }
}

// Initialize default data (admin, packages, patterns)
const initializeDefaultData = async () => {
  try {
    const { Config } = await import('./models/index.js')

    // Check if admin exists
    const adminExists = await Config.findOne({ _id: 'admin' })

    if (!adminExists) {

      // Import and run seed function
      const { seedDatabase } = await import('./utils/helpers.js')
      await seedDatabase()

    }
  } catch (error) {
    console.error('⚠️ Error initializing default data:', error.message)
  }
}

// ═══════════════════════════════════════════════════════════════
// CRON JOBS (Scheduled Tasks)
// ═══════════════════════════════════════════════════════════════

const setupCronJobs = () => {
  // Daily cleanup - Run at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await runDailyCleanup()
    } catch (error) {
      console.error('❌ Daily cleanup failed:', error.message)
    }
  }, {
    timezone: process.env.TIMEZONE || 'Asia/Kolkata'
  })

  // Analytics aggregation - Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await runAnalyticsAggregation()
    } catch (error) {
      console.error('❌ Analytics aggregation failed:', error.message)
    }
  })

  // Learning job - Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      await runLearningJob()
    } catch (error) {
      console.error('❌ Learning job failed:', error.message)
    }
  })

}

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

const startServer = async () => {
  try {
    // Connect to database
    await connectDB()

    // Setup cron jobs
    setupCronJobs()

    // Start listening
    app.listen(PORT, () => {
      // Server started successfully
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

// Start the server
startServer()

export default app