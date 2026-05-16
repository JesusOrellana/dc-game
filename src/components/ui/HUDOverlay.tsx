import { useEffect, useState } from "react";
import { 
  Zap, 
  Power, 
  Network, 
  Thermometer, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Wrench,
  X,
  ShieldCheck,
  Server
} from "lucide-react";
import { useGameStore, type CableStandard, type AwgGauge } from "../../store/useGameStore";

export function HUDOverlay() {
  const { 
    inventory, 
    equippedItem, 
    setEquippedItem, 
    activeInteraction, 
    racks, 
    objectives, 
    notification, 
    clearNotification,
    pduAOnline,
    pduBOnline,
    hvacOnline,
    togglePdu,
    toggleHvac,
    toggleThermalVision,
    connectPsu,
    disconnectPsu,
    changeDataCable,
    changePowerGauge
  } = useGameStore();

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (activeInteraction.type !== null) {
          setModalOpen(true);
        }
      }
      if (e.code === "Escape") {
        setModalOpen(false);
      }
      // Quick slot keys
      if (e.code === "Digit1") setEquippedItem(inventory[0] || null);
      if (e.code === "Digit2") setEquippedItem(inventory[1] || null);
      if (e.code === "Digit3") setEquippedItem(inventory[2] || null);
      if (e.code === "Digit4") setEquippedItem(inventory[3] || null);
      if (e.code === "Digit5") setEquippedItem(inventory[4] || null);
      if (e.code === "KeyT") toggleThermalVision();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeInteraction, inventory, setEquippedItem, toggleThermalVision]);

  const targetRack = racks.find((r) => r.id === activeInteraction.targetId);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none font-mono">
      
      {/* Top Bar: Title, System Status, Objectives */}
      <div className="flex items-start justify-between">
        
        {/* Game Title & Environmental Indicators */}
        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/80 backdrop-blur p-4 rounded-2xl shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm tracking-wider text-slate-100">DCCA SIMULATOR</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-3 text-xs">
            <button 
              onClick={() => togglePdu("A")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                pduAOnline ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              <Power className="w-3.5 h-3.5" /> PDU-A: {pduAOnline ? "ON" : "OFF"}
            </button>
            <button 
              onClick={() => togglePdu("B")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                pduBOnline ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              <Power className="w-3.5 h-3.5" /> PDU-B: {pduBOnline ? "ON" : "OFF"}
            </button>
            <button 
              onClick={toggleHvac}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                hvacOnline ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" /> HVAC: {hvacOnline ? "STABLE" : "OFF"}
            </button>
          </div>
        </div>

        {/* Real-Time Objectives Window */}
        <div className="w-80 bg-slate-900/90 border border-slate-700/80 backdrop-blur p-4 rounded-2xl shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Active Tasks
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              {objectives.filter((o) => o.completed).length}/{objectives.length}
            </span>
          </div>
          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {objectives.map((obj) => (
              <div key={obj.id} className={`p-2.5 rounded-xl border transition-all ${
                obj.completed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-slate-800/50 border-slate-700/60 text-slate-400"
              }`}>
                <div className="flex items-center gap-2">
                  {obj.completed ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />}
                  <span className={`text-xs font-bold truncate ${obj.completed ? "line-through text-slate-500" : "text-slate-200"}`}>{obj.title}</span>
                </div>
                <p className="text-[10px] mt-1 leading-relaxed pl-6 text-slate-400">{obj.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Notifications (Feedback) */}
      {notification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto max-w-md w-full bg-slate-900 border border-indigo-500/40 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-bounce">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
            <Eye className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-100">{notification.title}</span>
              <button onClick={clearNotification} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Center Bottom Prompt: When standing near an interaction target */}
      <div className="flex flex-col items-center gap-3">
        {activeInteraction.type !== null && !modalOpen && (
          <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-pulse pointer-events-auto cursor-pointer" onClick={() => setModalOpen(true)}>
            <Wrench className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              Press [SPACE] or Click to Inspect {activeInteraction.type === "rack" ? `Rack #${targetRack?.id} (${targetRack?.name})` : "PDU Power Switch"}
            </span>
          </div>
        )}

        {/* Toolbar / Inventory */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 backdrop-blur p-3 rounded-2xl shadow-xl pointer-events-auto">
          {inventory.map((item, idx) => (
            <button
              key={item}
              onClick={() => {
                setEquippedItem(equippedItem === item ? null : item);
                if (item === "thermal-scanner") toggleThermalVision();
              }}
              className={`flex flex-col items-center gap-1.5 w-20 p-2 rounded-xl border relative transition-all ${
                equippedItem === item ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/20" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              <span className="absolute top-1 left-1.5 text-[9px] font-bold text-slate-500">{idx + 1}</span>
              <Wrench className="w-5 h-5 mt-1 text-slate-300" />
              <span className="text-[9px] font-bold truncate w-full text-center">{item.replace("cable-", "").replace("tool-", "").toUpperCase()}</span>
            </button>
          ))}
          <div className="h-8 w-px bg-slate-700 mx-1" />
          <button onClick={toggleThermalVision} className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl border bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600">
            <Eye className="w-5 h-5 text-amber-400" />
            <span className="text-[9px] font-bold">[T] THERMAL</span>
          </button>
        </div>
      </div>

      {/* Interaction Modal / Cabinet Technical Inspection */}
      {modalOpen && activeInteraction.type === "rack" && targetRack && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden font-mono">
            
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-950 px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Rack #{targetRack.id} — {targetRack.name}</h3>
                  <p className="text-xs text-slate-500">{targetRack.role}</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Content Controls */}
            <div className="p-6 space-y-6">
              
              {/* Power Dual-Cord Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> ① Dual Cord Power Paths (SPOF Mitigation)
                  </span>
                  {targetRack.psuAConnected && targetRack.psuBConnected ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">✓ SPOF Protected</span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">⚠ Single Point of Failure</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${targetRack.psuAConnected ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-slate-800/40 border-slate-700 text-slate-500"}`}>
                    <div>
                      <span className="font-bold text-sm block">PSU-A (Primary)</span>
                      <span className="text-xs text-slate-400">Connected to PDU-A</span>
                    </div>
                    <button onClick={() => targetRack.psuAConnected ? disconnectPsu(targetRack.id, "A") : connectPsu(targetRack.id, "A")} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${targetRack.psuAConnected ? "border-blue-500/40 bg-blue-500/20 text-blue-200" : "border-slate-600 bg-slate-700 text-slate-300"}`}>
                      {targetRack.psuAConnected ? "DISCONNECT" : "CONNECT"}
                    </button>
                  </div>
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${targetRack.psuBConnected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-slate-800/40 border-slate-700 text-slate-500"}`}>
                    <div>
                      <span className="font-bold text-sm block">PSU-B (Secondary)</span>
                      <span className="text-xs text-slate-400">Connected to PDU-B</span>
                    </div>
                    <button onClick={() => targetRack.psuBConnected ? disconnectPsu(targetRack.id, "B") : connectPsu(targetRack.id, "B")} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${targetRack.psuBConnected ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200" : "border-slate-600 bg-slate-700 text-slate-300"}`}>
                      {targetRack.psuBConnected ? "DISCONNECT" : "CONNECT"}
                    </button>
                  </div>
                </div>
              </div>

              {/* AWG Power Cabling */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Power className="w-4 h-4 text-rose-400" /> ② Power Cable Gauge (NEC 80% Rule)
                  </span>
                  <span className="text-xs text-slate-400 font-bold">Load: {targetRack.requiredAmps}A Continuous</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["awg14", "awg12", "awg10", "awg2"] as AwgGauge[]).map((gauge) => {
                    const isSelected = targetRack.currentAwg === gauge;
                    const tooSmall = gauge === "awg14" && targetRack.requiredAmps >= 16;
                    return (
                      <button key={gauge} onClick={() => changePowerGauge(targetRack.id, gauge)} className={`p-3 rounded-2xl border text-center transition-all ${isSelected ? "bg-rose-500/20 border-rose-500 text-rose-200 shadow-lg" : tooSmall ? "bg-slate-800/30 border-rose-500/20 text-rose-400/60" : "bg-slate-800/50 border-slate-700 text-slate-400"}`}>
                        <span className="font-bold text-xs uppercase block">{gauge}</span>
                        <span className="text-[10px] text-slate-500">{gauge === "awg14" ? "15A Max" : gauge === "awg12" ? "20A Max" : gauge === "awg10" ? "30A Max" : "95A Max"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Network Patch Cord Standard */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Network className="w-4 h-4 text-sky-400" /> ③ Backbone Network Cabling (Bottleneck Rule)
                  </span>
                  <span className="text-xs text-slate-400 font-bold">Backbone: {targetRack.backboneStandard === "fiber-om3" ? "OM3 Fiber (10G)" : "Cat 6a (10G)"}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(["cat5e", "cat6a", "fiber-om3"] as CableStandard[]).map((std) => {
                    const isSelected = targetRack.dataStandard === std;
                    const isBottleneck = std === "cat5e" && targetRack.backboneStandard !== "cat5e";
                    return (
                      <button key={std} onClick={() => changeDataCable(targetRack.id, std)} className={`p-4 rounded-2xl border text-center transition-all ${isSelected ? "bg-sky-500/20 border-sky-500 text-sky-200 shadow-lg" : isBottleneck ? "bg-rose-500/5 border-rose-500/30 text-rose-400/80" : "bg-slate-800/50 border-slate-700 text-slate-400"}`}>
                        <span className="font-bold text-sm block">{std === "fiber-om3" ? "OM3 Fiber" : std.toUpperCase()}</span>
                        <span className="text-[10px] text-slate-500">{std === "cat5e" ? "1 Gbps Max" : "10 Gbps Backbone"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Physical changes update network metrics immediately.
              </span>
              <button onClick={() => setModalOpen(false)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all">
                CONFIRM WIRING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
