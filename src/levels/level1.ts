export interface GroundSegment {
  xStart: number;
  xEnd: number;
  y: number; // top surface y
}

export interface LevelData {
  id: string;
  title: string;
  worldWidth: number;
  worldHeight: number;
  fallDeathY: number;
  spawn: { x: number; y: number };
  groundSegments: GroundSegment[];
  pit: { xStart: number; xEnd: number; spikesY: number };
  bridge: { x: number; y: number; width: number; leverX: number; leverY: number };
  saw: {
    x: number;
    highY: number;
    lowY: number;
    periodMs: number;
    pauseMs: number;
    leverX: number;
    leverY: number;
  };
  flag: { x: number; y: number };
}

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
  pit: { xStart: 576, xEnd: 736, spikesY: GROUND_Y + 16 },
  bridge: { x: 576, y: GROUND_Y, width: 160, leverX: 470, leverY: GROUND_Y },
  saw: {
    x: 1150,
    highY: 360,
    lowY: 468,
    periodMs: 2600,
    pauseMs: 3400,
    leverX: 940,
    leverY: GROUND_Y,
  },
  flag: { x: 1620, y: GROUND_Y },
};
