import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/useGameStore";

// Pure helper function declared outside React component scope
function generateParticlePositions(): Float32Array {
  const arr = new Float32Array(900);
  for (let i = 0; i < 900; i++) {
    arr[i] = (Math.random() - 0.5) * 24;
  }
  return arr;
}

export function DCLighting() {
  const { pduAOnline, pduBOnline, hvacOnline, thermalVisionMode } = useGameStore();
  const emergencyMode = !pduAOnline || !pduBOnline;
  const alarmLightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particlePositions = useMemo(() => generateParticlePositions(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (alarmLightRef.current) {
      if (emergencyMode && !thermalVisionMode) {
        const pulse = Math.sin(t * 12) * 2 + 3;
        alarmLightRef.current.intensity = pulse;
      } else {
        alarmLightRef.current.intensity = 0;
      }
    }
    if (particlesRef.current && hvacOnline) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 0.05; // Air blowing down
        if (pos[i] < 0) pos[i] = 10;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Ambient Fill */}
      <ambientLight intensity={thermalVisionMode ? 0.8 : emergencyMode ? 0.2 : 0.6} color={thermalVisionMode ? "#475569" : emergencyMode ? "#fee2e2" : "#e2e8f0"} />

      {/* Main Overhead High-Bay LED Lights */}
      {!thermalVisionMode && (
        <>
          <directionalLight position={[10, 20, 10]} intensity={emergencyMode ? 0.3 : 1.8} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001}>
            <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20, 0.5, 50]} />
          </directionalLight>
          <pointLight position={[0, 12, -4]} intensity={1.5} color="#60a5fa" distance={30} decay={1.5} />
        </>
      )}

      {/* Emergency Red Strobes */}
      <pointLight ref={alarmLightRef} position={[0, 10, 0]} color="#ef4444" distance={40} decay={1.2} intensity={0} />

      {/* HVAC Cold Aisle Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={300} array={particlePositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#38bdf8" transparent opacity={hvacOnline ? 0.4 : 0} />
      </points>
    </group>
  );
}
