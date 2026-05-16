import Phaser from "phaser";

/**
 * Level 1: Cabling Operations
 * Source module: "Fundamentals of Cabling Strategies for Data Centers" (dc-study-app)
 *
 * Mechanics implemented:
 * - AWG de-rating (size cable for 80% continuous load)
 * - Bottleneck rule (patch cord must match backbone)
 * - SPOF mitigation (dual-cord paths)
 * - Overhead vs underfoot routing
 */
export class Level1Scene extends Phaser.Scene {
  private score = 0;
  private tasks: Task[] = [];
  private currentTask = 0;
  private hudText!: Phaser.GameObjects.Text;
  private taskText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Level1Scene" });
  }

  create() {
    const { width, height } = this.scale;

    /* ── Background ── */
    this.add.rectangle(0, 0, width, height, 0x0f172a).setOrigin(0);

    /* ── Draw isometric DC floor grid ── */
    this.drawIsoGrid();

    /* ── Draw rack row ── */
    this.drawRacks();

    /* ── HUD ── */
    this.add.rectangle(0, 0, width, 50, 0x0f172a).setOrigin(0);
    this.add.text(16, 14, "LEVEL 1 — CABLING OPERATIONS", {
      fontFamily: "monospace", fontSize: "14px", color: "#6366f1", fontStyle: "bold",
    });
    this.hudText = this.add.text(width - 16, 14, `SCORE: ${this.score}`, {
      fontFamily: "monospace", fontSize: "14px", color: "#34d399",
    }).setOrigin(1, 0);

    /* ── Back to menu ── */
    const backBtn = this.add.text(16, height - 30, "← MENU", {
      fontFamily: "monospace", fontSize: "12px", color: "#475569",
      backgroundColor: "#1e293b", padding: { x: 8, y: 4 },
    }).setInteractive({ useHandCursor: true });
    backBtn.on("pointerover", () => backBtn.setColor("#94a3b8"));
    backBtn.on("pointerout",  () => backBtn.setColor("#475569"));
    backBtn.on("pointerdown", () => this.scene.start("MenuScene"));

    /* ── Task panel ── */
    this.add.rectangle(width / 2, height - 90, width - 40, 110, 0x1e293b, 0.95)
      .setStrokeStyle(1, 0x334155);

    this.taskText = this.add.text(width / 2, height - 120, "", {
      fontFamily: "monospace", fontSize: "13px", color: "#e2e8f0",
      align: "center", wordWrap: { width: width - 80 },
    }).setOrigin(0.5, 0);

    this.feedbackText = this.add.text(width / 2, height - 60, "", {
      fontFamily: "monospace", fontSize: "11px", color: "#fbbf24",
      align: "center", wordWrap: { width: width - 80 },
    }).setOrigin(0.5, 0);

    /* ── Load tasks ── */
    this.tasks = buildLevel1Tasks();
    this.showTask();
  }

  private drawIsoGrid() {
    const g = this.add.graphics();
    const tileW = 64, tileH = 32;
    const cols = 12, rows = 8;
    const originX = this.scale.width / 2;
    const originY = 180;

    g.lineStyle(1, 0x1e3a5f, 0.5);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = originX + (col - row) * (tileW / 2);
        const y = originY + (col + row) * (tileH / 2);
        // Draw isometric tile diamond
        g.beginPath();
        g.moveTo(x, y - tileH / 2);
        g.lineTo(x + tileW / 2, y);
        g.lineTo(x, y + tileH / 2);
        g.lineTo(x - tileW / 2, y);
        g.closePath();
        g.strokePath();
        // Alternate tile fill
        if ((row + col) % 2 === 0) {
          g.fillStyle(0x0f1f35, 0.4);
          g.fillPath();
        }
      }
    }
  }

  private drawRacks() {
    const { width } = this.scale;
    const rackPositions = [
      { x: width / 2 - 160, y: 220, label: "RACK A" },
      { x: width / 2,       y: 252, label: "RACK B" },
      { x: width / 2 + 160, y: 284, label: "RACK C" },
    ];

    rackPositions.forEach((pos) => {
      // Isometric rack box
      const g = this.add.graphics();
      // Top face
      g.fillStyle(0x1e3a5f);
      g.beginPath();
      g.moveTo(pos.x,      pos.y - 30);
      g.lineTo(pos.x + 40, pos.y - 10);
      g.lineTo(pos.x,      pos.y + 10);
      g.lineTo(pos.x - 40, pos.y - 10);
      g.closePath(); g.fillPath();
      // Right face
      g.fillStyle(0x0e2a4a);
      g.beginPath();
      g.moveTo(pos.x + 40, pos.y - 10);
      g.lineTo(pos.x + 40, pos.y + 50);
      g.lineTo(pos.x,      pos.y + 70);
      g.lineTo(pos.x,      pos.y + 10);
      g.closePath(); g.fillPath();
      // Left face
      g.fillStyle(0x162d4a);
      g.beginPath();
      g.moveTo(pos.x - 40, pos.y - 10);
      g.lineTo(pos.x - 40, pos.y + 50);
      g.lineTo(pos.x,      pos.y + 70);
      g.lineTo(pos.x,      pos.y + 10);
      g.closePath(); g.fillPath();
      // Border lines
      g.lineStyle(1, 0x6366f1, 0.6);
      g.strokeRect(pos.x - 40, pos.y - 10, 80, 80);

      // LED strip
      for (let i = 0; i < 6; i++) {
        g.fillStyle(0x34d399);
        g.fillRect(pos.x - 36 + i * 12, pos.y + 2, 8, 3);
      }

      this.add.text(pos.x, pos.y - 40, pos.label, {
        fontFamily: "monospace", fontSize: "10px", color: "#475569",
      }).setOrigin(0.5);
    });
  }

  private showTask() {
    if (this.currentTask >= this.tasks.length) {
      this.taskText.setText("✅ ALL TASKS COMPLETE! Final score: " + this.score);
      this.feedbackText.setText("Level 1 cleared. Returning to menu...");
      this.time.delayedCall(3000, () => this.scene.start("MenuScene"));
      return;
    }
    const task = this.tasks[this.currentTask];
    this.taskText.setText(`TASK ${this.currentTask + 1}/${this.tasks.length}: ${task.prompt}`);
    this.feedbackText.setText("");
    this.renderTaskOptions(task);
  }

  private optionButtons: Phaser.GameObjects.Text[] = [];

  private renderTaskOptions(task: Task) {
    // Clear previous buttons
    this.optionButtons.forEach((b) => b.destroy());
    this.optionButtons = [];

    const { width, height } = this.scale;
    const startX = width / 2 - ((task.options.length - 1) * 120) / 2;

    task.options.forEach((opt, i) => {
      const btn = this.add.text(startX + i * 120, height - 52, opt.label, {
        fontFamily: "monospace", fontSize: "12px", color: "#6366f1",
        backgroundColor: "#1e1b4b", padding: { x: 10, y: 6 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on("pointerover", () => btn.setColor("#a5b4fc"));
      btn.on("pointerout",  () => btn.setColor("#6366f1"));
      btn.on("pointerdown", () => this.handleAnswer(opt));

      this.optionButtons.push(btn);
    });
  }

  private handleAnswer(opt: TaskOption) {
    const task = this.tasks[this.currentTask];
    this.optionButtons.forEach((b) => b.destroy());
    this.optionButtons = [];

    if (opt.correct) {
      this.score += 100;
      this.hudText.setText(`SCORE: ${this.score}`);
      this.feedbackText.setColor("#34d399").setText("✓ CORRECT! " + task.explanation);
    } else {
      this.feedbackText.setColor("#f87171").setText("✗ WRONG. " + task.explanation);
    }

    this.time.delayedCall(2500, () => {
      this.currentTask++;
      this.showTask();
    });
  }
}

/* ── Task types ─────────────────────────────────────── */
type TaskOption = { label: string; correct: boolean };
type Task = {
  prompt: string;
  options: TaskOption[];
  explanation: string;
};

function buildLevel1Tasks(): Task[] {
  return [
    {
      prompt: "Your server rack draws 16A continuously. What is the MINIMUM cable rating you need after applying the de-rating rule?",
      options: [
        { label: "16A (AWG 14)", correct: false },
        { label: "20A (AWG 12)", correct: true  },
        { label: "30A (AWG 10)", correct: false },
      ],
      explanation: "Continuous load ÷ 0.8 = 16 ÷ 0.8 = 20A. AWG 12 is rated for 20A. AWG 14 (15A) is too small.",
    },
    {
      prompt: "Your backbone is Cat 6a (10 Gbps). Which patch cord can you use?",
      options: [
        { label: "Cat 5e (1G)", correct: false },
        { label: "Cat 6 (1G)",  correct: false },
        { label: "Cat 6a (10G)", correct: true },
      ],
      explanation: "Bottleneck Rule: patch cord must equal or exceed backbone standard. Cat 5e or Cat 6 would choke the link to 1 Gbps.",
    },
    {
      prompt: "Server #4 has only ONE power supply connected to PDU-A. PDU-A fails. What happens?",
      options: [
        { label: "Server stays online", correct: false },
        { label: "Server goes offline",  correct: true  },
        { label: "Server switches to PDU-B", correct: false },
      ],
      explanation: "A server with a single PSU on one PDU has a SPOF. If that PDU fails, the server goes offline. Dual-cord cabling eliminates this.",
    },
    {
      prompt: "Where should data cables be routed in a modern data center?",
      options: [
        { label: "Under the raised floor", correct: false },
        { label: "Overhead cable trays",   correct: true  },
        { label: "Along server front panels", correct: false },
      ],
      explanation: "Overhead trays are best practice — they keep the raised floor clear for cold air distribution and make cable changes easier.",
    },
    {
      prompt: "You need to run a 30-meter copper data cable near a high-voltage transformer. What should you do?",
      options: [
        { label: "Run it directly — copper is shielded", correct: false },
        { label: "Re-route the cable away from the transformer", correct: true },
        { label: "Wrap the cable in foil", correct: false },
      ],
      explanation: "Electromagnetic Interference (EMI) from power equipment disrupts copper signals. Always route copper data cables away from EMI sources. Fiber optic is immune to EMI.",
    },
  ];
}
