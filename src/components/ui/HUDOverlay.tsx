import { useEffect, useState, useCallback } from "react";
import { 
  Zap, 
  Network, 
  Eye, 
  AlertTriangle, 
  Wrench,
  X,
  ShieldCheck,
  Server,
  Clock,
  DollarSign,
  TrendingDown,
  ShoppingCart,
  Truck,
  Flame,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Terminal as TerminalIcon
} from "lucide-react";
import { useGameStore, type CableStandard, type AwgGauge, type ElectricalPhase, type ToolType, type WorkOrder } from "../../store/useGameStore";

type InspectionTab = "overview" | "cabling" | "power" | "cooling" | "kvm";

interface DustSpot {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export function HUDOverlay() {
  const { 
    day,
    timeOfDay,
    sla,
    budget,
    gameOver,
    gameOverReason,
    inventory, 
    equippedItem, 
    setEquippedItem, 
    activeInteraction, 
    racks, 
    workOrders, 
    notification, 
    clearNotification,
    pduAOnline,
    pduBOnline,
    hvacOnline,
    cartAttached,
    cartInventory,
    deliveryQueue,
    togglePdu,
    toggleHvac,
    toggleThermalVision,
    toggleCartAttach,
    connectPsu,
    disconnectPsu,
    changeDataCable,
    changePowerGauge,
    toggleContainmentDoors,
    cleanFansWithDuster,
    purgeCryptoMinerWithKvm,
    extinguishFire,
    buyFromShop,
    transferCartItem,
    resetShift
  } = useGameStore();

  const [modalOpen, setModalOpen]   = useState(false);
  const [shopOpen, setShopOpen]     = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);
  const [selectedPhase, SetPhase]   = useState<ElectricalPhase>("L1");

  // Inmersive Physical Hands-on Minigame States
  const [activeTab, setActiveTab] = useState<InspectionTab>("overview");

  // Cooling Minigame State (Dust spots on fans)
  const [dustSpots, setDustSpots] = useState<DustSpot[]>([
    { id: 1, x: 20, y: 30, opacity: 1 },
    { id: 2, x: 70, y: 25, opacity: 1 },
    { id: 3, x: 45, y: 65, opacity: 1 },
    { id: 4, x: 80, y: 75, opacity: 1 },
    { id: 5, x: 30, y: 80, opacity: 1 },
  ]);
  const [isSprayingAir, setIsSprayingAir] = useState(false);

  // Cabling Minigame State (Physical unplug / plug)
  const [cablePlugged, setCablePlugged] = useState(true);

  // KVM Minigame State (Terminal hacking)
  const [terminalLog, setTerminalLog] = useState<string[]>([
    "INITIALIZING KVM SECURE BRIDGE...",
    "CONNECTING TO RACK BLADE CONTROLLER...",
    "SCANNING RUNNING PROCESS ID TABLE..."
  ]);
  const [kvmProgress, setKvmProgress] = useState(0);

  const targetRack = racks.find((r) => r.id === activeInteraction.targetId);
  const activeRackTicket = targetRack ? workOrders.find((wo) => !wo.completed && !wo.failed && wo.targetRackId === targetRack.id) : null;

