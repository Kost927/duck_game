import { observer } from "mobx-react-lite";
import { gameStore } from "store";

export const Scoreboard = observer(function Scoreboard() {
  const { hits, roundsStarted } = gameStore;
  return (
    <div aria-live="polite" aria-label="Score">
      Hits: {hits} / Rounds: {roundsStarted}
    </div>
  );
});
