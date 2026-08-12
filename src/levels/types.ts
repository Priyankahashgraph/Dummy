export interface GroundSegment {
  xStart: number;
  xEnd: number;
  y: number; // top surface y
}

export interface BridgeObstacle {
  type: "bridge";
  x: number;
  width: number;
  y: number;
  spikesY: number;
  leverX: number;
  leverY: number;
}

export interface SawObstacle {
  type: "saw";
  x: number;
  highY: number;
  lowY: number;
  periodMs: number;
  pauseMs: number;
  leverX: number;
  leverY: number;
}

export interface CrumbleObstacle {
  type: "crumble";
  x: number;
  y: number;
  width: number;
  delayMs: number;
  spikesY: number;
}

export interface FanObstacle {
  type: "fan";
  x: number;
  y: number;
  width: number;
  height: number;
  liftVelocity: number;
}

export interface SpringObstacle {
  type: "spring";
  x: number;
  y: number;
  bounceVelocity: number;
}

export type Obstacle = BridgeObstacle | SawObstacle | CrumbleObstacle | FanObstacle | SpringObstacle;

export interface LevelData {
  id: string;
  title: string;
  worldWidth: number;
  worldHeight: number;
  fallDeathY: number;
  spawn: { x: number; y: number };
  groundSegments: GroundSegment[];
  obstacles: Obstacle[];
  flag: { x: number; y: number };
}
