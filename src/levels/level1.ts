import { LevelData } from "./types";

const GROUND_Y = 480;

export const level1: LevelData = {
  id: "level1",
  title: "The Commute",
  worldWidth: 1700,
  worldHeight: 540,
  fallDeathY: 620,
  spawn: { x: 80, y: GROUND_Y },
  groundSegments: [
    { xStart: 0, xEnd: 576, y: GROUND_Y },
    { xStart: 736, xEnd: 1700, y: GROUND_Y },
  ],
  obstacles: [
    {
      type: "bridge",
      x: 576,
      width: 160,
      y: GROUND_Y,
      spikesY: GROUND_Y + 16,
      leverX: 470,
      leverY: GROUND_Y,
    },
    {
      type: "saw",
      x: 1150,
      highY: 360,
      lowY: 468,
      periodMs: 2600,
      pauseMs: 3400,
      leverX: 940,
      leverY: GROUND_Y,
    },
  ],
  flag: { x: 1620, y: GROUND_Y },
};
