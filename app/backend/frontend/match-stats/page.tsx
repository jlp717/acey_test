"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Target, Zap, TrendingUp, ChevronDown, Play } from "lucide-react"
import Link from "next/link"

interface ImpactZone {
  id: number
  x: number
  y: number
  intensity: number // 0-1, where 1 is best result
  type: "winner" | "error" | "neutral"
}

interface RadarData {
  power: number
  accuracy: number
  consistency: number
  speed: number
  spin: number
}

interface TipCard {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  tip: string
  isFlipped: boolean
}

export default function MatchStatsPage() {
  const [selectedDate, setSelectedDate] = useState("Today")
  const [impactZones, setImpactZones] = useState<ImpactZone[]>([])
  const [radarData, setRadarData] = useState<RadarData>({
    power: 0.85,
    accuracy: 0.72,
    consistency: 0.91,
    speed: 0.68,
    spin: 0.79,
  })
  const [tipCards, setTipCards] = useState<TipCard[]>([
    {
      id: "accuracy",
      icon: <Target className="w-6 h-6" />,
      title: "Accuracy",
      description: "72% court precision",
      tip: "Focus on follow-through to improve shot placement consistency",
      isFlipped: false,
    },
    {
      id: "power",
      icon: <Zap className="w-6 h-6" />,
      title: "Power",
      description: "Average 89 km/h",
      tip: "Engage your core rotation for 15% more power generation",
      isFlipped: false,
    },
    {
      id: "consistency",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Consistency",
      description: "91% rally success",
      tip: "Maintain this excellent rhythm with regular practice sessions",
      isFlipped: false,
    },
  ])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const radarCanvasRef = useRef<HTMLCanvasElement>(null)

  // Generate impact zones
  useEffect(() => {
    const zones: ImpactZone[] = []
    for (let i = 0; i < 25; i++) {
      zones.push({
        id: i,
        x: Math.random() * 0.8 + 0.1, // Keep within court bounds
        y: Math.random() * 0.8 + 0.1,
        intensity: Math.random(),
        type: Math.random() > 0.7 ? "winner" : Math.random() > 0.8 ? "error" : "neutral",
      })
    }
    setImpactZones(zones)
  }, [])

  // Draw tennis court
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // Court background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, width, height)

    // Court outline
    ctx.strokeStyle = "#e9ecef"
    ctx.lineWidth = 3
    ctx.strokeRect(20, 20, width - 40, height - 40)

    // Center line
    ctx.strokeStyle = "#dee2e6"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width / 2, 20)
    ctx.lineTo(width / 2, height - 20)
    ctx.stroke()

    // Service boxes
    const serviceBoxWidth = (width - 40) / 2
    const serviceBoxHeight = (height - 40) * 0.4

    // Left service boxes
    ctx.strokeRect(20, 20 + (height - 40) * 0.3, serviceBoxWidth / 2, serviceBoxHeight)
    ctx.strokeRect(20 + serviceBoxWidth / 2, 20 + (height - 40) * 0.3, serviceBoxWidth / 2, serviceBoxHeight)

    // Right service boxes
    ctx.strokeRect(width / 2, 20 + (height - 40) * 0.3, serviceBoxWidth / 2, serviceBoxHeight)
    ctx.strokeRect(width / 2 + serviceBoxWidth / 2, 20 + (height - 40) * 0.3, serviceBoxWidth / 2, serviceBoxHeight)

    // Draw impact zones
    impactZones.forEach((zone) => {
      const x = 20 + zone.x * (width - 40)
      const y = 20 + zone.y * (height - 40)
      const radius = 4 + zone.intensity * 8

      // Create gradient based on intensity
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      const alpha = 0.3 + zone.intensity * 0.7
      const greenIntensity = Math.floor(100 + zone.intensity * 155)

      if (zone.type === "winner") {
        gradient.addColorStop(0, `rgba(34, ${greenIntensity}, 84, ${alpha})`)
        gradient.addColorStop(1, `rgba(34, ${greenIntensity}, 84, 0.1)`)
      } else if (zone.type === "error") {
        gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
        gradient.addColorStop(1, `rgba(239, 68, 68, 0.1)`)
      } else {
        gradient.addColorStop(0, `rgba(34, ${greenIntensity}, 84, ${alpha})`)
        gradient.addColorStop(1, `rgba(34, ${greenIntensity}, 84, 0.1)`)
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Add subtle glow effect for high-intensity zones
      if (zone.intensity > 0.7) {
        ctx.shadowColor = `rgba(34, ${greenIntensity}, 84, 0.5)`
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }, [impactZones])

  // Draw radar chart
  useEffect(() => {
    const canvas = radarCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20

    ctx.clearRect(0, 0, width, height)

    // Draw pentagon grid
    const sides = 5
    const angleStep = (Math.PI * 2) / sides
    const levels = 5

    // Draw grid levels
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius * level) / levels
      ctx.strokeStyle = level === levels ? "#22c55e" : "#e5e7eb"
      ctx.lineWidth = level === levels ? 2 : 1
      ctx.beginPath()

      for (let i = 0; i <= sides; i++) {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + Math.cos(angle) * levelRadius
        const y = centerY + Math.sin(angle) * levelRadius

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.stroke()
    }

    // Draw grid lines from center
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius)
      ctx.stroke()
    }

    // Draw data polygon
    const dataPoints = [radarData.power, radarData.accuracy, radarData.consistency, radarData.speed, radarData.spin]

    ctx.fillStyle = "rgba(34, 197, 94, 0.2)"
    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 3
    ctx.beginPath()

    dataPoints.forEach((value, i) => {
      const angle = i * angleStep - Math.PI / 2
      const dataRadius = radius * value
      const x = centerX + Math.cos(angle) * dataRadius
      const y = centerY + Math.sin(angle) * dataRadius

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Draw data points
      ctx.save()
      ctx.fillStyle = "#22c55e"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Add labels
    const labels = ["Power", "Accuracy", "Consistency", "Speed", "Spin"]
    ctx.fillStyle = "#374151"
    ctx.font = "12px system-ui"
    ctx.textAlign = "center"

    labels.forEach((label, i) => {
      const angle = i * angleStep - Math.PI / 2
      const labelRadius = radius + 15
      const x = centerX + Math.cos(angle) * labelRadius
      const y = centerY + Math.sin(angle) * labelRadius + 4
      ctx.fillText(label, x, y)
    })
  }, [radarData])

  const handleCardFlip = (cardId: string) => {
    setTipCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, isFlipped: !card.isFlipped } : card)))
  }

  const dateOptions = ["Today", "Yesterday", "This Week", "Last Week", "This Month"]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Satin paper texture overlay */}
      <div className="absolute inset-0 opacity-30 bg-noise"></div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/match">
              <Button className="clean-nav-button p-3 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 clean-font">Match Analysis</h1>
              <p className="text-gray-500 clean-font">Match Summary</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="relative">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-selector appearance-none bg-green-100 text-green-800 px-6 py-3 rounded-full border-0 outline-none cursor-pointer clean-font font-medium"
            >
              {dateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600 pointer-events-none" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Side - Radar Chart */}
          <div className="lg:w-1/3">
            <Card className="stats-card h-fit">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 clean-font">Performance Radar</h3>
                <div className="relative">
                  <canvas ref={radarCanvasRef} width={280} height={280} className="w-full max-w-sm mx-auto" />
                </div>
                <div className="mt-4 space-y-2">
                  {Object.entries(radarData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize clean-font">{key}</span>
                      <span className="text-sm font-semibold text-green-600 clean-font">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Court Map */}
          <div className="lg:w-3/5">
            <Card className="stats-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 clean-font">Shot Distribution</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-600 clean-font">Winners</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-gray-600 clean-font">Errors</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-lg shadow-sm" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-7xl mx-auto">
          {tipCards.map((card) => (
            <div key={card.id} className="flip-card-container" style={{ perspective: "1000px" }}>
              <div className={`flip-card ${card.isFlipped ? "flipped" : ""}`} onClick={() => handleCardFlip(card.id)}>
                {/* Front Side */}
                <Card className="flip-card-front stats-card cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 rounded-full text-green-600">{card.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 clean-font">{card.title}</h4>
                        <p className="text-gray-600 clean-font text-sm">{card.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Back Side */}
                <Card className="flip-card-back stats-card cursor-pointer">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 clean-font">Improvement Tip</h4>
                      <p className="text-gray-600 text-sm clean-font mb-4">{card.tip}</p>
                    </div>
                    <Link href="/training">
                      <Button className="practice-button w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Practice this now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .clean-font {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .bg-noise {
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
          background-size: 4px 4px, 6px 6px;
          background-position: 0 0, 3px 3px;
        }

        .stats-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(229, 231, 235, 0.8);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.08),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .clean-nav-button {
          background: rgba(243, 244, 246, 0.8);
          border: 1px solid rgba(229, 231, 235, 0.6);
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .clean-nav-button:hover {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #22c55e;
          transform: scale(1.05);
        }

        .date-selector {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
          transition: all 0.3s ease;
        }

        .date-selector:hover {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
          transform: translateY(-1px);
        }

        .flip-card-container {
          height: 120px;
        }

        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card.flipped {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        .practice-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .practice-button:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .flip-card-container {
            height: 140px;
          }
          
          .stats-card {
            margin-bottom: 1rem;
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .flip-card,
          .stats-card,
          .practice-button {
            transition: none !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .stats-card {
            border: 2px solid #22c55e;
          }
          
          .bg-noise {
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  )
}
