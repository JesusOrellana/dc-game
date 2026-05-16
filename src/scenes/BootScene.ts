import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Loading bar
    const { width, height } = this.scale;
    const bar = this.add.graphics();
    const bg  = this.add.graphics();

    bg.fillStyle(0x1e293b).fillRect(width / 2 - 200, height / 2 - 10, 400, 20);

    this.load.on("progress", (value: number) => {
      bar.clear();
      bar.fillStyle(0x6366f1).fillRect(width / 2 - 198, height / 2 - 8, 396 * value, 16);
    });

    // TODO: load tilemaps, spritesheets, audio here as assets are created
    // this.load.image("tiles", "assets/tilemaps/dc_tiles.png");
    // this.load.tilemapTiledJSON("level1", "assets/tilemaps/level1.json");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
