import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, HueSaturation, BrightnessContrast } from "@react-three/postprocessing";
import { useGameStore } from "../../store/useGameStore";

// Pure helper function declared outside React component scope
function generateParticlePositions(): Float32Array {
  const arr = new Float32Array(900);
  for (let i = 0; i < 900; i++) {
    arr[i] = (Math.random() - 0.5) * 26;
  }
  return arr;
}

export function DCLighting() {
  const { pduAOnline, pduBOnline, hvacOnline, thermalVisionMode } = useGameStore();
  const emergencyMode = !pduAOnline || !pduBOnline;
  const alarmLightRef = useRef<THREE.PointLight>(null);
  const particlesRef  = useRef<THREE.Points>(null);

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
    if (particlesRef.current && hvacOnline && !thermalVisionMode) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 0.08; // Air blowing down
        if (pos[i] < 0) pos[i] = 12;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Soft Global Ambient Lighting */}
      <ambientLight 
        intensity={thermalVisionMode ? 0.2 : emergencyMode ? 0.3 : 1.2} 
        color={thermalVisionMode ? "#0f172a" : emergencyMode ? "#ffcfcf" : "#f8fafc"} 
      />

      {/* Main Overhead High-Bay Directional Light with Soft Shadows */}
      {!thermalVisionMode && (
        <>
          <directionalLight 
            position={[18, 30, 15]} 
            intensity={emergencyMode ? 0.5 : 2.5} 
            color="#ffffff"
            castShadow 
            shadow-mapSize={[4096, 4096]} 
            shadow-bias={-0.0001}
            shadow-normalBias={0.02}
          >
            <orthographicCamera attach="shadow-camera" args={[-28, 28, 28, -28, 0.5, 80]} />
          </directionalLight>

          {/* Secondary Fill Light for Cold Aisle Blue Tint */}
          <pointLight position={[0, 14, -4]} intensity={2.0} color="#38bdf8" distance={35} decay={1.5} />
          {/* Warm Fill Light for Hot Aisle Back */}
          <pointLight position={[0, 14, 4]} intensity={1.5} color="#fb923c" distance={35} decay={1.5} />
        </>
      )}

      {/* Emergency Red Strobes */}
      <pointLight ref={alarmLightRef} position={[0, 12, 0]} color="#ef4444" distance={50} decay={1.2} intensity={0} />

      {/* HVAC Cold Aisle Dust/Air Particles */}
      {!thermalVisionMode && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={300} array={particlePositions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.12} color="#7dd3fc" transparent opacity={hvacOnline ? 0.5 : 0} blending={THREE.AdditiveBlending} />
        </points>
      )}

      {/* Postprocessing Pipeline for Cinematic Neon Glow & Thermal Mode */}
      <EffectComposer disableNormalPass multisampling={4}>
        <Bloom 
          intensity={thermalVisionMode ? 2.5 : 1.2} 
          luminanceThreshold={thermalVisionMode ? 0.1 : 0.6} 
          luminanceSmoothing={0.3} 
          mipmapBlur 
        />
        {thermalVisionMode && (
          <>
            <HueSaturation saturation={-0.8} hue={0.1} />
            <BrightnessContrast brightness={-0.1} contrast={0.4} />
          </>
        )}
      </EffectComposer>
    </group>
  );
}
