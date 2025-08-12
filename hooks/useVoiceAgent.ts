'use client'

import { useEffect, useRef, useState } from 'react'
import { statStore } from '@/lib/statStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function useVoiceAgent(active: boolean) {
  const [listening, setListening] = useState(false)
  const [muted, setMuted] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (active) {
      start()
    } else if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
  }, [active])

  function initRecognition() {
    if (recognitionRef.current) return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('')
      handleQuery(text)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    synthRef.current = window.speechSynthesis
  }

  function start() {
    initRecognition()
    try {
      recognitionRef.current?.start()
      setListening(true)
    } catch (err) {
      console.error('No se pudo iniciar el reconocimiento', err)
    }
  }

  async function handleQuery(text: string) {
    const cleaned = text.trim().toLowerCase()
    if (!cleaned) return
    
    if (cleaned.includes('activar')) {
      setMuted(false)
      speak('Micrófono activado')
      return
    }

    if (muted) return

    const history = [...messages, { role: 'user', content: cleaned }]
    setMessages(history)
    const answer = await getAnswer(cleaned, history)
    setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    speak(answer)
  }

  function speak(text: string) {
    if (!synthRef.current) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'es-ES'
    synthRef.current.speak(utter)
  }

  async function getAnswer(text: string, history: Message[]): Promise<string> {
    if (/duraci[oó]n.*punto/i.test(text)) {
      const durations = statStore.points.map(
        (p) => ((p.end ?? Date.now()) - p.start) / 1000
      )
      if (durations.length === 0) return 'Aún no hay datos de puntos.'
      const avg = (
        durations.reduce((a, b) => a + b, 0) / durations.length
      ).toFixed(1)
      return `La duración promedio de los puntos es ${avg} segundos.`
    }

    if (/velocidad.*saque/i.test(text)) {
      const speeds = statStore.serves.map((s) => s.speed)
      if (speeds.length === 0) return 'No se han detectado saques todavía.'
      const max = Math.max(...speeds)
      return `La velocidad máxima de saque registrada es ${max} km/h.`
    }

    try {
      const res = await fetch('/api/voice-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, history })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return typeof data.answer === 'string'
          ? data.answer
          : 'Error al contactar el modelo.'
      }
      return data.answer ?? 'Respuesta vacía del modelo.'
    } catch (e) {
      return 'Error al contactar el modelo.'
    }
  }

  const toggleMute = () => setMuted((m) => !m)

  return { listening, messages, muted, toggleMute, start }
}

