import React, { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lenis from '@studio-freight/lenis'
import { ChatProvider } from './context/ChatContext'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Admin = lazy(() => import('./pages/Admin'))

// Loading fallback component
const PageLoader = () => (
  <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
    <div className="text-center">
      {/* Animated logo/loader */}
      <div className="w-16 h-16 mx-auto mb-4 relative">
        <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
      </div>
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
)

// Performance context for device detection
export const PerformanceContext = React.createContext({
  tier: 'high', // 'low', 'medium', 'high'
  enable3D: true,
  enableAnimations: true
})

function App() {
  const [performanceTier, setPerformanceTier] = useState('high')
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Cleanup
    return () => {
      lenis.destroy()
    }
  }, [])

  // Detect device performance
  useEffect(() => {
    const detectPerformance = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setPerformanceTier('low')
        document.documentElement.classList.add('perf-low')
        return
      }

      // Check device memory (if available)
      const memory = navigator.deviceMemory || 4

      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 4

      // Check connection type
      const connection = navigator.connection || {}
      const slowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g'

      // Determine tier
      if (memory <= 2 || cores <= 2 || slowConnection) {
        setPerformanceTier('low')
        document.documentElement.classList.add('perf-low')
      } else if (memory <= 4 || cores <= 4) {
        setPerformanceTier('medium')
        document.documentElement.classList.add('perf-medium')
      } else {
        setPerformanceTier('high')
        document.documentElement.classList.add('perf-high')
      }
    }

    detectPerformance()
    setIsLoaded(true)
  }, [])

  // Performance context value
  const performanceValue = {
    tier: performanceTier,
    enable3D: performanceTier === 'high',
    enableAnimations: performanceTier !== 'low'
  }

  if (!isLoaded) {
    return <PageLoader />
  }

  return (
    <PerformanceContext.Provider value={performanceValue}>
      <ChatProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ChatProvider>
    </PerformanceContext.Provider>
  )
}

export default App