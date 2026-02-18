import { FLIGHT_DURATION_MS } from "utils";
import { type DuckWithTrajectory } from "store";

const getProgress = (duck: DuckWithTrajectory): number => {
  const elapsed =
    duck.isHit && duck.hitAt !== undefined
      ? duck.hitAt - duck.spawnedAt
      : Date.now() - duck.spawnedAt;
  return Math.min(1, elapsed / FLIGHT_DURATION_MS);
};

export const getPosition = (duck: DuckWithTrajectory): { x: number; y: number; flip: boolean } => {
  const p = getProgress(duck);
  const x = duck.startX + (duck.endX - duck.startX) * p;
  const y = duck.startY + (duck.endY - duck.startY) * p;
  const flip = duck.endX < duck.startX;
  return { x, y, flip };
};
