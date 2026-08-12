import { LevelData } from "./types";

const GROUND_Y = 480;

export const level2: LevelData = {
  id: "level2",
  title: "Second Wind",
  worldWidth: 2000,
  worldHeight: 540,
  fallDeathY: 620,
  spawn: { x: 80, y: GROUND_Y },
  groundSegments: [
    { xStart: 0, xEnd: 700, y: GROUND_Y },
    { xStart: 860, xEnd: 2000, y: GROUND_Y },
  ],
  pit: { xStart: 700, xEnd: 860, spikesY: GROUND_Y + 16 },
  bridge: { x: 700, y: GROUND_Y, width: 160, leverX: 560, leverY: GROUND_Y },
  saw: {
    x: 1400,
    highY: 340,
    lowY: 468,
    periodMs: 2100,
    pauseMs: 2600,
    leverX: 1150,
    leverY: GROUND_Y,
  },
  flag: { x: 1920, y: GROUND_Y },
};
