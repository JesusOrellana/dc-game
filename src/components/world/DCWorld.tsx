import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { DataCenterEnvironment } from "./DataCenterEnvironment";
import { Rack } from "./Rack";
import { CrashCart } from "./CrashCart";
import { ShopDesk } from "./ShopDesk";
import { Operator } from "../operator/Operator";
import { DCLighting } from "../effects/DCLighting";
import { useGameStore } from "../../store/useGameStore";

export function DCWorld() {
  const { racks, tickDayTime, generateProceduralTicket, gameOver } = useGameStore();

  // Master Systemic Procedural Simulation Loop (1 second intervals)
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      tickDayTime(1);
      // Relaxed 3.5% chance every second to generate a new ticket (~1 ticket every 28s) for balanced gameplay pacing
      if (Math.random() < 0.035) {
        generateProceduralTicket();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tickDayTime, generateProceduralTicket, gameOver]);

  return (
    <div className="absolute inset-0 w-full h-screen bg-slate-950">
      <Canvas
        shadows
        orthographic
        camera={{ position: [20, 26, 20], zoom: 38, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={null}>
          <DCLighting />
          <Physics gravity={[0, -25, 0]}>
            <DataCenterEnvironment />
            {racks.map((rack) => (
              <Rack key={rack.id} rack={rack} />
            ))}
            <CrashCart />
            <ShopDesk />
            <Operator />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
