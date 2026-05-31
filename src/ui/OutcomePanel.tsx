import { memo } from "react";
import { buildOutcomeSummary } from "../engine/outcomeSummary";
import type { GameState, PendingOutcome, RuntimeEvent } from "../engine/types";
import { getArchetypeQuote, pickQuoteSpeaker, type QuoteMoment } from "../content/quotes";

export const OutcomePanel = memo(function OutcomePanel({
  game,
  pending,
  ev,
  moment,
  onContinue,
}: {
  game: GameState;
  pending: PendingOutcome;
  ev?: RuntimeEvent;
  moment: QuoteMoment;
  onContinue: () => void;
}) {
  const pre = pending.preCrewHp ?? game.crew.map((c) => ({ id: c.id, hp: c.hp }));
  const summary = buildOutcomeSummary({
    tankHealthBefore: pending.tankHealthBefore,
    tankHealthAfter: game.tank.healthPct,
    resourcesBefore: pending.resourceSnapshot,
    resourcesAfter: game.resources,
    crewBefore: pre.map((p) => {
      const cm = game.crew.find((c) => c.id === p.id);
      return {
        id: p.id,
        role: cm?.role ?? "",
        nickname: cm?.nickname ?? "",
        hp: p.hp,
      };
    }),
    crewAfter: game.crew,
    effectLines: pending.effectLines ?? [],
  });

  const speaker = pickQuoteSpeaker(game.crew, moment, game.rngCounter);
  const quote =
    speaker && getArchetypeQuote(speaker.archetypeId, moment, game.runSeed, game.rngCounter + 999);

  return (
    <div className="outcome-panel">
      {pending.choice.dialogueLine ? (
        <p className="dialogue-line">"{pending.choice.dialogueLine}"</p>
      ) : null}
      <p className="outcome-panel__narrative">{pending.displayText}</p>
      {summary.lines.length > 0 ? (
        <div className="outcome-summary">
          <h4 className="outcome-summary__title">Aftermath</h4>
          <ul>
            {summary.lines.map((line, i) => (
              <li
                key={`${line.category}-${i}`}
                className={`outcome-summary__line outcome-summary__line--${line.category}`}
              >
                {line.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {pending.choice.npcReply ? (
        <div className="speech-block npc-reply">
          <span className="speech-line">{pending.choice.npcReply}</span>
        </div>
      ) : null}
      {ev?.postQuote ? <p className="outcome-panel__quote">{ev.postQuote}</p> : null}
      {quote && speaker ? (
        <p className="outcome-panel__crew-quote">
          {speaker.nickname}: "{quote}"
        </p>
      ) : null}
      <button type="button" className="choiceBtn" onClick={onContinue}>
        Next
      </button>
    </div>
  );
});
