// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Public Routes (No Auth Required)
// ═══════════════════════════════════════════════════════════════

import express from 'express'
import { Config } from '../models/index.js'

const router = express.Router()

// ═══════════════════════════════════════════════════════════════
// GET PACKAGES
// ═══════════════════════════════════════════════════════════════

router.get('/packages', async (req, res) => {
  try {
    const packagesConfig = await Config.findOne({ _id: 'packages' })
    
    const packages = (packagesConfig?.data || [])
      .filter(p => p.active)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        priceFormatted: `₹${p.price.toLocaleString()}`,
        duration: p.duration,
        features: p.features,
        description: p.description,
        emoji: p.emoji,
        popular: p.popular
      }))

    res.json({
      success: true,
      data: packages
    })
  } catch (error) {
    console.error('Get packages error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages'
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// GET FILMMAKER INFO
// ═══════════════════════════════════════════════════════════════

router.get('/info', async (req, res) => {
  try {
    const adminConfig = await Config.findOne({ _id: 'admin' })
    
    const profile = adminConfig?.data?.profile || {}
    const business = adminConfig?.data?.business || {}

    res.json({
      success: true,
      data: {
        name: profile.name || process.env.FILMMAKER_NAME || 'PG Films',
        tagline: profile.tagline || 'Capturing Moments, Creating Memories',
        phone: profile.phone || process.env.FILMMAKER_PHONE,
        email: profile.email || process.env.FILMMAKER_EMAIL,
        whatsapp: profile.whatsapp || process.env.FILMMAKER_WHATSAPP,
        location: profile.location || process.env.FILMMAKER_LOCATION,
        socialLinks: profile.socialLinks || {},
        businessHours: {
          start: business.hoursStart || '09:00',
          end: business.hoursEnd || '21:00'
        },
        languages: business.supportedLanguages || ['en', 'hi', 'gu']
      }
    })
  } catch (error) {
    console.error('Get info error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch info'
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// GET PORTFOLIO (Placeholder - Connect to Instagram later)
// ═══════════════════════════════════════════════════════════════

router.get('/portfolio', async (req, res) => {
  try {
    // TODO: Connect to Instagram API
    // For now, return placeholder data
    
    const portfolio = [
      { id: 1, category: 'wedding', src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', alt: 'Wedding' },
      { id: 2, category: 'portrait', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', alt: 'Portrait' },
      { id: 3, category: 'wedding', src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', alt: 'Wedding' },
      { id: 4, category: 'event', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', alt: 'Event' },
      { id: 5, category: 'prewedding', src: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800', alt: 'Pre-Wedding' },
      { id: 6, category: 'portrait', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', alt: 'Portrait' }
    ]

    res.json({
      success: true,
      data: portfolio,
      source: 'placeholder'
    })
  } catch (error) {
    console.error('Get portfolio error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio'
    })
  }
})

export default router