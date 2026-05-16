import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CableStandard = "cat5e" | "cat6a" | "fiber-om3";
export type AwgGauge      = "awg14" | "awg12" | "awg10" | "awg2";
export type ElectricalPhase = "L1" | "L2" | "L3";
export type ToolType      = "multimeter" | "air-duster" | "kvm" | "extinguisher" | "thermal-scanner" | "cable-cat6a" | "cable-om3" | "psu-spare";

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  reward: number; // Budget dollars earned upon completion
  penalty: number; // SLA drop if expired or failed
  timeRemaining: number; // Seconds left
  type: "spof" | "bottleneck" | "overheat" | "crypto-miner" | "dirty-fans" | "phase-imbalance";
  targetRackId: number;
  completed: boolean;
  failed: boolean;
}

export interface RackState {
  id: number;
  name: string;
  role: string;
  position: [number, number, number];
  
  // Power & Redundancy
  psuAConnected: boolean;
  psuBConnected: boolean;
  phaseA: ElectricalPhase;
  phaseB: ElectricalPhase;
  requiredAmps: number;
  currentAwg: AwgGauge;

  // Data
  dataStandard: CableStandard;
  backboneStandard: CableStandard;

  // Systemic Health & Degradation
  health: number;         // 0 to 100%
  fanEfficiency: number;  // 0 to 100% (Degrades over time due to dust)
  hasCryptoMiner: boolean; // Unauthorized hardware event
  containmentClosed: boolean; // Aisle containment doors
  onFire: boolean;        // Critical ignition state if health hits 0 under extreme overheat

  // Calculated Runtime Flags
  isOn: boolean;
  hasSpof: boolean;
  isBottleneck: boolean;
  isOverheating: boolean;
}

export interface ActiveInteraction {
  type: "rack" | "pdu" | "shop" | "cart" | null;
  targetId: number | null;
}

export interface GameStore {
  // World & Corporate State
  day: number;
  timeOfDay: number; // Seconds in current day (e.g., 0 to 600 for a 10 min shift)
  sla: number;       // Percentage (e.g. 99.999%)
  budget: number;    // Corporate Dollars ($)
  gameOver: boolean;
  gameOverReason: string | null;

  // Infrastructure & Power Grid
  racks: RackState[];
  workOrders: WorkOrder[];
  pduAOnline: boolean;
  pduBOnline: boolean;
  hvacOnline: boolean;
  mainBreakerTripped: boolean;
  unlockedHalls: ("hall1" | "hall2" | "hall3")[];

  // Operator & Physical Inventory
  inventory: ToolType[];
  equippedItem: ToolType | null;
  activeInteraction: ActiveInteraction;
  thermalVisionMode: boolean;
  notification: { title: string; message: string; type: "info" | "success" | "warn" | "danger" } | null;

  // Physical Crash Cart State
  cartAttached: boolean;
  cartPosition: [number, number, number];
  cartInventory: { [key in ToolType]?: number }; // Quantities in cart

  // Shop Orders (Delivery queue)
  deliveryQueue: { item: ToolType; quantity: number; timeRemaining: number }[];

  // Actions
  setEquippedItem: (item: ToolType | null) => void;
  setActiveInteraction: (type: ActiveInteraction["type"], id: number | null) => void;
  togglePdu: (pdu: "A" | "B") => void;
  toggleHvac: () => void;
  toggleThermalVision: () => void;
  toggleCartAttach: () => void;
  clearNotification: () => void;

  // Physical Repair & Maintenance Actions
  connectPsu: (rackId: number, psu: "A" | "B", phase: ElectricalPhase) => void;
  disconnectPsu: (rackId: number, psu: "A" | "B") => void;
  changeDataCable: (rackId: number, standard: CableStandard) => void;
  changePowerGauge: (rackId: number, gauge: AwgGauge) => void;
  toggleContainmentDoors: (rackId: number) => void;
  cleanFansWithDuster: (rackId: number) => void;
  purgeCryptoMinerWithKvm: (rackId: number) => void;
  extinguishFire: (rackId: number) => void;

