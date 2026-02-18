// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Initialize Packages Data
// ═══════════════════════════════════════════════════════════════

import mongoose from 'mongoose'
import { Config } from './src/models/index.js'

const packagesData = [
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

async function initializePackages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pgfilmmaker')
    console.log('✅ Connected to MongoDB')

    // Check if packages config already exists
    const existingConfig = await Config.findOne({ _id: 'packages' })
    
    if (existingConfig) {
      console.log('⚠️ Packages config already exists, updating...')
      existingConfig.data = packagesData
      await existingConfig.save()
      console.log('✅ Packages updated successfully')
    } else {
      console.log('📝 Creating new packages config...')
      const packagesConfig = new Config({
        _id: 'packages',
        type: 'packages',
        data: packagesData
      })
      await packagesConfig.save()
      console.log('✅ Packages created successfully')
    }

    console.log('🎉 Packages initialization complete!')
    console.log('📊 Packages created:', packagesData.length)
    console.log('✨ Popular package:', packagesData.find(p => p.popular)?.name || 'None')

  } catch (error) {
    console.error('❌ Error initializing packages:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the script
initializePackages()