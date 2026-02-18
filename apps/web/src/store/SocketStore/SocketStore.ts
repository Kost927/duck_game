import { makeAutoObservable } from "mobx";
import { io, type Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@duck-hunt/shared";
import type { RoundEndPayload, RoundHitPayload, RoundStartPayload } from "@duck-hunt/shared";
import { GameStore } from "store";

const DEFAULT_URL = "http://localhost:3000";

export class SocketStore {
  socket: Socket | null = null;
  connected = false;
  readonly gameStoreRef: GameStore;

  constructor(gameStore: GameStore) {
    this.gameStoreRef = gameStore;
    makeAutoObservable(this, { gameStoreRef: false });
  }

  connect(url: string = DEFAULT_URL): void {
    this.disconnect();
    const socket = io(url, { autoConnect: true });
    this.socket = socket;

    socket.on("connect", () => {
      this.connected = true;
    });

    socket.on("disconnect", () => {
      this.connected = false;
    });

    socket.on(SOCKET_EVENTS.ROUND_START, (payload: RoundStartPayload) => {
      this.gameStoreRef.startRound(payload);
    });

    socket.on(SOCKET_EVENTS.ROUND_HIT, (payload: RoundHitPayload) => {
      this.gameStoreRef.applyServerHit(payload);
    });

    socket.on(SOCKET_EVENTS.ROUND_END, (payload: RoundEndPayload) => {
      this.gameStoreRef.endRound(payload.reason);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }

  emitHit(): void {
    const socket = this.socket;
    if (!socket || !this.connected) return;
    const roundId = this.gameStoreRef.currentRoundId;
    const duckId = this.gameStoreRef.currentDuck?.id;
    if (roundId === null || duckId === undefined) return;
    socket.emit(SOCKET_EVENTS.DUCK_HIT, {
      roundId,
      duckId,
      hitAt: Date.now(),
    });
  }
}
