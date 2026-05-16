import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { DataCenterEnvironment } from "./DataCenterEnvironment";
import { Rack } from "./Rack";
import { Operator } from "../operator/Operator";
import { DCLighting } from "../effects/DCLighting";
import { useGameStore } from "../../store/useGameStore";

export function DCWorld() {
  const { racks } = useGameStore();

  return (
    <div className="absolute inset-0 w-full h-screen bg-slate-950">
      <Canvas
        shadows
        orthographic
        camera={{ position: [20, 24, 20], zoom: 36, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={null}>
          <DCLighting />
          <Physics gravity={[0, -20, 0]}>
            <DataCenterEnvironment />
            {racks.map((rack) => (
              <Rack key={rack.id} rack={rack} />
            ))}
            <Operator />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
