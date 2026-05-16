/* ─────────────────────────────────────────────────────────
   Level definitions — derived from dc-study-app modules
   Source of truth: github.com/JesusOrellana/dc-study-app
───────────────────────────────────────────────────────── */

export type LevelConfig = {
  id: number;
  slug: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  /** Which dc-study-app module this level maps to */
  sourceModule: string;
  unlocked: boolean;
  scene: string; // Phaser scene key
  mechanics: string[];
};

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    slug: "cabling",
    title: "Cabling Operations",
    titleEs: "Operaciones de Cableado",
    description:
      "Route power cables correctly, size AWG gauges for continuous loads, and apply the bottleneck rule to backbone cabling.",
    descriptionEs:
      "Tiende cables de poder correctamente, dimensiona calibres AWG para carga continua y aplica la regla del cuello de botella al backbone.",
    sourceModule: "Fundamentals of Cabling Strategies for Data Centers",
    unlocked: true,
    scene: "Level1Scene",
    mechanics: [
      "awg-derating",       // Size cable for 80% continuous load rule
      "bottleneck-rule",    // Patch cord must match backbone standard
      "spof-mitigation",    // Dual-cord power paths
      "overhead-routing",   // Cable trays vs raised floor
      "emi-avoidance",      // Route copper away from power lines
    ],
  },
  {
    id: 2,
    slug: "availability",
    title: "Availability Engineering",
    titleEs: "Ingeniería de Disponibilidad",
    description:
      "Design redundant power and cooling systems. Build a Tier III data center layout while eliminating single points of failure.",
    descriptionEs:
      "Diseña sistemas redundantes de energía y enfriamiento. Construye un layout Tier III eliminando puntos únicos de fallo.",
    sourceModule: "Fundamentals of Availability",
    unlocked: false,
    scene: "Level2Scene",
    mechanics: [
      "tier-classification",
      "redundancy-paths",
      "uptime-calculation",
      "spof-elimination",
    ],
  },
  {
    id: 3,
    slug: "fire-protection",
    title: "Fire Protection Systems",
    titleEs: "Sistemas de Protección contra Incendios",
    description:
      "Install fire detection systems, configure EPO procedures, and choose the right suppression agent for each zone.",
    descriptionEs:
      "Instala sistemas de detección de incendios, configura procedimientos EPO y elige el agente de supresión adecuado para cada zona.",
    sourceModule: "Examining Fire Protection Methods in the Data Center",
    unlocked: false,
    scene: "Level3Scene",
    mechanics: [
      "detector-placement",
      "epo-sequence",
      "suppression-agents",
      "nfpa75-compliance",
    ],
  },
];
