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
