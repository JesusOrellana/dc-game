import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "../../store/useGameStore";

export function Operator() {
  const bodyRef      = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const { camera }   = useThree();
  const keys         = useRef({ w: false, a: false, s: false, d: false });
  const { setActiveInteraction, racks, thermalVisionMode, cartAttached } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.w = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.a = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.s = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.d = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.w = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.a = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.s = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.d = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!bodyRef.current || !meshGroupRef.current) return;

    // Movement speed drops from 8.0 to 5.2 m/s when pushing the heavy Crash Cart
    const speed = cartAttached ? 5.2 : 8.0;
    const vel = { x: 0, z: 0 };

    if (keys.current.w) vel.z -= speed;
    if (keys.current.s) vel.z += speed;
    if (keys.current.a) vel.x -= speed;
    if (keys.current.d) vel.x += speed;

    if (vel.x !== 0 && vel.z !== 0) {
      vel.x *= 0.7071;
      vel.z *= 0.7071;
    }

    bodyRef.current.setLinvel({ x: vel.x, y: bodyRef.current.linvel().y, z: vel.z }, true);

    if (vel.x !== 0 || vel.z !== 0) {
      const targetAngle = Math.atan2(vel.x, vel.z);
      meshGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        meshGroupRef.current.rotation.y,
        targetAngle,
        delta * 12
      );
    }

    const pos = bodyRef.current.translation();
    camera.position.lerp(new THREE.Vector3(pos.x + 16, pos.y + 22, pos.z + 16), delta * 8);
    camera.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z));

    // Interaction Proximity Checks
    let closestRackId: number | null = null;
    let minDist = 3.8;

    racks.forEach((rack) => {
      const rx = rack.position[0];
      const rz = rack.position[2];
      const dist = Math.hypot(pos.x - rx, pos.z - rz);
      if (dist < minDist) {
        minDist = dist;
        closestRackId = rack.id;
      }
    });

    if (closestRackId !== null) {
      setActiveInteraction("rack", closestRackId);
    } else {
      const shopDist = Math.hypot(pos.x - (-12), pos.z - 12);
      const cartDist = Math.hypot(pos.x - (-8), pos.z - 8);
      const pduDist  = Math.hypot(pos.x - 0, pos.z - (-15));

      if (shopDist < 4.0) {
        setActiveInteraction("shop", null);
      } else if (cartDist < 3.5 && !cartAttached) {
        setActiveInteraction("cart", null);
      } else if (pduDist < 4.5) {
        setActiveInteraction("pdu", null);
      } else {
        setActiveInteraction(null, null);
      }
    }
  });

  return (
    <RigidBody ref={bodyRef} colliders="cuboid" lockRotations position={[0, 2, 8]}>
      <group ref={meshGroupRef}>
        {/* Head */}
        <mesh position={[0, 2.0, 0]} castShadow>
          <boxGeometry args={[0.7, 0.5, 0.7]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#facc15"} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.6]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#fed7aa"} roughness={0.6} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.85, 1.0, 0.5]} />
          <meshStandardMaterial color={thermalVisionMode ? "#ff4500" : "#f97316"} roughness={0.4} />
        </mesh>
        {!thermalVisionMode && (
          <mesh position={[0, 0.9, 0.26]}>
            <boxGeometry args={[0.85, 0.2, 0.02]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        )}

        {/* Arms */}
        <mesh position={[-0.55, 0.9, 0]} castShadow>
          <boxGeometry args={[0.25, 0.9, 0.25]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#334155"} roughness={0.7} />
        </mesh>
        <mesh position={[0.55, 0.9, 0]} castShadow>
          <boxGeometry args={[0.25, 0.9, 0.25]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#334155"} roughness={0.7} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.25, 0.1, 0]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#1e293b"} roughness={0.8} />
        </mesh>
        <mesh position={[0.25, 0.1, 0]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#1e293b"} roughness={0.8} />
        </mesh>
      </group>
    </RigidBody>
  );
}
