import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "../../store/useGameStore";

export function CrashCart() {
  const { cartAttached, activeInteraction, thermalVisionMode } = useGameStore();
  const isSelected = activeInteraction.type === "cart";
  const cartRef = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!cartRef.current || !meshGroupRef.current) return;

    // In attached mode, the cart physical position is managed by the operator
    if (cartAttached) {
      // The operator will push the cart, so we let the physics collide naturally or update position
    }
  });

  return (
    <RigidBody ref={cartRef} colliders="cuboid" position={[-8, 1, 8]} lockRotations>
      <group ref={meshGroupRef}>
        {/* Cart Metal Shelves */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.6, 1.0]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#475569"} metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Top Handle */}
        <mesh position={[0, 1.7, 0.45]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.2]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Tool Items sitting on shelves */}
        <group position={[0, 1.65, -0.2]}>
          {/* Spool of Cat6 Cable (Blue) */}
          <mesh position={[-0.3, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.3]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.4} />
          </mesh>
          {/* Spool of OM3 Fiber Cable (Yellow) */}
          <mesh position={[0.3, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.3]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        </group>

        {/* Wheels */}
        <mesh position={[-0.65, 0.1, -0.4]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.15, 0.1]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <mesh position={[0.65, 0.1, -0.4]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.15, 0.1]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <mesh position={[-0.65, 0.1, 0.4]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.15, 0.1]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <mesh position={[0.65, 0.1, 0.4]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.15, 0.1]} /><meshStandardMaterial color="#0f172a" /></mesh>

        {/* Selection Bounding Ring */}
        {isSelected && !thermalVisionMode && (
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.4, 32]} />
            <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
}
