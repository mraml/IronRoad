import { STANCE_PICKER_OPTIONS } from "../content/stanceOptions";
import type { EncounterStance, GameState, RuntimeEvent } from "../engine/types";
import {
  threatBand,
  threatBandLabel,
  usesTacticalEncounter,
} from "../engine/tacticalEncounter";

export function EncounterTurnPanel({
  game,
  ev,
  onChooseStance,
}: {
  game: GameState;
  ev: RuntimeEvent;
  onChooseStance: (stance: EncounterStance) => void;
}) {
  if (!usesTacticalEncounter(ev)) return null;

  const pending = game.pendingEncounter;
  const stance = pending?.stance;
  const turn = pending?.turn ?? 0;
  const threat = pending?.threat;

  if (!stance) {
    return (
      <div className="tactical-panel">
        <p className="muted" style={{ marginTop: 0 }}>
          How does the crew enter this?
        </p>
        {STANCE_PICKER_OPTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="choiceBtn"
            onClick={() => onChooseStance(s.id)}
          >
            <strong>{s.label}</strong>
            <span className="choice-hint"> — {s.hint}</span>
          </button>
        ))}
      </div>
    );
  }

  const band = threat !== undefined ? threatBand(threat) : "moderate";
  const stanceLabel = STANCE_PICKER_OPTIONS.find((s) => s.id === stance)?.label ?? stance;

  return (
    <div className="tactical-panel tactical-turn-header">
      <span className="tag tag--inline">
        Turn {turn} · {threatBandLabel(band)} · {stanceLabel}
      </span>
    </div>
  );
}
