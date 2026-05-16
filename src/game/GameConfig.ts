import Phaser from "phaser";
import { BootScene }   from "./scenes/BootScene";
import { MenuScene }   from "./scenes/MenuScene";
import { Level1Scene } from "./scenes/Level1Scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#0f172a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 900,
    height: 600,
  },
  scene: [BootScene, MenuScene, Level1Scene],
  render: {
    pixelArt: true,          // Crisp pixel-art rendering
    antialias: false,
  },
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
};
