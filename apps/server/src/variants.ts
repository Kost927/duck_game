import type { FlightVariant } from "@duck-hunt/shared";
import { FLIGHT_DURATION_MS } from "./constants.js";

const createVariant = (
  id: string,
  startEdge: "left" | "right",
  endEdge: "left" | "right",
  yMin: number,
  yMax: number,
  pathStyle: "horizontal" | "diagonalUp" | "diagonalDown",
): FlightVariant => ({
  id,
  startEdge,
  endEdge,
  yMin,
  yMax,
  durationMs: FLIGHT_DURATION_MS,
  pathStyle,
});

const FLIGHT_VARIANTS: FlightVariant[] = [
  createVariant("1", "left", "right", 180, 260, "horizontal"),
  createVariant("2", "right", "left", 320, 400, "horizontal"),
  createVariant("3", "left", "right", 60, 140, "horizontal"),
  createVariant("4", "right", "left", 180, 260, "horizontal"),
  createVariant("5", "left", "right", 200, 280, "diagonalUp"),
  createVariant("6", "right", "left", 220, 300, "diagonalDown"),
];

export const pickRandomVariant = (): FlightVariant => {
  const idx = Math.floor(Math.random() * FLIGHT_VARIANTS.length);
  return FLIGHT_VARIANTS[idx]!;
};
