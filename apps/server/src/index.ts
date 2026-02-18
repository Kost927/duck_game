import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { SOCKET_EVENTS } from "@duck-hunt/shared";
import type { RoundStartPayload, RoundHitPayload, RoundEndPayload } from "@duck-hunt/shared";
import { FLIGHT_DURATION_MS, SCHEDULE_DELAY_MIN_MS, SCHEDULE_DELAY_MAX_MS } from "./constants.js";
import { pickRandomVariant } from "./variants.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

let flightTimeoutId: ReturnType<typeof setTimeout> | null = null;
let currentRoundId: string | null = null;
let currentDuckId: string | null = null;
let hit = false;

const createRoundId = (): string => `round-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const createDuckId = (): string => `duck-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function scheduleNextRound(): void {
  const delay =
    SCHEDULE_DELAY_MIN_MS + Math.random() * (SCHEDULE_DELAY_MAX_MS - SCHEDULE_DELAY_MIN_MS);
  setTimeout(() => {
    startRound();
  }, delay);
}

function startRound(): void {
  currentRoundId = createRoundId();
  currentDuckId = createDuckId();
  hit = false;
  const variant = pickRandomVariant();
  const y = variant.yMin + Math.random() * (variant.yMax - variant.yMin);
  const startedAt = Date.now();
  const payload: RoundStartPayload = {
    roundId: currentRoundId,
    duckId: currentDuckId,
    variantId: variant.id,
    startEdge: variant.startEdge,
    y,
    startedAt,
    flightDurationMs: FLIGHT_DURATION_MS,
  };
  io.emit(SOCKET_EVENTS.ROUND_START, payload);

  flightTimeoutId = setTimeout(() => {
    flightTimeoutId = null;
    if (!hit && currentRoundId !== null) {
      const endPayload: RoundEndPayload = {
        roundId: currentRoundId,
        reason: "miss",
      };
      io.emit(SOCKET_EVENTS.ROUND_END, endPayload);
      currentRoundId = null;
      currentDuckId = null;
      scheduleNextRound();
    }
  }, FLIGHT_DURATION_MS);
}

io.on("connection", (socket) => {
  if (currentRoundId === null) {
    scheduleNextRound();
  }

  socket.on(SOCKET_EVENTS.DUCK_HIT, (payload: RoundHitPayload) => {
    if (
      currentRoundId === null ||
      payload.roundId !== currentRoundId ||
      payload.duckId !== currentDuckId ||
      hit
    ) {
      return;
    }
    hit = true;
    if (flightTimeoutId !== null) {
      clearTimeout(flightTimeoutId);
      flightTimeoutId = null;
    }
    io.emit(SOCKET_EVENTS.ROUND_HIT, payload);
    const endPayload: RoundEndPayload = {
      roundId: currentRoundId,
      reason: "hit",
    };
    io.emit(SOCKET_EVENTS.ROUND_END, endPayload);
    currentRoundId = null;
    currentDuckId = null;
    scheduleNextRound();
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
