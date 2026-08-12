import { LevelData } from "./types";
import { level1 } from "./level1";
import { level2 } from "./level2";
import { level3 } from "./level3";
import { level4 } from "./level4";
import { level5 } from "./level5";
import { Save } from "../core/SaveManager";

export const LEVELS: LevelData[] = [level1, level2, level3, level4, level5];

export function getLevelById(id: string): LevelData | undefined {
  return LEVELS.find((level) => level.id === id);
}

export function getNextLevel(id: string): LevelData | undefined {
  const index = LEVELS.findIndex((level) => level.id === id);
  if (index === -1) return undefined;
  return LEVELS[index + 1];
}

export function isLevelUnlocked(index: number): boolean {
  if (index <= 0) return true;
  return Save.getLevel(LEVELS[index - 1].id).completed;
}
