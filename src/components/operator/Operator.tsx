import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "../../store/useGameStore";

export function Operator() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const { setActiveInteraction, racks } = useGameStore();

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

    const speed = 7.0;
    const vel = { x: 0, z: 0 };

    if (keys.current.w) vel.z -= speed;
    if (keys.current.s) vel.z += speed;
    if (keys.current.a) vel.x -= speed;
    if (keys.current.d) vel.x += speed;

    // Normalize diagonal velocity
    if (vel.x !== 0 && vel.z !== 0) {
      vel.x *= 0.7071;
      vel.z *= 0.7071;
    }

    bodyRef.current.setLinvel({ x: vel.x, y: bodyRef.current.linvel().y, z: vel.z }, true);

    // Rotate character mesh towards movement direction
    if (vel.x !== 0 || vel.z !== 0) {
      const targetAngle = Math.atan2(vel.x, vel.z);
      meshGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        meshGroupRef.current.rotation.y,
        targetAngle,
        delta * 12
      );
    }

    // Camera follow (isometric offset)
    const pos = bodyRef.current.translation();
    camera.position.lerp(new THREE.Vector3(pos.x + 12, pos.y + 16, pos.z + 12), delta * 8);
    camera.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z));

    // Check interaction proximity with racks
    let closestRackId: number | null = null;
    let minDist = 3.5;

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
      // Check proximity to PDU buttons at the back wall (-4, 0, -10)
      const pduDist = Math.hypot(pos.x - 0, pos.z - (-10));
      if (pduDist < 4.0) {
        setActiveInteraction("pdu", null);
      } else {
        setActiveInteraction(null, null);
      }
    }
  });

  return (
    <RigidBody ref={bodyRef} colliders="cuboid" lockRotations position={[0, 2, 4]}>
      <group ref={meshGroupRef}>
        {/* Head */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#fde047" roughness={0.4} /> {/* Yellow Hard Hat */}
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} /> {/* Face */}
        </mesh>

        {/* Body (High-Vis Vest) */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.7, 0.8, 0.4]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} /> {/* Orange Vest */}
        </mesh>

        {/* Arms */}
        <mesh position={[-0.45, 0.6, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        <mesh position={[0.45, 0.6, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.2, -0.1, 0]} castShadow>
          <boxGeometry args={[0.25, 0.7, 0.25]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh position={[0.2, -0.1, 0]} castShadow>
          <boxGeometry args={[0.25, 0.7, 0.25]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>
    </RigidBody>
  );
}
