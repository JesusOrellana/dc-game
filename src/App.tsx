import { DCWorld } from "./components/world/DCWorld";
import { HUDOverlay } from "./components/ui/HUDOverlay";
import "./index.css";

export default function App() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-950 font-mono">
      <DCWorld />
      <HUDOverlay />
    </main>
  );
}
