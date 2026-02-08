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

// Load environment variables
dotenv.config()

// Import routes
import publicRoutes from './routes/public.routes.js'
import chatRoutes from './routes/chat.routes.js'
import adminRoutes from './routes/admin.routes.js'

// Import services for cron jobs
import { runDailyCleanup, runAnalyticsAggregation } from './services/admin.service.js'
import { runLearningJob } from './services/chat.service.js'

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Rate limiting - Chat (more lenient)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: { 
    success: false, 
    message: 'Slow down! Too many messages.' 
  }
})

// Rate limiting - Admin (stricter)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { 
    success: false, 
    message: 'Too many admin requests.' 
  }
})

// Apply rate limiters
app.use('/api/public', generalLimiter)
app.use('/api/chat', chatLimiter)
app.use('/api/admin', adminLimiter)

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

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    
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
      console.log('📦 Initializing default data...')
      
      // Import and run seed function
      const { seedDatabase } = await import('./utils/helpers.js')
      await seedDatabase()
      
      console.log('✅ Default data initialized')
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
    console.log('🧹 Running daily cleanup job...')
    try {
      await runDailyCleanup()
      console.log('✅ Daily cleanup completed')
    } catch (error) {
      console.error('❌ Daily cleanup failed:', error.message)
    }
  }, {
    timezone: process.env.TIMEZONE || 'Asia/Kolkata'
  })

  // Analytics aggregation - Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('📊 Running analytics aggregation...')
    try {
      await runAnalyticsAggregation()
      console.log('✅ Analytics aggregation completed')
    } catch (error) {
      console.error('❌ Analytics aggregation failed:', error.message)
    }
  })

  // Learning job - Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('🧠 Running learning job...')
    try {
      await runLearningJob()
      console.log('✅ Learning job completed')
    } catch (error) {
      console.error('❌ Learning job failed:', error.message)
    }
  })

  console.log('⏰ Cron jobs scheduled')
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
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎬 PG FILMMAKER API SERVER                                  ║
║                                                               ║
║   Status:      Running                                        ║
║   Port:        ${PORT}                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                               ║
║   Database:    Connected                                      ║
║                                                               ║
║   Endpoints:                                                  ║
║   • Health:    http://localhost:${PORT}/health                    ║
║   • API:       http://localhost:${PORT}/api                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `)
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