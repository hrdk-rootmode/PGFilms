import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { useAuthStore } from '../utils/store'
import AdminPanel from '../components/AdminPanel'

// ═══════════════════════════════════════════════════════════════
// ADMIN LOGIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Demo credentials (for development - remove in production)
  const DEMO_EMAIL = 'admin@pgfilms.com'
  const DEMO_PASSWORD = 'admin123'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For now, use demo credentials (will connect to backend later)
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        const adminData = {
          email: DEMO_EMAIL,
          name: 'PG Films',
          role: 'admin'
        }
        const token = 'demo-token-' + Date.now()
        onLogin(adminData, token)
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-rose/10" />
      
      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Back to home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Website
        </button>

        <div className="glass rounded-2xl p-8 border border-dark-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-rose flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-gray-400 mt-2">Welcome back! Please login to continue.</p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pgfilms.com"
                required
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-rose text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Login
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-6 p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-400 text-center space-y-1">
              <p>Email: <span className="text-primary-400">admin@pgfilms.com</span></p>
              <p>Password: <span className="text-primary-400">admin123</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Only authorized administrators can access this area.
        </p>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const Admin = () => {
  const { isAuthenticated, login, logout, admin } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        // In real app, verify token with backend
        // For now, just check if token exists
        setIsChecking(false)
      } else {
        setIsChecking(false)
      }
    }
    checkAuth()
  }, [])

  // Handle login
  const handleLogin = (adminData, token) => {
    login(adminData, token)
  }

  // Handle logout
  const handleLogout = () => {
    logout()
  }

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  // Show dashboard if authenticated
  return <AdminPanel admin={admin} onLogout={handleLogout} />
}

export default Admin