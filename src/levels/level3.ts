import { LevelData } from "./types";

const GROUND_Y = 480;

export const level3: LevelData = {
  id: "level3",
  title: "Gone in a Flash",
  worldWidth: 1950,
  worldHeight: 540,
  fallDeathY: 620,
  spawn: { x: 80, y: GROUND_Y },
  groundSegments: [
    { xStart: 0, xEnd: 500, y: GROUND_Y },
    { xStart: 620, xEnd: 1100, y: GROUND_Y },
    { xStart: 1260, xEnd: 1950, y: GROUND_Y },
  ],
  obstacles: [
    {
      type: "crumble",
      x: 500,
      y: GROUND_Y,
      width: 120,
      delayMs: 1800,
      spikesY: GROUND_Y + 16,
    },
    {
      type: "bridge",
      x: 1100,
      width: 160,
      y: GROUND_Y,
      spikesY: GROUND_Y + 16,
      leverX: 1000,
      leverY: GROUND_Y,
    },
    {
      type: "saw",
      x: 1500,
      highY: 360,
      lowY: 468,
      periodMs: 2400,
      pauseMs: 3000,
      leverX: 1350,
      leverY: GROUND_Y,
    },
  ],
  flag: { x: 1850, y: GROUND_Y },
};
