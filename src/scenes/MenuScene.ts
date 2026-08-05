import Phaser from "phaser";
import { TEXTURES } from "../core/Constants";
import { Save } from "../core/SaveManager";
import { level1 } from "../levels/level1";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .tileSprite(0, 0, width, height, TEXTURES.sky)
      .setOrigin(0, 0);

    this.add
      .text(width / 2, height / 2 - 100, "DON'T LET BOB DIE", {
        fontFamily: "monospace",
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 55, "a hilarious physics-puzzle prototype", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#9aa3b2",
      })
      .setOrigin(0.5);

    const record = Save.getLevel(level1.id);
    const best = record.bestTimeMs !== null ? `${(record.bestTimeMs / 1000).toFixed(1)}s` : "—";
    this.add
      .text(width / 2, height / 2 - 20, `Best time: ${best}`, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#9aa3b2",
      })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(width / 2, height / 2 + 40, 200, 56, 0x3ec46d, 1)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width / 2, height / 2 + 40, "PLAY", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#10121a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    button.on("pointerover", () => button.setFillStyle(0x4dd97f));
    button.on("pointerout", () => button.setFillStyle(0x3ec46d));
    button.on("pointerdown", () => this.startGame());

    this.input.keyboard?.once("keydown-SPACE", () => this.startGame());
  }

  private startGame(): void {
    this.scene.start("Game");
    this.scene.launch("UI");
  }
}
