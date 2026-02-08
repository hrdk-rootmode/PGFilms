import React, { useRef, useMemo, useContext } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { PerformanceContext } from '../App'

// ═══════════════════════════════════════════════════════════════
// FLOATING PARTICLES - Creates the magical particle effect
// ═══════════════════════════════════════════════════════════════

function ParticleField({ count = 5000, color = '#d946ef' }) {
  const points = useRef()
  
  // Generate random positions for particles
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Spread particles in a sphere-like volume
      positions[i3] = (Math.random() - 0.5) * 20      // x
      positions[i3 + 1] = (Math.random() - 0.5) * 20  // y
      positions[i3 + 2] = (Math.random() - 0.5) * 20  // z
    }
    
    return positions
  }, [count])

  // Animate particles
  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.x += delta * 0.02
      points.current.rotation.y += delta * 0.03
      
      // Subtle floating motion
      points.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <Points ref={points} positions={particlePositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </Points>
  )
}

// ═══════════════════════════════════════════════════════════════
// FLOATING ORBS - Glowing spheres in background
// ═══════════════════════════════════════════════════════════════

function FloatingOrbs() {
  const orbsData = useMemo(() => [
    { position: [-4, 2, -5], color: '#d946ef', size: 0.5, speed: 0.5 },
    { position: [4, -2, -8], color: '#f43f5e', size: 0.8, speed: 0.3 },
    { position: [0, 3, -6], color: '#fbbf24', size: 0.4, speed: 0.7 },
    { position: [-3, -3, -7], color: '#22d3ee', size: 0.6, speed: 0.4 },
    { position: [5, 1, -10], color: '#d946ef', size: 1, speed: 0.2 },
  ], [])

  return (
    <>
      {orbsData.map((orb, index) => (
        <Orb key={index} {...orb} />
      ))}
    </>
  )
}

function Orb({ position, color, size, speed }) {
  const meshRef = useRef()
  const initialY = position[1]

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 0.5
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════
// CAMERA CONTROLLER - Subtle camera movement based on mouse
// ═══════════════════════════════════════════════════════════════

function CameraController() {
  useFrame((state) => {
    // Subtle camera sway
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5
    state.camera.position.y = Math.cos(state.clock.elapsedTime * 0.1) * 0.3
    state.camera.lookAt(0, 0, 0)
  })

  return null
}

// ═══════════════════════════════════════════════════════════════
// MAIN 3D BACKGROUND COMPONENT
// ═══════════════════════════════════════════════════════════════

const Background3D = () => {
  const { tier, enable3D } = useContext(PerformanceContext)

  // Don't render 3D on low-end devices
  if (!enable3D || tier === 'low') {
    return <FallbackBackground />
  }

  // Reduce particles for medium tier
  const particleCount = tier === 'medium' ? 2000 : 5000

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={tier === 'medium' ? 1 : [1, 2]} // Lower DPR for medium devices
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: tier === 'high',
          powerPreference: 'high-performance'
        }}
      >
        {/* Dark background color */}
        <color attach="background" args={['#020617']} />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.5} />
        
        {/* Particles */}
        <ParticleField count={particleCount} />
        
        {/* Floating orbs - only on high-end devices */}
        {tier === 'high' && <FloatingOrbs />}
        
        {/* Camera animation */}
        <CameraController />
      </Canvas>
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/50 to-dark-950 pointer-events-none" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK FOR LOW-END DEVICES - CSS Only Animation
// ═══════════════════════════════════════════════════════════════

const FallbackBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-dark-950">
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-rose/10" />
      
      {/* Simple animated gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.15) 0%, transparent 50%)',
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/50 to-dark-950" />
    </div>
  )
}

export default Background3D