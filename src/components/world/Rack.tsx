import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { RackState, useGameStore } from "../../store/useGameStore";

export function Rack({ rack }: { rack: RackState }) {
  const { activeInteraction, thermalVisionMode } = useGameStore();
  const isSelected = activeInteraction.type === "rack" && activeInteraction.targetId === rack.id;
  
  const ledRef = useRef<THREE.MeshBasicMaterial>(null);
  const warnRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ledRef.current) {
      if (!rack.isOn) {
        ledRef.current.color.set("#1e293b"); // Off
      } else {
        // Normal pulsing green
        const intensity = THREE.MathUtils.clamp(Math.sin(t * 8) * 0.5 + 0.5, 0.2, 1.0);
        ledRef.current.color.setRGB(0.1, intensity * 0.8, 0.3);
      }
    }
    if (warnRef.current) {
      if (rack.hasSpof || rack.isBottleneck || rack.isOverheating) {
        const pulse = Math.sin(t * 15) > 0 ? 1 : 0.2;
        warnRef.current.color.set(rack.isOverheating ? "#ef4444" : rack.hasSpof ? "#f97316" : "#3b82f6");
        warnRef.current.opacity = pulse;
      } else {
        warnRef.current.opacity = 0;
      }
    }
  });

  return (
    <RigidBody type="fixed" colliders="cuboid" position={rack.position}>
      <group>
        {/* Main Cabinet Body */}
        <mesh castShadow receiveShadow position={[0, 2, 0]}>
          <boxGeometry args={[2.2, 4.0, 2.2]} />
          <meshStandardMaterial
            color={thermalVisionMode ? (rack.isOverheating ? "#ef4444" : rack.isOn ? "#f59e0b" : "#3b82f6") : "#0f172a"}
            roughness={thermalVisionMode ? 0.9 : 0.4}
            metalness={thermalVisionMode ? 0.0 : 0.8}
            emissive={thermalVisionMode ? (rack.isOverheating ? "#ef4444" : "#000000") : "#000000"}
          />
        </mesh>

        {/* Server Blade Door / Mesh */}
        <mesh position={[0, 2, 1.11]}>
          <boxGeometry args={[1.8, 3.6, 0.05]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.9} wireframe />
        </mesh>

        {/* Server LEDs */}
        <mesh position={[-0.7, 3.5, 1.14]}>
          <boxGeometry args={[0.2, 0.1, 0.05]} />
          <meshBasicMaterial ref={ledRef} color="#22c55e" />
        </mesh>

        {/* Warning Indicator Beacon on top */}
        <mesh position={[0, 4.2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
          <meshBasicMaterial ref={warnRef} color="#ef4444" transparent opacity={0} />
        </mesh>

        {/* Active Selection Glow Ring */}
        {isSelected && (
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.6, 1.9, 32]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Floating Name Label */}
        <group position={[0, 4.8, 0]}>
          {/* We will draw HTML overlay labels in UI, or use simple 3D text */}
        </group>
      </group>
    </RigidBody>
  );
}
