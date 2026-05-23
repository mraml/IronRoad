import type { EventChoice, RuntimeEvent } from "../engine/types";
import { diceOddsLabel } from "../engine/riskTelegraph";

const RISK_LABELS: Record<NonNullable<EventChoice["choiceRisk"]>, string> = {
  aggressive: "Aggressive",
  tactical: "Tactical",
  cautious: "Cautious",
  desperate: "Desperate",
};

export function ChoiceList({
  ev,
  frozenRoles,
  onChoose,
}: {
  ev: RuntimeEvent;
  frozenRoles: Set<string>;
  onChoose: (choiceId: string) => void;
}) {
  return (
    <>
      <p className="muted">Choose (keys 1–{ev.choices.length}):</p>
      <div className="choiceList">
        {ev.choices.map((ch, i) => {
          const actorFrozen = ch.role ? frozenRoles.has(ch.role) : false;
          const odds = ev.useDice ? diceOddsLabel(ch.modifierBonus) : null;
          const tags = ch.riskTags ?? [];
          return (
            <button
              key={ch.id}
              type="button"
              className="choiceBtn"
              style={actorFrozen ? { borderColor: "#e05a5a", opacity: 0.8 } : undefined}
              onClick={() => onChoose(ch.id)}
            >
              <kbd>{i + 1}</kbd>
              {ch.choiceRisk ? (
                <span className="choice-risk">{RISK_LABELS[ch.choiceRisk]}</span>
              ) : null}
              <span className="choiceBtn__label">{ch.label}</span>
              {ch.role ? (
                <span className="muted choiceBtn__role">
                  [{ch.role.replaceAll("_", " ")}
                  {actorFrozen ? " — FROZEN" : ""}]
                </span>
              ) : null}
              {odds ? <span className="choice-odds">{odds}</span> : null}
              {tags.length > 0 ? (
                <span className="choice-risk-tags">
                  {tags.map((t) => (
                    <span
                      key={`${t.domain}-${t.label}`}
                      className={`choice-risk-tag choice-risk-tag--${t.severity}`}
                    >
                      {t.label}
                    </span>
                  ))}
                </span>
              ) : ch.choiceHint ? (
                <span className="choice-hint">{ch.choiceHint}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
