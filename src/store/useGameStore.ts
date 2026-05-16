import { create } from "zustand";

export type CableStandard = "cat5e" | "cat6a" | "fiber-om3";
export type AwgGauge = "awg14" | "awg12" | "awg10" | "awg2";

export type RackState = {
  id: number;
  name: string;
  role: string;
  position: [number, number, number];
  // Power
  psuAConnected: boolean; // Connected to PDU-A
  psuBConnected: boolean; // Connected to PDU-B
  requiredAmps: number;
  currentAwg: AwgGauge;
  // Data
  dataStandard: CableStandard;
  backboneStandard: CableStandard; // Required standard to avoid bottleneck
  // Status
  isOn: boolean;
  hasSpof: boolean;
  isBottleneck: boolean;
  isOverheating: boolean;
};

export type InventoryItem = 
  | "tool-crimper" 
  | "cable-cat6a" 
  | "cable-fiber-om3" 
  | "cable-awg12" 
  | "cable-awg2"
  | "thermal-scanner";

export type Objective = {
  id: string;
  title: string;
  description: string;
  module: string;
  completed: boolean;
};

type GameStore = {
  // Player State
  inventory: InventoryItem[];
  equippedItem: InventoryItem | null;
  activeInteraction: { type: "rack" | "pdu" | "inventory" | null; targetId: number | null };
  
  // DC Environment State
  pduAOnline: boolean;
  pduBOnline: boolean;
  hvacOnline: boolean;
  thermalVisionMode: boolean;
  racks: RackState[];
  objectives: Objective[];
  notification: { title: string; message: string; type: "info" | "success" | "warn" | "danger" } | null;

  // Actions
  setEquippedItem: (item: InventoryItem | null) => void;
  setActiveInteraction: (type: "rack" | "pdu" | "inventory" | null, targetId?: number | null) => void;
  togglePdu: (pdu: "A" | "B") => void;
  toggleHvac: () => void;
  toggleThermalVision: () => void;
  connectPsu: (rackId: number, psu: "A" | "B") => void;
  disconnectPsu: (rackId: number, psu: "A" | "B") => void;
  changeDataCable: (rackId: number, standard: CableStandard) => void;
  changePowerGauge: (rackId: number, gauge: AwgGauge) => void;
  clearNotification: () => void;
  checkObjectives: () => void;
};

const initialRacks: RackState[] = [
  {
    id: 1,
    name: "Web Cluster 1",
    role: "Frontend Server",
    position: [-6, 0, -4],
    psuAConnected: true,
    psuBConnected: true,
    requiredAmps: 16,
    currentAwg: "awg12", // Correct (20A capacity)
    dataStandard: "cat6a",
    backboneStandard: "cat6a",
    isOn: true,
    hasSpof: false,
    isBottleneck: false,
    isOverheating: false,
  },
  {
    id: 2,
    name: "Web Cluster 2",
    role: "Frontend Server",
    position: [-3, 0, -4],
    psuAConnected: true,
    psuBConnected: true,
    requiredAmps: 16,
    currentAwg: "awg14", // Danger! Too thin for 16A continuous (16/0.8 = 20A req)
    dataStandard: "cat6a",
    backboneStandard: "cat6a",
    isOn: true,
    hasSpof: false,
    isBottleneck: false,
    isOverheating: true, // Due to AWG14
  },
  {
    id: 3,
    name: "DB Primary Core",
    role: "Database Master",
    position: [0, 0, -4],
    psuAConnected: true,
    psuBConnected: false, // SPOF Alert!
    requiredAmps: 32,
    currentAwg: "awg10",
    dataStandard: "cat5e", // Bottleneck! (Backbone is OM3 Fiber 10G)
    backboneStandard: "fiber-om3",
    isOn: true,
    hasSpof: true,
    isBottleneck: true,
    isOverheating: false,
  },
  {
    id: 4,
    name: "AI Computing Spine",
    role: "Deep Learning GPU",
    position: [3, 0, -4],
    psuAConnected: true,
    psuBConnected: true,
    requiredAmps: 64,
    currentAwg: "awg2",
    dataStandard: "fiber-om3",
    backboneStandard: "fiber-om3",
    isOn: true,
    hasSpof: false,
    isBottleneck: false,
    isOverheating: false,
  },
];

