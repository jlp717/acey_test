"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Line, Sphere } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, Pause, RotateCcw, Target } from "lucide-react"
import Link from "next/link"
import type * as THREE from "three"

// 3D Skeleton Joint positions (simplified tennis pose)
const SKELETON_JOINTS = {
  head: [0, 1.7, 0],
  neck: [0, 1.5, 0],
  leftShoulder: [-0.3, 1.4, 0],
  rightShoulder: [0.3, 1.4, 0],
  leftElbow: [-0.5, 1.1, -0.2],
  rightElbow: [0.7, 1.2, -0.3],
  leftWrist: [-0.6, 0.9, -0.3],
  rightWrist: [1.0, 1.0, -0.5],
  spine: [0, 1.0, 0],
  leftHip: [-0.2, 0.8, 0],
  rightHip: [0.2, 0.8, 0],
  leftKnee: [-0.3, 0.4, 0.1],
  rightKnee: [0.3, 0.4, 0.1],
  leftAnkle: [-0.3, 0.0, 0],
  rightAnkle: [0.3, 0.0, 0],
}

const SKELETON_CONNECTIONS = [
  ["head", "neck"],
  ["neck", "leftShoulder"],
  ["neck", "rightShoulder"],
  ["leftShoulder", "leftElbow"],
  ["rightShoulder", "rightElbow"],
  ["leftElbow", "leftWrist"],
  ["rightElbow", "rightWrist"],
  ["neck", "spine"],
  ["spine", "leftHip"],
  ["spine", "rightHip"],
  ["leftHip", "leftKnee"],
  ["rightHip", "rightKnee"],
  ["leftKnee", "leftAnkle"],
  ["rightKnee", "rightAnkle"],
]

// Professional skeleton (ideal technique)
const PROFESSIONAL_SKELETON = {
  ...SKELETON_JOINTS,
  rightElbow: [0.6, 1.3, -0.2],
  rightWrist: [0.9, 1.1, -0.4],
  leftShoulder: [-0.25, 1.45, 0],
  rightShoulder: [0.25, 1.45, 0],
}

interface SkeletonProps {
  joints: typeof SKELETON_JOINTS
  color: string
  opacity?: number
  isUser?: boolean
  accuracy?: number
}

