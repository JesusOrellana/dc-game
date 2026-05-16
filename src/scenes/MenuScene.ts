import Phaser from "phaser";
import { LEVELS } from "../data/levels";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    /* ── Background ── */
    this.add.rectangle(0, 0, width, height, 0x0f172a).setOrigin(0);

    /* ── Grid lines (isometric feel) ── */
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1e293b, 0.6);
    for (let x = 0; x < width; x += 40) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y < height; y += 40) grid.lineBetween(0, y, width, y);

    /* ── Title ── */
    this.add.text(cx, 80, "DC OPERATOR", {
      fontFamily: "monospace",
      fontSize: "42px",
      color: "#6366f1",
      stroke: "#312e81",
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 130, "Data Center Simulator", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#94a3b8",
    }).setOrigin(0.5);

    /* ── Level cards ── */
    LEVELS.forEach((level, i) => {
      const y = 230 + i * 100;
      const locked = !level.unlocked;
      const cardColor = locked ? 0x1e293b : 0x1e3a5f;
      const textColor = locked ? "#475569" : "#e2e8f0";

      const card = this.add.rectangle(cx, y, 520, 80, cardColor, 1)
        .setStrokeStyle(1, locked ? 0x334155 : 0x6366f1)
        .setInteractive({ useHandCursor: !locked });

      this.add.text(cx - 240, y - 18, `LEVEL ${level.id}`, {
        fontFamily: "monospace", fontSize: "10px", color: locked ? "#334155" : "#818cf8",
      });

      this.add.text(cx - 240, y, level.title.toUpperCase(), {
        fontFamily: "monospace", fontSize: "16px", color: textColor, fontStyle: "bold",
      });

      this.add.text(cx - 240, y + 22, level.description.substring(0, 60) + "...", {
        fontFamily: "monospace", fontSize: "10px", color: "#64748b", wordWrap: { width: 380 },
      });

      // Lock icon for locked levels
      if (locked) {
        this.add.text(cx + 220, y, "🔒", { fontSize: "24px" }).setOrigin(0.5);
      } else {
        const playBtn = this.add.text(cx + 220, y, "▶  PLAY", {
          fontFamily: "monospace", fontSize: "14px", color: "#6366f1",
          backgroundColor: "#1e1b4b", padding: { x: 12, y: 6 },
        }).setOrigin(0.5);

        card.on("pointerover", () => {
          card.setStrokeStyle(2, 0x818cf8);
          playBtn.setColor("#a5b4fc");
        });
        card.on("pointerout", () => {
          card.setStrokeStyle(1, 0x6366f1);
          playBtn.setColor("#6366f1");
        });
        card.on("pointerdown", () => {
          this.scene.start(level.scene);
        });
      }
    });

    /* ── Footer ── */
    this.add.text(cx, height - 30, "Knowledge source: dc-study-app · github.com/JesusOrellana", {
      fontFamily: "monospace", fontSize: "10px", color: "#334155",
    }).setOrigin(0.5);
  }
}
