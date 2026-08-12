import { LevelData } from "./types";

const GROUND_Y = 480;

export const level5: LevelData = {
  id: "level5",
  title: "The Gauntlet",
  worldWidth: 2750,
  worldHeight: 540,
  fallDeathY: 620,
  spawn: { x: 80, y: GROUND_Y },
  groundSegments: [
    { xStart: 0, xEnd: 500, y: GROUND_Y },
    { xStart: 650, xEnd: 1000, y: GROUND_Y },
    { xStart: 1110, xEnd: 1500, y: GROUND_Y },
    { xStart: 1660, xEnd: 1950, y: GROUND_Y },
    { xStart: 2100, xEnd: 2750, y: GROUND_Y },
  ],
  obstacles: [
    {
      type: "spring",
      x: 490,
      y: GROUND_Y,
      bounceVelocity: 900,
    },
    {
      type: "crumble",
      x: 1000,
      y: GROUND_Y,
      width: 110,
      delayMs: 1700,
      spikesY: GROUND_Y + 16,
    },
    {
      type: "bridge",
      x: 1500,
      width: 160,
      y: GROUND_Y,
      spikesY: GROUND_Y + 16,
      leverX: 1400,
      leverY: GROUND_Y,
    },
    {
      type: "fan",
      x: 1950,
      y: 200,
      width: 150,
      height: 280,
      liftVelocity: 300,
    },
    {
      type: "saw",
      x: 2300,
      highY: 360,
      lowY: 468,
      periodMs: 1900,
      pauseMs: 2300,
      leverX: 2150,
      leverY: GROUND_Y,
    },
  ],
  flag: { x: 2650, y: GROUND_Y },
};
