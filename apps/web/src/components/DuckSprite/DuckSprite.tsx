import { observer } from "mobx-react-lite";
import type { DuckWithTrajectory } from "store";
import { gameStore, socketStore, SoundService } from "store";
import { getPosition } from "./DuckSprite.utils";
import styles from "./DuckSprite.module.scss";

type DuckSpriteProps = {
  duck: DuckWithTrajectory;
  frameIndex?: 0 | 1;
  className?: string;
  style?: React.CSSProperties;
};

export const DuckSprite = observer(function DuckSprite({
  duck,
  frameIndex = 0,
  className,
  style,
}: DuckSpriteProps) {
  const { x, y, flip } = getPosition(duck);
  const isHit = duck.isHit;
  const image = isHit
    ? "/images/duck3.png"
    : frameIndex === 0
      ? "/images/duck1.png"
      : "/images/duck2.png";

  const handleHit = (): void => {
    if (gameStore.config.useServer && socketStore.connected) {
      socketStore.emitHit();
    } else {
      gameStore.hitDuck();
    }
  };

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    SoundService.playAwp();
    handleHit();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleHit();
    }
  };

  return (
    <div
      className={`${styles.duck} ${isHit ? styles.duckHit : ""} ${className ?? ""}`.trim()}
      style={{
        ...style,
        left: x,
        top: y,
        width: duck.width,
        height: duck.height,
        transform: `scaleX(${flip ? -1 : 1})`,
      }}
      role={"button"}
      tabIndex={0}
      aria-label={isHit ? "Duck hit" : "Duck"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <img key={image} src={image} alt="" draggable={false} />
    </div>
  );
});
