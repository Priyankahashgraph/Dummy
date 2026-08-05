import Phaser from "phaser";
import { TEXTURES, WALK_SPEED, GRAVITY_Y } from "../core/Constants";
import { Bob } from "../entities/Bob";
import { level1, LevelData } from "../levels/level1";
import { Analytics } from "../core/Analytics";
import { Save } from "../core/SaveManager";
import { GameState } from "../core/GameState";
import { EventBus, GameEvents } from "../core/EventBus";

const TILE = 64;

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private bob!: Bob;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private bridge!: Phaser.Physics.Arcade.Image;
  private bridgeActive = false;
  private bridgeLever!: Phaser.GameObjects.Sprite;
  private saw!: Phaser.Physics.Arcade.Sprite;
  private sawLever!: Phaser.GameObjects.Sprite;
  private sawPausedUntil = 0;
  private flag!: Phaser.Physics.Arcade.Image;
  private finished = false;

  constructor() {
    super("Game");
  }

  create(): void {
    this.level = level1;
    this.finished = false;
    this.bridgeActive = false;
    this.sawPausedUntil = 0;

    this.physics.world.gravity.y = GRAVITY_Y;
    this.physics.world.setBounds(0, 0, this.level.worldWidth, this.level.worldHeight);
    this.cameras.main.setBounds(0, 0, this.level.worldWidth, this.level.worldHeight);

    this.add
      .tileSprite(0, 0, this.level.worldWidth, this.level.worldHeight, TEXTURES.sky)
      .setOrigin(0, 0)
      .setScrollFactor(0.3);

    this.buildGround();
    this.buildPit();
    this.buildBridge();
    this.buildSaw();
    this.buildFlag();

    this.bob = new Bob(this, this.level.spawn.x, this.level.spawn.y);
    this.physics.add.collider(this.bob, this.ground);
    this.physics.add.collider(this.bob, this.bridge, undefined, () => this.bridgeActive);
    this.physics.add.overlap(this.bob, this.saw, () => this.onHazardHit());
    this.physics.add.overlap(this.bob, this.flag, () => this.onWin());

    this.cameras.main.startFollow(this.bob, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(120, 80);

    const now = this.time.now;
    GameState.startRun(this.level.id, now);
    Save.recordAttempt(this.level.id);
    Analytics.track("level_started", { level: this.level.id, attempt: GameState.get().attempt });
    EventBus.emit(GameEvents.LevelStarted, { levelId: this.level.id, attempt: GameState.get().attempt });

    EventBus.once(GameEvents.RetryRequested, this.handleRetry, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.RetryRequested, this.handleRetry, this);
    });

    this.input.keyboard?.on("keydown-R", () => this.handleRetry());
  }

  update(time: number): void {
    if (this.finished) return;

    if (!this.bob.isDead) {
      (this.bob.body as Phaser.Physics.Arcade.Body).setVelocityX(WALK_SPEED);
      if (this.bob.y > this.level.fallDeathY) {
        this.onFallDeath();
      }
    }

    this.updateSaw(time);
  }

  private buildGround(): void {
    this.ground = this.physics.add.staticGroup();
    for (const segment of this.level.groundSegments) {
      for (let x = segment.xStart; x < segment.xEnd; x += TILE) {
        this.ground.create(x, segment.y, TEXTURES.ground).setOrigin(0, 0).refreshBody();
      }
    }
  }

  private buildPit(): void {
    const { pit } = this.level;
    const width = pit.xEnd - pit.xStart;
    this.add
      .tileSprite(pit.xStart, pit.spikesY, width, 32, TEXTURES.spikes)
      .setOrigin(0, 0);
  }

  private buildBridge(): void {
    const { bridge } = this.level;
    this.bridge = this.physics.add.staticImage(bridge.x, bridge.y - 4, TEXTURES.bridge);
    this.bridge.setOrigin(0, 0);
    this.bridge.setDisplaySize(bridge.width, 12);
    this.bridge.refreshBody();
    this.bridge.setVisible(false);
    (this.bridge.body as Phaser.Physics.Arcade.StaticBody).enable = false;

    this.bridgeLever = this.add
      .sprite(bridge.leverX, bridge.leverY, TEXTURES.lever)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true });
    this.bridgeLever.on("pointerdown", () => this.activateBridge());
  }

  private activateBridge(): void {
    if (this.bridgeActive) return;
    this.bridgeActive = true;
    this.bridge.setVisible(true);
    (this.bridge.body as Phaser.Physics.Arcade.StaticBody).enable = true;
    this.bridgeLever.setTexture(TEXTURES.leverOn);
    this.bridge.setAlpha(0);
    this.tweens.add({ targets: this.bridge, alpha: 1, duration: 250 });
    Analytics.track("lever_toggled", { lever: "bridge" });
    EventBus.emit(GameEvents.LeverToggled, { lever: "bridge" });
  }

  private buildSaw(): void {
    const { saw } = this.level;
    this.saw = this.physics.add.sprite(saw.x, saw.highY, TEXTURES.sawBlade);
    const body = this.saw.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.moves = false;
    body.setCircle(18);

    this.sawLever = this.add
      .sprite(saw.leverX, saw.leverY, TEXTURES.lever)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true });
    this.sawLever.on("pointerdown", () => this.pauseSaw());
  }

  private pauseSaw(): void {
    const now = this.time.now;
    if (now < this.sawPausedUntil) return;
    this.sawPausedUntil = now + this.level.saw.pauseMs;
    this.sawLever.setTexture(TEXTURES.leverOn);
    Analytics.track("lever_toggled", { lever: "saw" });
    EventBus.emit(GameEvents.LeverToggled, { lever: "saw" });
    this.time.delayedCall(this.level.saw.pauseMs, () => {
      this.sawLever.setTexture(TEXTURES.lever);
    });
  }

  private updateSaw(time: number): void {
    const { saw } = this.level;
    if (time < this.sawPausedUntil) {
      this.saw.y = Phaser.Math.Linear(this.saw.y, saw.highY, 0.2);
    } else {
      const phase = (time / saw.periodMs) * Math.PI * 2;
      const t = (Math.sin(phase) + 1) / 2;
      this.saw.y = Phaser.Math.Linear(saw.highY, saw.lowY, t);
    }
  }

  private buildFlag(): void {
    const { flag } = this.level;
    this.flag = this.physics.add.staticImage(flag.x, flag.y, TEXTURES.flag).setOrigin(0.5, 1);
  }

  private onHazardHit(): void {
    if (this.bob.isDead || this.finished) return;
    this.bob.die("hazard");
    this.finishRun("dead");
  }

  private onFallDeath(): void {
    if (this.bob.isDead || this.finished) return;
    this.bob.die("fell");
    this.finishRun("dead");
  }

  private onWin(): void {
    if (this.bob.isDead || this.finished) return;
    this.bob.win();
    this.finishRun("won");
  }

  private finishRun(result: "dead" | "won"): void {
    this.finished = true;
    const elapsed = GameState.elapsedMs(this.time.now);
    GameState.setPhase(result);

    if (result === "won") {
      Save.recordCompletion(this.level.id, elapsed);
      Analytics.track("level_completed", { level: this.level.id, timeMs: elapsed });
      EventBus.emit(GameEvents.BobWon, { levelId: this.level.id, timeMs: elapsed });
    } else {
      Analytics.track("level_failed", { level: this.level.id, timeMs: elapsed });
      EventBus.emit(GameEvents.BobDied, { levelId: this.level.id, timeMs: elapsed });
    }
  }

  private handleRetry(): void {
    this.scene.restart();
  }
}
