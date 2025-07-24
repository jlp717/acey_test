"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh } from "three"

export default function TennisCourtScene() {
  const courtRef = useRef<Mesh>(null)
  const fogRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (fogRef.current) {
      fogRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* Tennis Court Base */}
      <mesh ref={courtRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[24, 11]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Court Lines */}
      <group position={[0, -1.9, 0]}>
        {/* Outer boundary */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[11.8, 12, 4]} />
          <meshBasicMaterial color="#00FF9E" />
        </mesh>

        {/* Service boxes */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2.75]}>
          <ringGeometry args={[3.9, 4.1, 4]} />
          <meshBasicMaterial color="#00FF9E" />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2.75]}>
          <ringGeometry args={[3.9, 4.1, 4]} />
          <meshBasicMaterial color="#00FF9E" />
        </mesh>

        {/* Center line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, 11]} />
          <meshBasicMaterial color="#00FF9E" />
        </mesh>

        {/* Net posts */}
        <mesh position={[-6, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.2} />
        </mesh>

        <mesh position={[6, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#00FF9E" emissive="#00FF9E" emissiveIntensity={0.2} />
        </mesh>

        {/* Net */}
        <mesh position={[0, 0.5, 0]}>
          <planeGeometry args={[12, 1]} />
          <meshBasicMaterial color="#00FF9E" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Volumetric Fog Effect */}
      <mesh ref={fogRef} position={[0, 0, 0]}>
        <sphereGeometry args={[15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} fog={false} />
      </mesh>

      {/* Atmospheric particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 30, Math.random() * 10, (Math.random() - 0.5) * 20]}>
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color="#00FF9E" transparent opacity={Math.random() * 0.3} />
        </mesh>
      ))}
    </>
  )
}
