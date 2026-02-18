import type { DuckEntity } from "@duck-hunt/shared";

export type GameStatus = "idle" | "scheduled" | "flying" | "hit";

export type SchedulingMode = "random20±10" | "fixed10";

export type GameConfig = {
  schedulingMode: SchedulingMode;
  useServer: boolean;
};

export type DuckWithTrajectory = DuckEntity & {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};