const initialObjectives: Objective[] = [
  {
    id: "obj-spof",
    title: "Eliminate Power SPOF",
    description: "Inspect Rack 3 (DB Primary Core) and connect its secondary power supply to PDU-B.",
    module: "Availability Engineering",
    completed: false,
  },
  {
    id: "obj-bottleneck",
    title: "Resolve Network Bottleneck",
    description: "Rack 3 is using a Cat 5e patch cord on an OM3 Fiber backbone. Replace it with an OM3 Fiber patch cord.",
    module: "Cabling Operations",
    completed: false,
  },
  {
    id: "obj-awg",
    title: "Fix Overheating Power Cable",
    description: "Rack 2 is drawing 16A continuous on an AWG 14 wire (rated 15A max). Upgrade to AWG 12 to meet the NEC 80% rule.",
    module: "Cabling Operations",
    completed: false,
  },
];

export const useGameStore = create<GameStore>((set, get) => ({
  inventory: ["cable-cat6a", "cable-fiber-om3", "cable-awg12", "cable-awg2", "thermal-scanner"],
  equippedItem: null,
  activeInteraction: { type: null, targetId: null },
  
  pduAOnline: true,
  pduBOnline: true,
  hvacOnline: true,
  thermalVisionMode: false,
  racks: initialRacks,
  objectives: initialObjectives,
  notification: {
    title: "Welcome Operator",
    message: "Use WASD or Arrow keys to walk through the Data Center. Approach any Rack or PDU and press Space or Enter to inspect.",
    type: "info",
  },

  setEquippedItem: (item) => set({ equippedItem: item }),
  setActiveInteraction: (type, targetId = null) => set({ activeInteraction: { type, targetId } }),
  
  togglePdu: (pdu) => {
    set((state) => {
      const nextA = pdu === "A" ? !state.pduAOnline : state.pduAOnline;
      const nextB = pdu === "B" ? !state.pduBOnline : state.pduBOnline;
      
      const updatedRacks = state.racks.map((rack) => {
        const hasPower = (rack.psuAConnected && nextA) || (rack.psuBConnected && nextB);
        return { ...rack, isOn: hasPower };
      });

      return {
        pduAOnline: nextA,
        pduBOnline: nextB,
        racks: updatedRacks,
        notification: {
          title: `PDU-${pdu} status changed`,
          message: `PDU-${pdu} is now ${pdu === "A" ? (nextA ? "Online" : "Offline") : (nextB ? "Online" : "Offline")}. Server power paths updated.`,
          type: (pdu === "A" ? nextA : nextB) ? "success" : "danger",
        },
      };
    });
    get().checkObjectives();
  },

  toggleHvac: () => {
    set((state) => ({
      hvacOnline: !state.hvacOnline,
      notification: {
        title: "HVAC System",
        message: !state.hvacOnline ? "Cooling system active. Airflow stabilized." : "Warning: HVAC offline. Cold aisle temperatures rising.",
        type: !state.hvacOnline ? "success" : "warn",
      },
    }));
  },

  toggleThermalVision: () => {
    set((state) => ({
      thermalVisionMode: !state.thermalVisionMode,
      notification: {
        title: "Thermal Scanner",
        message: !state.thermalVisionMode ? "Thermal vision active. Inspecting infrastructure hotspots." : "Standard optical spectrum restored.",
        type: "info",
      },
    }));
  },

  connectPsu: (rackId, psu) => {
    set((state) => ({
      racks: state.racks.map((r) => {
        if (r.id !== rackId) return r;
        const nextA = psu === "A" ? true : r.psuAConnected;
        const nextB = psu === "B" ? true : r.psuBConnected;
        const isOn = (nextA && state.pduAOnline) || (nextB && state.pduBOnline);
        const hasSpof = !(nextA && nextB);
        return { ...r, psuAConnected: nextA, psuBConnected: nextB, isOn, hasSpof };
      }),
      notification: {
        title: "Power Cable Connected",
        message: `Connected PSU-${psu} on Rack ${rackId}. Dual cord power paths established.`,
        type: "success",
      },
    }));
    get().checkObjectives();
  },

  disconnectPsu: (rackId, psu) => {
    set((state) => ({
      racks: state.racks.map((r) => {
        if (r.id !== rackId) return r;
        const nextA = psu === "A" ? false : r.psuAConnected;
        const nextB = psu === "B" ? false : r.psuBConnected;
        const isOn = (nextA && state.pduAOnline) || (nextB && state.pduBOnline);
        const hasSpof = !(nextA && nextB);
        return { ...r, psuAConnected: nextA, psuBConnected: nextB, isOn, hasSpof };
      }),
      notification: {
        title: "Power Cable Disconnected",
        message: `Disconnected PSU-${psu} on Rack ${rackId}. Server is now vulnerable to power faults.`,
        type: "warn",
      },
    }));
    get().checkObjectives();
  },

  changeDataCable: (rackId, standard) => {
    set((state) => ({
      racks: state.racks.map((r) => {
        if (r.id !== rackId) return r;
        const isBottleneck = standard === "cat5e" && r.backboneStandard !== "cat5e";
        return { ...r, dataStandard: standard, isBottleneck };
      }),
      notification: {
        title: "Data Patch Cord Replaced",
        message: `Upgraded Rack ${rackId} patch cord to ${standard === "fiber-om3" ? "OM3 Fiber" : standard.toUpperCase()}.`,
        type: "success",
      },
    }));
    get().checkObjectives();
  },

  changePowerGauge: (rackId, gauge) => {
    set((state) => ({
      racks: state.racks.map((r) => {
        if (r.id !== rackId) return r;
        // Check continuous rating (16A continuous requires 20A capacity -> AWG 12 or lower)
        const isOverheating = gauge === "awg14" && r.requiredAmps >= 16;
        return { ...r, currentAwg: gauge, isOverheating };
      }),
      notification: {
        title: "Power Gauge Upgraded",
        message: `Replaced Rack ${rackId} power cabling with ${gauge.toUpperCase()}.`,
        type: "success",
      },
    }));
    get().checkObjectives();
  },

  clearNotification: () => set({ notification: null }),

  checkObjectives: () => {
    set((state) => {
      const racks = state.racks;
      
      // Check SPOF
      const rack3 = racks.find((r) => r.id === 3);
      const spofDone = rack3 ? (rack3.psuAConnected && rack3.psuBConnected) : false;

      // Check Bottleneck
      const bottleDone = rack3 ? rack3.dataStandard === "fiber-om3" : false;

      // Check AWG
      const rack2 = racks.find((r) => r.id === 2);
      const awgDone = rack2 ? (rack2.currentAwg === "awg12" || rack2.currentAwg === "awg2") : false;

      const updatedObjs = state.objectives.map((obj) => {
        if (obj.id === "obj-spof") return { ...obj, completed: spofDone };
        if (obj.id === "obj-bottleneck") return { ...obj, completed: bottleDone };
        if (obj.id === "obj-awg") return { ...obj, completed: awgDone };
        return obj;
      });

      const allDone = updatedObjs.every((o) => o.completed);

      return {
        objectives: updatedObjs,
        ...(allDone && !state.objectives.every((o) => o.completed) ? {
          notification: {
            title: "🎉 Level 1 Infrastructure Certified",
            message: "Outstanding work! You have successfully eliminated all SPOFs, upgraded continuous load cabling, and resolved backbone network bottlenecks.",
            type: "success",
          }
        } : {})
      };
    });
  },
}));
