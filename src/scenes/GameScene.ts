import Phaser from "phaser";
import { TEXTURES, WALK_SPEED, GRAVITY_Y } from "../core/Constants";
import { Bob } from "../entities/Bob";
import { LevelData, BridgeObstacle, SawObstacle, CrumbleObstacle, FanObstacle, SpringObstacle } from "../levels/types";
import { LEVELS, getLevelById, getNextLevel } from "../levels/registry";
import { Analytics } from "../core/Analytics";
import { Save } from "../core/SaveManager";
import { GameState } from "../core/GameState";
import { EventBus, GameEvents } from "../core/EventBus";

const TILE = 64;

export interface GameSceneData {
  levelId?: string;
}

interface BridgeInstance {
  spec: BridgeObstacle;
  platform: Phaser.Physics.Arcade.Image;
  lever: Phaser.GameObjects.Sprite;
  active: boolean;
}

interface SawInstance {
  spec: SawObstacle;
  sprite: Phaser.Physics.Arcade.Sprite;
  lever: Phaser.GameObjects.Sprite;
  pausedUntil: number;
}

interface CrumbleInstance {
  spec: CrumbleObstacle;
  platform: Phaser.Physics.Arcade.Image;
  triggeredAt: number | null;
  gone: boolean;
}

interface FanInstance {
  spec: FanObstacle;
  zone: Phaser.GameObjects.Zone;
}

