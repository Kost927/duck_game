import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { DuckSprite, Scoreboard } from "components";
import { FRAME_SWAP_MS } from "utils";
import { gameStore } from "store";
import styles from "./GameField.module.scss";
import { TICK_MS } from "./GameField.constants";
import { SoundService } from "services";

export const GameField = observer(function GameField() {
  const { currentDuck } = gameStore;
  const [frameIndex, setFrameIndex] = useState<0 | 1>(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev === 0 ? 1 : 0));
    }, FRAME_SWAP_MS);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!currentDuck) return;

    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);

    return () => clearInterval(id);
  }, [currentDuck]);

  const handleFieldClick = (): void => {
    SoundService.playAwp();
  };

  const handleStop = (): void => {
    gameStore.stop();
  };

  const handleRestart = (): void => {
    gameStore.restart();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <Scoreboard />
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.button}
            onClick={handleStop}
            aria-label="Stop game"
          >
            Stop
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={handleRestart}
            aria-label="Restart game"
          >
            Restart
          </button>
        </div>
      </div>
      <div
        className={styles.field}
        role="application"
        aria-label="Duck Hunt game field"
        onClick={handleFieldClick}
      >
        {currentDuck !== null && (
          <DuckSprite
            key={`${currentDuck.id}-${currentDuck.isHit}`}
            duck={currentDuck}
            frameIndex={frameIndex}
          />
        )}
      </div>
    </div>
  );
});
