import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { GameField, DebugPanel } from "components";
import { SocketStore, GameStore, SoundService } from "store";

import styles from "./App.module.scss";

const gameStore = new GameStore();
const socketStore = new SocketStore(gameStore);

const AppInner = observer(function AppInner() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const hasStartedScheduler = useRef(false);

  useEffect(() => {
    SoundService.preload();
  }, []);

  useEffect(() => {
    if (!audioUnlocked) return;
    if (gameStore.config.useServer) {
      socketStore.connect();
    }
    return () => {
      socketStore.disconnect();
    };
  }, [audioUnlocked]);

  useEffect(() => {
    if (!audioUnlocked) return;

    if (gameStore.config.useServer && socketStore.connected) {
      if (hasStartedScheduler.current) {
        gameStore.stopLocalScheduler();
        hasStartedScheduler.current = false;
      }
      return;
    }
    const useLocal = !gameStore.config.useServer || !socketStore.connected;
    const delay = gameStore.config.useServer ? 2000 : 0;
    const timerId = setTimeout(() => {
      if (gameStore.config.useServer && socketStore.connected) return;
      if (!hasStartedScheduler.current && useLocal) {
        hasStartedScheduler.current = true;
        gameStore.startLocalScheduler();
      }
    }, delay);

    return () => {
      clearTimeout(timerId);

      if (hasStartedScheduler.current) {
        gameStore.stopLocalScheduler();
        hasStartedScheduler.current = false;
      }
    };
  }, [audioUnlocked]);

  const handleHit = (): void => {
    if (gameStore.config.useServer && socketStore.connected) {
      socketStore.emitHit();
    } else {
      gameStore.hitDuck();
    }
  };

  const handleUnlock = (): void => {
    setAudioUnlocked(true);
  };

  return (
    <div className={styles.app}>
      {!audioUnlocked ? (
        <div
          className={styles.unlockOverlay}
          role="button"
          tabIndex={0}
          aria-label="Click to start game and enable sound"
          onClick={handleUnlock}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleUnlock();
            }
          }}
        >
          Click to start
        </div>
      ) : null}
      <main className={styles.main}>
        <GameField
          hits={gameStore.hits}
          roundsStarted={gameStore.roundsStarted}
          currentDuck={gameStore.currentDuck}
          onHit={handleHit}
        />
      </main>
      {gameStore.config.debug ? (
        <div className={styles.debugPanel}>
          <DebugPanel
            status={gameStore.status}
            nextRoundDelayMs={gameStore.nextRoundDelayMs}
            currentRoundId={gameStore.currentRoundId}
          />
        </div>
      ) : null}
    </div>
  );
});

export default function App() {
  return <AppInner />;
}

export { gameStore };
