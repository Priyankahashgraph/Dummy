import Phaser from "phaser";

// Decoupled cross-scene communication (GameScene <-> UIScene) instead of
// scenes reaching into each other directly.
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  LevelStarted: "level-started",
  LeverToggled: "lever-toggled",
  BobDied: "bob-died",
  BobWon: "bob-won",
  RetryRequested: "retry-requested",
  NextLevelRequested: "next-level-requested",
  LevelSelectRequested: "level-select-requested",
} as const;
