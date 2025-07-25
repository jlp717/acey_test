"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Float, Sparkles, Sphere, Box, Plane } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Camera, Watch, Zap, Play, Target, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import Link from "next/link"
import type * as THREE from "three"

// Animated Tennis Player Component
function TennisPlayer({ position, color, isServing, courtSide }: any) {
  const playerRef = useRef<THREE.Group>(null)
  const racketRef = useRef<THREE.Group>(null)
  const [animationPhase, setAnimationPhase] = useState(0)

  useFrame((state) => {
    if (playerRef.current && racketRef.current) {
      const time = state.clock.elapsedTime

      // Player movement animation
      if (isServing) {
        // Serving animation
        playerRef.current.position.x = position[0] + Math.sin(time * 0.5) * 0.5
        playerRef.current.position.z = position[2]
        racketRef.current.rotation.x = Math.sin(time * 2) * 0.3 - 0.2
        racketRef.current.rotation.z = Math.sin(time * 2) * 0.2
      } else {
        // Receiving/moving animation
        playerRef.current.position.x = position[0] + Math.sin(time * 0.8) * 2
        playerRef.current.position.z = position[2] + Math.cos(time * 0.6) * 1.5
        racketRef.current.rotation.x = Math.sin(time * 1.5) * 0.4
        racketRef.current.rotation.y = Math.cos(time * 1.2) * 0.3
      }

      // Subtle floating animation
      playerRef.current.position.y = position[1] + Math.sin(time * 3) * 0.1
    }
  })

  return (
    <group ref={playerRef} position={position}>
      {/* Player Body (Holographic) */}
      <group>
        {/* Head */}
        <Sphere args={[0.3]} position={[0, 1.7, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.7} />
        </Sphere>

        {/* Body */}
        <Box args={[0.6, 1.2, 0.3]} position={[0, 0.8, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.6} />
        </Box>

        {/* Arms */}
        <Box args={[0.2, 0.8, 0.2]} position={[-0.5, 0.8, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.6} />
        </Box>
        <Box args={[0.2, 0.8, 0.2]} position={[0.5, 0.8, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.6} />
        </Box>

        {/* Legs */}
        <Box args={[0.2, 0.8, 0.2]} position={[-0.2, -0.2, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.6} />
        </Box>
        <Box args={[0.2, 0.8, 0.2]} position={[0.2, -0.2, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.6} />
        </Box>
      </group>

      {/* Tennis Racket */}
      <group ref={racketRef} position={[0.7, 1.2, 0]}>
        {/* Handle */}
        <Box args={[0.05, 0.4, 0.05]}>
          <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.3} />
        </Box>
        {/* Head */}
        <Sphere args={[0.15, 8, 8]} position={[0, 0.3, 0]} scale={[1, 1.5, 0.1]}>
          <meshStandardMaterial
            color="#00FF9E"
            emissive="#00FF9E"
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
            wireframe
          />
        </Sphere>
      </group>

      {/* Player Glow Effect */}
      <pointLight position={[0, 1, 0]} intensity={0.5} color={color} distance={5} />
    </group>
  )
}

// Animated Tennis Ball
function TennisBall() {
  const ballRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ballRef.current) {
      const time = state.clock.elapsedTime
      // Ball trajectory animation
      ballRef.current.position.x = Math.sin(time * 1.2) * 8
      ballRef.current.position.y = Math.abs(Math.sin(time * 2.4)) * 3 + 1
      ballRef.current.position.z = Math.cos(time * 0.8) * 6

      // Ball rotation
      ballRef.current.rotation.x = time * 3
      ballRef.current.rotation.y = time * 2
    }
  })

  return (
    <Sphere ref={ballRef} args={[0.1]} position={[0, 2, 0]}>
      <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={0.5} />
    </Sphere>
  )
}

// Enhanced 3D Tennis Court Scene
function TennisCourtScene() {
  const meshRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const { viewport } = useThree()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  // Create particle system
  const particleCount = 1000
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50
    positions[i * 3 + 1] = Math.random() * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50

    colors[i * 3] = 0
    colors[i * 3 + 1] = Math.random() * 0.5 + 0.5
    colors[i * 3 + 2] = Math.random() * 0.3 + 0.7
  }

  return (
    <group ref={meshRef}>
      {/* Environment lighting */}
      <Environment preset="night" />
      <fog attach="fog" args={["#0a0a0a", 10, 100]} />

      {/* Tennis Court Base */}
      <Plane args={[30, 15]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.8}
          metalness={0.2}
          emissive="#001a0a"
          emissiveIntensity={0.1}
        />
      </Plane>

      {/* Court Lines - Neon Effect */}
      <group position={[0, -1.9, 0]}>
        <Box args={[24, 0.05, 0.2]} position={[0, 0, -7.5]}>
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.5} />
        </Box>
        <Box args={[24, 0.05, 0.2]} position={[0, 0, 7.5]}>
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.5} />
        </Box>
        <Box args={[0.2, 0.05, 15]} position={[-12, 0, 0]}>
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.5} />
        </Box>
        <Box args={[0.2, 0.05, 15]} position={[12, 0, 0]}>
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.5} />
        </Box>

        {/* Service lines */}
        <Box args={[12, 0.05, 0.2]} position={[0, 0, -4.5]}>
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.3} />
        </Box>
        <Box args={[12, 0.05, 0.2]} position={[0, 0, 4.5]}>
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.3} />
        </Box>

        {/* Center line */}
        <Box args={[0.2, 0.05, 15]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.4} />
        </Box>
      </group>

      {/* Animated Tennis Players */}
      <TennisPlayer position={[-8, 0, -6]} color="#00FF9E" isServing={true} courtSide="left" />
      <TennisPlayer position={[8, 0, 6]} color="#00FFFF" isServing={false} courtSide="right" />

      {/* Animated Tennis Ball */}
      <TennisBall />

      {/* Holographic Net */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[0, 1, 0]}>
          <Plane args={[24, 2]} rotation={[0, 0, 0]}>
            <meshStandardMaterial
              color="#00FF9E"
              transparent
              opacity={0.1}
              emissive="#00FF9E"
              emissiveIntensity={0.2}
            />
          </Plane>
        </group>
      </Float>

      {/* Holographic Pillars */}
      {[-12, 12].map((x, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <Box args={[0.5, 8, 0.5]} position={[x, 2, 0]}>
            <meshStandardMaterial
              color="#00FFFF"
              emissive="#00FFFF"
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
            />
          </Box>
        </Float>
      ))}

      {/* Particle System */}
      <points ref={particlesRef}>
        <bufferGeometry>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.1} vertexColors transparent opacity={0.6} />
      </points>

      {/* Sparkles Effect */}
      <Sparkles count={100} scale={[30, 20, 30]} size={2} speed={0.4} color="#00FF9E" />

      {/* Ambient Orbs */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.1} floatIntensity={0.5}>
          <Sphere
            args={[0.3]}
            position={[Math.sin((i * Math.PI) / 4) * 20, 2 + Math.sin(i) * 3, Math.cos((i * Math.PI) / 4) * 20]}
          >
            <meshStandardMaterial
              color="#66FFA6"
              emissive="#66FFA6"
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
      ))}

      {/* Dynamic Lighting */}
      <pointLight position={[0, 10, 0]} intensity={1} color="#00FF9E" />
      <pointLight position={[-15, 5, -10]} intensity={0.5} color="#00FFFF" />
      <pointLight position={[15, 5, 10]} intensity={0.5} color="#66FFA6" />
      <spotLight
        position={[0, 20, 0]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={2}
        color="#00FF9E"
        target-position={[0, 0, 0]}
      />
    </group>
  )
}

