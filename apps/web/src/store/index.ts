export * from "./GameStore";
export * from "./SocketStore";

import { GameStore } from "./GameStore";
import { SocketStore } from "./SocketStore";

const gameStore = new GameStore();
const socketStore = new SocketStore(gameStore);

export { gameStore, socketStore };
