import { observer } from "mobx-react-lite";

type DebugPanelProps = {
  status: string;
  nextRoundDelayMs: number;
  currentRoundId: string | null;
};

export const DebugPanel = observer(function DebugPanel({
  status,
  nextRoundDelayMs,
  currentRoundId,
}: DebugPanelProps) {
  return (
    <div className="debug-panel" role="region" aria-label="Debug info">
      <div>status: {status}</div>
      <div>nextRoundDelayMs: {nextRoundDelayMs}</div>
      <div>currentRoundId: {currentRoundId ?? "—"}</div>
    </div>
  );
});
