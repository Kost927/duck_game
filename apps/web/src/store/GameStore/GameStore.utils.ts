import type { FlightVariant } from "@duck-hunt/shared";
import { FIELD_WIDTH, FIELD_HEIGHT, DUCK_WIDTH, DUCK_HEIGHT } from "utils";

export const createDuckId = (): string =>
  `duck-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export const createRoundId = (): string =>
  `round-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const getTrajectory = (
  variant: FlightVariant,
): { startX: number; startY: number; endX: number; endY: number } => {
  const y = variant.yMin + Math.random() * (variant.yMax - variant.yMin);
  const margin = 20;
  const startX = variant.startEdge === "left" ? margin : FIELD_WIDTH - DUCK_WIDTH - margin;
  const endX = variant.endEdge === "left" ? margin : FIELD_WIDTH - DUCK_WIDTH - margin;
  const startY = Math.max(0, Math.min(FIELD_HEIGHT - DUCK_HEIGHT, y));
  let endY = startY;

  if (variant.pathStyle === "diagonalUp") {
    endY = Math.max(0, startY - 80);
  } else if (variant.pathStyle === "diagonalDown") {
    endY = Math.min(FIELD_HEIGHT - DUCK_HEIGHT, startY + 80);
  }
  return { startX, startY, endX, endY };
};
