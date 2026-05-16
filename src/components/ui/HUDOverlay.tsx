import { useEffect, useState } from "react";
import { 
  Zap, 
  Power, 
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
  Lock,
  Unlock,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { useGameStore, type CableStandard, type AwgGauge, type ElectricalPhase, type ToolType, type WorkOrder } from "../../store/useGameStore";

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (activeInteraction.type === "rack") setModalOpen(true);
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
  }, [activeInteraction, inventory, setEquippedItem, toggleThermalVision, toggleCartAttach]);

  const targetRack = racks.find((r) => r.id === activeInteraction.targetId);
  const activeRackTicket = targetRack ? workOrders.find((wo) => !wo.completed && !wo.failed && wo.targetRackId === targetRack.id) : null;

  const shiftHour = Math.floor(8 + (timeOfDay / 60));
  const shiftMin  = Math.floor((timeOfDay % 60));
  const timeFormatted = `${String(shiftHour).padStart(2, "0")}:${String(shiftMin).padStart(2, "0")}`;

  const getTicketHelperBadge = (wo: WorkOrder) => {
    switch (wo.type) {
      case "spof":          return { text: "🔌 ACTION: CONNECT REDUNDANT PSU", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
      case "overheat":      return { text: "⚡ ACTION: UPGRADE AWG CABLE GAUGE", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" };
      case "bottleneck":    return { text: "🌐 ACTION: UPGRADE TO OM3 FIBER", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" };
      case "crypto-miner":  return { text: "💻 TOOL REQUIRED: EQUIP [KVM] (Slot 4)", color: "bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse" };
      case "dirty-fans":    return { text: "💨 TOOL REQUIRED: EQUIP [AIR-DUSTER] (Slot 3)", color: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse" };
      case "phase-imbalance": return { text: "⚡ TOOL REQUIRED: EQUIP [MULTIMETER] (Slot 2)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      default: return { text: "Inspect Rack", color: "bg-slate-800 text-slate-300" };
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
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Active Tickets & Tool Guide
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
                  
                  {/* Intuitive Tool Guidance Badge */}
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
              if (activeInteraction.type === "rack") setModalOpen(true);
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
                className={`flex flex-col items-center gap-1.5 w-24 p-2 rounded-xl border relative transition-all ${
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

          <button onClick={toggleThermalVision} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-bold">[T] THERMAL</span>
          </button>
          <button onClick={toggleCartAttach} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border font-bold transition-all ${cartAttached ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-slate-800/60 border-slate-700 text-slate-400"}`}>
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
                  <button onClick={() => buyFromShop(item.id as ToolType, item.qty, item.cost)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-xs text-white shadow-lg">
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
                    <button onClick={() => transferCartItem(item, "player")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-xl">EQUIP TO PLAYER</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalOpen && activeInteraction.type === "rack" && targetRack && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in-95 font-mono">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-950 px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400"><Server className="w-6 h-6" /></div>
                <div><h3 className="text-lg font-bold text-slate-100">Rack #{targetRack.id} — {targetRack.name}</h3><p className="text-xs text-slate-500">{targetRack.role}</p></div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Target Ticket Guidance Banner */}
            {activeRackTicket && (
              <div className="bg-amber-500/20 border-b border-amber-500/40 px-6 py-3 flex items-center gap-3 text-amber-200 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
                <div>
                  <span className="font-bold uppercase block tracking-wide">Active Ticket #{activeRackTicket.id}: {activeRackTicket.title}</span>
                  <span className="text-slate-300 text-[11px]">{getTicketHelperBadge(activeRackTicket).text}</span>
                </div>
              </div>
            )}

            {/* Content Controls */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950 text-xs">
                <div><span className="text-slate-500 block">Hardware Health</span><span className={`font-bold text-lg ${targetRack.health < 50 ? "text-rose-500" : "text-emerald-400"}`}>{targetRack.health.toFixed(1)}%</span></div>
                <div><span className="text-slate-500 block">Fan Cleanliness</span><span className={`font-bold text-lg ${targetRack.fanEfficiency < 60 ? "text-amber-500" : "text-sky-400"}`}>{targetRack.fanEfficiency.toFixed(1)}%</span></div>
                <div><span className="text-slate-500 block">Thermal Containment</span><span className="font-bold text-lg text-indigo-400">{targetRack.containmentClosed ? "CLOSED" : "OPEN"}</span></div>
              </div>

              {/* Maintenance Tools with Real-Time Lock / Unlock Validation */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">🛠️ Physical Hands-on Maintenance</span>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => toggleContainmentDoors(targetRack.id)} className="p-3 rounded-xl border border-slate-700 bg-slate-800/60 hover:border-slate-500 font-bold text-xs text-left flex items-center justify-between text-slate-200">
                    <span>Toggle Thermal Containment</span><span className="text-[10px] text-slate-400">{targetRack.containmentClosed ? "OPEN DOORS" : "CLOSE DOORS"}</span>
                  </button>
                  
                  {/* Air Duster Validation */}
                  {equippedItem === "air-duster" ? (
                    <button onClick={() => cleanFansWithDuster(targetRack.id)} className="p-3 rounded-xl border border-emerald-500 bg-emerald-500/20 hover:bg-emerald-500/30 font-bold text-xs text-left flex items-center justify-between text-emerald-200 shadow-lg shadow-emerald-500/20 animate-pulse">
                      <span className="flex items-center gap-2"><Unlock className="w-4 h-4 text-emerald-400" /> [AIR-DUSTER] Ready</span><span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">CLICK TO PURGE DUST</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-500 font-bold text-xs flex items-center justify-between cursor-not-allowed">
                      <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-slate-600" /> Fans Dirty</span><span className="text-[9px] text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">🔒 EQUIP [AIR-DUSTER] (Slot 3)</span>
                    </div>
                  )}

                  {/* KVM Validation */}
                  {targetRack.hasCryptoMiner && (
                    equippedItem === "kvm" ? (
                      <button onClick={() => purgeCryptoMinerWithKvm(targetRack.id)} className="p-3 rounded-xl border border-purple-500 bg-purple-500/20 text-purple-200 font-bold text-xs text-left flex items-center justify-between animate-pulse col-span-2 shadow-lg shadow-purple-500/20">
                        <span className="flex items-center gap-2"><Unlock className="w-4 h-4 text-purple-400" /> [KVM CONSOLE] Attached</span><span className="bg-purple-500 text-slate-950 px-3 py-1 rounded font-bold">PURGE CRYPTO MINER MALWARE</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 font-bold text-xs flex items-center justify-between col-span-2">
                        <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-rose-500" /> Crypto Malware Detected</span><span className="text-[10px] bg-purple-500/20 text-purple-300 px-3 py-1 rounded border border-purple-500/40 animate-pulse font-mono">🔒 EQUIP [KVM CONSOLE] (Slot 4)</span>
                      </div>
                    )
                  )}

                  {/* Extinguisher Validation */}
                  {targetRack.onFire && (
                    equippedItem === "extinguisher" ? (
                      <button onClick={() => extinguishFire(targetRack.id)} className="p-3 rounded-xl border border-rose-500 bg-rose-600 text-white font-bold text-xs text-left flex items-center justify-between animate-bounce col-span-2 shadow-xl shadow-rose-600/50">
                        <span className="flex items-center gap-2"><Flame className="w-5 h-5" /> [EXTINGUISHER] Ready</span><span className="bg-white text-rose-600 px-3 py-1 rounded font-bold uppercase">DISCHARGE FOAM IMMEDIATELY</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl border border-rose-500 bg-rose-950 text-rose-200 font-bold text-xs flex items-center justify-between col-span-2 animate-pulse">
                        <span className="flex items-center gap-2"><Lock className="w-5 h-5 text-rose-500" /> RACK ON FIRE!</span><span className="text-[10px] bg-rose-500 text-white px-3 py-1 rounded font-bold font-mono">🔒 EQUIP [EXTINGUISHER] (Slot 5)</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Power Redundancy with Dynamic Ticket Glow */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> ① Dual Cord Power Paths & 3-Phase (L1/L2/L3)</span>
                  <div className="flex items-center gap-2">
                    {(["L1", "L2", "L3"] as ElectricalPhase[]).map((ph) => (
                      <button key={ph} onClick={() => SetPhase(ph)} className={`px-2 py-0.5 rounded font-bold text-xs ${selectedPhase === ph ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>{ph}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${targetRack.psuAConnected ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-slate-800/40 border-slate-700 text-slate-500"}`}>
                    <div><span className="font-bold text-sm block">PSU-A (Primary)</span><span className="text-xs text-slate-400">PDU-A on Phase {targetRack.phaseA}</span></div>
                    <button onClick={() => targetRack.psuAConnected ? disconnectPsu(targetRack.id, "A") : connectPsu(targetRack.id, "A", selectedPhase)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${targetRack.psuAConnected ? "border-blue-500/40 bg-blue-500/20 text-blue-200" : "border-slate-600 bg-slate-700 text-slate-300"}`}>
                      {targetRack.psuAConnected ? "DISCONNECT" : "CONNECT"}
                    </button>
                  </div>
                  
                  {/* PSU-B Redundant with SPOF Glow Highlight */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    targetRack.psuBConnected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : activeRackTicket?.type === "spof" ? "bg-amber-500/10 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/20 animate-pulse" : "bg-slate-800/40 border-slate-700 text-slate-500"
                  }`}>
                    <div>
                      <span className="font-bold text-sm block flex items-center gap-2">PSU-B (Secondary) {!targetRack.psuBConnected && activeRackTicket?.type === "spof" && <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">TASK TARGET</span>}</span>
                      <span className="text-xs text-slate-400">PDU-B on Phase {targetRack.phaseB}</span>
                    </div>
                    <button onClick={() => targetRack.psuBConnected ? disconnectPsu(targetRack.id, "B") : connectPsu(targetRack.id, "B", selectedPhase)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      targetRack.psuBConnected ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200" : activeRackTicket?.type === "spof" ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold" : "border-slate-600 bg-slate-700 text-slate-300"
                    }`}>
                      {targetRack.psuBConnected ? "DISCONNECT" : "CONNECT REDUNDANT"}
                    </button>
                  </div>
                </div>
              </div>

              {/* AWG Power Cabling with Dynamic Ticket Glow */}
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2"><Power className="w-4 h-4 text-rose-400" /> ② Power Conductor Gauge (NEC 80% Rule)</span><span className="text-xs text-slate-400 font-bold">Load: {targetRack.requiredAmps}A</span></div>
                <div className="grid grid-cols-4 gap-2">
                  {(["awg14", "awg12", "awg10", "awg2"] as AwgGauge[]).map((gauge) => {
                    const isTarget = activeRackTicket?.type === "overheat" && (gauge === "awg10" || gauge === "awg2");
                    return (
                      <button key={gauge} onClick={() => changePowerGauge(targetRack.id, gauge)} className={`p-3 rounded-2xl border text-center font-bold text-xs uppercase relative transition-all ${
                        targetRack.currentAwg === gauge ? "bg-rose-500/20 border-rose-500 text-rose-200 shadow-md" : isTarget ? "bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse shadow-lg shadow-amber-500/20" : "bg-slate-800/50 border-slate-700 text-slate-400"
                      }`}>
                        {gauge}
                        {isTarget && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-bold">FIX</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Network Patch Cord Standard with Dynamic Ticket Glow */}
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2"><Network className="w-4 h-4 text-sky-400" /> ③ Backbone Network Cabling</span><span className="text-xs text-slate-400 font-bold">Backbone: {targetRack.backboneStandard.toUpperCase()}</span></div>
                <div className="grid grid-cols-3 gap-3">
                  {(["cat5e", "cat6a", "fiber-om3"] as CableStandard[]).map((std) => {
                    const isTarget = activeRackTicket?.type === "bottleneck" && std === "fiber-om3";
                    return (
                      <button key={std} onClick={() => changeDataCable(targetRack.id, std)} className={`p-4 rounded-2xl border text-center font-bold text-sm relative transition-all ${
                        targetRack.dataStandard === std ? "bg-sky-500/20 border-sky-500 text-sky-200 shadow-md" : isTarget ? "bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse shadow-lg shadow-amber-500/20" : "bg-slate-800/50 border-slate-700 text-slate-400"
                      }`}>
                        {std === "fiber-om3" ? "OM3 Fiber" : std.toUpperCase()}
                        {isTarget && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-amber-500 text-slate-950 px-2 rounded font-bold shadow">UPGRADE TARGET</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tool status validated in real-time.</span>
              <button onClick={() => setModalOpen(false)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-lg">CONFIRM INSPECTION</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
