export type RunPhase = "idle" | "running" | "dead" | "won";

export interface RunState {
  levelId: string;
  phase: RunPhase;
  attempt: number;
  startedAtMs: number;
}

// Lightweight typed state for the current run. Scenes read/write this instead
// of passing ad-hoc data through Phaser's untyped scene data channel.
class GameStateStore {
  private state: RunState = {
    levelId: "level1",
    phase: "idle",
    attempt: 0,
    startedAtMs: 0,
  };

  get(): Readonly<RunState> {
    return this.state;
  }

  startRun(levelId: string, nowMs: number): void {
    this.state = {
      levelId,
      phase: "running",
      attempt: this.state.levelId === levelId ? this.state.attempt + 1 : 1,
      startedAtMs: nowMs,
    };
  }

  setPhase(phase: RunPhase): void {
    this.state = { ...this.state, phase };
  }

  elapsedMs(nowMs: number): number {
    return nowMs - this.state.startedAtMs;
  }
}

export const GameState = new GameStateStore();
