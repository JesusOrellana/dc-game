import { RigidBody } from "@react-three/rapier";
import { useGameStore } from "../../store/useGameStore";

export function DataCenterEnvironment() {
  const { pduAOnline, pduBOnline, hvacOnline, thermalVisionMode } = useGameStore();

  const cols  = 16;
  const rows  = 16;
  const tileW = 2;

  const floorTiles = [];
  for (let x = -cols / 2; x < cols / 2; x++) {
    for (let z = -rows / 2; z < rows / 2; z++) {
      const isColdAisle = z >= -5 && z <= -2;
      const isHotAisle  = z >= 2  && z <= 5;
      
      let tileColor = (x + z) % 2 === 0 ? "#cbd5e1" : "#e2e8f0"; // Bright clean industrial floor
      if (thermalVisionMode) tileColor = "#0f172a";

      let lineTint = null;
      if (isColdAisle && (z === -5 || z === -2)) lineTint = "#38bdf8"; // Cold aisle cyan boundary
      if (isHotAisle  && (z === 2  || z === 5))  lineTint = "#ef4444"; // Hot aisle red boundary

      floorTiles.push(
        <group key={`${x}-${z}`} position={[x * tileW + 1, 0, z * tileW + 1]}>
          {/* Main Floor Tile */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[tileW, tileW]} />
            <meshStandardMaterial
              color={tileColor}
              roughness={thermalVisionMode ? 0.9 : 0.25} // Low roughness for beautiful LED floor reflections
              metalness={thermalVisionMode ? 0.0 : 0.15}
            />
          </mesh>
          {/* Aisle Boundary Strip */}
          {lineTint && !thermalVisionMode && (
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[tileW, 0.15]} />
              <meshBasicMaterial color={lineTint} />
            </mesh>
          )}
        </group>
      );
    }
  }

  return (
    <group>
      {/* Underlying Solid Foundation */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[cols * tileW, 1, rows * tileW]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </RigidBody>

      {/* Raised Floor Surface */}
      <group position={[0, 0.01, 0]}>{floorTiles}</group>

      {/* Back Wall (Industrial light grey) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 7, -16]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[32, 14, 1]} />
          <meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#f8fafc"} roughness={0.6} />
        </mesh>
        {/* Wall Accent Piping (Yellow and Cyan conduits) */}
        {!thermalVisionMode && (
          <group position={[0, 2, 0.6]}>
            <mesh position={[0, 3, 0]}><boxGeometry args={[32, 0.2, 0.2]} /><meshStandardMaterial color="#eab308" metalness={0.6} /></mesh>
            <mesh position={[0, 2.5, 0]}><boxGeometry args={[32, 0.2, 0.2]} /><meshStandardMaterial color="#38bdf8" metalness={0.6} /></mesh>
          </group>
        )}
      </RigidBody>

      {/* Side Walls */}
      <RigidBody type="fixed" colliders="cuboid" position={[-16, 7, 0]}>
        <mesh receiveShadow><boxGeometry args={[1, 14, 32]} /><meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#f1f5f9"} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[16, 7, 0]}>
        <mesh receiveShadow><boxGeometry args={[1, 14, 32]} /><meshStandardMaterial color={thermalVisionMode ? "#0f172a" : "#f1f5f9"} /></mesh>
      </RigidBody>

      {/* PDU-A Main Power Panel (Left Back Wall) */}
      <RigidBody type="fixed" colliders="cuboid" position={[-6, 3.5, -15.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.5, 6, 1]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2, 0.55]}>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <meshBasicMaterial color={pduAOnline ? "#3b82f6" : "#ef4444"} /> {/* Bright Neon Indicator */}
        </mesh>
      </RigidBody>

      {/* PDU-B Main Power Panel (Right Back Wall) */}
      <RigidBody type="fixed" colliders="cuboid" position={[6, 3.5, -15.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.5, 6, 1]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2, 0.55]}>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <meshBasicMaterial color={pduBOnline ? "#22c55e" : "#ef4444"} /> {/* Bright Neon Indicator */}
        </mesh>
      </RigidBody>

      {/* Overhead Cable Trays & HVAC Duct */}
      <group position={[0, 11, -4]}>
        {/* Metallic Ladder Cable Tray */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[28, 0.6, 2.0]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} wireframe />
        </mesh>
        {/* Yellow Optical Fiber Trough */}
        <mesh position={[0, 0.8, -1.2]} castShadow>
          <boxGeometry args={[28, 0.4, 0.8]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Big Industrial HVAC Ducting */}
        <mesh position={[0, 2.2, 4]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.2, 28, 24]} />
          <meshStandardMaterial color={hvacOnline ? "#cbd5e1" : "#64748b"} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