function Skeleton({ joints, color, opacity = 1, isUser = false, accuracy = 0 }: SkeletonProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [pulsePhase, setPulsePhase] = useState(0)

  useFrame((state) => {
    if (groupRef.current && isUser) {
      // Animate user skeleton based on accuracy
      const time = state.clock.elapsedTime
      setPulsePhase(time)

      if (accuracy > 0.9) {
        // Success glow - aqua green
        groupRef.current.children.forEach((child: any) => {
          if (child.material) {
            child.material.emissiveIntensity = 0.3 + Math.sin(time * 8) * 0.2
          }
        })
      } else if (accuracy < 0.5) {
        // Error pulse - red
        groupRef.current.children.forEach((child: any) => {
          if (child.material) {
            child.material.color.setHex(0xff4444)
            child.material.emissiveIntensity = 0.5 + Math.sin(time * 12) * 0.3
          }
        })
      } else {
        // Normal state
        groupRef.current.children.forEach((child: any) => {
          if (child.material) {
            child.material.color.setHex(color === "#00FF9E" ? 0x00ff9e : 0x666666)
            child.material.emissiveIntensity = 0.2
          }
        })
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Joints */}
      {Object.entries(joints).map(([jointName, position]) => (
        <Sphere key={jointName} args={[0.03]} position={position as [number, number, number]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isUser ? 0.3 : 0.1}
            transparent
            opacity={opacity}
          />
        </Sphere>
      ))}

      {/* Connections */}
      {SKELETON_CONNECTIONS.map(([joint1, joint2], index) => {
        const pos1 = joints[joint1 as keyof typeof joints] as [number, number, number]
        const pos2 = joints[joint2 as keyof typeof joints] as [number, number, number]

        return <Line key={index} points={[pos1, pos2]} color={color} lineWidth={3} transparent opacity={opacity} />
      })}
    </group>
  )
}

function TrainingScene({ selectedStroke, cameraAngle, userAccuracy }: any) {
  const { camera } = useThree()
  const [userSkeleton, setUserSkeleton] = useState(SKELETON_JOINTS)

  useFrame((state) => {
    // Animate user skeleton based on selected stroke
    const time = state.clock.elapsedTime
    const animatedSkeleton = { ...SKELETON_JOINTS }

    if (selectedStroke === "forehand") {
      animatedSkeleton.rightElbow = [0.6 + Math.sin(time * 2) * 0.2, 1.2 + Math.cos(time * 2) * 0.1, -0.3]
      animatedSkeleton.rightWrist = [0.9 + Math.sin(time * 2) * 0.3, 1.0 + Math.cos(time * 2) * 0.2, -0.5]
    } else if (selectedStroke === "backhand") {
      animatedSkeleton.leftElbow = [-0.6 + Math.sin(time * 2) * 0.2, 1.2 + Math.cos(time * 2) * 0.1, -0.3]
      animatedSkeleton.leftWrist = [-0.9 + Math.sin(time * 2) * 0.3, 1.0 + Math.cos(time * 2) * 0.2, -0.5]
    } else if (selectedStroke === "serve") {
      animatedSkeleton.rightElbow = [0.4, 1.6 + Math.sin(time * 1.5) * 0.3, -0.1]
      animatedSkeleton.rightWrist = [0.6, 1.8 + Math.sin(time * 1.5) * 0.4, -0.2]
    }

    setUserSkeleton(animatedSkeleton)

    // Update camera position based on angle
    const radius = 5
    const x = Math.cos(cameraAngle) * radius
    const z = Math.sin(cameraAngle) * radius
    camera.position.set(x, 2, z)
    camera.lookAt(0, 1, 0)
  })

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[2, 4, 2]} intensity={0.8} color="#00FF9E" />
      <pointLight position={[-2, 4, -2]} intensity={0.5} color="#00FFFF" />

      {/* Professional skeleton (gray, behind) */}
      <Skeleton joints={PROFESSIONAL_SKELETON} color="#666666" opacity={0.4} />

      {/* User skeleton (electric green, in front) */}
      <Skeleton joints={userSkeleton} color="#00FF9E" opacity={0.9} isUser={true} accuracy={userAccuracy} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0a0a0a" transparent opacity={0.3} />
      </mesh>

      {/* Grid lines */}
      {Array.from({ length: 21 }).map((_, i) => {
        const pos = (i - 10) * 0.5
        return (
          <group key={i}>
            <Line
              points={[
                [-5, 0, pos],
                [5, 0, pos],
              ]}
              color="#00FF9E"
              lineWidth={1}
              transparent
              opacity={0.1}
            />
            <Line
              points={[
                [pos, 0, -5],
                [pos, 0, 5],
              ]}
              color="#00FF9E"
              lineWidth={1}
              transparent
              opacity={0.1}
            />
          </group>
        )
      })}
    </>
  )
}

