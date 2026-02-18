import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  Crown,
  ArrowRight,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Camera,
  Video,
  Users,
  FileText,
  Settings,
  Sparkles,
  BadgeCheck,
  Calendar,
  Ruler,
  Palette,
  Heart,
  Sparkle
} from 'lucide-react'

const PackageCard = ({ 
  pkg, 
  index, 
  onSelect, 
  onUpdate, 
  onDelete, 
  isEditable = false,
  darkMode = false 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: pkg.name || '',
    price: pkg.price || '',
    description: pkg.description || '',
    emoji: pkg.emoji || '📸',
    features: pkg.features || [''],
    popular: pkg.popular || false,
    isActive: pkg.isActive !== false, // Default to true if undefined
    imageUrl: pkg.imageUrl || ''
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  const isPopular = pkg.popular

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', file)
      formData.append('packageId', pkg.id)

      // Upload image - you'll need to implement this API endpoint
      const response = await fetch('/api/upload-package-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setEditData(prev => ({
          ...prev,
          imageUrl: result.imageUrl
        }))
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    try {
      console.log('💾 PackageCard - Saving package data:', editData)
      console.log('💾 PackageCard - Original package:', pkg)
      
      // Ensure all fields are properly included in the update
      const updateData = {
        name: editData.name || pkg.name,
        price: editData.price || pkg.price,
        description: editData.description || pkg.description,
        emoji: editData.emoji || pkg.emoji,
        features: editData.features || pkg.features,
        popular: editData.popular !== undefined ? editData.popular : pkg.popular,
        isActive: editData.isActive !== undefined ? editData.isActive : pkg.isActive,
        imageUrl: editData.imageUrl || pkg.imageUrl
      }
      
      console.log('💾 PackageCard - Final update data:', updateData)
      
      await onUpdate(pkg.id, updateData)
      setIsEditing(false)
      
      console.log('✅ PackageCard - Package saved successfully')
    } catch (error) {
      console.error('❌ Update failed:', error)
      alert('Failed to update package')
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${pkg.name}" package?`)) {
      try {
        await onDelete(pkg.id)
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Failed to delete package')
      }
    }
  }

  const handleCancel = () => {
    setEditData(pkg)
    setIsEditing(false)
  }

  const addFeature = () => {
    setEditData(prev => ({
      ...prev,
      features: [...prev.features, 'New feature']
    }))
  }

  const updateFeature = (idx, value) => {
    setEditData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === idx ? value : f)
    }))
  }

  const removeFeature = (idx) => {
    setEditData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }))
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        className={`
          relative rounded-2xl overflow-hidden transition-all duration-300
          ${isPopular ? 'ring-2 ring-primary-500/50' : ''}
          ${!isEditable && pkg.isActive === false ? 'opacity-60 grayscale' : ''}
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          ${isEditable ? 'shadow-xl hover:shadow-2xl' : 'shadow-lg hover:shadow-xl'}
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Edit Package
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Save"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Name
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Price
              </label>
              <input
                type="text"
                value={editData.price}
                onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          {/* Emoji */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Emoji Icon
            </label>
            <input
              type="text"
              value={editData.emoji}
              onChange={(e) => setEditData(prev => ({ ...prev, emoji: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              placeholder="📸"
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Package Image
            </label>
            <div className="flex items-center gap-4">
              {editData.imageUrl && (
                <img
                  src={editData.imageUrl}
                  alt={editData.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  uploadingImage 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                } ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
              >
                {uploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Features
              </label>
              <button
                onClick={addFeature}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3 h-3" />
                Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {editData.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={() => removeFeature(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Toggle */}
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Mark as Popular
            </label>
            <button
              type="button"
              onClick={() => setEditData(prev => ({ ...prev, popular: !prev.popular }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                editData.popular ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editData.popular ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Package Active
            </label>
            <button
              type="button"
              onClick={() => setEditData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                editData.isActive !== false ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editData.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -10 }}
      onClick={() => !isEditable && onSelect && onSelect(pkg)}
      className={`relative h-full ${!isEditable ? 'cursor-pointer' : ''}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/40 max-w-[200px] sm:max-w-[240px]">
            <Sparkles className="w-4 h-4 text-white flex-shrink-0" />
            <span className="text-white text-xs font-bold uppercase tracking-wide text-center whitespace-nowrap">
              Most Popular
            </span>
            <Sparkle className="w-3 h-3 text-white flex-shrink-0" />
          </div>
        </motion.div>
      )}

      {/* Inactive Badge */}
      {!isEditable && pkg.isActive === false && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
          className="absolute top-4 right-4 z-10"
        >
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
            Inactive
          </span>
        </motion.div>
      )}

      {/* Edit Actions */}
      {isEditable && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Package"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Package"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Card Container - Professional Photography Design */}
      <div
        className={`
          relative h-full rounded-2xl p-6 sm:p-8
          transition-all duration-400 overflow-hidden
          ${isPopular
            ? 'bg-gradient-to-br from-white via-gray-50 to-white border-2 border-primary-500/30 shadow-2xl shadow-primary-500/15'
            : darkMode 
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/10'
              : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/10'
          }
        `}
      >
        {/* Subtle Background Pattern for Popular */}
        {isPopular && (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]" />
          </div>
        )}

        {/* Package Header Section */}
        <div className="relative z-10 text-center mb-6">
          {/* Professional Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2 + index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            className={`
              inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4
              ${isPopular
                ? 'bg-gradient-to-br from-primary-500/10 to-accent-rose/10 ring-2 ring-primary-500/30 shadow-lg'
                : darkMode ? 'bg-gray-700/80 shadow-lg' : 'bg-white shadow-lg border border-gray-100'
              }
            `}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-rose rounded-full opacity-20 animate-pulse" />
              <span className="relative text-3xl">{pkg.emoji || '📸'}</span>
            </div>
          </motion.div>

          {/* Package Name - Elegant Typography */}
          <h3
            className={`
              text-xl sm:text-2xl font-bold font-display mb-2 tracking-tight
              ${isPopular
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-accent-rose'
                : darkMode ? 'text-white' : 'text-gray-900'
              }
            `}
          >
            {pkg.name}
          </h3>

          {/* Package Description */}
          {pkg.description && (
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-light`}>
              {pkg.description}
            </p>
          )}
        </div>

        {/* Price Section - Premium Display */}
        <div className="flex items-baseline justify-center mb-6">
          <div className="text-center">
            <span
              className={`
                text-3xl sm:text-4xl font-bold tracking-tight
                ${isPopular ? 'text-primary-600' : darkMode ? 'text-white' : 'text-gray-900'}
              `}
            >
              ₹{pkg.price?.toLocaleString() || pkg.price}
            </span>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {pkg.duration || 'Professional Session'}
            </p>
          </div>
        </div>

        {/* Elegant Divider */}
        <div
          className={`
            h-px w-full mb-6
            ${isPopular
              ? 'bg-gradient-to-r from-transparent via-primary-500/30 to-transparent'
              : darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }
          `}
        />

        {/* Features Section - Professional Layout */}
        <div className="space-y-3 mb-8">
          {pkg.features?.slice(0, 5).map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.05 + index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className={`
                  flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                  ${isPopular
                    ? 'bg-gradient-to-br from-primary-500/20 to-accent-rose/20 text-primary-600 ring-1 ring-primary-500/30'
                    : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600 ring-1 ring-green-500/30'
                  }
                `}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
              </div>
              <span className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {feature}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Package Details Grid - Professional Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary-500/5 to-transparent">
            <Calendar className={`w-4 h-4 ${isPopular ? 'text-primary-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <div>
              <span className={`text-xs block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Session Duration</span>
              <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pkg.duration || 'Custom'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-accent-rose/5 to-transparent">
            <Ruler className={`w-4 h-4 ${isPopular ? 'text-primary-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <div>
              <span className={`text-xs block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Coverage</span>
              <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Full Event</span>
            </div>
          </div>
        </div>

        {/* CTA Button - Premium Design */}
        <motion.button
          whileHover={{ 
            scale: 1.02,
            boxShadow: isPopular 
              ? '0 10px 25px -5px rgba(236, 72, 153, 0.3), 0 8px 10px -6px rgba(236, 72, 153, 0.2)'
              : '0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 8px 10px -6px rgba(59, 130, 246, 0.2)'
          }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect && onSelect(pkg)
          }}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-sm
            transition-all duration-300 transform
            ${isPopular 
              ? 'bg-gradient-to-r from-primary-600 to-accent-rose text-white shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/35 border border-primary-500/30'
              : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl shadow-primary-600/25 hover:shadow-2xl hover:shadow-primary-600/35 border border-primary-600/30'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="tracking-wide">
              {isEditable ? 'Edit Package' : isPopular ? 'Book This Package' : 'Book Now'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </div>
          {!isEditable && (
            <div className="text-xs opacity-80 mt-1">
              {isPopular ? 'Limited Availability' : 'Professional Quality'}
            </div>
          )}
        </motion.button>

        {/* Bottom Accent for Popular */}
        {isPopular && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-rose to-primary-500 opacity-80" />
        )}
      </div>
    </motion.div>
  )
}

export default PackageCard
