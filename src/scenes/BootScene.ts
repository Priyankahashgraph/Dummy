import Phaser from "phaser";
import { TEXTURES } from "../core/Constants";

/**
 * Generates all placeholder art procedurally (no external image assets) so
 * the prototype has its own visual identity from day one, per the "we do not
 * copy characters/artwork" constraint in the design doc.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.makeBob();
    this.makeGround();
    this.makeSpikes();
    this.makeLever();
    this.makeBridge();
    this.makeSawBlade();
    this.makeCrumble();
    this.makeFan();
    this.makeSpring();
    this.makeFlag();
    this.makeSky();

    this.scene.start("Menu");
  }

  private makeBob(): void {
    // Alive: round yellow head, blue body, simple dot eyes + smile
    const alive = this.make.graphics({ x: 0, y: 0 });
    alive.fillStyle(0x2f6fed, 1);
    alive.fillRoundedRect(6, 20, 20, 20, 6);
    alive.fillStyle(0xffd166, 1);
    alive.fillCircle(16, 14, 12);
    alive.fillStyle(0x1a1a1a, 1);
    alive.fillCircle(11, 12, 2);
    alive.fillCircle(21, 12, 2);
    alive.lineStyle(2, 0x1a1a1a, 1);
    alive.beginPath();
    alive.arc(16, 16, 6, 0.2, Math.PI - 0.2, false);
    alive.strokePath();
    alive.generateTexture(TEXTURES.bobAlive, 32, 40);
    alive.destroy();

    // Dead: same shape, tinted, X_X eyes
    const dead = this.make.graphics({ x: 0, y: 0 });
    dead.fillStyle(0x2f6fed, 1);
    dead.fillRoundedRect(6, 20, 20, 20, 6);
    dead.fillStyle(0xe07a5f, 1);
    dead.fillCircle(16, 14, 12);
    dead.lineStyle(2, 0x1a1a1a, 1);
    dead.beginPath();
    dead.moveTo(8, 9);
    dead.lineTo(13, 15);
    dead.moveTo(13, 9);
    dead.lineTo(8, 15);
    dead.moveTo(19, 9);
    dead.lineTo(24, 15);
    dead.moveTo(24, 9);
    dead.lineTo(19, 15);
    dead.strokePath();
    dead.beginPath();
    dead.arc(16, 22, 5, Math.PI + 0.2, Math.PI * 2 - 0.2, false);
    dead.strokePath();
    dead.generateTexture(TEXTURES.bobDead, 32, 40);
    dead.destroy();
  }

  private makeGround(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x3a2e26, 1);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x5c4a3a, 1);
    g.fillRect(0, 0, 64, 10);
    g.generateTexture(TEXTURES.ground, 64, 64);
    g.destroy();
  }

  private makeSpikes(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8a8f98, 1);
    for (let i = 0; i < 4; i++) {
      const x = i * 16;
      g.fillTriangle(x, 32, x + 8, 4, x + 16, 32);
    }
    g.generateTexture(TEXTURES.spikes, 64, 32);
    g.destroy();
  }

  private makeLever(): void {
    const off = this.make.graphics({ x: 0, y: 0 });
    off.fillStyle(0x2b2b2b, 1);
    off.fillRoundedRect(10, 20, 12, 24, 3);
    off.fillStyle(0xd64550, 1);
    off.fillRoundedRect(14, 4, 4, 24, 2);
    off.fillCircle(16, 4, 5);
    off.generateTexture(TEXTURES.lever, 32, 44);
    off.destroy();

    const on = this.make.graphics({ x: 0, y: 0 });
    on.fillStyle(0x2b2b2b, 1);
    on.fillRoundedRect(10, 20, 12, 24, 3);
    on.fillStyle(0x4caf50, 1);
    on.save();
    on.translateCanvas(16, 32);
    on.rotateCanvas(-Math.PI / 2.4);
    on.fillRoundedRect(-2, -28, 4, 24, 2);
    on.fillCircle(0, -28, 5);
    on.restore();
    on.generateTexture(TEXTURES.leverOn, 32, 44);
    on.destroy();
  }

  private makeBridge(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8d6a45, 1);
    g.fillRect(0, 0, 96, 12);
    g.fillStyle(0x6b4f33, 1);
    for (let i = 0; i < 6; i++) g.fillRect(i * 16, 0, 2, 12);
    g.generateTexture(TEXTURES.bridge, 96, 12);
    g.destroy();
  }

  private makeSawBlade(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xc9ccd1, 1);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0x9a9ea6, 1);
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const x = 20 + Math.cos(angle) * 18;
      const y = 20 + Math.sin(angle) * 18;
      g.fillTriangle(x, y, x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, x + Math.cos(angle + 0.3) * 6, y + Math.sin(angle + 0.3) * 6);
    }
    g.fillStyle(0x5c5f66, 1);
    g.fillCircle(20, 20, 6);
    g.generateTexture(TEXTURES.sawBlade, 40, 40);
    g.destroy();
  }

  private makeCrumble(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8d6a45, 1);
    g.fillRect(0, 0, 96, 12);
    g.lineStyle(1, 0x3a2e26, 1);
    g.beginPath();
    g.moveTo(18, 0);
    g.lineTo(26, 12);
    g.moveTo(48, 0);
    g.lineTo(40, 12);
    g.moveTo(72, 0);
    g.lineTo(80, 12);
    g.strokePath();
    g.generateTexture(TEXTURES.crumble, 96, 12);
    g.destroy();
  }

  private makeFan(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x2b2b2b, 1);
    g.fillRoundedRect(4, 24, 24, 8, 2);
    g.fillStyle(0x8fd3ff, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x2b2b2b, 1);
    g.fillCircle(16, 16, 4);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const x = 16 + Math.cos(angle) * 9;
      const y = 16 + Math.sin(angle) * 9;
      g.fillCircle(x, y, 3);
    }
    g.generateTexture(TEXTURES.fan, 32, 32);
    g.destroy();
  }

  private makeSpring(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x555a6b, 1);
    g.fillRoundedRect(4, 26, 24, 6, 2);
    g.lineStyle(3, 0xffb703, 1);
    g.beginPath();
    g.moveTo(8, 26);
    g.lineTo(24, 18);
    g.lineTo(8, 10);
    g.lineTo(24, 4);
    g.strokePath();
    g.generateTexture(TEXTURES.spring, 32, 32);
    g.destroy();
  }

  private makeFlag(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x777777, 1);
    g.fillRect(6, 0, 4, 96);
    g.fillStyle(0x3ec46d, 1);
    g.fillTriangle(10, 4, 10, 34, 46, 19);
    g.generateTexture(TEXTURES.flag, 48, 96);
    g.destroy();
  }

  private makeSky(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillGradientStyle(0x2b3a55, 0x2b3a55, 0x161c2b, 0x161c2b, 1);
    g.fillRect(0, 0, 16, 16);
    g.generateTexture(TEXTURES.sky, 16, 16);
    g.destroy();
  }
}
