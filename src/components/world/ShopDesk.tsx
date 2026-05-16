import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "../../store/useGameStore";

export function ShopDesk() {
  const { activeInteraction, thermalVisionMode } = useGameStore();
  const isSelected = activeInteraction.type === "shop";

  return (
    <RigidBody type="fixed" colliders="cuboid" position={[-12, 1.5, 12]}>
      <group>
        {/* Wooden / Industrial Desk */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <boxGeometry args={[3.5, 3.0, 1.8]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#334155"} roughness={0.7} />
        </mesh>

        {/* Desktop Monitor Screen (Procurement Terminal) */}
        <mesh position={[0, 2.2, 0]} rotation={[0, Math.PI / 8, 0]}>
          <boxGeometry args={[1.8, 1.2, 0.1]} />
          <meshStandardMaterial color="#0f172a" />
          {/* Glowing Green Terminal Screen */}
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[1.6, 1.0]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </mesh>

        {/* Keyboard */}
        <mesh position={[0, 1.55, 0.5]}>
          <boxGeometry args={[1.2, 0.05, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Selection Glow Indicator */}
        {isSelected && !thermalVisionMode && (
          <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.2, 2.5, 32]} />
            <meshBasicMaterial color="#22c55e" side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
}
