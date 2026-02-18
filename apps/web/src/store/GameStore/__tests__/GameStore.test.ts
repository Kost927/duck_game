import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameStore } from "../GameStore";

vi.mock("./SoundService", () => ({
  SoundService: {
    preload: vi.fn(),
    playQuackLoop: vi.fn(),
    stopQuack: vi.fn(),
    playAwp: vi.fn(),
  },
}));

describe("GameStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("increments roundsStarted when round starts", () => {
    const store = new GameStore();
    store.setConfig({ useServer: false, schedulingMode: "fixed10" });
    store.startLocalScheduler();
    expect(store.roundsStarted).toBe(0);
    vi.advanceTimersByTime(10000);
    expect(store.roundsStarted).toBe(1);
    vi.advanceTimersByTime(10000);
    vi.advanceTimersByTime(5000);
    expect(store.roundsStarted).toBe(2);
  });

  it("increments hits only once per round when hitDuck is called", () => {
    const store = new GameStore();
    store.setConfig({ useServer: false, schedulingMode: "fixed10" });
    store.startLocalScheduler();
    vi.advanceTimersByTime(10000);
    expect(store.status).toBe("flying");
    store.hitDuck();
    expect(store.hits).toBe(1);
    store.hitDuck();
    store.hitDuck();
    expect(store.hits).toBe(1);
  });

  it("transitions flying -> hit -> end", () => {
    const store = new GameStore();
    store.setConfig({ useServer: false, schedulingMode: "fixed10" });
    store.startLocalScheduler();
    vi.advanceTimersByTime(10000);
    expect(store.status).toBe("flying");
    expect(store.currentDuck).not.toBeNull();
    store.hitDuck();
    expect(store.status).toBe("hit");
    expect(store.currentDuck?.isHit).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(store.currentDuck).toBeNull();
    expect(store.status).toMatch(/idle|scheduled/);
  });

  it("schedule delay is within bounds when random scheduling is enabled", () => {
    const store = new GameStore();
    store.setConfig({ useServer: false, schedulingMode: "random20±10" });
    store.startLocalScheduler();
    expect(store.nextRoundDelayMs).toBeGreaterThanOrEqual(10000);
    expect(store.nextRoundDelayMs).toBeLessThanOrEqual(30000);
  });
});
