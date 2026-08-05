export interface LevelRecord {
  completed: boolean;
  attempts: number;
  bestTimeMs: number | null;
}

export interface SaveData {
  version: 1;
  levels: Record<string, LevelRecord>;
}

const STORAGE_KEY = "dlbd_save_v1";

function defaultSave(): SaveData {
  return { version: 1, levels: {} };
}

// Kept intentionally small/flat so it stays well under Poki's 1MB compressed
// cloud-save limit once we swap this for a cloud-save adapter.
class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.version !== 1) return defaultSave();
      return parsed;
    } catch {
      return defaultSave();
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // storage unavailable (private mode / quota) — fail silently, keep in-memory state
    }
  }

  getLevel(levelId: string): LevelRecord {
    return (
      this.data.levels[levelId] ?? {
        completed: false,
        attempts: 0,
        bestTimeMs: null,
      }
    );
  }

  recordAttempt(levelId: string): void {
    const record = this.getLevel(levelId);
    record.attempts += 1;
    this.data.levels[levelId] = record;
    this.persist();
  }

  recordCompletion(levelId: string, timeMs: number): void {
    const record = this.getLevel(levelId);
    record.completed = true;
    if (record.bestTimeMs === null || timeMs < record.bestTimeMs) {
      record.bestTimeMs = timeMs;
    }
    this.data.levels[levelId] = record;
    this.persist();
  }
}

export const Save = new SaveManager();
