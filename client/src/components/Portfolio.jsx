import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { PerformanceContext } from '../App'

// ═══════════════════════════════════════════════════════════════
// DEMO PORTFOLIO DATA (Replace with Instagram API later)
// ═══════════════════════════════════════════════════════════════

const portfolioItems = [
  { id: 1, category: 'wedding', src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', alt: 'Wedding Photography' },
  { id: 2, category: 'portrait', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', alt: 'Portrait Session' },
  { id: 3, category: 'wedding', src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', alt: 'Wedding Moments' },
  { id: 4, category: 'event', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', alt: 'Event Coverage' },
  { id: 5, category: 'prewedding', src: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800', alt: 'Pre-Wedding Shoot' },
  { id: 6, category: 'portrait', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', alt: 'Portrait Photography' },
  { id: 7, category: 'wedding', src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', alt: 'Wedding Ceremony' },
  { id: 8, category: 'event', src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', alt: 'Event Highlights' },
  { id: 9, category: 'prewedding', src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800', alt: 'Couple Shoot' },
]

const categories = [
  { id: 'all', label: 'All' },
  { id: 'wedding', label: 'Weddings' },
  { id: 'portrait', label: 'Portraits' },
  { id: 'prewedding', label: 'Pre-Wedding' },
  { id: 'event', label: 'Events' },
]

// ═══════════════════════════════════════════════════════════════
// PORTFOLIO COMPONENT
// ═══════════════════════════════════════════════════════════════

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)
  const { enableAnimations } = useContext(PerformanceContext)

  const filteredItems = activeCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory)

  const handlePrev = () => {
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id)
    const prevIndex = currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1
    setSelectedImage(filteredItems[prevIndex])
  }

  const handleNext = () => {
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id)
    const nextIndex = currentIndex === filteredItems.length - 1 ? 0 : currentIndex + 1
    setSelectedImage(filteredItems[nextIndex])
  }

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(cat => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-primary-500 to-accent-rose text-white'
                : 'bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Image Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: enableAnimations ? 0.3 : 0, delay: enableAnimations ? index * 0.05 : 0 }}
              className="image-hover aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-medium">{item.alt}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>

            {/* Navigation */}
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>

            {/* Image */}
            <motion.img
              key={selectedImage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Caption */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className="text-white font-medium">{selectedImage.alt}</p>
              <p className="text-gray-400 text-sm mt-1">
                {filteredItems.findIndex(item => item.id === selectedImage.id) + 1} / {filteredItems.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Portfolio