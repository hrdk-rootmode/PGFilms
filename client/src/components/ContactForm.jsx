import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Send, CheckCircle, Loader } from 'lucide-react'
import { publicAPI } from '../utils/api'

const ContactForm = ({ isOpen, onClose, selectedPackage = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        package: selectedPackage || '',
        eventDate: '',
        location: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            // Submit booking via API
            const response = await publicAPI.submitBooking(formData)

            if (response.data.success) {
                setSubmitSuccess(true)
                setTimeout(() => {
                    onClose()
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        package: '',
                        eventDate: '',
                        location: '',
                        message: ''
                    })
                    setSubmitSuccess(false)
                }, 3000)
            }
        } catch (err) {
            console.error('Booking submission error:', err)
            setError(err.response?.data?.message || 'Failed to submit. Please try WhatsApp.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-dark-900 rounded-3xl p-8 max-w-2xl w-full mx-4 border border-primary-500/20 shadow-2xl"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="text-gray-400" size={24} />
                </button>

                {submitSuccess ? (
                    <div className="text-center py-12">
                        <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Booking Received!</h3>
                        <p className="text-gray-400">
                            We'll contact you soon via email and WhatsApp.
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold gradient-text mb-2">Book Your Package</h2>
                        <p className="text-gray-400 mb-6">
                            Fill in your details and we'll contact you within 24 hours
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                {/* Package */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Package *
                                    </label>
                                    <input
                                        type="text"
                                        name="package"
                                        value={formData.package}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                        placeholder="Wedding Gold"
                                    />
                                </div>

                                {/* Event Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Event Date
                                    </label>
                                    <input
                                        type="date"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                        placeholder="City, State"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Special Requests
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                                    placeholder="Any specific requirements or questions..."
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-primary-600 to-accent-rose hover:from-primary-500 hover:to-accent-rose/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send Booking Request
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-3">
                                By submitting, you agree to receive communication via email and WhatsApp
                            </p>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default ContactForm
