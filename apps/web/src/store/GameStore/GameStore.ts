import { makeAutoObservable, runInAction } from "mobx";
import type { RoundStartPayload } from "@duck-hunt/shared";
import {
  pickRandomVariant,
  FLIGHT_DURATION_MS,
  HIT_DISAPPEAR_MS,
  SCHEDULE_DELAY_MIN_MS,
  SCHEDULE_DELAY_MAX_MS,
  SCHEDULE_FIXED_MS,
  DUCK_WIDTH,
  DUCK_HEIGHT,
  FIELD_WIDTH,
  FIELD_HEIGHT,
} from "utils";
import { createDuckId, createRoundId, getTrajectory } from "./GameStore.utils";
import type { GameConfig, GameStatus, DuckWithTrajectory } from "./GameStore.types";
import { SoundService } from "store";

export class GameStore {
  roundsStarted = 0;
  hits = 0;
  status: GameStatus = "idle";
  currentRoundId: string | null = null;
  currentDuck: DuckWithTrajectory | null = null;
  nextRoundDelayMs = 0;
  config: GameConfig = {
    schedulingMode: "random20±10",
    useServer: true,
    debug: true,
  };

  private scheduleTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private flightTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private hitDisappearTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  startLocalScheduler(): void {
    this.scheduleNextRound();
  }

  stopLocalScheduler(): void {
    if (this.scheduleTimeoutId !== null) {
      clearTimeout(this.scheduleTimeoutId);
      this.scheduleTimeoutId = null;
    }
    this.clearRoundTimers();
    SoundService.stopQuack();
  }

  private clearRoundTimers(): void {
    if (this.flightTimeoutId !== null) {
      clearTimeout(this.flightTimeoutId);
      this.flightTimeoutId = null;
    }
    if (this.hitDisappearTimeoutId !== null) {
      clearTimeout(this.hitDisappearTimeoutId);
      this.hitDisappearTimeoutId = null;
    }
  }

  scheduleNextRound(): void {
    if (this.config.useServer) return;
    const delay =
      this.config.schedulingMode === "fixed10"
        ? SCHEDULE_FIXED_MS
        : SCHEDULE_DELAY_MIN_MS + Math.random() * (SCHEDULE_DELAY_MAX_MS - SCHEDULE_DELAY_MIN_MS);
    runInAction(() => {
      this.nextRoundDelayMs = Math.round(delay);
      this.status = "scheduled";
    });
    this.scheduleTimeoutId = setTimeout(() => {
      this.scheduleTimeoutId = null;
      this.startRound();
    }, delay);
  }

  startRound(payload?: RoundStartPayload): void {
    this.clearRoundTimers();
    SoundService.stopQuack();
    if (payload) {
      const variant = payload.variantId;
      const y = payload.y;
      const startEdge = payload.startEdge;
      const endEdge = startEdge === "left" ? "right" : "left";
      const margin = 20;
      const startX = startEdge === "left" ? margin : FIELD_WIDTH - DUCK_WIDTH - margin;
      const endX = endEdge === "left" ? margin : FIELD_WIDTH - DUCK_WIDTH - margin;
      const startY = Math.max(0, Math.min(FIELD_HEIGHT - DUCK_HEIGHT, y));
      const endY = startY;
      runInAction(() => {
        this.roundsStarted += 1;
        this.status = "flying";
        this.currentRoundId = payload.roundId;
        this.currentDuck = {
          id: payload.duckId,
          x: startX,
          y: startY,
          width: DUCK_WIDTH,
          height: DUCK_HEIGHT,
          variantId: variant,
          isHit: false,
          spawnedAt: payload.startedAt,
          startX,
          startY,
          endX,
          endY,
        };
      });
      SoundService.playQuackLoop();
      this.flightTimeoutId = setTimeout(() => {
        this.flightTimeoutId = null;
        this.endRound("miss");
      }, payload.flightDurationMs);
      return;
    }
    const variant = pickRandomVariant();
    this.spawnDuck(variant);
  }

  spawnDuck(variant: ReturnType<typeof pickRandomVariant>): void {
    this.clearRoundTimers();
    SoundService.stopQuack();
    const roundId = createRoundId();
    const duckId = createDuckId();
    const { startX, startY, endX, endY } = getTrajectory(variant);
    runInAction(() => {
      this.roundsStarted += 1;
      this.status = "flying";
      this.currentRoundId = roundId;
      this.currentDuck = {
        id: duckId,
        x: startX,
        y: startY,
        width: DUCK_WIDTH,
        height: DUCK_HEIGHT,
        variantId: variant.id,
        isHit: false,
        spawnedAt: Date.now(),
        startX,
        startY,
        endX,
        endY,
      };
    });
    SoundService.playQuackLoop();
    this.flightTimeoutId = setTimeout(() => {
      this.flightTimeoutId = null;
      this.endRound("miss");
    }, FLIGHT_DURATION_MS);
  }

  hitDuck(): void {
    if (this.status !== "flying" || !this.currentDuck || this.currentDuck.isHit) return;
    this.clearRoundTimers();
    SoundService.stopQuack();
    runInAction(() => {
      const duck = this.currentDuck!;
      this.currentDuck = {
        ...duck,
        isHit: true,
        hitAt: Date.now(),
      };
      this.hits += 1;
      this.status = "hit";
    });
    this.hitDisappearTimeoutId = setTimeout(() => {
      this.hitDisappearTimeoutId = null;
      this.endRound("hit");
    }, HIT_DISAPPEAR_MS);
  }

  applyServerHit(payload: { roundId: string }): void {
    if (this.currentRoundId !== payload.roundId || !this.currentDuck) return;
    if (this.currentDuck.isHit) return;
    this.hitDuck();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reason is for API consistency
  endRound(reason: "hit" | "miss"): void {
    if (reason === "hit" && this.hitDisappearTimeoutId !== null) return;

    this.clearRoundTimers();
    SoundService.stopQuack();
    runInAction(() => {
      this.currentDuck = null;
      this.currentRoundId = null;
      this.status = "idle";
    });
    if (!this.config.useServer) {
      this.scheduleNextRound();
    }
  }

  setConfig(partial: Partial<GameConfig>): void {
    this.config = { ...this.config, ...partial };
  }
}
