import Phaser from "phaser";
import { TEXTURES } from "../core/Constants";

export class Bob extends Phaser.Physics.Arcade.Sprite {
  private dead = false;
  private idleWobble: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURES.bobAlive);
    this.setOrigin(0.5, 1); // (x, y) is Bob's feet, matching ground-surface spawn coordinates
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 26);
    body.setOffset(6, 12);
    body.setCollideWorldBounds(false);

    // Subtle continuous waddle so Bob doesn't look frozen mid-stride.
    this.idleWobble = scene.tweens.add({
      targets: this,
      scaleX: 1.06,
      scaleY: 0.94,
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  get isDead(): boolean {
    return this.dead;
  }

  /** Quick squash-and-recover, e.g. when touching down after a fan/spring launch. */
  squash(): void {
    if (this.dead) return;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 0.7,
      duration: 80,
      yoyo: true,
      ease: "Cubic.Out",
    });
  }

  die(cause: "fell" | "hazard"): void {
    if (this.dead) return;
    this.dead = true;
    this.idleWobble.stop();
    this.setScale(1, 1);
    this.setTexture(TEXTURES.bobDead);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(cause !== "fell");
    body.moves = cause !== "fell";

    if (cause === "hazard") {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.6,
        scaleY: 0.45,
        angle: 12,
        duration: 140,
        ease: "Cubic.Out",
      });
    } else {
      this.scene.tweens.add({
        targets: this,
        angle: 260,
        duration: 500,
        ease: "Cubic.In",
      });
    }
  }

  win(): void {
    this.dead = true; // stop auto-walk / input without triggering death visuals
    this.idleWobble.stop();
    this.setScale(1, 1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
    this.scene.tweens.add({
      targets: this,
      y: this.y - 16,
      scaleX: { from: 1, to: 0.85 },
      scaleY: { from: 1, to: 1.15 },
      duration: 220,
      yoyo: true,
      repeat: 2,
      ease: "Sine.InOut",
    });
  }
}