  const handleOpenConsole = useCallback(() => {
    if (!targetRack) return;
    setModalOpen(true);
    setCablePlugged(true);
    setDustSpots([
      { id: 1, x: 20, y: 30, opacity: targetRack.fanEfficiency < 80 ? 1 : 0 },
      { id: 2, x: 70, y: 25, opacity: targetRack.fanEfficiency < 80 ? 1 : 0 },
      { id: 3, x: 45, y: 65, opacity: targetRack.fanEfficiency < 70 ? 1 : 0 },
      { id: 4, x: 80, y: 75, opacity: targetRack.fanEfficiency < 60 ? 1 : 0 },
      { id: 5, x: 30, y: 80, opacity: targetRack.fanEfficiency < 50 ? 1 : 0 },
    ]);
    setTerminalLog([
      "INITIALIZING KVM SECURE BRIDGE...",
      "CONNECTING TO RACK BLADE CONTROLLER...",
      targetRack.hasCryptoMiner ? "WARNING: UNKNOWN ANOMALOUS PROCESS 'miner_v2.4.exe' DETECTED AT CPU 99%" : "SYSTEM STABLE: NO ANOMALOUS PROCESSES FOUND."
    ]);
    setKvmProgress(0);
  }, [targetRack]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (activeInteraction.type === "rack") handleOpenConsole();
        if (activeInteraction.type === "shop") setShopOpen(true);
        if (activeInteraction.type === "cart") setCartOpen(true);
      }
      if (e.code === "Escape") {
        setModalOpen(false);
        setShopOpen(false);
        setCartOpen(false);
      }
      if (e.code === "Digit1") setEquippedItem(inventory[0] || null);
      if (e.code === "Digit2") setEquippedItem(inventory[1] || null);
      if (e.code === "Digit3") setEquippedItem(inventory[2] || null);
      if (e.code === "Digit4") setEquippedItem(inventory[3] || null);
      if (e.code === "Digit5") setEquippedItem(inventory[4] || null);
      if (e.code === "KeyT") toggleThermalVision();
      if (e.code === "KeyC") toggleCartAttach();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeInteraction, inventory, setEquippedItem, toggleThermalVision, toggleCartAttach, handleOpenConsole]);

  const shiftHour = Math.floor(8 + (timeOfDay / 60));
  const shiftMin  = Math.floor((timeOfDay % 60));
  const timeFormatted = `${String(shiftHour).padStart(2, "0")}:${String(shiftMin).padStart(2, "0")}`;

  const getTicketHelperBadge = (wo: WorkOrder) => {
    switch (wo.type) {
      case "spof":          return { text: "🔌 TASK: INSERT REDUNDANT PSU IN BACK CHASSIS", tab: "power", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
      case "overheat":      return { text: "⚡ TASK: UNPLUG & UPGRADE POWER GAUGE CORD", tab: "power", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" };
      case "bottleneck":    return { text: "🌐 TASK: UNPLUG COPPER & INSERT OM3 FIBER SPOOL", tab: "cabling", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" };
      case "crypto-miner":  return { text: "💻 TASK: ATTACH KVM CONSOLE TO EXECUTE MALWARE PURGE", tab: "kvm", color: "bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse" };
      case "dirty-fans":    return { text: "💨 TASK: SPRAY COMPRESSED AIR CANNISTER OVER FANS", tab: "cooling", color: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse" };
      case "phase-imbalance": return { text: "⚡ TASK: CHECK MULTIMETER AMP LOAD ACROSS L1/L2/L3", tab: "power", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      default: return { text: "Inspect Rack", tab: "overview", color: "bg-slate-800 text-slate-300" };
    }
  };

  const handleDustCleanSpot = (id: number) => {
    if (equippedItem !== "air-duster" || !targetRack) return;
    setIsSprayingAir(true);
    setTimeout(() => setIsSprayingAir(false), 300);

    const nextSpots = dustSpots.map((s) => s.id === id ? { ...s, opacity: 0 } : s);
    setDustSpots(nextSpots);

    if (nextSpots.every((s) => s.opacity === 0)) {
      cleanFansWithDuster(targetRack.id);
    }
  };

  const executeKvmPurgeStep = () => {
    if (!targetRack || !targetRack.hasCryptoMiner || equippedItem !== "kvm") return;
    const nextProg = kvmProgress + 35;
    setKvmProgress(nextProg);
    if (nextProg === 35) setTerminalLog((prev) => [...prev, "SENDING SIGTERM TO PID 4091 (miner_v2.4.exe)..."]);
    if (nextProg === 70) setTerminalLog((prev) => [...prev, "ISOLATING PROCESS MEMORY DESCRIPTORS..."]);
    if (nextProg >= 100) {
      setTerminalLog((prev) => [...prev, "SUCCESS: PROCESS PURGED. HARDWARE FIREWALL LOCK ENGAGED."]);
      purgeCryptoMinerWithKvm(targetRack.id);
    }
  };

  if (gameOver) {
    return (
      <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-md pointer-events-auto flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in-95 font-mono text-slate-100">
        <div className="bg-slate-900 border border-rose-500/60 max-w-xl w-full rounded-3xl shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-rose-500/20 border border-rose-500 rounded-2xl mx-auto flex items-center justify-center text-rose-500 animate-bounce">
            <TrendingDown className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold tracking-wider text-rose-500 uppercase">Contract Terminated</h2>
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-sm leading-relaxed text-rose-200">
            {gameOverReason}
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div><span className="text-slate-500 block">Final Day Reached</span><span className="font-bold text-lg">Day {day}</span></div>
            <div><span className="text-slate-500 block">Corporate Budget Left</span><span className="font-bold text-lg text-emerald-400">${budget}</span></div>
          </div>
          <button 
            onClick={() => {
              resetShift();
              window.location.reload();
            }} 
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 font-bold rounded-2xl shadow-xl transition-all cursor-pointer"
          >
            COMMENCE NEW SHIFT (RESTART)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none font-mono">
      
      {/* Top Bar: System Status, Clock, Budget, SLA, Active Tickets */}
      <div className="flex items-start justify-between">
        
        <div className="flex items-center gap-6 bg-slate-900/90 border border-slate-700/80 backdrop-blur p-4 rounded-2xl shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm tracking-wider text-slate-100">DCCA SIMULATOR</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Clock className="w-4 h-4" /> Day {day} — {timeFormatted}
          </div>

          <div className="h-6 w-px bg-slate-700" />
          
          <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
            <DollarSign className="w-4 h-4" /> {budget.toLocaleString()}
          </div>

          <div className="h-6 w-px bg-slate-700" />
          
          <div className={`flex items-center gap-2 font-bold text-sm px-3 py-1 rounded-xl border ${
            sla < 99.5 ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}>
            <span>SLA: {sla.toFixed(3)}%</span>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div className="flex items-center gap-2 text-xs">
            <button onClick={() => togglePdu("A")} className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${pduAOnline ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
              PDU-A: {pduAOnline ? "ON" : "OFF"}
            </button>
            <button onClick={() => togglePdu("B")} className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${pduBOnline ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
              PDU-B: {pduBOnline ? "ON" : "OFF"}
            </button>
            <button onClick={toggleHvac} className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${hvacOnline ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"}`}>
              HVAC: {hvacOnline ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Real-Time Tickets Window */}
        <div className="w-96 bg-slate-900/90 border border-slate-700/80 backdrop-blur p-4 rounded-2xl shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Active Tickets & Action Guide
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              {workOrders.filter((wo) => !wo.completed && !wo.failed).length} Active
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {workOrders.filter((wo) => !wo.completed).map((wo) => {
              const badge = getTicketHelperBadge(wo);
              return (
                <div key={wo.id} className={`p-3 rounded-xl border transition-all space-y-2 ${
                  wo.failed ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : "bg-slate-800/50 border-slate-700/60 text-slate-300"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wide text-amber-400">{wo.id}: {wo.title}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">+${wo.reward}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400">{wo.description}</p>
                  
                  {/* Intuitive Action Guidance Badge */}
                  <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${badge.color}`}>
                    <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{badge.text}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span className="font-bold">Target: Rack #{wo.targetRackId}</span>
                    <span className={wo.timeRemaining < 60 ? "text-rose-400 font-bold animate-pulse" : "text-slate-400"}>
                      {wo.failed ? "FAILED" : `${Math.floor(wo.timeRemaining)}s left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {notification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto max-w-md w-full bg-slate-900 border border-indigo-500/40 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-bounce">
          <div className={`p-2 rounded-xl text-white ${notification.type === "danger" ? "bg-rose-600" : notification.type === "success" ? "bg-emerald-600" : "bg-indigo-600"}`}>
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

      {deliveryQueue.length > 0 && (
        <div className="absolute top-44 left-1/2 -translate-x-1/2 pointer-events-auto bg-slate-900/90 border border-emerald-500/40 px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 text-xs text-emerald-300">
          <Truck className="w-4 h-4 animate-pulse" />
          <span>Procurement Shipment ETA: {Math.floor(deliveryQueue[0].timeRemaining)}s</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        {activeInteraction.type !== null && !modalOpen && !shopOpen && !cartOpen && (
          <div 
            className="bg-amber-500/20 border border-amber-500/40 text-amber-200 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-pulse pointer-events-auto cursor-pointer font-bold text-sm"
            onClick={() => {
              if (activeInteraction.type === "rack") handleOpenConsole();
              if (activeInteraction.type === "shop") setShopOpen(true);
              if (activeInteraction.type === "cart") setCartOpen(true);
            }}
          >
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>
              Press [SPACE] or Click to Inspect {activeInteraction.type === "rack" ? `Rack #${targetRack?.id} (${targetRack?.name})` : activeInteraction.type === "shop" ? "Shop Procurement Terminal" : "Crash Cart Inventory"}
            </span>
          </div>
        )}

        {/* Toolbar / Inventory */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 backdrop-blur p-3 rounded-2xl shadow-xl pointer-events-auto">
          {inventory.map((item, idx) => {
            const isEquipped = equippedItem === item;
            return (
              <button
                key={item}
                onClick={() => {
                  setEquippedItem(equippedItem === item ? null : item);
                  if (item === "thermal-scanner") toggleThermalVision();
                }}
                className={`flex flex-col items-center gap-1.5 w-24 p-2 rounded-xl border relative transition-all cursor-pointer ${
                  isEquipped ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/50 scale-105" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <span className={`absolute top-1 left-1.5 text-[9px] font-bold ${isEquipped ? "text-indigo-200" : "text-slate-500"}`}>{idx + 1}</span>
                <Wrench className={`w-5 h-5 mt-1 ${isEquipped ? "text-white" : "text-slate-300"}`} />
                <span className="text-[9px] font-bold truncate w-full text-center tracking-tight">{item.replace("cable-", "").replace("tool-", "").toUpperCase()}</span>
                {isEquipped && <span className="absolute -bottom-2 text-[8px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-full">ACTIVE</span>}
              </button>
            );
          })}

          <div className="h-8 w-px bg-slate-700 mx-1" />

          <button onClick={toggleThermalVision} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600 cursor-pointer">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-bold">[T] THERMAL</span>
          </button>
          <button onClick={toggleCartAttach} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border font-bold transition-all cursor-pointer ${cartAttached ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-slate-800/60 border-slate-700 text-slate-400"}`}>
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px]">[C] PUSH CART</span>
          </button>
        </div>
      </div>

      {shopOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in-95 font-mono">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-slate-950 px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-emerald-400" /> Corporate Procurement Portal</h3>
              <button onClick={() => setShopOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { id: "cable-cat6a", name: "Spool of Cat 6a Cables (10G)", cost: 200, qty: 5 },
                { id: "cable-om3", name: "Spool of OM3 Optical Fiber (10G)", cost: 500, qty: 4 },
                { id: "psu-spare", name: "Redundant Power Supply Unit (PSU)", cost: 800, qty: 2 },
              ].map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-200 block">{item.name}</span>
                    <span className="text-xs text-slate-500">Delivered directly to mobile Crash Cart in 30s</span>
                  </div>
                  <button onClick={() => buyFromShop(item.id as ToolType, item.qty, item.cost)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-xs text-white shadow-lg cursor-pointer">
                    BUY (${item.cost})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in-95 font-mono">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-slate-950 px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-amber-400" /> Mobile Crash Cart Storage</h3>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {(["cable-cat6a", "cable-om3", "psu-spare"] as ToolType[]).map((item) => (
                <div key={item} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200 uppercase">{item.replace("cable-", "")}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-amber-400">{cartInventory[item] || 0} in Cart</span>
                    <button onClick={() => transferCartItem(item, "player")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-xl cursor-pointer">EQUIP TO PLAYER</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalOpen && activeInteraction.type === "rack" && targetRack && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-auto flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in-95 font-mono">
          <div className="bg-slate-900 border border-slate-700 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header & Navigation Tabs */}
            <div className="bg-slate-950 border-b border-slate-800 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 shadow-inner"><Server className="w-7 h-7" /></div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-white">Rack #{targetRack.id} — {targetRack.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{targetRack.role} | Active Backbone: <span className="text-sky-400 uppercase font-bold">{targetRack.backboneStandard}</span></p>
                </div>
              </div>
              
              <button onClick={() => setModalOpen(false)} className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"><X className="w-6 h-6" /></button>
            </div>

            {/* Target Ticket Guidance Banner */}
            {activeRackTicket && (
              <div className="bg-amber-500/20 border-b border-amber-500/40 px-8 py-3.5 flex items-center justify-between text-amber-200 text-xs shadow-md">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold uppercase tracking-wide block text-amber-300">Active Order #{activeRackTicket.id}: {activeRackTicket.title}</span>
                    <span className="text-slate-300 text-[11px]">{getTicketHelperBadge(activeRackTicket).text}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab(getTicketHelperBadge(activeRackTicket).tab as InspectionTab)} 
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase shadow transition-all cursor-pointer"
                >
                  GO TO PHYSICAL PANEL ➡️
                </button>
              </div>
            )}

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-2 px-8 py-3 bg-slate-900 border-b border-slate-800 text-xs">
              {[
                { id: "overview", label: "📊 Hardware Overview" },
                { id: "cabling",  label: "🔌 Network Patch Panel" },
                { id: "power",    label: "⚡ Dual PSU & PDU Feeds" },
                { id: "cooling",  label: "❄️ Fan & Dust Ventilation" },
                { id: "kvm",      label: "💻 KVM Security Bridge" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as InspectionTab)}
                  className={`px-4 py-2.5 rounded-xl font-bold tracking-wide transition-all cursor-pointer ${
                    activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Interactive Work Area */}
            <div className="p-8 flex-1 overflow-y-auto space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="grid grid-cols-3 gap-6 p-6 rounded-3xl border border-slate-800 bg-slate-950/80 shadow-inner">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-xs uppercase font-bold block">Structural Health</span>
                      <span className={`font-extrabold text-3xl block ${targetRack.health < 50 ? "text-rose-500 animate-pulse" : "text-emerald-400"}`}>{targetRack.health.toFixed(1)}%</span>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2"><div className="bg-emerald-500 h-full" style={{ width: `${targetRack.health}%` }} /></div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-xs uppercase font-bold block">Fan Airflow Cleanliness</span>
                      <span className={`font-extrabold text-3xl block ${targetRack.fanEfficiency < 60 ? "text-amber-500" : "text-sky-400"}`}>{targetRack.fanEfficiency.toFixed(1)}%</span>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2"><div className="bg-sky-500 h-full" style={{ width: `${targetRack.fanEfficiency}%` }} /></div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-xs uppercase font-bold block">Thermal Containment</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`font-extrabold text-2xl ${targetRack.containmentClosed ? "text-indigo-400" : "text-amber-500"}`}>{targetRack.containmentClosed ? "CLOSED" : "OPEN DOORS"}</span>
                        <button onClick={() => toggleContainmentDoors(targetRack.id)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer">TOGGLE</button>
                      </div>
                    </div>
                  </div>

                  {targetRack.onFire && (
                    <div className="p-6 bg-rose-600/20 border border-rose-500 rounded-3xl flex items-center justify-between animate-bounce shadow-xl shadow-rose-600/20">
                      <div className="flex items-center gap-4 text-rose-200">
                        <Flame className="w-10 h-10 text-rose-500 animate-pulse" />
                        <div><span className="text-xl font-extrabold text-white block uppercase">CRITICAL FIRE DETECTED!</span><span className="text-xs">Thermal thermal ignition in progress. Use Extinguisher immediately.</span></div>
                      </div>
                      <button onClick={() => extinguishFire(targetRack.id)} className="px-8 py-4 bg-rose-600 hover:bg-rose-500 font-extrabold text-white rounded-2xl shadow-lg cursor-pointer">DISCHARGE EXTINGUISHER</button>
                    </div>
                  )}

                  <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950/40 text-slate-400 text-xs space-y-2 leading-relaxed font-sans">
                    <p className="font-bold text-slate-200 font-mono">💡 Inmersive Operator Guidance:</p>
                    <p>To perform maintenance on this server rack, navigate through the top physical inspection tabs. You can physically connect redundant PSUs, swap patch cords in the network backplane, spray compressed air over dusty fans, or attach your KVM secure bridge to hack anomalous processes.</p>
                  </div>
                </div>
              )}

              {/* TAB 2: NETWORK PATCH PANEL (PHYSICAL UNPLUG / PLUG MINIGAME) */}
              {activeTab === "cabling" && (
                <div className="space-y-8 animate-in fade-in-50">
                  <div className="flex items-center justify-between bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Active Data channel</span>
                      <span className="text-2xl font-extrabold text-white tracking-wide uppercase mt-1 flex items-center gap-3">
                        <Network className="w-6 h-6 text-sky-400" />
                        {targetRack.dataStandard === "fiber-om3" ? "Optical Fiber OM3 (10 Gbps)" : targetRack.dataStandard === "cat6a" ? "Cat 6a Copper Patch Cord" : "Cat 5e Copper Bottleneck"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">Port Status: {cablePlugged ? "SECURE" : "UNPLUGGED"}</span>
                    </div>
                  </div>

                  {/* Physical Switch Port & Cord Visualizer */}
                  <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-10 relative overflow-hidden flex flex-col items-center justify-center min-h-[320px] shadow-2xl">
                    <div className="absolute top-4 left-6 text-xs text-slate-500 font-bold uppercase tracking-widest">Physical Network Interface Card (NIC)</div>
                    
                    {/* Switch Port Hole */}
                    <div className="w-40 h-32 bg-slate-900 border-4 border-slate-700 rounded-2xl flex items-center justify-center relative shadow-inner">
                      <div className="absolute top-2 text-[10px] text-slate-500 font-bold">ETH 01 / SFP+</div>
                      
                      {cablePlugged ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in-75">
                          {/* Plugged Head */}
                          <div className={`w-24 h-16 rounded-xl border-2 flex items-center justify-center font-extrabold text-xs shadow-lg ${
                            targetRack.dataStandard === "fiber-om3" ? "bg-amber-500/20 border-amber-500 text-amber-300" : targetRack.dataStandard === "cat6a" ? "bg-sky-500/20 border-sky-500 text-sky-300" : "bg-slate-700 border-slate-500 text-slate-300"
                          }`}>
                            {targetRack.dataStandard === "fiber-om3" ? "OM3 FIBER SFP+" : targetRack.dataStandard.toUpperCase()}
                          </div>
                          {/* Trailing Cable wire hanging down */}
                          <div className={`w-6 h-28 -bottom-28 absolute rounded-b-none shadow-md ${
                            targetRack.dataStandard === "fiber-om3" ? "bg-amber-500" : targetRack.dataStandard === "cat6a" ? "bg-sky-500" : "bg-slate-600"
                          }`} />
                        </div>
                      ) : (
                        <div className="text-slate-600 text-xs font-bold animate-pulse uppercase tracking-wider">PORT EMPTY — READY FOR SPOOL</div>
                      )}
                    </div>

                    {/* Unplug / Spool Insertion Action Buttons */}
                    <div className="mt-12 flex items-center gap-6 z-10">
                      {cablePlugged ? (
                        <button
                          onClick={() => setCablePlugged(false)}
                          className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 cursor-pointer text-sm tracking-wider"
                        >
                          <RotateCcw className="w-5 h-5" /> 1. UNPLUG PHYSICAL PATCH CORD
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest animate-pulse">2. Select Replacement Patch Spool to Insert:</span>
                          <div className="flex items-center gap-4">
                            {(["cat5e", "cat6a", "fiber-om3"] as CableStandard[]).map((std) => (
                              <button
                                key={std}
                                onClick={() => {
                                  changeDataCable(targetRack.id, std);
                                  setCablePlugged(true);
                                }}
                                className={`px-6 py-4 rounded-2xl font-extrabold text-xs tracking-wider transition-all cursor-pointer border ${
                                  std === "fiber-om3" ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xl shadow-amber-500/20 hover:scale-105" : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                                }`}
                              >
                                PLUG IN {std === "fiber-om3" ? "OM3 FIBER SPOOL" : std.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: POWER DUAL PSU FEED (PHYSICAL PSU INSERTION & AWG CORDS) */}
              {activeTab === "power" && (
                <div className="space-y-8 animate-in fade-in-50">
                  <div className="flex items-center justify-between bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">3-Phase Electrical Supply</span>
                      <span className="text-2xl font-extrabold text-white tracking-wide uppercase mt-1 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-amber-400" />
                        Required Load: {targetRack.requiredAmps}A ({targetRack.currentAwg.toUpperCase()})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold mr-2">Assign Phase Feed:</span>
                      {(["L1", "L2", "L3"] as ElectricalPhase[]).map((ph) => (
                        <button key={ph} onClick={() => SetPhase(ph)} className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${selectedPhase === ph ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{ph}</button>
                      ))}
                    </div>
                  </div>

                  {/* Back Server Chassis PSU Bays */}
                  <div className="grid grid-cols-2 gap-8">
                    
                    {/* BAY A: Primary */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[300px]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold tracking-widest uppercase text-slate-400">PSU Bay A (Primary)</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${targetRack.psuAConnected ? "bg-blue-500/20 text-blue-300" : "bg-rose-500/20 text-rose-300"}`}>{targetRack.psuAConnected ? "ONLINE" : "UNPLUGGED"}</span>
                      </div>

                      <div className="my-8 flex items-center justify-center">
                        {targetRack.psuAConnected ? (
                          <div className="w-56 h-32 bg-slate-900 border-2 border-blue-500/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                            <span className="font-extrabold text-xs text-blue-400">IEC C19 SECURED CORD</span>
                            <span className="text-2xl font-mono font-bold text-slate-200">Phase {targetRack.phaseA}</span>
                            <span className="text-[10px] text-slate-500 font-mono">PDU-A DISTRIBUTION PATH</span>
                          </div>
                        ) : (
                          <div className="w-56 h-32 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-xs">
                            EMPTY POWER BAY
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => targetRack.psuAConnected ? disconnectPsu(targetRack.id, "A") : connectPsu(targetRack.id, "A", selectedPhase)}
                        className={`w-full py-4 rounded-2xl font-extrabold text-xs tracking-wider transition-all cursor-pointer ${
                          targetRack.psuAConnected ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                        }`}
                      >
                        {targetRack.psuAConnected ? "UNPLUG PSU CORD" : `INSERT PSU & CONNECT TO PHASE [${selectedPhase}]`}
                      </button>
                    </div>

                    {/* BAY B: Redundant (SPOF Target) */}
                    <div className={`bg-slate-950 border rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[300px] transition-all ${
                      !targetRack.psuBConnected && activeRackTicket?.type === "spof" ? "border-amber-400 shadow-xl shadow-amber-500/10" : "border-slate-800"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold tracking-widest uppercase text-slate-400">PSU Bay B (Redundant)</span>
                          {!targetRack.psuBConnected && activeRackTicket?.type === "spof" && <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-extrabold text-[10px] animate-pulse">SPOF TASK</span>}
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${targetRack.psuBConnected ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>{targetRack.psuBConnected ? "ONLINE" : "UNPLUGGED"}</span>
                      </div>

                      <div className="my-8 flex items-center justify-center">
                        {targetRack.psuBConnected ? (
                          <div className="w-56 h-32 bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                            <span className="font-extrabold text-xs text-emerald-400">IEC C19 SECURED CORD</span>
                            <span className="text-2xl font-mono font-bold text-slate-200">Phase {targetRack.phaseB}</span>
                            <span className="text-[10px] text-slate-500 font-mono">PDU-B DISTRIBUTION PATH</span>
                          </div>
                        ) : (
                          <div className="w-56 h-32 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-xs animate-pulse">
                            EMPTY REDUNDANT BAY
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => targetRack.psuBConnected ? disconnectPsu(targetRack.id, "B") : connectPsu(targetRack.id, "B", selectedPhase)}
                        className={`w-full py-4 rounded-2xl font-extrabold text-xs tracking-wider transition-all cursor-pointer ${
                          targetRack.psuBConnected ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                        }`}
                      >
                        {targetRack.psuBConnected ? "UNPLUG PSU CORD" : `INSERT REDUNDANT PSU ON PHASE [${selectedPhase}]`}
                      </button>
                    </div>
                  </div>

                  {/* AWG Power Cord Gauge Upgrade Section */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">⚡ Main Feeder Conductor AWG Gauge (NEC 80% De-rating Rule)</span>
                    <div className="grid grid-cols-4 gap-4">
                      {(["awg14", "awg12", "awg10", "awg2"] as AwgGauge[]).map((gauge) => {
                        const isTarget = activeRackTicket?.type === "overheat" && (gauge === "awg10" || gauge === "awg2");
                        return (
                          <button key={gauge} onClick={() => changePowerGauge(targetRack.id, gauge)} className={`p-4 rounded-2xl border text-center font-bold text-sm uppercase relative transition-all cursor-pointer ${
                            targetRack.currentAwg === gauge ? "bg-rose-500/20 border-rose-500 text-rose-200 shadow-lg" : isTarget ? "bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse shadow-xl shadow-amber-500/20" : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                          }`}>
                            {gauge}
                            {isTarget && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-extrabold shadow">UPGRADE CORD</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: COOLING & DUST VENTILATION (PHYSICAL AIR SPRAY MINIGAME) */}
              {activeTab === "cooling" && (
                <div className="space-y-8 animate-in fade-in-50">
                  <div className="flex items-center justify-between bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Cooling Fan Assembly</span>
                      <span className="text-2xl font-extrabold text-white tracking-wide uppercase mt-1 flex items-center gap-3">
                        <Eye className="w-6 h-6 text-sky-400" />
                        Airflow Efficiency: {targetRack.fanEfficiency.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-bold">Equipped Tool:</span>
                      <span className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase ${equippedItem === "air-duster" ? "bg-emerald-500 text-slate-950 shadow" : "bg-rose-500/20 text-rose-300"}`}>
                        {equippedItem === "air-duster" ? "💨 [AIR-DUSTER] EQUIPPED" : "🔒 EQUIP [AIR-DUSTER] (Slot 3)"}
                      </span>
                    </div>
                  </div>

                  {/* Physical Fan Visualizer with Interactive Dust Spots */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px] shadow-2xl">
                    <div className="absolute top-6 left-8 text-xs font-bold text-slate-500 uppercase tracking-widest">Back Server Ventilation Grills</div>

                    {/* Rotating Server Fan */}
                    <div className="w-64 h-64 border-8 border-slate-800 rounded-full flex items-center justify-center relative shadow-inner overflow-hidden bg-slate-900">
                      
                      {/* Fan Blades Animation */}
                      <div className={`w-full h-full flex items-center justify-center transition-all ${targetRack.fanEfficiency > 80 ? "animate-spin" : "animate-pulse"}`} style={{ animationDuration: `${3 - (targetRack.fanEfficiency / 50)}s` }}>
                        <div className="w-56 h-12 bg-slate-700/60 rounded-full absolute" />
                        <div className="w-12 h-56 bg-slate-700/60 rounded-full absolute" />
                        <div className="w-16 h-16 bg-slate-600 rounded-full z-10 border-4 border-slate-800" />
                      </div>

                      {/* Dust Spots Overlay */}
                      {dustSpots.map((spot) => spot.opacity > 0 && (
                        <div
                          key={spot.id}
                          onClick={() => handleDustCleanSpot(spot.id)}
                          className="absolute w-16 h-16 bg-amber-900/80 rounded-full blur-md cursor-pointer hover:scale-125 transition-all flex items-center justify-center border-2 border-amber-600/50 animate-pulse z-20"
                          style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                        >
                          <span className="text-[9px] font-extrabold text-white tracking-tighter uppercase pointer-events-none">CLEAN</span>
                        </div>
                      ))}

                      {/* Air Spray Particle Burst Animation */}
                      {isSprayingAir && (
                        <div className="absolute inset-0 bg-sky-400/40 backdrop-blur-sm transition-all animate-ping z-30 rounded-full" />
                      )}
                    </div>

                    <div className="mt-8 text-center space-y-2">
                      <span className="text-sm font-extrabold text-white tracking-wide block uppercase">
                        {dustSpots.some((s) => s.opacity > 0) ? "⚠️ Physical Dust Spots Blocking Airflow. Click over spots to spray compressed air." : "✨ FAN PURGED 100% STABLE"}
                      </span>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">Use your physical compressed air cannister to clear out hardware dust accumulation and restore server airflow.</p>
                    </div>

                    {/* Direct Quick-Purge Button as backup */}
                    <button
                      onClick={() => cleanFansWithDuster(targetRack.id)}
                      className={`mt-6 px-8 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        equippedItem === "air-duster" ? "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      ⚡ INSTANT PURGE ALL FANS (BACKUP OVERRIDE)
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: KVM SECURITY BRIDGE (TERMINAL HACKING) */}
              {activeTab === "kvm" && (
                <div className="space-y-8 animate-in fade-in-50">
                  <div className="flex items-center justify-between bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Secure KVM Terminal Bridge</span>
                      <span className="text-2xl font-extrabold text-white tracking-wide uppercase mt-1 flex items-center gap-3">
                        <TerminalIcon className="w-6 h-6 text-purple-400" />
                        Blade Remote Shell (SSH v2.4)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-bold">Bridge Status:</span>
                      <span className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase ${equippedItem === "kvm" ? "bg-purple-500 text-white shadow" : "bg-rose-500/20 text-rose-300"}`}>
                        {equippedItem === "kvm" ? "🔌 [KVM CONSOLE] SECURED" : "🔒 EQUIP [KVM] (Slot 4)"}
                      </span>
                    </div>
                  </div>

                  {/* Terminal Screen Visualizer */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 relative shadow-2xl font-mono min-h-[360px] flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs text-slate-500 ml-4">root@dc-ingress-blade-#{targetRack.id}:~#</span>
                      </div>

                      {/* Matrix Green Logs */}
                      <div className="space-y-1.5 text-xs text-emerald-400 font-mono pt-2">
                        {terminalLog.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-slate-600">&gt;</span>
                            <span className={log.includes("WARNING") ? "text-rose-500 font-bold animate-pulse" : "text-emerald-400"}>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hacking Progress Bar & Action */}
                    <div className="border-t border-slate-800 pt-6 space-y-4">
                      {targetRack.hasCryptoMiner ? (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                              <span>Malware Purge Hacking Progress</span>
                              <span className="text-purple-400">{kvmProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-purple-500 h-full transition-all duration-300 shadow-lg shadow-purple-500/50" style={{ width: `${kvmProgress}%` }} />
                            </div>
                          </div>

                          <button
                            onClick={executeKvmPurgeStep}
                            disabled={equippedItem !== "kvm"}
                            className={`w-full py-4 rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 ${
                              equippedItem === "kvm" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/30" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            <Play className="w-4 h-4 fill-current" /> EXECUTE FIREWALL HACK STEP (+35%)
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-center text-xs font-bold uppercase">
                          ✨ BLADE SECURED — ZERO MALWARE THREATS DETECTED
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Validation */}
            <div className="bg-slate-950 px-8 py-5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Physical hands-on mini-games sync instantly with 3D infrastructure.</span>
              <button onClick={() => setModalOpen(false)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-xl cursor-pointer">CLOSE INSPECTION CONSOLE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
