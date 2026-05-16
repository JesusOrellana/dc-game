import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore, type RackState } from "../../store/useGameStore";

// Pure helper function declared outside React component scope
function generateSmokePositions(): Float32Array {
  const arr = new Float32Array(45);
  for (let i = 0; i < 45; i++) {
    arr[i] = (Math.random() - 0.5) * 2;
  }
  return arr;
}

export function Rack({ rack }: { rack: RackState }) {
  const { activeInteraction, thermalVisionMode } = useGameStore();
  const isSelected = activeInteraction.type === "rack" && activeInteraction.targetId === rack.id;
  
  const ledRef  = useRef<THREE.MeshBasicMaterial>(null);
  const warnRef = useRef<THREE.MeshBasicMaterial>(null);
  const heatRef = useRef<THREE.MeshStandardMaterial>(null);

  const smokePositions = useMemo(() => generateSmokePositions(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ledRef.current) {
      if (!rack.isOn) {
        ledRef.current.color.set("#1e293b"); // Off
      } else {
        // Normal blinking activity (Green for optimal, Yellow for SPOF/Bottleneck, Red for Overheat)
        const activeColor = rack.isOverheating ? "#ef4444" : (rack.hasSpof || rack.isBottleneck) ? "#facc15" : "#22c55e";
        const intensity = THREE.MathUtils.clamp(Math.sin(t * 15 + rack.id) * 0.5 + 0.5, 0.2, 1.0);
        ledRef.current.color.set(activeColor);
        ledRef.current.opacity = intensity;
      }
    }
    if (warnRef.current) {
      if (rack.hasSpof || rack.isBottleneck || rack.isOverheating) {
        const pulse = Math.sin(t * 10) > 0 ? 1 : 0.2;
        warnRef.current.color.set(rack.isOverheating ? "#ef4444" : rack.hasSpof ? "#f97316" : "#3b82f6");
        warnRef.current.opacity = pulse;
      } else {
        warnRef.current.opacity = 0;
      }
    }
    if (heatRef.current && thermalVisionMode) {
      const targetHex = rack.isOverheating ? "#ff4500" : rack.isOn ? "#1e3a8a" : "#0f172a";
      heatRef.current.color.lerp(new THREE.Color(targetHex), 0.1);
      heatRef.current.emissive.lerp(new THREE.Color(rack.isOverheating ? "#ff2a00" : "#000000"), 0.1);
    }
  });

  const baseColor = "#1e293b";

  return (
    <RigidBody type="fixed" colliders="cuboid" position={rack.position}>
      <group>
        {/* Main Cabinet Chassis */}
        <mesh castShadow receiveShadow position={[0, 2.2, 0]}>
          <boxGeometry args={[2.4, 4.4, 2.4]} />
          <meshStandardMaterial
            ref={heatRef}
            color={thermalVisionMode ? (rack.isOverheating ? "#ff4500" : "#1e3a8a") : baseColor}
            roughness={thermalVisionMode ? 0.8 : 0.4}
            metalness={thermalVisionMode ? 0.0 : 0.8}
          />
        </mesh>

        {/* Server Front Perforated Mesh / Vents */}
        {!thermalVisionMode && (
          <group position={[0, 2.2, 1.21]}>
            <mesh position={[0, 0.8, 0]}><boxGeometry args={[2.0, 1.2, 0.05]} /><meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} wireframe /></mesh>
            <mesh position={[0, -0.8, 0]}><boxGeometry args={[2.0, 1.2, 0.05]} /><meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} wireframe /></mesh>
          </group>
        )}

        {/* High-Fidelity Server LEDs on Front Bezel */}
        <mesh position={[-0.8, 3.8, 1.24]}>
          <boxGeometry args={[0.3, 0.12, 0.05]} />
          <meshBasicMaterial ref={ledRef} color="#22c55e" transparent />
        </mesh>

        {/* Top Warning Beacon */}
        <mesh position={[0, 4.6, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.4, 16]} />
          <meshBasicMaterial ref={warnRef} color="#ef4444" transparent opacity={0} />
        </mesh>

        {/* Interaction Glow Bounding Box (Outline) */}
        {isSelected && !thermalVisionMode && (
          <group position={[0, 2.2, 0]}>
            <mesh>
              <boxGeometry args={[2.6, 4.6, 2.6]} />
              <meshBasicMaterial color="#38bdf8" wireframe wireframeLinewidth={3} transparent opacity={0.8} />
            </mesh>
            {/* Ground indicator ring */}
            <mesh position={[0, -2.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.8, 2.1, 32]} />
              <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* Floating Heat Smoke Particles when Overheating in Thermal Mode */}
        {thermalVisionMode && rack.isOverheating && (
          <points position={[0, 4.5, 0]}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={15} array={smokePositions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.3} color="#ffaa00" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
          </points>
        )}
      </group>
    </RigidBody>
  );
}