interface SpringInstance {
  spec: SpringObstacle;
  sprite: Phaser.Physics.Arcade.Image;
  cooldownUntil: number;
}

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private bob!: Bob;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private flag!: Phaser.Physics.Arcade.Image;
  private finished = false;

  private bridges: BridgeInstance[] = [];
  private saws: SawInstance[] = [];
  private crumbles: CrumbleInstance[] = [];
  private fans: FanInstance[] = [];
  private springs: SpringInstance[] = [];

  constructor() {
    super("Game");
  }

  create(data: GameSceneData): void {
    this.level = getLevelById(data?.levelId ?? "") ?? LEVELS[0];
    this.finished = false;
    this.bridges = [];
    this.saws = [];
    this.crumbles = [];
    this.fans = [];
    this.springs = [];

    this.physics.world.gravity.y = GRAVITY_Y;
    this.physics.world.setBounds(0, 0, this.level.worldWidth, this.level.worldHeight);
    this.cameras.main.setBounds(0, 0, this.level.worldWidth, this.level.worldHeight);

    this.add
      .tileSprite(0, 0, this.level.worldWidth, this.level.worldHeight, TEXTURES.sky)
      .setOrigin(0, 0)
      .setScrollFactor(0.3);

    this.buildGround();
    for (const obstacle of this.level.obstacles) {
      switch (obstacle.type) {
        case "bridge":
          this.buildBridge(obstacle);
          break;
        case "saw":
          this.buildSaw(obstacle);
          break;
        case "crumble":
          this.buildCrumble(obstacle);
          break;
        case "fan":
          this.buildFan(obstacle);
          break;
        case "spring":
          this.buildSpring(obstacle);
          break;
      }
    }
    this.buildFlag();

    this.bob = new Bob(this, this.level.spawn.x, this.level.spawn.y);
    this.wireCollisions();

    this.cameras.main.startFollow(this.bob, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(120, 80);

    const now = this.time.now;
    GameState.startRun(this.level.id, now);
    Save.recordAttempt(this.level.id);
    Analytics.track("level_started", { level: this.level.id, attempt: GameState.get().attempt });
    EventBus.emit(GameEvents.LevelStarted, {
      levelId: this.level.id,
      title: this.level.title,
      attempt: GameState.get().attempt,
    });

    EventBus.once(GameEvents.RetryRequested, this.handleRetry, this);
    EventBus.once(GameEvents.NextLevelRequested, this.handleNextLevel, this);
    EventBus.once(GameEvents.LevelSelectRequested, this.handleLevelSelect, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.RetryRequested, this.handleRetry, this);
      EventBus.off(GameEvents.NextLevelRequested, this.handleNextLevel, this);
      EventBus.off(GameEvents.LevelSelectRequested, this.handleLevelSelect, this);
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

    this.updateSaws(time);
  }

  private buildGround(): void {
    this.ground = this.physics.add.staticGroup();
    for (const segment of this.level.groundSegments) {
      for (let x = segment.xStart; x < segment.xEnd; x += TILE) {
        this.ground.create(x, segment.y, TEXTURES.ground).setOrigin(0, 0).refreshBody();
      }
    }
  }

  private buildFlag(): void {
    const { flag } = this.level;
    this.flag = this.physics.add.staticImage(flag.x, flag.y, TEXTURES.flag).setOrigin(0.5, 1);
  }

  // --- Bridge ---------------------------------------------------------

  private buildBridge(spec: BridgeObstacle): void {
    const platform = this.physics.add.staticImage(spec.x, spec.y - 4, TEXTURES.bridge);
    platform.setOrigin(0, 0);
    platform.setDisplaySize(spec.width, 12);
    platform.refreshBody();
    platform.setVisible(false);
    (platform.body as Phaser.Physics.Arcade.StaticBody).enable = false;

    this.add.tileSprite(spec.x, spec.spikesY, spec.width, 32, TEXTURES.spikes).setOrigin(0, 0);

    const lever = this.add
      .sprite(spec.leverX, spec.leverY, TEXTURES.lever)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true });

    const instance: BridgeInstance = { spec, platform, lever, active: false };
    lever.on("pointerdown", () => this.activateBridge(instance));
    this.bridges.push(instance);
  }

  private activateBridge(instance: BridgeInstance): void {
    if (instance.active) return;
    instance.active = true;
    instance.platform.setVisible(true);
    (instance.platform.body as Phaser.Physics.Arcade.StaticBody).enable = true;
    instance.lever.setTexture(TEXTURES.leverOn);
    instance.platform.setAlpha(0);
    this.tweens.add({ targets: instance.platform, alpha: 1, duration: 250 });
    Analytics.track("lever_toggled", { lever: "bridge" });
    EventBus.emit(GameEvents.LeverToggled, { lever: "bridge" });
  }

  // --- Saw -------------------------------------------------------------

  private buildSaw(spec: SawObstacle): void {
    const sprite = this.physics.add.sprite(spec.x, spec.highY, TEXTURES.sawBlade);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.moves = false;
    body.setCircle(18);

    const lever = this.add
      .sprite(spec.leverX, spec.leverY, TEXTURES.lever)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true });

    const instance: SawInstance = { spec, sprite, lever, pausedUntil: 0 };
    lever.on("pointerdown", () => this.pauseSaw(instance));
    this.saws.push(instance);
  }

  private pauseSaw(instance: SawInstance): void {
    const now = this.time.now;
    if (now < instance.pausedUntil) return;
    instance.pausedUntil = now + instance.spec.pauseMs;
    instance.lever.setTexture(TEXTURES.leverOn);
    Analytics.track("lever_toggled", { lever: "saw" });
    EventBus.emit(GameEvents.LeverToggled, { lever: "saw" });
    this.time.delayedCall(instance.spec.pauseMs, () => instance.lever.setTexture(TEXTURES.lever));
  }

  private updateSaws(time: number): void {
    for (const instance of this.saws) {
      const { spec } = instance;
      if (time < instance.pausedUntil) {
        instance.sprite.y = Phaser.Math.Linear(instance.sprite.y, spec.highY, 0.2);
      } else {
        const phase = (time / spec.periodMs) * Math.PI * 2;
        const t = (Math.sin(phase) + 1) / 2;
        instance.sprite.y = Phaser.Math.Linear(spec.highY, spec.lowY, t);
      }
    }
  }

  // --- Crumble ----------------------------------------------------------

  private buildCrumble(spec: CrumbleObstacle): void {
    this.add.tileSprite(spec.x, spec.spikesY, spec.width, 32, TEXTURES.spikes).setOrigin(0, 0);

    const platform = this.physics.add.staticImage(spec.x, spec.y, TEXTURES.crumble);
    platform.setOrigin(0, 0);
    platform.setDisplaySize(spec.width, 12);
    platform.refreshBody();
    this.crumbles.push({ spec, platform, triggeredAt: null, gone: false });
  }

  private handleCrumbleTouch(instance: CrumbleInstance): void {
    if (instance.triggeredAt !== null || instance.gone) return;
    instance.triggeredAt = this.time.now;
    instance.platform.setTint(0xff9d6b);
    this.time.delayedCall(instance.spec.delayMs, () => this.collapseCrumble(instance));
  }

  private collapseCrumble(instance: CrumbleInstance): void {
    if (instance.gone) return;
    instance.gone = true;
    (instance.platform.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    this.tweens.add({
      targets: instance.platform,
      y: instance.platform.y + 40,
      alpha: 0,
      duration: 300,
      ease: "Cubic.In",
    });
  }

  // --- Fan ---------------------------------------------------------------

  private buildFan(spec: FanObstacle): void {
    this.add.rectangle(spec.x, spec.y, spec.width, spec.height, 0x8fd3ff, 0.12).setOrigin(0, 0);
    this.add.sprite(spec.x + spec.width / 2, spec.y + spec.height - 4, TEXTURES.fan).setOrigin(0.5, 1);

    const zone = this.add.zone(spec.x, spec.y, spec.width, spec.height).setOrigin(0, 0);
    this.physics.add.existing(zone, true);
    this.fans.push({ spec, zone });
  }

  private applyFanLift(spec: FanObstacle): void {
    const body = this.bob.body as Phaser.Physics.Arcade.Body;
    body.velocity.y = Phaser.Math.Linear(body.velocity.y, -spec.liftVelocity, 0.3);
  }

  // --- Spring -------------------------------------------------------------

  private buildSpring(spec: SpringObstacle): void {
    const sprite = this.physics.add.staticImage(spec.x, spec.y, TEXTURES.spring).setOrigin(0.5, 1);
    this.springs.push({ spec, sprite, cooldownUntil: 0 });
  }

  private triggerSpring(instance: SpringInstance): void {
    if (this.time.now < instance.cooldownUntil) return;
    instance.cooldownUntil = this.time.now + 300;
    const body = this.bob.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-instance.spec.bounceVelocity);
    this.tweens.add({ targets: instance.sprite, scaleY: 0.6, duration: 80, yoyo: true });
  }

  // --- Wiring / lifecycle --------------------------------------------------

  private wireCollisions(): void {
    this.physics.add.collider(this.bob, this.ground);
    this.physics.add.overlap(this.bob, this.flag, () => this.onWin());

    for (const bridge of this.bridges) {
      this.physics.add.collider(this.bob, bridge.platform, undefined, () => bridge.active);
    }
    for (const saw of this.saws) {
      this.physics.add.overlap(this.bob, saw.sprite, () => this.onHazardHit());
    }
    for (const crumble of this.crumbles) {
      this.physics.add.collider(this.bob, crumble.platform, () => this.handleCrumbleTouch(crumble));
    }
    for (const fan of this.fans) {
      this.physics.add.overlap(this.bob, fan.zone, () => this.applyFanLift(fan.spec));
    }
    for (const spring of this.springs) {
      this.physics.add.overlap(this.bob, spring.sprite, () => this.triggerSpring(spring));
    }
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
      const nextLevel = getNextLevel(this.level.id);
      EventBus.emit(GameEvents.BobWon, {
        levelId: this.level.id,
        timeMs: elapsed,
        nextLevelId: nextLevel?.id ?? null,
      });
    } else {
      Analytics.track("level_failed", { level: this.level.id, timeMs: elapsed });
      EventBus.emit(GameEvents.BobDied, { levelId: this.level.id, timeMs: elapsed });
    }
  }

  private handleRetry(): void {
    this.scene.restart({ levelId: this.level.id });
  }

  private handleNextLevel(data: { levelId: string }): void {
    this.scene.start("Game", { levelId: data.levelId });
  }

  private handleLevelSelect(): void {
    this.scene.stop("UI");
    this.scene.start("LevelSelect");
  }
}
