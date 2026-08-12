import { LevelData } from "./types";

const GROUND_Y = 480;

export const level4: LevelData = {
  id: "level4",
  title: "Blow Over",
  worldWidth: 2150,
  worldHeight: 540,
  fallDeathY: 620,
  spawn: { x: 80, y: GROUND_Y },
  groundSegments: [
    { xStart: 0, xEnd: 600, y: GROUND_Y },
    { xStart: 760, xEnd: 1300, y: GROUND_Y },
    { xStart: 1460, xEnd: 2150, y: GROUND_Y },
  ],
  obstacles: [
    {
      type: "fan",
      x: 600,
      y: 200,
      width: 160,
      height: 280,
      liftVelocity: 300,
    },
    {
      type: "bridge",
      x: 1300,
      width: 160,
      y: GROUND_Y,
      spikesY: GROUND_Y + 16,
      leverX: 1200,
      leverY: GROUND_Y,
    },
    {
      type: "saw",
      x: 1700,
      highY: 360,
      lowY: 468,
      periodMs: 2000,
      pauseMs: 2400,
      leverX: 1550,
      leverY: GROUND_Y,
    },
  ],
  flag: { x: 2050, y: GROUND_Y },
};