  // Corporate Shop Orders
  buyFromShop: (item: ToolType, quantity: number, cost: number) => void;
  transferCartItem: (item: ToolType, to: "player" | "cart") => void;

  // Procedural Engine Ticks
  tickDayTime: (deltaSeconds: number) => void;
  generateProceduralTicket: () => void;
}

const initialRacks: RackState[] = [
  {
    id: 1,
    name: "Web Ingress Core",
    role: "Nginx Load Balancer cluster",
    position: [-4, 0, -4],
    psuAConnected: true,
    psuBConnected: true,
    phaseA: "L1",
    phaseB: "L1",
    requiredAmps: 16,
    currentAwg: "awg12",
    dataStandard: "cat6a",
    backboneStandard: "cat6a",
    health: 100,
    fanEfficiency: 95,
    hasCryptoMiner: false,
    containmentClosed: true,
    onFire: false,
    isOn: true,
    hasSpof: false,
    isBottleneck: false,
    isOverheating: false,
  },
  {
    id: 2,
    name: "DB Master Storage",
    role: "Postgres NVMe Database cluster",
    position: [-1.5, 0, -4],
    psuAConnected: true,
    psuBConnected: true,
    phaseA: "L2",
    phaseB: "L2",
    requiredAmps: 32,
    currentAwg: "awg14", // Intentional NEC violation (Overheating trigger)
    dataStandard: "cat6a",
    backboneStandard: "cat6a",
    health: 90,
    fanEfficiency: 80,
    hasCryptoMiner: false,
    containmentClosed: true,
    onFire: false,
    isOn: true,
    hasSpof: false,
    isBottleneck: false,
    isOverheating: true,
  },
  {
    id: 3,
    name: "AI Analytics Node",
    role: "NVIDIA H100 GPU compute rack",
    position: [1.5, 0, -4],
    psuAConnected: true,
    psuBConnected: false, // Intentional SPOF
    phaseA: "L3",
    phaseB: "L3",
    requiredAmps: 64,
    currentAwg: "awg2",
    dataStandard: "cat5e", // Intentional Bottleneck
    backboneStandard: "fiber-om3",
    health: 85,
    fanEfficiency: 70, // Needs cleaning
    hasCryptoMiner: false,
    containmentClosed: true,
    onFire: false,
    isOn: true,
    hasSpof: true,
    isBottleneck: true,
    isOverheating: false,
  },
  {
    id: 4,
    name: "S3 Object Store",
    role: "High-density MinIO Ceph cluster",
    position: [4, 0, -4],
    psuAConnected: true,
    psuBConnected: true,
    phaseA: "L1",
    phaseB: "L2",
    requiredAmps: 32,
    currentAwg: "awg10",
    dataStandard: "fiber-om3",
    backboneStandard: "fiber-om3",
    health: 100,
    fanEfficiency: 90,
    hasCryptoMiner: false,
    containmentClosed: true,
    onFire: false,
    isOn: true,
    hasSpof: false,
    isBottleneck: false,
    isOverheating: false,
  },
];

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // Corporate State
      day: 1,
      timeOfDay: 0,
      sla: 99.999,
      budget: 15000, // Corporate starting budget ($15,000)
      gameOver: false,
      gameOverReason: null,

      // Infrastructure
      racks: initialRacks,
      workOrders: [
        {
          id: "WO-101",
          title: "SPOF Vulnerability in AI Analytics Node",
          description: "Rack #3 is running on a single PSU. Connect redundant power to PDU-B on Phase L3.",
          reward: 1200,
          penalty: 0.05,
          timeRemaining: 300,
          type: "spof",
          targetRackId: 3,
          completed: false,
          failed: false,
        },
        {
          id: "WO-102",
          title: "NEC De-rating Fire Hazard in DB Master",
          description: "Rack #2 pulls 32A through AWG 14 conductors. Replace with AWG 10 or AWG 2 immediately.",
          reward: 1500,
          penalty: 0.1,
          timeRemaining: 240,
          type: "overheat",
          targetRackId: 2,
          completed: false,
          failed: false,
        },
        {
          id: "WO-103",
          title: "Network Bottleneck on AI Backbone",
          description: "Rack #3 has Cat5e copper patch cords restricting 10G OM3 backbone throughput. Upgrade to Fiber.",
          reward: 1000,
          penalty: 0.02,
          timeRemaining: 400,
          type: "bottleneck",
          targetRackId: 3,
          completed: false,
          failed: false,
        },
      ],
      pduAOnline: true,
      pduBOnline: true,
      hvacOnline: true,
      mainBreakerTripped: false,
      unlockedHalls: ["hall1"],

      // Operator Inventory & State
      inventory: ["thermal-scanner", "multimeter", "air-duster", "kvm", "extinguisher"],
      equippedItem: null,
      activeInteraction: { type: null, targetId: null },
      thermalVisionMode: false,
      notification: {
        title: "SHIFT COMMENCING",
        message: "Welcome Operator. Keep SLA above 99.000%. Check active work orders on your HUD.",
        type: "info",
      },

      // Crash Cart
      cartAttached: false,
      cartPosition: [-10, 0, 8],
      cartInventory: {
        "cable-cat6a": 4,
        "cable-om3": 2,
        "psu-spare": 3,
      },

      // Shop Delivery Queue
      deliveryQueue: [],

      // Actions
      setEquippedItem: (item) => set({ equippedItem: item }),
      setActiveInteraction: (type, targetId) => set({ activeInteraction: { type, targetId } }),
      toggleThermalVision: () => set((state) => ({ thermalVisionMode: !state.thermalVisionMode })),
      toggleCartAttach: () => set((state) => ({ cartAttached: !state.cartAttached })),
      clearNotification: () => set({ notification: null }),

      togglePdu: (pdu) => set((state) => {
        const nextA = pdu === "A" ? !state.pduAOnline : state.pduAOnline;
        const nextB = pdu === "B" ? !state.pduBOnline : state.pduBOnline;
        return {
          pduAOnline: nextA,
          pduBOnline: nextB,
          notification: {
            title: `PDU-${pdu} POWER SWITCHED`,
            message: `Power distribution unit ${pdu} is now ${pdu === "A" ? (nextA ? "ONLINE" : "OFFLINE") : (nextB ? "ONLINE" : "OFFLINE")}.`,
            type: "warn",
          },
        };
      }),

      toggleHvac: () => set((state) => ({
        hvacOnline: !state.hvacOnline,
        notification: {
          title: "HVAC STATUS UPDATED",
          message: `Chiller units are now ${!state.hvacOnline ? "STABLE" : "OFFLINE"}. Watch server thermals closely.`,
          type: "warn",
        },
      })),

      // Repair & Wiring
      connectPsu: (rackId, psu, phase) => set((state) => {
        const racks = state.racks.map((r) => {
          if (r.id === rackId) {
            return {
              ...r,
              psuAConnected: psu === "A" ? true : r.psuAConnected,
              psuBConnected: psu === "B" ? true : r.psuBConnected,
              phaseA: psu === "A" ? phase : r.phaseA,
              phaseB: psu === "B" ? phase : r.phaseB,
            };
          }
          return r;
        });
        return { racks, notification: { title: "PSU WIRING SECURED", message: `Rack #${rackId} connected to PDU-${psu} on Phase ${phase}.`, type: "success" } };
      }),

      disconnectPsu: (rackId, psu) => set((state) => {
        const racks = state.racks.map((r) => {
          if (r.id === rackId) {
            return {
              ...r,
              psuAConnected: psu === "A" ? false : r.psuAConnected,
              psuBConnected: psu === "B" ? false : r.psuBConnected,
            };
          }
          return r;
        });
        return { racks, notification: { title: "PSU DISCONNECTED", message: `Rack #${rackId} disconnected from PDU-${psu}.`, type: "warn" } };
      }),

      changeDataCable: (rackId, standard) => set((state) => {
        let requiredTool: ToolType | null = null;
        if (standard === "cat6a") requiredTool = "cable-cat6a";
        if (standard === "fiber-om3") requiredTool = "cable-om3";

        if (requiredTool) {
          const cartCount = state.cartInventory[requiredTool] || 0;
          if (cartCount <= 0) {
            return { notification: { title: "INSUFFICIENT CABLE INVENTORY", message: `You need ${standard.toUpperCase()} cables in your Crash Cart. Buy from Shop Terminal.`, type: "danger" } };
          }
          state.cartInventory[requiredTool] = cartCount - 1;
        }

        const racks = state.racks.map((r) => (r.id === rackId ? { ...r, dataStandard: standard } : r));
        return { racks, cartInventory: { ...state.cartInventory }, notification: { title: "PATCH CORD UPDATED", message: `Rack #${rackId} data channel updated to ${standard.toUpperCase()}.`, type: "success" } };
      }),

      changePowerGauge: (rackId, gauge) => set((state) => {
        const racks = state.racks.map((r) => (r.id === rackId ? { ...r, currentAwg: gauge } : r));
        return { racks, notification: { title: "NEC POWER CORD REPLACED", message: `Rack #${rackId} power conductor upgraded to ${gauge.toUpperCase()}.`, type: "success" } };
      }),

      toggleContainmentDoors: (rackId) => set((state) => {
        const racks = state.racks.map((r) => (r.id === rackId ? { ...r, containmentClosed: !r.containmentClosed } : r));
        return { racks, notification: { title: "CONTAINMENT DOORS TOGGLED", message: `Aisle containment doors on Rack #${rackId} updated.`, type: "info" } };
      }),

      cleanFansWithDuster: (rackId) => set((state) => {
        const racks = state.racks.map((r) => (r.id === rackId ? { ...r, fanEfficiency: 100 } : r));
        return { racks, notification: { title: "FANS PURGED WITH COMPRESSED AIR", message: `Rack #${rackId} ventilation efficiency restored to 100%.`, type: "success" } };
      }),

      purgeCryptoMinerWithKvm: (rackId) => set((state) => {
        const racks = state.racks.map((r) => (r.id === rackId ? { ...r, hasCryptoMiner: false } : r));
        return { racks, notification: { title: "UNAUTHORIZED MALWARE PURGED", message: `Crypto mining process terminated via KVM console on Rack #${rackId}.`, type: "success" } };
      }),

      extinguishFire: (rackId) => set((state) => {
        const racks = state.racks.map((r) => (r.id === rackId ? { ...r, onFire: false, health: Math.max(r.health, 20) } : r));
        return { racks, notification: { title: "FIRE EXTINGUISHED", message: `Flames suppressed on Rack #${rackId}. Hardware requires immediate maintenance.`, type: "success" } };
      }),

      buyFromShop: (item, quantity, cost) => set((state) => {
        if (state.budget < cost) {
          return { notification: { title: "ORDER REJECTED", message: "Insufficient corporate budget for procurement.", type: "danger" } };
        }
        const deliveryQueue = [...state.deliveryQueue, { item, quantity, timeRemaining: 30 }];
        return { budget: state.budget - cost, deliveryQueue, notification: { title: "ORDER PLACED", message: `Procurement order for ${quantity}x ${item} placed. ETA 30 seconds.`, type: "success" } };
      }),

      transferCartItem: (item, to) => set((state) => {
        if (to === "player") {
          const count = state.cartInventory[item] || 0;
          if (count > 0 && !state.inventory.includes(item)) {
            state.cartInventory[item] = count - 1;
            return { inventory: [...state.inventory, item], cartInventory: { ...state.cartInventory } };
          }
        }
        return state;
      }),

      // Procedural Simulation Engine Ticks
      tickDayTime: (deltaSeconds) => set((state) => {
        if (state.gameOver) return state;

        const timeOfDay = state.timeOfDay + deltaSeconds;
        let day = state.day;

        if (timeOfDay >= 600) {
          day += 1;
          return { day, timeOfDay: 0, notification: { title: `DAY ${day} COMMENCING`, message: "Shift completed. Systems stabilized. Budget bonus awarded.", type: "success" }, budget: state.budget + 2500 };
        }

        const deliveryQueue = state.deliveryQueue.map((dq) => ({ ...dq, timeRemaining: dq.timeRemaining - deltaSeconds })).filter((dq) => {
          if (dq.timeRemaining <= 0) {
            const current = state.cartInventory[dq.item] || 0;
            state.cartInventory[dq.item] = current + dq.quantity;
            state.notification = { title: "SHIPMENT ARRIVED", message: `Package delivered to your Crash Cart: ${dq.quantity}x ${dq.item}.`, type: "success" };
            return false;
          }
          return true;
        });

        let slaDrop = 0;
        let totalL1 = 0;
        let totalL2 = 0;
        let totalL3 = 0;

        const racks = state.racks.map((r) => {
          const hasPower = (r.psuAConnected && state.pduAOnline) || (r.psuBConnected && state.pduBOnline);
          if (!hasPower || state.mainBreakerTripped) {
            slaDrop += 0.005 * deltaSeconds;
            return { ...r, isOn: false };
          }

          if (r.psuAConnected && state.pduAOnline) {
            if (r.phaseA === "L1") totalL1 += r.requiredAmps;
            if (r.phaseA === "L2") totalL2 += r.requiredAmps;
            if (r.phaseA === "L3") totalL3 += r.requiredAmps;
          }
          if (r.psuBConnected && state.pduBOnline) {
            if (r.phaseB === "L1") totalL1 += r.requiredAmps;
            if (r.phaseB === "L2") totalL2 += r.requiredAmps;
            if (r.phaseB === "L3") totalL3 += r.requiredAmps;
          }

          const isBottleneck = r.dataStandard === "cat5e" && r.backboneStandard !== "cat5e";

          const maxAmps = r.currentAwg === "awg14" ? 15 : r.currentAwg === "awg12" ? 20 : r.currentAwg === "awg10" ? 30 : 95;
          const actualLoad = r.hasCryptoMiner ? r.requiredAmps * 2 : r.requiredAmps;
          const necViolated = actualLoad > maxAmps;
          
          const nextFanEff = Math.max(0, r.fanEfficiency - 0.05 * deltaSeconds);
          const fanOverheat = nextFanEff < 50;

          const containmentPenalty = !r.containmentClosed ? 5 : 0;
          const hvacPenalty = !state.hvacOnline ? 25 : 0;

          const isOverheating = necViolated || fanOverheat || (hvacPenalty + containmentPenalty) > 15 || r.onFire;

          let nextHealth = r.health;
          let nextOnFire = r.onFire;
          if (isOverheating) {
            nextHealth = Math.max(0, r.health - 0.4 * deltaSeconds);
            slaDrop += 0.002 * deltaSeconds;
            if (nextHealth <= 0) nextOnFire = true;
          }

          return {
            ...r,
            isOn: true,
            hasSpof: !(r.psuAConnected && r.psuBConnected),
            isBottleneck,
            isOverheating,
            fanEfficiency: nextFanEff,
            health: nextHealth,
            onFire: nextOnFire,
          };
        });

        const maxLoad = Math.max(totalL1, totalL2, totalL3);
        const minLoad = Math.min(totalL1, totalL2, totalL3);
        let mainBreakerTripped = state.mainBreakerTripped;
        if (maxLoad - minLoad > 60 && !mainBreakerTripped) {
          mainBreakerTripped = true;
          state.notification = { title: "MAIN DISYUNTOR TRIPPED", message: "Extreme 3-Phase electrical imbalance (L1/L2/L3). All server halls lost power!", type: "danger" };
        }

        const nextSla = Math.max(0, state.sla - slaDrop);
        let gameOver = state.gameOver;
        let gameOverReason = state.gameOverReason;

        if (nextSla <= 99.000 && !gameOver) {
          gameOver = true;
          gameOverReason = "Service Level Agreement (SLA) dropped below 99.000%. Critical client contract breached. You have been relieved of duty.";
        }

        const workOrders = state.workOrders.map((wo) => {
          if (wo.completed || wo.failed) return wo;

          let completed = false;
          const targetRack = racks.find((r) => r.id === wo.targetRackId);
          if (targetRack) {
            if (wo.type === "spof" && !targetRack.hasSpof) completed = true;
            if (wo.type === "overheat" && !targetRack.isOverheating) completed = true;
            if (wo.type === "bottleneck" && !targetRack.isBottleneck) completed = true;
            if (wo.type === "crypto-miner" && !targetRack.hasCryptoMiner) completed = true;
            if (wo.type === "dirty-fans" && targetRack.fanEfficiency >= 90) completed = true;
          }

          if (completed) {
            state.budget += wo.reward;
            state.notification = { title: "WORK ORDER RESOLVED", message: `Ticket #${wo.id} successfully closed. Corporate bonus: +$${wo.reward}.`, type: "success" };
            return { ...wo, completed: true };
          }

          const timeRemaining = wo.timeRemaining - deltaSeconds;
          const failed = timeRemaining <= 0;
          if (failed) {
            state.notification = { title: "TICKET SLA EXPIRED", message: `Work Order #${wo.id} failed. Penalty applied to global SLA.`, type: "danger" };
            return { ...wo, failed: true };
          }

          return { ...wo, timeRemaining };
        });

        return { timeOfDay, sla: nextSla, racks, workOrders, deliveryQueue, mainBreakerTripped, gameOver, gameOverReason, cartInventory: { ...state.cartInventory } };
      }),

      generateProceduralTicket: () => set((state) => {
        if (state.workOrders.filter((wo) => !wo.completed && !wo.failed).length >= 5) return state;

        const randomRack = state.racks[Math.floor(Math.random() * state.racks.length)];
        const types: WorkOrder["type"][] = ["crypto-miner", "dirty-fans", "phase-imbalance"];
        const selectedType = types[Math.floor(Math.random() * types.length)];
        const newId = `WO-${Math.floor(Math.random() * 900 + 100)}`;

        let nextTitle: string;
        let nextDesc: string;
        let nextReward: number;
        let nextPenalty: number;

        if (selectedType === "crypto-miner") {
          nextTitle = `Unauthorized Hardware in Rack #${randomRack.id}`;
          nextDesc = `Anomalous power spike detected. Connect KVM console to Rack #${randomRack.id} to purge crypto miner malware.`;
          nextReward = 2000;
          nextPenalty = 0.1;
          randomRack.hasCryptoMiner = true;
        } else if (selectedType === "dirty-fans") {
          nextTitle = `Severe Dust Accumulation on Rack #${randomRack.id}`;
          nextDesc = `Server fan speeds failing. Use Compressed Air Duster to restore cooling airflow.`;
          nextReward = 800;
          nextPenalty = 0.03;
          randomRack.fanEfficiency = Math.min(randomRack.fanEfficiency, 40);
        } else {
          nextTitle = `Phase Imbalance Warning in Data Hall`;
          nextDesc = `Verify 3-Phase load distribution across L1/L2/L3 using your Multimeter before main breaker trips.`;
          nextReward = 1200;
          nextPenalty = 0.08;
        }

        return {
          racks: [...state.racks],
          workOrders: [...state.workOrders, {
            id: newId,
            title: nextTitle,
            description: nextDesc,
            reward: nextReward,
            penalty: nextPenalty,
            timeRemaining: 240,
            type: selectedType,
            targetRackId: randomRack.id,
            completed: false,
            failed: false,
          }],
          notification: { title: "NEW WORK ORDER ISSUED", message: `${nextTitle} — Check HUD for details.`, type: "warn" },
        };
      }),
    }),
    {
      name: "dcca-simulator-storage",
      partialize: (state) => ({
        day: state.day,
        sla: state.sla,
        budget: state.budget,
        racks: state.racks,
        unlockedHalls: state.unlockedHalls,
        cartInventory: state.cartInventory,
        workOrders: state.workOrders,
      }),
    }
  )
);
