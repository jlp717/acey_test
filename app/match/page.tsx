"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, ArrowLeft, Volume2, Camera, Wifi, ChevronRight, Play } from "lucide-react"
import Link from "next/link"
import { useVoiceAgent } from '@/hooks/useVoiceAgent'
import { statStore } from '@/lib/statStore'

interface SwingData {
  id: number
  speed: number
  timestamp: number
  x: number
  y: number
  type: "first-serve" | "second-serve" | "stroke"
  player: "lucia" | "alex"
}

interface PointData {
  id: number
  winner: "lucia" | "alex" | null
  type: "winner" | "unforced-error" | "forced-error" | "ace" | null
  gameNumber: number
  pointNumber: number
}

interface GameScore {
  lucia: string
  alex: string
}

interface SetScore {
  lucia: number
  alex: number
}

export default function LiveMatchPage() {
  const [cameraActive, setCameraActive] = useState(false)
  const [score, setScore] = useState({ lucia: 0, alex: 0 })
  const [gameScore, setGameScore] = useState<GameScore>({ lucia: "0", alex: "0" })
  const [sets, setSets] = useState<SetScore[]>([
    { lucia: 0, alex: 0 },
    { lucia: 0, alex: 0 },
    { lucia: 0, alex: 0 },
  ])
  const [currentSet, setCurrentSet] = useState(0)
  const [server, setServer] = useState<"lucia" | "alex">("lucia")
  const [isListening, setIsListening] = useState(false)
  const [swings, setSwings] = useState<SwingData[]>([])
  const [points, setPoints] = useState<PointData[]>([])
  const [currentGame, setCurrentGame] = useState(1)
  const [currentPoint, setCurrentPoint] = useState(1)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [matchEnded, setMatchEnded] = useState(false)
  const [matchWinner, setMatchWinner] = useState<"lucia" | "alex" | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [settings, setSettings] = useState({
    autoScore: true,
    soundEffects: true,
    aiAnalysis: true,
    slowMotion: false,
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const voice = useVoiceAgent(cameraActive)

  // Simulate camera activation
  useEffect(() => {
    const timer = setTimeout(() => {
      setCameraActive(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Simulate serve detection
  useEffect(() => {
    if (matchEnded) return

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        statStore.startPoint()
        const isServe = Math.random() > 0.6
        const speed = isServe ? Math.floor(Math.random() * 80) + 120 : Math.floor(Math.random() * 50) + 80
        const serveType = isServe ? (Math.random() > 0.7 ? "second-serve" : "first-serve") : "stroke"

        const newSwing: SwingData = {
          id: Date.now(),
          speed,
          timestamp: Date.now(),
          x: server === "lucia" ? Math.random() * 200 + 50 : Math.random() * 200 + 250,
          y: Math.random() * 100 + 200,
          type: serveType,
          player: server,
        }
        setSwings((prev) => [...prev, newSwing])
        if (isServe) statStore.recordServe(speed)
        statStore.recordTrajectory([{ x: newSwing.x, y: newSwing.y, time: Date.now() }])

        // Remove swing after 3 seconds
        setTimeout(() => {
          setSwings((prev) => prev.filter((swing) => swing.id !== newSwing.id))
        }, 3000)

        // Sometimes add a point result
        if (Math.random() > 0.7) {
          setTimeout(() => {
            const winner = Math.random() > 0.5 ? "lucia" : "alex"
            const pointTypes = ["winner", "unforced-error", "forced-error", "ace"]
            const pointType = pointTypes[Math.floor(Math.random() * pointTypes.length)] as any

            const newPoint: PointData = {
              id: Date.now(),
              winner,
              type: pointType,
              gameNumber: currentGame,
              pointNumber: currentPoint,
            }

            setPoints((prev) => [...prev, newPoint])
            setCurrentPoint((prev) => prev + 1)

            // Update score
            updateScore(winner)
            statStore.endPoint()
          }, 1500)
        } else {
          setTimeout(() => statStore.endPoint(), 1500)
        }
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [server, currentGame, currentPoint, matchEnded])

  const updateScore = (winner: "lucia" | "alex") => {
    setScore((prevScore) => {
      const newScore = { ...prevScore, [winner]: prevScore[winner] + 1 }

      // Check for game win (simplified tennis scoring)
      if (newScore[winner] >= 4 && newScore[winner] - newScore[winner === "lucia" ? "alex" : "lucia"] >= 2) {
        // Game won
        setSets((prevSets) => {
          const newSets = [...prevSets]
          newSets[currentSet] = { ...newSets[currentSet], [winner]: newSets[currentSet][winner] + 1 }

          // Check for set win
          if (
            newSets[currentSet][winner] >= 6 &&
            newSets[currentSet][winner] - newSets[currentSet][winner === "lucia" ? "alex" : "lucia"] >= 2
          ) {
            // Set won
            const setsWon = newSets.filter((set) => set[winner] > set[winner === "lucia" ? "alex" : "lucia"]).length

            if (setsWon >= 2) {
              // Match won
              setMatchEnded(true)
              setMatchWinner(winner)
            } else if (currentSet < 2) {
              setCurrentSet((prev) => prev + 1)
            }
          }

          return newSets
        })

        // Reset game score
        setScore({ lucia: 0, alex: 0 })
        setCurrentGame((prev) => prev + 1)
        setServer((prev) => (prev === "lucia" ? "alex" : "lucia"))
      }

      return newScore
    })
  }

  const getGameScoreDisplay = (score: number): string => {
    const scoreMap = ["0", "15", "30", "40"]
    return score >= 3 ? scoreMap[3] : scoreMap[score]
  }

  const handleMicToggle = () => {
    setIsListening(!isListening)
  }

  const handleSettingsToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  const handleEndMatch = () => {
    setMatchEnded(true)
    setMatchWinner(sets[0].lucia > sets[0].alex ? "lucia" : "alex")
  }

  const getPointDescription = (point: PointData): string => {
    const pointTypeMap = {
      winner: "Winner",
      "unforced-error": "Error no forzado",
      "forced-error": "Error forzado",
      ace: "Ace",
    }
    return `Punto ${point.pointNumber} – ${pointTypeMap[point.type || "winner"]}`
  }

  // Group points by game
  const pointsByGame = points.reduce(
    (acc, point) => {
      if (!acc[point.gameNumber]) {
        acc[point.gameNumber] = []
      }
      acc[point.gameNumber].push(point)
      return acc
    },
    {} as Record<number, PointData[]>,
  )

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Full-screen Video Background */}
      <div className="absolute inset-0 z-0">
        {cameraActive ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            style={{
              filter: "contrast(1.1) saturate(1.2) hue-rotate(5deg)",
              aspectRatio: "16/9",
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-green-900/20 to-green-700/30"></div>
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-green-400 text-xl cyber-font">Activating camera...</p>
            </div>
          </div>
        )}

        {/* Video overlay for court enhancement */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(0, 50, 0, 0.1) 0%, rgba(0, 100, 50, 0.05) 100%)",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button className="cyber-nav-button p-3 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Enhanced Table-style Scoreboard */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
        <Card
          className={`enhanced-scoreboard backdrop-blur-xl border-0 overflow-hidden ${matchEnded ? "match-ended" : ""}`}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 p-[1px]">
            <div className="w-full h-full bg-black/80 rounded-2xl"></div>
          </div>

          <CardContent className="relative p-4">
            {/* Sets Display */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-white text-sm font-bold cyber-font mb-2">LUCIA</div>
                <div className="flex space-x-1 justify-center">
                  {sets.map((set, index) => (
                    <div
                      key={index}
                      className={`w-6 h-4 rounded border ${
                        set.lucia > set.alex
                          ? "bg-green-400 border-green-400 shadow-green"
                          : "border-gray-600 bg-transparent"
                      } text-xs flex items-center justify-center text-white cyber-font`}
                    >
                      {set.lucia > 0 || set.alex > 0 ? set.lucia : ""}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-xs cyber-font mb-2">SETS</div>
                <div className="flex space-x-1 justify-center">
                  {sets.map((set, index) => (
                    <div
                      key={index}
                      className="w-6 h-4 rounded border border-gray-600 bg-transparent text-xs flex items-center justify-center text-gray-400 cyber-font"
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-white text-sm font-bold cyber-font mb-2">ALEX</div>
                <div className="flex space-x-1 justify-center">
                  {sets.map((set, index) => (
                    <div
                      key={index}
                      className={`w-6 h-4 rounded border ${
                        set.alex > set.lucia
                          ? "bg-green-400 border-green-400 shadow-green"
                          : "border-gray-600 bg-transparent"
                      } text-xs flex items-center justify-center text-white cyber-font`}
                    >
                      {set.alex > 0 || set.lucia > 0 ? set.alex : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Game Score */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="text-4xl font-bold cyber-font laser-green-text flex items-center justify-center">
                  {getGameScoreDisplay(score.lucia)}
                  {server === "lucia" && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse ml-2 server-ball"></div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-xs cyber-font">GAME {currentGame}</div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold cyber-font laser-green-text flex items-center justify-center">
                  {server === "alex" && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2 server-ball"></div>
                  )}
                  {getGameScoreDisplay(score.alex)}
                </div>
              </div>
            </div>

            {matchEnded && (
              <div className="mt-4 text-center">
                <div className="text-green-400 text-lg font-bold cyber-font animate-pulse">PARTIDO FINALIZADO</div>
                <div className="text-white text-sm cyber-font mt-1">{matchWinner?.toUpperCase()} WINS!</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Speed and Stroke Type Messages */}
      {swings.map((swing) => (
        <div
          key={swing.id}
          className="absolute z-30 speed-message animate-float-up"
          style={{
            left: `${swing.x}px`,
            top: `${swing.y}px`,
          }}
        >
          <div className="bg-black/80 backdrop-blur-md border border-green-400/50 rounded-lg px-4 py-2">
            <div className={`font-bold cyber-font text-lg ${swing.speed > 180 ? "text-cyan-400" : "text-green-400"}`}>
              {swing.speed} km/h
            </div>
            {swing.type !== "stroke" && (
              <div className="text-gray-300 text-xs cyber-font capitalize">{swing.type.replace("-", " ")}</div>
            )}
          </div>
        </div>
      ))}

      {/* Enhanced Point Chronology */}
      <div className="absolute bottom-8 left-0 right-0 z-30">
        <div className="flex justify-center">
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 max-w-4xl overflow-x-auto">
            <div className="flex items-center space-x-1 min-w-max">
              {Object.entries(pointsByGame).map(([gameNum, gamePoints], gameIndex) => (
                <div key={gameNum} className="flex items-center">
                  {gameIndex > 0 && <div className="w-2"></div>}
                  {gamePoints.map((point, pointIndex) => (
                    <div
                      key={point.id}
                      className="relative"
                      onMouseEnter={() => setHoveredPoint(point.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                          point.winner === "lucia"
                            ? "bg-green-400 border-green-400 shadow-green"
                            : point.winner === "alex"
                              ? "bg-red-400 border-red-400 shadow-red"
                              : "border-gray-500 bg-transparent"
                        }`}
                      />

                      {hoveredPoint === point.id && (
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md border border-green-400/50 rounded-lg px-3 py-2 whitespace-nowrap">
                          <div className="text-green-400 text-xs cyber-font">{getPointDescription(point)}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add empty circles for remaining points in current game */}
                  {Number.parseInt(gameNum) === currentGame && (
                    <>
                      {Array.from({ length: Math.max(0, 6 - gamePoints.length) }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="w-4 h-4 rounded-full border-2 border-gray-600 bg-transparent"
                        />
                      ))}
                    </>
                  )}
                </div>
              ))}

              {/* Show empty circles for first game if no points yet */}
              {points.length === 0 && (
                <div className="flex space-x-1">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`initial-${index}`}
                      className="w-4 h-4 rounded-full border-2 border-gray-600 bg-transparent"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Microphone Button */}
      <div className="absolute bottom-8 right-8 z-40">
        <Button
          onClick={handleMicToggle}
          className={`w-14 h-14 rounded-full emerald-mic-button ${isListening ? "listening" : ""}`}
        >
          <Mic className="w-6 h-6 text-white" />
          {isListening && <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></div>}
        </Button>
      </div>

      {/* Settings Handler */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-40">
        <Button
          onClick={() => setSettingsOpen(true)}
          className="settings-handler bg-green-400/20 border-l-0 rounded-l-lg rounded-r-none p-3 backdrop-blur-md"
        >
          <ChevronRight className="w-5 h-5 text-green-400" />
        </Button>
      </div>

      {/* Enhanced Settings Panel */}
      <div
        className={`absolute top-0 right-0 h-full settings-panel bg-black/90 backdrop-blur-xl border-l border-green-400/30 transform transition-transform duration-300 z-50 ${
          settingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold cyber-font text-white glow-text">CONFIGURACIÓN</h2>
            <Button onClick={() => setSettingsOpen(false)} className="cyber-nav-button p-2 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6 flex-1">
            {Object.entries(settings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-white cyber-font capitalize text-sm">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <Button
                  onClick={() => handleSettingsToggle(key as keyof typeof settings)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    value ? "bg-green-400 shadow-green" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      value ? "translate-x-3" : "-translate-x-3"
                    }`}
                  />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4 mt-8">
            <Button className="w-full cyber-button-secondary">
              <Camera className="w-5 h-5 mr-2" />
              Cámara
            </Button>
            <Button className="w-full cyber-button-secondary">
              <Volume2 className="w-5 h-5 mr-2" />
              Audio
            </Button>
            <Button className="w-full cyber-button-secondary">
              <Wifi className="w-5 h-5 mr-2" />
              Conexión
            </Button>

            <Button onClick={handleEndMatch} className="w-full end-match-button mt-8">
              Finalizar partido
            </Button>
          </div>
        </div>
      </div>

      {/* Match End Overlay */}
      {matchEnded && (
        <div className="absolute inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="match-end-card backdrop-blur-xl border-0 overflow-hidden max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold cyber-font text-white mb-4">PARTIDO FINALIZADO</h2>
              <div className="text-6xl font-bold cyber-font laser-green-text mb-6">
                {sets.reduce((acc, set) => acc + (set.lucia > set.alex ? 1 : 0), 0)} -{" "}
                {sets.reduce((acc, set) => acc + (set.alex > set.lucia ? 1 : 0), 0)}
              </div>
              <p className="text-gray-300 mb-8 cyber-font">{matchWinner?.toUpperCase()} GANA!</p>
              <div className="space-y-4">
                <Link href="/match-stats">
                  <Button className="w-full cyber-button-primary">
                    <Play className="w-5 h-5 mr-2" />
                    Ver estadísticas
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full cyber-button-secondary">Volver al inicio</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="fixed bottom-4 right-4 bg-black/60 text-green-400 p-2 rounded text-xs">
        {voice.listening ? "Agente activo" : "Agente inactivo"}
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        .cyber-font {
          font-family: 'Orbitron', monospace;
          font-size: max(14px, 1rem);
        }

        .settings-panel {
          width: 75%;
        }

        @media (min-width: 768px) {
          .settings-panel {
            width: 40%;
          }
        }

        @media (max-width: 400px) {
          .enhanced-scoreboard {
            transform: scale(0.9);
          }
          
          .enhanced-scoreboard .grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .cyber-font {
            font-size: 14px;
          }
        }

        .glow-text {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8);
        }

        .laser-green-text {
          color: #00FF9E;
          text-shadow: 
            0 0 20px rgba(0, 255, 158, 0.8),
            0 0 40px rgba(0, 255, 158, 0.6),
            0 2px 4px rgba(0, 0, 0, 0.8);
          filter: drop-shadow(0 0 10px rgba(0, 255, 158, 0.4));
        }

        .enhanced-scoreboard {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 0 30px rgba(0, 255, 158, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.05);
          transition: all 0.5s ease;
        }

        .enhanced-scoreboard.match-ended {
          box-shadow: 
            0 0 50px rgba(0, 255, 158, 0.6),
            inset 0 0 50px rgba(0, 255, 158, 0.1);
          animation: victory-glow 2s ease-in-out infinite alternate;
        }

        @keyframes victory-glow {
          0% {
            box-shadow: 
              0 0 50px rgba(0, 255, 158, 0.6),
              inset 0 0 50px rgba(0, 255, 158, 0.1);
          }
          100% {
            box-shadow: 
              0 0 70px rgba(0, 255, 158, 0.8),
              inset 0 0 70px rgba(0, 255, 158, 0.2);
          }
        }

        .match-end-card {
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 0 50px rgba(0, 255, 158, 0.3),
            inset 0 0 50px rgba(255, 255, 255, 0.05);
        }

        .server-ball {
          box-shadow: 0 0 15px rgba(0, 255, 158, 0.8);
        }

        .speed-message {
          animation: float-up 3s ease-out forwards;
        }

        @keyframes float-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          80% {
            opacity: 1;
            transform: translateY(-10px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
        }

        .settings-handler {
          transition: all 0.3s ease;
        }

        .settings-handler:hover {
          background: rgba(0, 255, 158, 0.3);
          transform: translateX(-2px);
        }

        .emerald-mic-button {
          background: 
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 70%),
            linear-gradient(135deg, rgba(0, 255, 158, 0.8) 0%, rgba(0, 200, 120, 0.9) 100%);
          border: 2px solid rgba(0, 255, 158, 0.6);
          box-shadow: 
            0 0 30px rgba(0, 255, 158, 0.4),
            0 8px 25px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .emerald-mic-button:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 40px rgba(0, 255, 158, 0.6),
            0 8px 25px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .emerald-mic-button.listening {
          animation: listening-pulse 1.5s ease-in-out infinite;
        }

        @keyframes listening-pulse {
          0%, 100% {
            box-shadow: 
              0 0 30px rgba(0, 255, 158, 0.4),
              0 8px 25px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 
              0 0 50px rgba(0, 255, 158, 0.8),
              0 8px 25px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
        }

        .shadow-green {
          box-shadow: 0 0 10px rgba(0, 255, 158, 0.6);
        }

        .shadow-red {
          box-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
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

        .cyber-button-primary {
          background: linear-gradient(135deg, rgba(0, 255, 158, 0.2) 0%, rgba(0, 255, 255, 0.2) 100%);
          border: 2px solid rgba(0, 255, 158, 0.5);
          color: white;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .cyber-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 158, 0.4);
          border-color: rgba(0, 255, 158, 0.8);
        }

        .cyber-button-secondary {
          background: linear-gradient(135deg, rgba(128, 0, 255, 0.2) 0%, rgba(255, 0, 128, 0.2) 100%);
          border: 2px solid rgba(128, 0, 128, 0.5);
          color: white;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .cyber-button-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(128, 0, 128, 0.4);
          border-color: rgba(128, 0, 128, 0.8);
        }

        .end-match-button {
          background: linear-gradient(135deg, rgba(128, 0, 128, 0.8) 0%, rgba(75, 0, 130, 0.9) 100%);
          border: 2px solid rgba(128, 0, 128, 0.6);
          color: white;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 600;
        }

        .end-match-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(128, 0, 128, 0.4);
          border-color: rgba(128, 0, 128, 0.8);
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .speed-message,
          .enhanced-scoreboard,
          .emerald-mic-button,
          .victory-glow,
          .listening-pulse {
            animation: none !important;
          }
          
          .cyber-nav-button:hover,
          .cyber-button-primary:hover,
          .cyber-button-secondary:hover,
          .end-match-button:hover {
            transform: none !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .enhanced-scoreboard {
            border: 2px solid #00FF9E;
          }
          
          .cyber-font {
            font-weight: 600;
          }
        }

        /* Mobile touch optimizations */
        @media (hover: none) and (pointer: coarse) {
          .emerald-mic-button:active {
            transform: scale(0.95);
          }
          
          .cyber-nav-button:active,
          .cyber-button-primary:active,
          .cyber-button-secondary:active,
          .end-match-button:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  )
}
