import Phaser from "phaser";
import { TEXTURES } from "../core/Constants";

export class Bob extends Phaser.Physics.Arcade.Sprite {
  private dead = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURES.bobAlive);
    this.setOrigin(0.5, 1); // (x, y) is Bob's feet, matching ground-surface spawn coordinates
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 26);
    body.setOffset(6, 12);
    body.setCollideWorldBounds(false);
  }

  get isDead(): boolean {
    return this.dead;
  }

  die(cause: "fell" | "hazard"): void {
    if (this.dead) return;
    this.dead = true;
    this.setTexture(TEXTURES.bobDead);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(cause !== "fell");
    body.moves = cause !== "fell";
    this.scene.tweens.add({
      targets: this,
      angle: cause === "hazard" ? 90 : 0,
      duration: 200,
      ease: "Cubic.Out",
    });
  }

  win(): void {
    this.dead = true; // stop auto-walk / input without triggering death visuals
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
    this.scene.tweens.add({
      targets: this,
      y: this.y - 16,
      duration: 220,
      yoyo: true,
      repeat: 2,
      ease: "Sine.InOut",
    });
  }
}
