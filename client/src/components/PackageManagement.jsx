import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Grid,
  List,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Package,
  DollarSign,
  Star,
  TrendingUp,
  Eye,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import PackageCard from './PackageCard'

const PackageManagement = ({ darkMode = false, adminAPI }) => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [newPackage, setNewPackage] = useState({
    name: '',
    price: '',
    description: '',
    emoji: '📸',
    features: [''],
    popular: false,
    isActive: true, // Default to active for new packages
    imageUrl: ''
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      console.log('Fetching packages from admin API...')
      
      const response = await adminAPI.getAdminPackages()
      console.log('Admin API response:', response)
      
      const packagesData = response.data?.data || []
      console.log('Packages data received:', packagesData.length)
      console.log('Package details:', packagesData.map(p => ({
        id: p.id,
        name: p.name,
        isActive: p.isActive,
        popular: p.popular
      })))
      
      setPackages(packagesData)
      
      // Log active/inactive counts
      const activeCount = packagesData.filter(p => p.isActive !== false).length
      const inactiveCount = packagesData.filter(p => p.isActive === false).length
      console.log(`Package status: ${activeCount} active, ${inactiveCount} inactive`)
      
    } catch (error) {
      console.error('Failed to fetch packages:', error)
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = async () => {
    try {
      setLoading(true)
      console.log('Creating new package:', newPackage)
      
      const response = await adminAPI.createPackage(newPackage)
      console.log('Create response:', response)
      
      await fetchPackages()
      setShowAddModal(false)
      resetNewPackage()
      showSuccessMessage('Package created successfully!')
    } catch (error) {
      console.error('Create failed:', error)
      showSuccessMessage('Failed to create package. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const showSuccessMessage = (message) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setSuccessMessage('')
    }, 3000)
  }

  const handleUpdatePackage = async (packageId, data) => {
    try {
      setLoading(true)
      console.log('🔧 PackageManagement - Updating package:', packageId, data)
      
      // Call the admin API to update the package
      const response = await adminAPI.updatePackage(packageId, data)
      console.log('🔧 PackageManagement - Update response:', response)
      
      // Wait a moment for database to settle
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh packages to get the latest data
      console.log('🔄 PackageManagement - Refreshing packages after update...')
      await fetchPackages()
      
      // Verify the package was updated correctly
      const updatedPackage = packages.find(p => p.id === packageId)
      if (updatedPackage) {
        console.log('✅ PackageManagement - Package updated successfully:', {
          id: updatedPackage.id,
          name: updatedPackage.name,
          isActive: updatedPackage.isActive,
          popular: updatedPackage.popular
        })
        showSuccessMessage('Package updated successfully! Changes are now live on the homepage.')
      } else {
        console.warn('⚠️ PackageManagement - Package not found after refresh, forcing refresh...')
        // Force another refresh if package not found
        await fetchPackages()
        showSuccessMessage('Package updated! Refreshing homepage...')
      }
    } catch (error) {
      console.error('❌ PackageManagement - Failed to update package:', error)
      showSuccessMessage('Failed to update package. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      try {
        setLoading(true)
        console.log('Deleting package:', packageId)
        
        // Call the admin API to delete the package
        await adminAPI.deletePackage(packageId)
        console.log('Package deleted successfully')
        
        // Refresh packages to get the latest data
        await fetchPackages()
        
        // Show success feedback
        showSuccessMessage('Package deleted successfully!')
      } catch (error) {
        console.error('Failed to delete package:', error)
        showSuccessMessage('Failed to delete package. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const resetNewPackage = () => {
    setNewPackage({
      name: '',
      price: '',
      description: '',
      emoji: '📸',
      features: [''],
      popular: false,
      isActive: true,
      imageUrl: ''
    })
  }

  const addFeature = () => {
    setNewPackage(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const updateFeature = (idx, value) => {
    setNewPackage(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === idx ? value : feature)
    }))
  }

  const removeFeature = (idx) => {
    setNewPackage(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }))
  }

  // Separate active and inactive packages
  const activePackages = packages.filter(pkg => pkg.isActive !== false)
  const inactivePackages = packages.filter(pkg => pkg.isActive === false)

  // Apply search to both active and inactive packages
  const filteredActivePackages = activePackages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredInactivePackages = inactivePackages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleImageUpload = async (file, packageId) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('packageId', packageId)

    try {
      const response = await fetch('/api/admin/upload-package-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')
      
      const result = await response.json()
      
      // Update package with image URL
      await handleUpdatePackage(packageId, { imageUrl: result.imageUrl })
      
      return result
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className={`p-4 rounded-lg shadow-lg border ${
              successMessage.includes('successfully') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  successMessage.includes('successfully') ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Package Management
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your photography packages, pricing, and availability
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Total</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {activePackages.length}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
        </div>

        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">Popular</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {packages.filter(p => p.popular).length}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Featured</p>
        </div>

        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">Average</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {packages.length > 0 
              ? `₹${Math.round(packages.reduce((sum, p) => {
                  const price = parseInt(String(p.price || '0').replace(/[^\d]/g, '') || 0)
                  return sum + price
                }, 0) / packages.length).toLocaleString()}`
              : '₹0'
            }
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Price</p>
        </div>

        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <span className="text-xs text-purple-500 bg-purple-50 px-2 py-1 rounded-full">Total</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {filteredActivePackages.length + filteredInactivePackages.length}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filtered</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPackages}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {activePackages.length} active, {inactivePackages.length} inactive
          </span>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-500 text-white' : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-500 text-white' : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Packages Display */}
      {filteredActivePackages.length === 0 && filteredInactivePackages.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'No packages match your search' : 'No packages found'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary-500 hover:text-primary-600"
            >
              Create your first package
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Active Packages */}
          {filteredActivePackages.length > 0 ? (
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Active Packages ({filteredActivePackages.length})
              </h3>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredActivePackages.map((pkg, index) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    index={index}
                    onUpdate={handleUpdatePackage}
                    onDelete={handleDeletePackage}
                    isEditable={true}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </div>
          ) : filteredInactivePackages.length > 0 && (
            <div className="mb-8 text-center py-8">
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                No active packages found
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {filteredInactivePackages.length} inactive package{filteredInactivePackages.length !== 1 ? 's' : ''} available below
              </p>
            </div>
          )}

          {/* Inactive Packages */}
          {filteredInactivePackages.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Inactive Packages ({filteredInactivePackages.length})
              </h3>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredInactivePackages.map((pkg, index) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    index={index}
                    onUpdate={handleUpdatePackage}
                    onDelete={handleDeletePackage}
                    isEditable={true}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Package Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create New Package
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Package Name *
                    </label>
                    <input
                      type="text"
                      value={newPackage.name}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Wedding Photography"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Price *
                    </label>
                    <input
                      type="text"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, price: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="₹25,000"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  <textarea
                    value={newPackage.description}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Perfect for capturing your special day..."
                  />
                </div>

                {/* Emoji */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Package Icon
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {['📸', '📷', '🎬', '🎥', '💍', '📹', '🎨', '📱'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewPackage(prev => ({ ...prev, emoji }))}
                        className={`p-3 rounded-lg border ${newPackage.emoji === emoji ? 'bg-primary-500 text-white' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} transition-colors`}
                      >
                        <span className="text-2xl">{emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Features *
                    </label>
                    <button
                      onClick={addFeature}
                      className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
                    >
                      <Plus className="w-3 h-3" />
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newPackage.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(idx, e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="Feature description"
                        />
                        {newPackage.features.length > 1 && (
                          <button
                            onClick={() => removeFeature(idx)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Toggle */}
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mark as Popular Package
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPackage(prev => ({ ...prev, popular: !prev.popular }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      newPackage.popular ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newPackage.popular ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Package Active (shown on home page)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPackage(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      newPackage.isActive !== false ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newPackage.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCreatePackage}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Create Package
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PackageManagement
