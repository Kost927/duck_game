import { observer } from "mobx-react-lite";

type ScoreboardProps = {
  hits: number;
  roundsStarted: number;
};

export const Scoreboard = observer(function Scoreboard({ hits, roundsStarted }: ScoreboardProps) {
  return (
    <div className="scoreboard" aria-live="polite" aria-label="Score">
      Hits: {hits} / Rounds: {roundsStarted}
    </div>
  );
});
