import { RigidBody } from "@react-three/rapier";
import { useGameStore } from "../../store/useGameStore";

export function DataCenterEnvironment() {
  const { pduAOnline, pduBOnline, hvacOnline } = useGameStore();

  const cols = 14;
  const rows = 14;
  const tileW = 2;

  const tiles = [];
  for (let x = -cols / 2; x < cols / 2; x++) {
    for (let z = -rows / 2; z < rows / 2; z++) {
      const isColdAisle = z >= -5 && z <= -3;
      tiles.push(
        <mesh key={`${x}-${z}`} position={[x * tileW + 1, 0, z * tileW + 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[tileW, tileW]} />
          <meshStandardMaterial
            color={(x + z) % 2 === 0 ? "#1e293b" : "#0f172a"}
            roughness={isColdAisle ? 0.3 : 0.6}
            metalness={isColdAisle ? 0.8 : 0.2}
          />
        </mesh>
      );
    }
  }

  return (
    <group>
      {/* Floor Collision */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[cols * tileW, 1, rows * tileW]} />
          <meshStandardMaterial color="#0b0f19" />
        </mesh>
      </RigidBody>

      {/* Raised Floor Tiles */}
      <group position={[0, 0.01, 0]}>{tiles}</group>

      {/* Back Wall with PDU Power Panels */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 6, -14]}>
        <mesh receiveShadow>
          <boxGeometry args={[28, 12, 1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Side Walls */}
      <RigidBody type="fixed" colliders="cuboid" position={[-14, 6, 0]}>
        <mesh receiveShadow><boxGeometry args={[1, 12, 28]} /><meshStandardMaterial color="#0f172a" /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[14, 6, 0]}>
        <mesh receiveShadow><boxGeometry args={[1, 12, 28]} /><meshStandardMaterial color="#0f172a" /></mesh>
      </RigidBody>

      {/* PDU-A Panel Box */}
      <RigidBody type="fixed" colliders="cuboid" position={[-4, 3, -13.2]}>
        <mesh castShadow>
          <boxGeometry args={[3, 5, 1]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0.55]}>
          <boxGeometry args={[0.5, 0.5, 0.1]} />
          <meshBasicMaterial color={pduAOnline ? "#3b82f6" : "#ef4444"} /> {/* Blue Online */}
        </mesh>
      </RigidBody>

      {/* PDU-B Panel Box */}
      <RigidBody type="fixed" colliders="cuboid" position={[4, 3, -13.2]}>
        <mesh castShadow>
          <boxGeometry args={[3, 5, 1]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0.55]}>
          <boxGeometry args={[0.5, 0.5, 0.1]} />
          <meshBasicMaterial color={pduBOnline ? "#22c55e" : "#ef4444"} /> {/* Green Online */}
        </mesh>
      </RigidBody>

      {/* Overhead Cable Trays & HVAC Duct */}
      <group position={[0, 9, -4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[24, 0.5, 1.5]} />
          <meshStandardMaterial color="#334155" metalness={0.9} wireframe />
        </mesh>
        {/* Yellow Optical Fiber Trough */}
        <mesh position={[0, 0.6, -1]} castShadow>
          <boxGeometry args={[24, 0.3, 0.6]} />
          <meshStandardMaterial color="#eab308" roughness={0.4} />
        </mesh>
        {/* HVAC Cold Air Pipe */}
        <mesh position={[0, 1.5, 3]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 24, 16]} />
          <meshStandardMaterial color={hvacOnline ? "#94a3b8" : "#475569"} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