export default function TechnicalTrainingPage() {
  const [selectedStroke, setSelectedStroke] = useState("forehand")
  const [isPlaying, setIsPlaying] = useState(false)
  const [cameraAngle, setCameraAngle] = useState(0)
  const [userAccuracy, setUserAccuracy] = useState(0.7)
  const [criticalAngles, setCriticalAngles] = useState({
    shoulderAngle: { value: 142, ideal: 145, tolerance: 10 },
    elbowAngle: { value: 158, ideal: 160, tolerance: 8 },
    wristAngle: { value: 178, ideal: 175, tolerance: 12 },
    hipRotation: { value: 32, ideal: 35, tolerance: 15 },
    kneeFlexion: { value: 28, ideal: 30, tolerance: 10 },
  })

  const strokes = [
    { id: "forehand", name: "Forehand", icon: "🎾" },
    { id: "backhand", name: "Backhand", icon: "🏓" },
    { id: "serve", name: "Serve", icon: "⚡" },
    { id: "volley", name: "Volley", icon: "🎯" },
    { id: "smash", name: "Smash", icon: "💥" },
  ]

  // Simulate accuracy changes
  useEffect(() => {
    const interval = setInterval(() => {
      setUserAccuracy(Math.random() * 0.4 + 0.6) // 0.6 to 1.0

      // Update critical angles with some variation
      setCriticalAngles((prev) => ({
        shoulderAngle: { ...prev.shoulderAngle, value: prev.shoulderAngle.ideal + (Math.random() - 0.5) * 20 },
        elbowAngle: { ...prev.elbowAngle, value: prev.elbowAngle.ideal + (Math.random() - 0.5) * 16 },
        wristAngle: { ...prev.wristAngle, value: prev.wristAngle.ideal + (Math.random() - 0.5) * 24 },
        hipRotation: { ...prev.hipRotation, value: prev.hipRotation.ideal + (Math.random() - 0.5) * 30 },
        kneeFlexion: { ...prev.kneeFlexion, value: prev.kneeFlexion.ideal + (Math.random() - 0.5) * 20 },
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Vibration effect for errors
  useEffect(() => {
    if (userAccuracy < 0.5 && "vibrate" in navigator) {
      navigator.vibrate(200)
    }
  }, [userAccuracy])

  const handleCameraRotation = (angle: number) => {
    setCameraAngle((angle * Math.PI) / 180)
  }

  const isAngleCorrect = (angle: any) => {
    return Math.abs(angle.value - angle.ideal) <= angle.tolerance
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Dark charcoal background with subtle texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,158,0.1),transparent_70%)]"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/">
          <Button className="cyber-nav-button p-3 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      {/* Left Stroke Menu */}
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-40 w-20">
        <div className="holographic-menu backdrop-blur-xl border border-green-400/30 rounded-2xl p-4">
          <div className="space-y-4">
            {strokes.map((stroke) => (
              <Button
                key={stroke.id}
                onClick={() => setSelectedStroke(stroke.id)}
                className={`w-12 h-12 rounded-xl transition-all duration-300 ${
                  selectedStroke === stroke.id
                    ? "stroke-selected border-2 border-green-400 bg-green-400/20"
                    : "stroke-inactive bg-gray-800/50 border border-gray-600/30"
                }`}
              >
                <span className="text-xl">{stroke.icon}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-600/30">
            <div className="text-xs text-gray-400 cyber-font text-center mb-2">CONTROLS</div>
            <div className="space-y-2">
              <Button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-8 rounded-lg cyber-control-button">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button onClick={() => setCameraAngle(0)} className="w-12 h-8 rounded-lg cyber-control-button">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Central 3D Scene */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [3, 2, 3], fov: 60 }} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <TrainingScene selectedStroke={selectedStroke} cameraAngle={cameraAngle} userAccuracy={userAccuracy} />
          </Suspense>
        </Canvas>
      </div>

      {/* Right Critical Angles Panel */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-40 w-64">
        <Card className="critical-angles-panel backdrop-blur-xl border-0 overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-green-400/10 via-transparent to-green-400/5 p-[1px]">
            <div className="w-full h-full bg-black/80 rounded-2xl"></div>
          </div>

          <CardContent className="relative p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold cyber-font text-white">CRITICAL ANGLES</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(criticalAngles).map(([key, angle]) => (
                <div key={key} className="angle-row">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm cyber-font text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span
                      className={`text-sm font-bold cyber-font ${
                        isAngleCorrect(angle) ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {Math.round(angle.value)}°
                    </span>
                  </div>

                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                        isAngleCorrect(angle)
                          ? "bg-gradient-to-r from-green-400 to-lime-400 shadow-green"
                          : "bg-gradient-to-r from-red-400 to-coral-400 shadow-red"
                      }`}
                      style={{
                        width: `${Math.min(100, (angle.value / 180) * 100)}%`,
                      }}
                    />

                    {/* Ideal range indicator */}
                    <div
                      className="absolute top-0 h-full w-1 bg-white/50"
                      style={{
                        left: `${(angle.ideal / 180) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0°</span>
                    <span className="text-gray-400">Ideal: {angle.ideal}°</span>
                    <span>180°</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Accuracy Score */}
            <div className="mt-6 pt-4 border-t border-gray-600/30">
              <div className="text-center">
                <div className="text-2xl font-bold cyber-font mb-2">
                  <span
                    className={`${
                      userAccuracy > 0.9 ? "text-green-400" : userAccuracy > 0.7 ? "text-yellow-400" : "text-red-400"
                    }`}
                  >
                    {Math.round(userAccuracy * 100)}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 cyber-font">TECHNIQUE MATCH</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Camera Rotation Slider */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="camera-rotation-control backdrop-blur-xl border border-green-400/30 rounded-full p-4">
          <div className="relative w-64 h-32">
            {/* Semicircle track */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
              <path d="M 20 80 A 80 80 0 0 1 180 80" fill="none" stroke="rgba(0, 255, 158, 0.3)" strokeWidth="2" />

              {/* Degree markers */}
              {Array.from({ length: 13 }).map((_, i) => {
                const angle = (i * 30 - 180) * (Math.PI / 180)
                const x = 100 + Math.cos(angle) * 80
                const y = 80 + Math.sin(angle) * 80
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="#00FF9E"
                    className="animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                )
              })}
            </svg>

            {/* Slider handle */}
            <div
              className="absolute w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                left: `${100 + Math.cos(cameraAngle - Math.PI) * 80 - 8}px`,
                top: `${80 + Math.sin(cameraAngle - Math.PI) * 80 - 8}px`,
              }}
              onMouseDown={(e) => {
                const handleMouseMove = (e: MouseEvent) => {
                  const rect = e.currentTarget?.parentElement?.getBoundingClientRect()
                  if (rect) {
                    const centerX = rect.left + rect.width / 2
                    const centerY = rect.top + rect.height * 0.8
                    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
                    handleCameraRotation((angle * 180) / Math.PI + 180)
                  }
                }

                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove)
                  document.removeEventListener("mouseup", handleMouseUp)
                }

                document.addEventListener("mousemove", handleMouseMove)
                document.addEventListener("mouseup", handleMouseUp)
              }}
            />
          </div>

          <div className="text-center mt-2">
            <span className="text-xs text-gray-400 cyber-font">
              CAMERA: {Math.round((cameraAngle * 180) / Math.PI)}°
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        .cyber-font {
          font-family: 'Orbitron', monospace;
        }

        .holographic-menu {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 0 30px rgba(0, 255, 158, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.05);
        }

        .stroke-selected {
          box-shadow: 
            0 0 20px rgba(0, 255, 158, 0.6),
            inset 0 0 20px rgba(0, 255, 158, 0.1);
          animation: phosphorescent-glow 2s ease-in-out infinite alternate;
        }

        @keyframes phosphorescent-glow {
          0% {
            box-shadow: 
              0 0 20px rgba(0, 255, 158, 0.6),
              inset 0 0 20px rgba(0, 255, 158, 0.1);
          }
          100% {
            box-shadow: 
              0 0 30px rgba(0, 255, 158, 0.8),
              inset 0 0 30px rgba(0, 255, 158, 0.2);
          }
        }

        .stroke-inactive {
          transition: all 0.3s ease;
        }

        .stroke-inactive:hover {
          border-color: rgba(0, 255, 158, 0.5);
          background: rgba(0, 255, 158, 0.1);
        }

        .cyber-control-button {
          background: rgba(0, 255, 158, 0.1);
          border: 1px solid rgba(0, 255, 158, 0.3);
          color: rgba(0, 255, 158, 0.8);
          transition: all 0.3s ease;
        }

        .cyber-control-button:hover {
          background: rgba(0, 255, 158, 0.2);
          color: rgba(0, 255, 158, 1);
          transform: scale(1.05);
        }

        .critical-angles-panel {
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 0 40px rgba(0, 255, 158, 0.2),
            inset 0 0 40px rgba(255, 255, 255, 0.05);
        }

        .angle-row {
          transition: all 0.3s ease;
        }

        .angle-row:hover {
          transform: translateX(5px);
        }

        .shadow-green {
          box-shadow: 0 0 10px rgba(0, 255, 158, 0.5);
        }

        .shadow-red {
          box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
        }

        .camera-rotation-control {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 0 30px rgba(0, 255, 158, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.05);
        }

        .cyber-nav-button {
          background: rgba(0, 255, 158, 0.1);
          border: 1px solid rgba(0, 255, 158, 0.3);
          color: rgba(0, 255, 158, 0.8);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .cyber-nav-button:hover {
          background: rgba(0, 255, 158, 0.2);
          color: rgba(0, 255, 158, 1);
          transform: scale(1.05);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .holographic-menu {
            width: 60px;
          }
          
          .critical-angles-panel {
            width: 200px;
          }
          
          .camera-rotation-control {
            transform: scale(0.8);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .phosphorescent-glow,
          .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
