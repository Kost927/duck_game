export type DuckEntity = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  variantId: string;
  isHit: boolean;
  spawnedAt: number;
  hitAt?: number;
};

export type FlightVariant = {
  id: string;
  startEdge: "left" | "right";
  endEdge: "left" | "right";
  yMin: number;
  yMax: number;
  durationMs: number;
  pathStyle: "horizontal" | "diagonalUp" | "diagonalDown";
  easing?: string;
};

export type RoundStartPayload = {
  roundId: string;
  duckId: string;
  variantId: string;
  startEdge: "left" | "right";
  y: number;
  startedAt: number;
  flightDurationMs: number;
};

export type RoundHitPayload = {
  roundId: string;
  duckId: string;
  hitAt: number;
};

export type RoundEndPayload = {
  roundId: string;
  reason: "hit" | "miss";
};
