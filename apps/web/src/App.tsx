import { GameField } from "components";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { gameStore, socketStore } from "store";

import styles from "./App.module.scss";
import { SoundService } from "services";

const AppInner = observer(function AppInner() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const hasStartedScheduler = useRef(false);

  useEffect(() => {
    SoundService.preload();
  }, []);

  useEffect(() => {
    if (!audioUnlocked) return;
    if (gameStore.stoppedByUser) return;

    if (gameStore.config.useServer) {
      socketStore.connect();
    }
    return () => {
      socketStore.disconnect();
    };
    // eslint-disable-next-line -- gameStore.stoppedByUser is valid: observer() re-renders on change
  }, [audioUnlocked, gameStore.stoppedByUser]);

  useEffect(() => {
    if (!audioUnlocked) return;
    if (gameStore.stoppedByUser) return;

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
    // eslint-disable-next-line -- gameStore.stoppedByUser is valid: observer() re-renders on change
  }, [audioUnlocked, gameStore.stoppedByUser]);

  const handleOverlayClick = (): void => {
    if (!audioUnlocked) {
      setAudioUnlocked(true);
      return;
    }
    if (gameStore.stoppedByUser) {
      gameStore.restart();
      if (gameStore.config.useServer) {
        socketStore.connect();
      }
    }
  };

  const showOverlay = !audioUnlocked || gameStore.stoppedByUser;

  return (
    <div className={styles.app}>
      {showOverlay ? (
        <div
          className={styles.unlockOverlay}
          role="button"
          tabIndex={0}
          aria-label={
            gameStore.stoppedByUser
              ? "Click to resume game"
              : "Click to start game and enable sound"
          }
          onClick={handleOverlayClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOverlayClick();
            }
          }}
        >
          Click to start
        </div>
      ) : null}
      <main className={styles.main}>
        <GameField />
      </main>
    </div>
  );
});

export default function App() {
  return <AppInner />;
}
