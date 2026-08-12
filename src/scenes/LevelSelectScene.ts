import Phaser from "phaser";
import { TEXTURES } from "../core/Constants";
import { Save } from "../core/SaveManager";
import { LEVELS, isLevelUnlocked } from "../levels/registry";

const CARD_WIDTH = 180;
const CARD_HEIGHT = 220;
const CARD_GAP = 24;

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelect");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.tileSprite(0, 0, width, height, TEXTURES.sky).setOrigin(0, 0);

    this.add
      .text(width / 2, 48, "SELECT A LEVEL", {
        fontFamily: "monospace",
        fontSize: "26px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const backButton = this.add
      .text(20, 20, "< MENU", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#9aa3b2",
      })
      .setInteractive({ useHandCursor: true });
    backButton.on("pointerdown", () => this.scene.start("Menu"));
    backButton.on("pointerover", () => backButton.setColor("#ffffff"));
    backButton.on("pointerout", () => backButton.setColor("#9aa3b2"));

    const columns = Math.max(1, Math.floor((width - 40) / (CARD_WIDTH + CARD_GAP)));
    const rowWidth = columns * CARD_WIDTH + (columns - 1) * CARD_GAP;
    const startX = width / 2 - rowWidth / 2 + CARD_WIDTH / 2;
    const startY = 190;

    LEVELS.forEach((level, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * (CARD_WIDTH + CARD_GAP);
      const y = startY + row * (CARD_HEIGHT + CARD_GAP);
      this.buildCard(x, y, level, index);
    });
  }

  private buildCard(
    x: number,
    y: number,
    level: { id: string; title: string },
    index: number
  ): void {
    const unlocked = isLevelUnlocked(index);
    const record = Save.getLevel(level.id);

    const bg = this.add
      .rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, unlocked ? 0x1c2030 : 0x14161f, 1)
      .setStrokeStyle(2, unlocked ? (record.completed ? 0x3ec46d : 0x555a6b) : 0x2a2d38);

    this.add
      .text(x, y - 70, `${index + 1}`, {
        fontFamily: "monospace",
        fontSize: "32px",
        color: unlocked ? "#ffffff" : "#4a4e5a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(x, y - 20, unlocked ? level.title : "???", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: unlocked ? "#ffffff" : "#4a4e5a",
        align: "center",
        wordWrap: { width: CARD_WIDTH - 24 },
      })
      .setOrigin(0.5);

    if (!unlocked) {
      this.add
        .text(x, y + 40, "LOCKED", {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#4a4e5a",
        })
        .setOrigin(0.5);
      return;
    }

    const status = record.completed
      ? `Best: ${(record.bestTimeMs! / 1000).toFixed(1)}s`
      : record.attempts > 0
        ? `Attempts: ${record.attempts}`
        : "Not played yet";
    this.add
      .text(x, y + 40, status, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#9aa3b2",
      })
      .setOrigin(0.5);

    if (record.completed) {
      this.add
        .text(x, y - 70 + 4, "✓", {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#3ec46d",
        })
        .setOrigin(0.5)
        .setPosition(x + CARD_WIDTH / 2 - 18, y - CARD_HEIGHT / 2 + 18);
    }

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => bg.setStrokeStyle(2, 0x7dd3a0));
    bg.on("pointerout", () =>
      bg.setStrokeStyle(2, record.completed ? 0x3ec46d : 0x555a6b)
    );
    bg.on("pointerdown", () => {
      this.scene.start("Game", { levelId: level.id });
      this.scene.launch("UI");
    });
  }
}