// Responsive Futuristic Sensor Icon
function FuturisticSensorIcon({ icon: Icon, label, connected, index }: any) {
  return (
    <div className="relative group">
      <div
        className={`w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 relative transform-gpu transition-all duration-700 ${
          connected ? "sensor-active" : "sensor-inactive"
        }`}
        style={{
          transform: `perspective(1000px) rotateX(15deg) rotateY(${index * 10}deg)`,
        }}
      >
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-spin-slow">
          <div className="absolute top-0 left-1/2 w-1 h-1 sm:w-2 sm:h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
        </div>

        {/* Inner Core */}
        <div
          className={`absolute inset-1 sm:inset-2 rounded-full backdrop-blur-xl border transition-all duration-500 ${
            connected
              ? "bg-gradient-to-br from-green-400/20 to-cyan-400/20 border-green-400/50 shadow-neon-green"
              : "bg-gray-900/40 border-gray-600/30"
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="flex items-center justify-center h-full">
            <Icon
              className={`w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 transition-colors duration-500 ${connected ? "text-green-400" : "text-gray-500"}`}
            />
          </div>

          {connected && <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse-glow"></div>}
        </div>

        {/* Holographic Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent transform rotate-${i * 60} transition-opacity duration-500 ${
                connected ? "opacity-100" : "opacity-30"
              }`}
              style={{ top: "50%", transformOrigin: "center" }}
            />
          ))}
        </div>
      </div>

      <div className="text-center mt-2 sm:mt-3">
        <span className="text-xs sm:text-sm font-medium text-cyan-300 cyber-font tracking-wider">{label}</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sensorStatus, setSensorStatus] = useState({
    camera: false,
    racket: false,
    smartwatch: false,
  })
  const [highlightIndex, setHighlightIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timers = [
      setTimeout(() => setSensorStatus((prev) => ({ ...prev, camera: true })), 1500),
      setTimeout(() => setSensorStatus((prev) => ({ ...prev, racket: true })), 3000),
      setTimeout(() => setSensorStatus((prev) => ({ ...prev, smartwatch: true })), 4500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const lastSessionHighlights = [
    { label: "Speed", value: "187", unit: "km/h", color: "from-green-400 to-emerald-500" },
    { label: "Precision", value: "94.7", unit: "%", color: "from-cyan-400 to-blue-500" },
    { label: "Power", value: "2.4", unit: "kW", color: "from-purple-400 to-pink-500" },
    { label: "Spin", value: "3200", unit: "rpm", color: "from-yellow-400 to-orange-500" },
    { label: "Consistency", value: "91.2", unit: "%", color: "from-red-400 to-rose-500" },
  ]

  const sensors = [
    { icon: Camera, label: "CAMERA", connected: sensorStatus.camera },
    { icon: Zap, label: "RACKET", connected: sensorStatus.racket },
    { icon: Watch, label: "WATCH", connected: sensorStatus.smartwatch },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{
            position: [0, 8, 20],
            fov: typeof window !== "undefined" && window.innerWidth < 768 ? 85 : 75,
          }}
          gl={{ antialias: true, alpha: true }}
          dpr={typeof window !== "undefined" ? window.devicePixelRatio : 1}
        >
          <Suspense fallback={null}>
            <TennisCourtScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Holographic Overlay Grid */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="holographic-grid"></div>
        <div className="scan-lines"></div>
      </div>

      {/* Main UI Content */}
      <div className="relative z-20 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 lg:mb-12 space-y-6 lg:space-y-0">
          {/* Futuristic Greeting */}
          <div className="space-y-2 sm:space-y-3">
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold cyber-font text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 animate-gradient-x">
                HELLO, LUCIA
              </h1>
              <div className="absolute inset-0 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold cyber-font text-green-400/20 blur-sm">
                HELLO, LUCIA
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-lg sm:text-xl lg:text-2xl font-mono text-cyan-300 tracking-wider">
                {formatTime(currentTime)}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-400 cyber-font">SYSTEM ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Futuristic Sensor Array */}
          <div className="flex space-x-4 sm:space-x-6 lg:space-x-8 justify-center lg:justify-end w-full lg:w-auto">
            {sensors.map((sensor, index) => (
              <FuturisticSensorIcon
                key={sensor.label}
                icon={sensor.icon}
                label={sensor.label}
                connected={sensor.connected}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Central Command Panel */}
        <div className="flex justify-center mb-12 lg:mb-16">
          <div className="relative group w-full max-w-md lg:max-w-lg">
            {/* Holographic Frame */}
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-green-400/20 rounded-2xl blur-xl animate-pulse-slow"></div>

            <Card className="w-full relative cyber-card backdrop-blur-2xl border-0 overflow-hidden">
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/50 via-cyan-400/50 to-green-400/50 p-[2px] animate-gradient-x">
                <div className="w-full h-full bg-black/80 rounded-2xl"></div>
              </div>

              <CardContent className="relative p-6 sm:p-8 lg:p-10 text-center">
                {/* Status Indicators */}
                <div className="flex justify-center space-x-2 mb-4 sm:mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i < 4 ? "bg-green-400 animate-pulse" : "bg-gray-600"}`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>

                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold cyber-font text-white mb-3 sm:mb-4 tracking-wider">
                    READY TO PLAY
                  </h2>
                  <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <Link href="/match">
                    <Button className="w-full h-12 sm:h-14 lg:h-16 cyber-button-primary text-lg sm:text-xl font-bold cyber-font tracking-wider relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mr-3 sm:mr-4" />
                        START MATCH
                      </div>
                    </Button>
                  </Link>

                  <Link href="/training">
                    <Button className="w-full h-12 sm:h-14 lg:h-16 cyber-button-secondary text-lg sm:text-xl font-bold cyber-font tracking-wider relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mr-3 sm:mr-4" />
                        TECH TRAINING
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Metrics Carousel */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <h3 className="text-xl sm:text-2xl font-bold cyber-font text-white tracking-wider text-center sm:text-left">
              PERFORMANCE METRICS
            </h3>
            <div className="flex space-x-4 justify-center sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="cyber-nav-button"
                onClick={() => setHighlightIndex(Math.max(0, highlightIndex - 1))}
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="cyber-nav-button"
                onClick={() => setHighlightIndex(Math.min(lastSessionHighlights.length - 3, highlightIndex + 1))}
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>
          </div>

          <div className="flex space-x-4 sm:space-x-6 lg:space-x-8 overflow-x-auto pb-4 scrollbar-hide">
            {lastSessionHighlights.slice(highlightIndex, highlightIndex + 3).map((metric, index) => (
              <div
                key={index}
                className="metric-card group flex-shrink-0"
                style={{
                  transform: `perspective(1000px) rotateY(${(index - 1) * 5}deg) translateZ(${index * 20}px)`,
                }}
              >
                <div className="relative w-36 h-24 sm:w-44 sm:h-28 lg:w-48 lg:h-32 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                  {/* Animated Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                  ></div>

                  {/* Content */}
                  <div className="relative p-3 sm:p-4 lg:p-6 h-full flex flex-col justify-center items-center">
                    <div
                      className={`text-3xl sm:text-4xl lg:text-5xl font-bold cyber-font bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-1 sm:mb-2`}
                    >
                      {metric.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 cyber-font tracking-wider mb-1">{metric.unit}</div>
                    <div className="text-xs text-gray-500 cyber-font">{metric.label}</div>
                  </div>

                  {/* Holographic Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Control Panel */}
        <div className="flex flex-col lg:flex-row justify-between items-end space-y-6 lg:space-y-0">
          {/* Schedule Interface */}
          <div className="cyber-panel p-4 sm:p-6 w-full lg:w-80">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              <span className="text-base sm:text-lg font-bold cyber-font text-white tracking-wider">SCHEDULE</span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400 cyber-font">TODAY</span>
                <span className="text-sm text-gray-500 cyber-font">FREE</span>
              </div>

              <div className="next-match-highlight p-3 sm:p-4 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-cyan-400/20"></div>
                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-bold cyber-font text-white">TOMORROW</span>
                  <span className="text-sm text-green-400 cyber-font">VS ALEX</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400 cyber-font">THU 23</span>
                <span className="text-sm text-gray-500 cyber-font">TRAINING</span>
              </div>
            </div>
          </div>

          {/* AI Coach Interface */}
          <div className="relative flex justify-center lg:justify-end w-full lg:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full relative cursor-pointer group ai-coach-orb">
              {/* Outer Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-spin-slow"></div>
              <div className="absolute inset-1 sm:inset-2 rounded-full border border-green-400/40 animate-spin-reverse"></div>

              {/* Core */}
              <div className="absolute inset-2 sm:inset-4 rounded-full bg-gradient-to-br from-green-400/40 to-cyan-400/40 backdrop-blur-xl border border-white/20">
                <div className="flex items-center justify-center h-full">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
              </div>

              {/* Notification Badge */}
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-black">
                <span className="text-xs sm:text-sm text-white font-bold">3</span>
              </div>

              {/* Pulse Effect */}
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
        
        .cyber-font {
          font-family: 'Orbitron', 'Share Tech Mono', monospace;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .holographic-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 158, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 158, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }

        @media (max-width: 768px) {
          .holographic-grid {
            background-size: 30px 30px;
          }
        }

        .scan-lines {
          background: linear-gradient(
            transparent 50%,
            rgba(0, 255, 158, 0.03) 50%,
            rgba(0, 255, 158, 0.03) 51%,
            transparent 51%
          );
          background-size: 100% 4px;
          animation: scan 2s linear infinite;
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes scan {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .sensor-active {
          filter: drop-shadow(0 0 20px rgba(0, 255, 158, 0.6));
        }

        .shadow-neon-green {
          box-shadow: 
            0 0 20px rgba(0, 255, 158, 0.5),
            inset 0 0 20px rgba(0, 255, 158, 0.1);
        }

        .cyber-card {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 0 50px rgba(0, 255, 158, 0.3),
            inset 0 0 50px rgba(255, 255, 255, 0.05);
        }

        .cyber-button-primary {
          background: linear-gradient(135deg, rgba(0, 255, 158, 0.2) 0%, rgba(0, 255, 255, 0.2) 100%);
          border: 2px solid rgba(0, 255, 158, 0.5);
          color: white;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .cyber-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 158, 0.4);
          border-color: rgba(0, 255, 158, 0.8);
        }

        .cyber-button-secondary {
          background: linear-gradient(135deg, rgba(128, 0, 255, 0.2) 0%, rgba(255, 0, 128, 0.2) 100%);
          border: 2px solid rgba(128, 0, 255, 0.5);
          color: white;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .cyber-button-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(128, 0, 255, 0.4);
          border-color: rgba(128, 0, 255, 0.8);
        }

        .cyber-nav-button {
          background: rgba(0, 255, 158, 0.1);
          border: 1px solid rgba(0, 255, 158, 0.3);
          color: rgba(0, 255, 158, 0.8);
          backdrop-filter: blur(10px);
        }

        .cyber-nav-button:hover {
          background: rgba(0, 255, 158, 0.2);
          color: rgba(0, 255, 158, 1);
        }

        .cyber-panel {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(0, 255, 158, 0.2);
          border-radius: 12px;
          box-shadow: 
            0 0 30px rgba(0, 255, 158, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.05);
        }

        .next-match-highlight {
          border: 1px solid rgba(0, 255, 158, 0.4);
          box-shadow: 0 0 20px rgba(0, 255, 158, 0.3);
        }

        .metric-card {
          transition: all 0.5s ease;
        }

        .metric-card:hover {
          transform: perspective(1000px) rotateY(0deg) translateZ(30px) translateY(-10px) !important;
        }

        .ai-coach-orb:hover {
          transform: scale(1.1);
          filter: drop-shadow(0 0 30px rgba(0, 255, 158, 0.6));
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .cyber-card {
            box-shadow: 
              0 0 30px rgba(0, 255, 158, 0.3),
              inset 0 0 30px rgba(255, 255, 255, 0.05);
          }
          
          .cyber-panel {
            box-shadow: 
              0 0 20px rgba(0, 255, 158, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.05);
          }
        }
      `}</style>
    </div>
  )
}
