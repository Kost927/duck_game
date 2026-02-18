import { observer } from "mobx-react-lite";
import type { DuckWithTrajectory } from "store";
import { getPosition } from "./DuckSprite.utils";
import styles from "./DuckSprite.module.scss";

export type DuckSpriteProps = {
  duck: DuckWithTrajectory;
  className?: string;
  style?: React.CSSProperties;
};

const DUCK_IMAGE_SRC = "/images/duck3.png";

export const DuckSprite = observer(function DuckSprite({
  duck,
  className,
  style,
}: DuckSpriteProps) {
  const { x, y, flip } = getPosition(duck);

  return (
    <div
      className={`${styles.duck} ${className ?? ""}`.trim()}
      style={{
        ...style,
        left: `${x}%`,
        top: `${y}%`,
        transform: `scaleX(${flip ? -1 : 1})`,
      }}
      role="img"
      aria-label="Duck"
    >
      <img src={DUCK_IMAGE_SRC} alt="" draggable={false} />
    </div>
  );
});
