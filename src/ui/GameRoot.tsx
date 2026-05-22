import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { useJournalStore } from "../store/journalStore";
import type { Difficulty, EnvironmentId, Role, RuntimeEvent, TankType } from "../engine/types";
import { getArchetypeQuote } from "../content/quotes";
import { CHARM_CATALOG } from "../content/charms";
import { TANK_TYPE_PROFILES } from "../engine/config";
import { conditionWarning } from "../engine/reducer";

// ─── labels ──────────────────────────────────────────────────────────────────

function envLabel(e: EnvironmentId): string {
  const labels: Record<EnvironmentId, string> = {
    clear: "Clear",
    scorching_heat: "Scorching heat",
    dust_storm: "Dust storm",
    heavy_rain: "Heavy rain",
    deep_mud: "Deep mud",
    thick_fog: "Thick fog",
    light_snow: "Light snow",
    blizzard: "Blizzard",
    hard_freeze: "Hard freeze",
    ice: "Ice on roads",
    thaw_mud: "Thaw mud",
    overcast: "Overcast",
  };
  return labels[e] ?? e;
}

function envWarning(env: EnvironmentId): string | null {
  if (env === "scorching_heat") return "Water burns faster in this heat.";
  if (env === "blizzard" || env === "ice") return "Ice in the bones. Every noise is a threat.";
  if (env === "thick_fog" || env === "heavy_rain") return "Fog and rain. The kind of morning that gets people killed.";
  if (env === "deep_mud" || env === "thaw_mud") return "Ground is soft. Tracks are working for it.";
  if (env === "hard_freeze") return "Engine doesn't like the cold.";
  return null;
}

const TRAUMA_LABELS: Record<string, string> = {
  shellshocked: "Shellshocked −2",
  frozen: "Frozen",
  jumpy: "Jumpy",
  thousand_yard_stare: "Thousand-yard stare",
  shaking: "Shaking −1",
  grief_struck: "Grief-struck",
  rage: "Rage",
  checked_out: "Checked out",
  numb: "Numb",
  breaking: "Breaking −1",
};

function constitutionColor(c: number): string {
  if (c < 20) return "#e05a5a";
  if (c < 35) return "#e09a20";
  return "inherit";
}

// ─── helpers ─────────────────────────────────────────────────────────────────

type Game = ReturnType<typeof useGameStore.getState>["game"];
type Dispatch = ReturnType<typeof useGameStore.getState>["dispatch"];

function missionAt(g: Game) {
  return g.missions[g.missionIndex];
}

// ─── root ────────────────────────────────────────────────────────────────────

export function GameRoot() {
  const game = useGameStore((s) => s.game);
  const dispatch = useGameStore((s) => s.dispatch);
  const hardReset = useGameStore((s) => s.hardReset);
  const [showJournal, setShowJournal] = useState(false);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (game.meta.t !== "play") return;
      const sub = game.meta.sub;
      const m = missionAt(game);
      let ev: RuntimeEvent | undefined;
      if (sub.t === "event" || sub.t === "foot" || sub.t === "briefing") {
        if (sub.step !== "choose") return;
        ev =
          sub.t === "foot"
            ? game.footEvents?.[sub.index]
            : sub.t === "briefing"
              ? m?.briefingEvent
              : m?.days[sub.day]?.events[sub.eventIndex];
      } else if (sub.t === "between_missions" && sub.socialStep === "choose") {
        ev = game.socialBeat;
      } else if (sub.t === "tank_replacement" && sub.step === "choose") {
        ev = game.tankReplacementBeat;
      } else {
        return;
      }
      if (!ev) return;
      const n = Number(e.key);
      if (n >= 1 && n <= ev.choices.length) {
        const ch = ev.choices[n - 1];
        if (ch) {
          e.preventDefault();
          dispatch({ type: "CHOOSE_OPTION", choiceId: ch.id });
        }
      }
    },
    [dispatch, game],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <div className="appShell">
      {showJournal && <JournalModal onClose={() => setShowJournal(false)} />}

      <header className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Iron Road</h1>
        <div className="row" style={{ gap: "0.5rem" }}>
          <button
            type="button"
            className="choiceBtn"
            style={{ fontSize: "0.85rem" }}
            onClick={() => setShowJournal(true)}
          >
            Field Journal
          </button>
          {game.meta.t !== "title" && (
            <button
              type="button"
              className="choiceBtn"
              onClick={() => dispatch({ type: "ABANDON_TO_TITLE" })}
            >
              Main menu
            </button>
          )}
        </div>
      </header>

      {game.meta.t === "title" && (
        <TitleScreen game={game} dispatch={dispatch} hardReset={hardReset} />
      )}

      {game.meta.t === "content_warning" && (
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Content notice</h2>
          <p>Iron Road depicts war without sanitizing it. You can stop at any time.</p>
          <button
            type="button"
            className="choiceBtn"
            onClick={() => dispatch({ type: "ACCEPT_CONTENT_WARNING" })}
          >
            I understand — proceed
          </button>
        </section>
      )}

      {game.meta.t === "pick_difficulty" && (
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Difficulty</h2>
          <div className="choiceList">
            {(
              [
                ["green", "Green — shorter campaign, kinder dice."],
                ["veteran", "Veteran — standard."],
                ["fury", "Fury — long road, cruel dice."],
              ] as const
            ).map(([d, label]) => (
              <button
                key={d}
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "START_CAMPAIGN", difficulty: d as Difficulty })}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      {game.meta.t === "pick_tank" && (
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Choose your tank</h2>
          <div className="choiceList">
            {(["sherman", "churchill", "t34"] as TankType[]).map((tid) => {
              const prof = TANK_TYPE_PROFILES[tid];
              return (
                <button
                  key={tid}
                  type="button"
                  className="choiceBtn"
                  onClick={() => dispatch({ type: "PICK_TANK", tankType: tid })}
                >
                  <strong>{prof.label}</strong>
                  <br />
                  <span style={{ fontSize: "0.85em", opacity: 0.8 }}>{prof.description}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {game.meta.t === "crew_reveal" && (
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Your crew — {game.tank.name}</h2>
          <ul style={{ paddingLeft: "1.1rem" }}>
            {game.crew.map((c) => (
              <li key={c.id}>
                <strong>{c.nickname}</strong> — {c.firstName} {c.lastName} (
                {c.role.replaceAll("_", " ")}){" "}
                <span className="muted">{c.archetypeId.replaceAll("_", " ")}</span>
                {c.charmId && (
                  <span className="tag" style={{ marginLeft: 6 }}>
                    ✦ {c.charmId}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="choiceBtn"
            onClick={() => dispatch({ type: "CONTINUE_AFTER_CREW" })}
          >
            Begin first mission
          </button>
        </section>
      )}

      {game.meta.t === "play" && <PlayPanel game={game} dispatch={dispatch} />}

      <footer className="muted" style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
        Journal: {game.fieldJournal.length} entries · Flags: {game.seededFlags.join(", ") || "none"}
      </footer>
    </div>
  );
}

// ─── title screen ────────────────────────────────────────────────────────────

function TitleScreen({
  game,
  dispatch,
  hardReset,
}: {
  game: Game;
  dispatch: Dispatch;
  hardReset: () => void;
}) {
  const [confirmNew, setConfirmNew] = useState(false);
  const canResume = game.missions.length > 0;

  if (confirmNew) {
    return (
      <section className="panel">
        <h2>Start new campaign?</h2>
        {canResume && (
          <p style={{ color: "#e09a20" }}>
            Your current campaign will be overwritten. This cannot be undone.
          </p>
        )}
        <div className="choiceList">
          <button
            type="button"
            className="choiceBtn"
            onClick={() => dispatch({ type: "BEGIN_NEW_RUN" })}
          >
            Yes — start new campaign
          </button>
          <button type="button" className="choiceBtn" onClick={() => setConfirmNew(false)}>
            Cancel
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <p className="muted">WW2 tank crew survival.</p>
      <p>This game depicts war without sanitizing it.</p>
      <div className="choiceList">
        {canResume && (
          <>
            <div style={{ marginBottom: "0.25rem" }}>
              <span className="muted" style={{ fontSize: "0.9rem" }}>
                Saved campaign: Mission {game.missionIndex + 1}/{game.missions.length} · {game.tank.name}
              </span>
            </div>
            <button
              type="button"
              className="choiceBtn"
              style={{ borderColor: "var(--accent)" }}
              onClick={() => {
                const resumeMeta = game.resumeMeta ?? { t: "play" as const, sub: { t: "briefing" as const, step: "narrative" as const } };
                dispatch({ type: "LOAD_STATE", state: { ...game, meta: resumeMeta } });
              }}
            >
              Continue campaign — {game.tank.name} · Mission {game.missionIndex + 1}
            </button>
          </>
        )}
        <button
          type="button"
          className="choiceBtn"
          onClick={() => (canResume ? setConfirmNew(true) : dispatch({ type: "BEGIN_NEW_RUN" }))}
        >
          {canResume ? "New campaign (overwrite)" : "New campaign"}
        </button>
        <button
          type="button"
          className="choiceBtn"
          style={{ opacity: 0.6, fontSize: "0.85rem" }}
          onClick={() => hardReset()}
        >
          Clear all saves
        </button>
      </div>
    </section>
  );
}

// ─── HUD ─────────────────────────────────────────────────────────────────────

function Hud({ game }: { game: Game }) {
  const noFood = game.resources.foodDays <= 0;
  const noWater = game.resources.waterCanteens <= 0;
  const lowFood = !noFood && game.resources.foodDays <= 2;
  const lowWater = !noWater && game.resources.waterCanteens <= 2;

  return (
    <div className="panel" style={{ fontSize: "0.88rem" }}>
      <div className="row" style={{ marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.3rem" }}>
        <span className="tag">
          Mission {game.missionIndex + 1}/{game.missions.length}
        </span>
        <span className="tag">{game.seasonPhase}</span>
        <span className="tag">Salvage {game.salvagePoints}</span>
        <span className="tag">Hull {game.tank.healthPct}%</span>
        {game.tank.healthPct <= 30 && (
          <span className="tag" style={{ color: "#e05a5a" }}>
            Hull critical
          </span>
        )}
      </div>

      {/* Resources row */}
      <div className="muted" style={{ marginBottom: "0.3rem" }}>
        <strong>{game.tank.name}</strong> · AP {game.resources.ammoAP} HE {game.resources.ammoHE} WP{" "}
        {game.resources.ammoWP} HEAT {game.resources.ammoHEAT} · mags {game.resources.smallArmsMags} ·
        medkits {game.resources.medkits}
      </div>
      <div className="muted" style={{ marginBottom: "0.4rem" }}>
        <span style={{ color: noFood ? "#e05a5a" : lowFood ? "#e09a20" : "inherit" }}>
          Food {game.resources.foodDays}d{noFood ? " ⚠ STARVING" : lowFood ? " ⚠ low" : ""}
        </span>{" "}
        ·{" "}
        <span style={{ color: noWater ? "#e05a5a" : lowWater ? "#e09a20" : "inherit" }}>
          Water {game.resources.waterCanteens}{noWater ? " ⚠ DEHYDRATED" : lowWater ? " ⚠ low" : ""}
        </span>
      </div>

      {/* Crew row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {game.crew.map((c) => (
          <span
            key={c.id}
            className="tag"
            style={{ opacity: c.hp <= 0 ? 0.4 : 1, flexDirection: "column", alignItems: "flex-start", lineHeight: 1.4 }}
          >
            <span>
              <strong>{c.nickname}</strong> {c.role.replaceAll("_", " ")}
            </span>
            <span>
              HP {c.hp <= 0 ? "KIA" : c.hp} ·{" "}
              <span style={{ color: constitutionColor(c.constitution) }}>
                Nerve {c.constitution}
              </span>
            </span>
            {c.traumaStates.length > 0 && (
              <span style={{ color: "#e05a5a", fontSize: "0.82rem" }}>
                {c.traumaStates.map((t) => TRAUMA_LABELS[t] ?? t).join(" · ")}
              </span>
            )}
            {c.scars.length > 0 && (
              <span style={{ color: "#888", fontSize: "0.78rem" }}>
                Scars: {c.scars.map((s) => s.text).join("; ")}
              </span>
            )}
            {c.coveringRole && (
              <span className="muted" style={{ fontSize: "0.82rem" }}>
                covering {c.coveringRole}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Broken components */}
      {Object.entries(game.tank.components).some(([, v]) => v !== "ok") && (
        <div className="muted" style={{ marginTop: "0.4rem", fontSize: "0.82rem" }}>
          Damaged:{" "}
          {Object.entries(game.tank.components)
            .filter(([, v]) => v !== "ok")
            .map(([k, v]) => `${k.replaceAll("_", " ")} (${v})`)
            .join(", ")}
        </div>
      )}
    </div>
  );
}

// ─── play panel ──────────────────────────────────────────────────────────────

function PlayPanel({ game, dispatch }: { game: Game; dispatch: Dispatch }) {
  const m = missionAt(game);
  const sub = game.meta.t === "play" ? game.meta.sub : null;
  if (!m || !sub) return null;

  if (sub.t === "end") {
    return <EndPanel game={game} dispatch={dispatch} sub={sub} />;
  }

  const hud = <Hud game={game} />;

  if (sub.t === "between_missions") {
    const beat = game.socialBeat;
    const ss = sub.socialStep;
    return (
      <>
        {hud}
        <section className="panel">
          <h2>Between missions</h2>
          {ss === "narrative" && beat && (
            <>
              {beat.atmosphere && <p className="atmosphere">{beat.atmosphere}</p>}
              <p style={{ whiteSpace: "pre-wrap" }}>{beat.narrative}</p>
              {beat.quote && <p style={{ fontStyle: "italic" }}>{beat.quote}</p>}
              {beat.preChoiceNpc && (
                <div className="speech-block">
                  <span className="speech-speaker">{beat.preChoiceNpc.speaker}</span>
                  <span className="speech-line">"{beat.preChoiceNpc.line}"</span>
                </div>
              )}
              <button type="button" className="choiceBtn" onClick={() => dispatch({ type: "EVENT_CONTINUE" })}>
                Continue
              </button>
            </>
          )}
          {ss === "choose" && beat && (
            <ChoosePanel ev={beat} game={game} dispatch={dispatch} subT="briefing" panelContext="meta" />
          )}
          {ss === "outcome" && game.pendingOutcome && (
            <>
              {game.pendingOutcome.choice.dialogueLine && (
                <p className="dialogue-line">"{game.pendingOutcome.choice.dialogueLine}"</p>
              )}
              <p style={{ whiteSpace: "pre-wrap" }}>{game.pendingOutcome.displayText}</p>
              {game.pendingOutcome.choice.npcReply && (
                <div className="speech-block" style={{ borderColor: "#4a6070", background: "rgba(74,96,112,0.06)" }}>
                  <span className="speech-line">{game.pendingOutcome.choice.npcReply}</span>
                </div>
              )}
              {beat?.postQuote && <p style={{ fontStyle: "italic" }}>{beat.postQuote}</p>}
              <button type="button" className="choiceBtn" onClick={() => dispatch({ type: "OUTCOME_CONTINUE" })}>
                Next
              </button>
            </>
          )}
          {!ss && (
            <>
              {beat ? (
                <>
                  {beat.atmosphere && <p className="atmosphere">{beat.atmosphere}</p>}
                  <p style={{ whiteSpace: "pre-wrap" }}>{beat.narrative}</p>
                  {beat.quote && <p style={{ fontStyle: "italic" }}>{beat.quote}</p>}
                </>
              ) : (
                <p className="muted">Repairs, rumors, and whatever passes for rest.</p>
              )}
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "BETWEEN_MISSIONS_CONTINUE" })}
              >
                Continue to next mission
              </button>
            </>
          )}
        </section>
      </>
    );
  }

  if (sub.t === "tank_replacement") {
    const ev = game.tankReplacementBeat;
    return (
      <>
        {hud}
        <section className="panel">
          <h2>Tank replacement</h2>
          {!ev ? (
            <p className="muted">Division needs a hull decision.</p>
          ) : sub.step === "narrative" ? (
            <>
              <p style={{ whiteSpace: "pre-wrap" }}>{ev.narrative}</p>
              {ev.quote && <p style={{ fontStyle: "italic" }}>{ev.quote}</p>}
              <button type="button" className="choiceBtn" onClick={() => dispatch({ type: "EVENT_CONTINUE" })}>
                Continue
              </button>
            </>
          ) : sub.step === "choose" ? (
            <ChoosePanel ev={ev} game={game} dispatch={dispatch} subT="briefing" panelContext="meta" />
          ) : sub.step === "outcome" && game.pendingOutcome ? (
            <>
              {game.pendingOutcome.choice.dialogueLine && (
                <p className="dialogue-line">"{game.pendingOutcome.choice.dialogueLine}"</p>
              )}
              <p style={{ whiteSpace: "pre-wrap" }}>{game.pendingOutcome.displayText}</p>
              {game.pendingOutcome.choice.npcReply && (
                <div className="speech-block" style={{ borderColor: "#4a6070", background: "rgba(74,96,112,0.06)" }}>
                  <span className="speech-line">{game.pendingOutcome.choice.npcReply}</span>
                </div>
              )}
              {ev.postQuote && <p style={{ fontStyle: "italic" }}>{ev.postQuote}</p>}
              <button type="button" className="choiceBtn" onClick={() => dispatch({ type: "OUTCOME_CONTINUE" })}>
                Next
              </button>
            </>
          ) : null}
        </section>
      </>
    );
  }

  if (sub.t === "debrief") {
    const hasDead = game.crew.some((c) => c.hp <= 0);
    return (
      <>
        {hud}
        <section className="panel">
          <h2>Debrief stop</h2>
          <p className="muted">
            {sub.picksRemaining} action{sub.picksRemaining !== 1 ? "s" : ""} remaining.
          </p>
          <div className="choiceList">
            <button
              type="button"
              className="choiceBtn"
              onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "resupply" })}
            >
              Resupply — food, water, ammo
            </button>
            <button
              type="button"
              className="choiceBtn"
              onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "repair" })}
            >
              Repair — fix one component or patch hull
            </button>
            <button
              type="button"
              className="choiceBtn"
              onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "rest" })}
            >
              Rest — +constitution, clear minor trauma
            </button>
            {hasDead && (
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "replace_crew" })}
              >
                Replace fallen crewman
              </button>
            )}
            {game.salvagePoints >= 3 && (
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "salvage_ammo_bundle" })}
              >
                Spend 3 salvage → ammo bundle (AP + HE)
              </button>
            )}
            {game.salvagePoints >= 3 && (
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "salvage_wp_round" })}
              >
                Spend 3 salvage → +2 WP rounds
              </button>
            )}
            {game.salvagePoints >= 5 && (
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "salvage_armor_patch" })}
              >
                Spend 5 salvage → armor patch (mitigate next hull hits)
              </button>
            )}
            {game.salvagePoints >= 2 && (
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "salvage_field_rations" })}
              >
                Spend 2 salvage → field rations (+2 food and water)
              </button>
            )}
            {game.salvagePoints >= 4 && game.missionIndex + 1 < game.missions.length && (
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "salvage_intel_brief" })}
              >
                Spend 4 salvage → intel on next mission
              </button>
            )}
            {game.salvagePoints >= 3 && (
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "salvage_spend" })}
              >
                Spend 3 salvage → +1 medkit
              </button>
            )}
            {game.resources.medkits > 0 && game.crew.some((c) => c.hp > 0 && c.hp < 80) && (
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "DEBRIEF_ACTION", action: "medkit_heal" })}
              >
                Use medkit — heal most-wounded crew ({game.resources.medkits} left)
              </button>
            )}
          </div>
        </section>
      </>
    );
  }

  if (sub.t === "day_intro") {
    const day = m.days[sub.day];
    const basicWarn = day ? envWarning(day.environment) : null;
    const compoundWarn = day
      ? conditionWarning(day.environment, game, day.events)
      : null;
    // Use compound warning if available (more informative), fall back to basic
    const warn = compoundWarn ?? basicWarn;
    return (
      <>
        {hud}
        <section className="panel">
          <h2>
            Day {sub.day + 1} — {day ? envLabel(day.environment) : "—"}
          </h2>
          {warn && <p style={{ fontStyle: "italic", color: "#e09a20" }}>{warn}</p>}
          {game.missionIntelHint && (
            <p
              style={{
                borderLeft: "3px solid #6a9e6a",
                paddingLeft: "0.75rem",
                fontStyle: "italic",
                marginTop: "0.5rem",
              }}
            >
              Intel: {game.missionIntelHint}
            </p>
          )}
          <button
            type="button"
            className="choiceBtn"
            onClick={() => dispatch({ type: "DAY_INTRO_CONTINUE" })}
          >
            Enter the day
          </button>
        </section>
      </>
    );
  }

  // briefing / event / foot
  let ev: typeof m.briefingEvent | undefined;
  if (sub.t === "briefing") ev = m.briefingEvent;
  else if (sub.t === "foot") ev = game.footEvents?.[sub.index];
  else if (sub.t === "event") ev = m.days[sub.day]?.events[sub.eventIndex];

  if (sub.t === "briefing" || sub.t === "event" || sub.t === "foot") {
    if (!ev) return <p className="muted">No event loaded.</p>;
    return (
      <>
        {hud}
        <section className="panel">
          <div className="row" style={{ flexWrap: "wrap", gap: "0.3rem" }}>
            <span className="tag">{ev.kind.replaceAll("_", " ")}</span>
            {sub.t === "event" && (
              <span className="tag">
                Day {sub.day + 1} · beat {sub.eventIndex + 1}/
                {m.days[sub.day]?.events.length ?? 0}
              </span>
            )}
            {sub.t === "foot" && (
              <span className="tag">
                On foot · beat {sub.index + 1}/{game.footEvents?.length ?? 0}
              </span>
            )}
            {sub.t === "briefing" && <span className="tag">Briefing</span>}
          </div>
          <h2 style={{ marginBottom: 0 }}>{m.title}</h2>
          <p className="muted" style={{ marginTop: "0.25rem" }}>
            {m.objective}
          </p>

          {sub.step === "narrative" && (
            <>
              {ev.atmosphere && <p className="atmosphere">{ev.atmosphere}</p>}
              <p style={{ whiteSpace: "pre-wrap" }}>{ev.narrative}</p>
              {ev.quote && <p style={{ fontStyle: "italic" }}>{ev.quote}</p>}
              {ev.preChoiceNpc && (
                <div className="speech-block">
                  <span className="speech-speaker">{ev.preChoiceNpc.speaker}</span>
                  <span className="speech-line">"{ev.preChoiceNpc.line}"</span>
                </div>
              )}
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "EVENT_CONTINUE" })}
              >
                Continue
              </button>
            </>
          )}

          {sub.step === "choose" && (
            <ChoosePanel
              ev={ev}
              game={game}
              dispatch={dispatch}
              subT={sub.t}
            />
          )}

          {sub.step === "outcome" && game.pendingOutcome && (
            <>
              {game.pendingOutcome.choice.dialogueLine && (
                <p className="dialogue-line">"{game.pendingOutcome.choice.dialogueLine}"</p>
              )}
              <p style={{ whiteSpace: "pre-wrap" }}>{game.pendingOutcome.displayText}</p>
              {game.pendingOutcome.choice.npcReply && (
                <div className="speech-block" style={{ borderColor: "#4a6070", background: "rgba(74,96,112,0.06)" }}>
                  <span className="speech-line">{game.pendingOutcome.choice.npcReply}</span>
                </div>
              )}
              {ev.postQuote && <p style={{ fontStyle: "italic" }}>{ev.postQuote}</p>}
              <ArchetypeQuoteDisplay game={game} moment="win" />
              <button
                type="button"
                className="choiceBtn"
                onClick={() => dispatch({ type: "OUTCOME_CONTINUE" })}
              >
                Next
              </button>
            </>
          )}
        </section>
      </>
    );
  }

  return null;
}

// ─── choose panel with crew support ──────────────────────────────────────────

function ChoosePanel({
  ev,
  game,
  dispatch,
  subT,
  panelContext = "mission",
}: {
  ev: RuntimeEvent;
  game: Game;
  dispatch: Dispatch;
  subT: "briefing" | "event" | "foot";
  panelContext?: "mission" | "meta";
}) {
  const [showSupport, setShowSupport] = useState(false);
  const [supportTarget, setSupportTarget] = useState<Role | "">("");

  const liveCrew = game.crew.filter((c) => c.hp > 0);
  const alreadySupported = game.supportUsedThisEvent ?? [];
  const availableSupporters = liveCrew.filter((c) => !alreadySupported.includes(c.role));

  const frozenRoles = new Set(
    game.crew.filter((c) => c.traumaStates.includes("frozen") && c.hp > 0).map((c) => c.role),
  );

  const isMission = panelContext === "mission";

  return (
    <>
      {ev.atmosphere && <p className="atmosphere">{ev.atmosphere}</p>}
      <p style={{ whiteSpace: "pre-wrap" }}>{ev.narrative}</p>
      {ev.quote && <p style={{ fontStyle: "italic" }}>{ev.quote}</p>}
      {ev.preChoiceNpc && (
        <div className="speech-block">
          <span className="speech-speaker">{ev.preChoiceNpc.speaker}</span>
          <span className="speech-line">"{ev.preChoiceNpc.line}"</span>
        </div>
      )}
      {isMission && ev.enemy && (
        <div className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          {ev.enemy.label && <span className="tag">{ev.enemy.label}</span>}{" "}
          {ev.enemy.idealAmmo && (
            <span className="tag">
              Ideal: {ev.enemy.idealAmmo}{" "}
              {ev.enemy.idealAmmo && (() => {
                const key = `ammo${ev.enemy.idealAmmo}` as keyof typeof game.resources;
                const qty = game.resources[key] as number;
                return qty <= 0 ? <span style={{ color: "#e05a5a" }}>(NONE)</span> : <span>({qty})</span>;
              })()}
            </span>
          )}
          {ev.enemy.combatMod != null && ev.enemy.combatMod !== 0 && (
            <span className="tag" style={{ color: "#e05a5a" }}>
              Combat {ev.enemy.combatMod >= 0 ? "+" : ""}{ev.enemy.combatMod}
            </span>
          )}
        </div>
      )}

      {isMission && subT === "event" && ev.useDice && ev.enemy?.idealAmmo && (
        <div className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", marginBottom: "0.35rem" }}>Loader doctrine</span>
          <div className="row" style={{ flexWrap: "wrap", gap: "0.35rem" }}>
            <button
              type="button"
              className="choiceBtn"
              style={{ fontSize: "0.85rem" }}
              onClick={() => dispatch({ type: "SET_LOADER_AMMO_DOCTRINE", useRecommended: true })}
            >
              Recommend {ev.enemy.idealAmmo} (+1 next combat roll)
            </button>
            <button
              type="button"
              className="choiceBtn"
              style={{ fontSize: "0.85rem" }}
              onClick={() => dispatch({ type: "SET_LOADER_AMMO_DOCTRINE", useRecommended: false })}
            >
              Commander override (no doctrine bonus)
            </button>
          </div>
          {(game.loaderAmmoDoctrineBonus ?? 0) > 0 && (
            <span className="tag" style={{ marginTop: "0.35rem", display: "inline-block" }}>
              Doctrine: +1 when you fire {ev.enemy.idealAmmo}
            </span>
          )}
        </div>
      )}

      <p className="muted">Choose (keys 1–{ev.choices.length}):</p>
      <div className="choiceList">
        {ev.choices.map((ch, i) => {
          const actorFrozen = ch.role ? frozenRoles.has(ch.role) : false;
          return (
            <button
              key={ch.id}
              type="button"
              className="choiceBtn"
              style={actorFrozen ? { borderColor: "#e05a5a", opacity: 0.8 } : undefined}
              onClick={() => dispatch({ type: "CHOOSE_OPTION", choiceId: ch.id })}
            >
              <kbd>{i + 1}</kbd>
              {ch.label}
              {ch.role && (
                <span className="muted" style={{ marginLeft: 6 }}>
                  [{ch.role.replaceAll("_", " ")}
                  {actorFrozen ? " — FROZEN" : ""}]
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Charm use buttons */}
      {isMission &&
        subT !== "briefing" &&
        game.crew.some((c) => c.hp > 0 && c.charmId && !c.charmUsedThisMission) && (
        <div style={{ marginTop: "0.5rem" }}>
          {game.crew
            .filter((c) => c.hp > 0 && c.charmId && !c.charmUsedThisMission)
            .map((c) => {
              const charm = c.charmId ? CHARM_CATALOG[c.charmId] : undefined;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="choiceBtn"
                  style={{ background: "transparent", borderStyle: "dashed", fontSize: "0.85rem", borderColor: "#b8860b" }}
                  onClick={() => dispatch({ type: "USE_CHARM", role: c.role })}
                >
                  ✦ {c.nickname} uses {charm?.name ?? c.charmId} [{charm?.rarity}]
                </button>
              );
            })}
        </div>
      )}

      {/* Medkit quick-use during events */}
      {isMission &&
        subT !== "briefing" &&
        game.resources.medkits > 0 &&
        game.crew.some((c) => c.hp > 0 && c.hp < 70) && (
        <div style={{ marginTop: "0.5rem" }}>
          {game.crew.filter((c) => c.hp > 0 && c.hp < 70).map((c) => (
            <button
              key={c.id}
              type="button"
              className="choiceBtn"
              style={{ background: "transparent", borderStyle: "dashed", fontSize: "0.85rem" }}
              onClick={() => dispatch({ type: "USE_MEDKIT", target: c.role })}
            >
              Medkit → {c.nickname} (HP {c.hp}) — {game.resources.medkits} left
            </button>
          ))}
        </div>
      )}

      {/* Crew support action — available on event/foot only, not briefing */}
      {isMission && subT !== "briefing" && availableSupporters.length >= 2 && (
        <div style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="choiceBtn"
            style={{ background: "transparent", borderStyle: "dashed", fontSize: "0.9rem" }}
            onClick={() => setShowSupport((v) => !v)}
          >
            {showSupport ? "Hide" : "▼ Crew support action"}
          </button>

          {showSupport && (
            <SupportPanel
              liveCrew={liveCrew}
              alreadySupported={alreadySupported}
              supportTarget={supportTarget}
              setSupportTarget={setSupportTarget}
              dispatch={dispatch}
              onDone={() => setShowSupport(false)}
            />
          )}
        </div>
      )}
    </>
  );
}

// ─── end panel ───────────────────────────────────────────────────────────────

function EndPanel({
  game,
  dispatch,
  sub,
}: {
  game: Game;
  dispatch: Dispatch;
  sub: { t: "end"; won: boolean; reason: string };
}) {
  const importMoments = useJournalStore((s) => s.importMoments);
  const recordCrewFates = useJournalStore((s) => s.recordCrewFates);
  const recordTankFate = useJournalStore((s) => s.recordTankFate);

  useEffect(() => {
    // Record this campaign's data into cross-campaign journal
    importMoments(game.fieldJournal, game.runSeed);
    recordCrewFates(game.crew, game.runSeed);
    recordTankFate(
      game.tank.name,
      game.tank.healthPct <= 0 ? "lost" : "operational",
      game.runSeed,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="panel">
      <h2>{sub.won ? "End of the road" : "Lost"}</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>{sub.reason}</p>

      {game.crew.length > 0 && (
        <>
          <h3 style={{ marginBottom: "0.3rem" }}>Crew fate</h3>
          <ul style={{ paddingLeft: "1.1rem" }}>
            {game.crew.map((c) => (
              <li key={c.id}>
                <strong>{c.nickname}</strong> {c.firstName} {c.lastName} ({c.role.replaceAll("_", " ")}){" "}
                — {c.hp > 0 ? `survived · HP ${c.hp}` : "KIA"}
                {c.scars.length > 0 && (
                  <span className="muted"> · scars: {c.scars.map((s) => s.text).join("; ")}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {game.fieldJournal.length > 0 && (
        <>
          <h3 style={{ marginBottom: "0.3rem" }}>Run journal</h3>
          <ul style={{ paddingLeft: "1.1rem" }}>
            {game.fieldJournal.slice(-16).map((e) => (
              <li key={e.id} className="muted">
                {e.text}
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        type="button"
        className="choiceBtn"
        onClick={() => dispatch({ type: "ABANDON_TO_TITLE" })}
      >
        Return to main menu
      </button>
    </section>
  );
}

// ─── field journal modal ─────────────────────────────────────────────────────

function JournalModal({ onClose }: { onClose: () => void }) {
  const journal = useJournalStore((s) => s.journal);
  const clearJournal = useJournalStore((s) => s.clearJournal);
  const game = useGameStore((s) => s.game);
  const [tab, setTab] = useState<"moments" | "crew" | "tanks">("moments");

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "2rem 1rem", overflowY: "auto",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#1a1a1a", border: "1px solid #444", padding: "1.5rem", maxWidth: 700, width: "100%" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Field Journal</h2>
          <button type="button" className="choiceBtn" onClick={onClose}>Close</button>
        </div>

        {/* Current run journal if in-campaign */}
        {game.fieldJournal.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem" }}>This campaign</h3>
            <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
              {game.fieldJournal.map((e) => (
                <li key={e.id} className="muted" style={{ marginBottom: "0.2rem" }}>
                  <span className="tag" style={{ marginRight: "0.3rem", fontSize: "0.75rem" }}>{e.kind}</span>
                  {e.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Charms on current crew */}
        {game.crew.some((c) => c.charmId) && (
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem" }}>Current charms</h3>
            <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
              {game.crew.filter((c) => c.charmId).map((c) => {
                const charm = c.charmId ? CHARM_CATALOG[c.charmId] : undefined;
                return (
                  <li key={c.id} className="muted">
                    <strong>{c.nickname}</strong> — {charm?.name ?? c.charmId}{" "}
                    <span className="tag">{charm?.rarity}</span>
                    {c.charmUsedThisMission && <span className="muted"> (used)</span>}
                    <br /><span style={{ fontSize: "0.82rem" }}>{charm?.flavor}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Cross-campaign tabs */}
        <h3 style={{ margin: "1rem 0 0.5rem" }}>Campaign history</h3>
        {journal.moments.length === 0 && journal.crew.length === 0 && journal.tanks.length === 0 && (
          <p className="muted">No history yet. Complete a campaign to record it here.</p>
        )}
        {(journal.moments.length > 0 || journal.crew.length > 0 || journal.tanks.length > 0) && (
          <>
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.7rem" }}>
              {(["moments", "crew", "tanks"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="choiceBtn"
                  style={{ background: tab === t ? "#333" : "transparent", fontSize: "0.85rem" }}
                  onClick={() => setTab(t)}
                >
                  {t} ({t === "moments" ? journal.moments.length : t === "crew" ? journal.crew.length : journal.tanks.length})
                </button>
              ))}
            </div>

            {tab === "moments" && (
              <ul style={{ paddingLeft: "1.1rem", maxHeight: 300, overflowY: "auto" }}>
                {[...journal.moments].reverse().map((m) => (
                  <li key={m.id} className="muted" style={{ marginBottom: "0.2rem" }}>
                    <span className="tag" style={{ fontSize: "0.75rem", marginRight: "0.3rem" }}>{m.kind}</span>
                    {m.text}
                  </li>
                ))}
              </ul>
            )}

            {tab === "crew" && (
              <ul style={{ paddingLeft: "1.1rem", maxHeight: 300, overflowY: "auto" }}>
                {journal.crew.map((c, i) => (
                  <li key={i} className="muted" style={{ marginBottom: "0.3rem" }}>
                    <strong>{c.nickname}</strong> {c.firstName} {c.lastName} · {c.role} ·{" "}
                    <span style={{ color: c.fate === "kia" ? "#e05a5a" : "#6a9" }}>
                      {c.fate.toUpperCase()}
                    </span>
                    {c.scars.length > 0 && (
                      <span> · scars: {c.scars.join("; ")}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {tab === "tanks" && (
              <ul style={{ paddingLeft: "1.1rem" }}>
                {journal.tanks.map((t, i) => (
                  <li key={i} className="muted">
                    <strong>{t.name}</strong> ·{" "}
                    <span style={{ color: t.fate === "lost" ? "#e05a5a" : "#6a9" }}>
                      {t.fate}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="choiceBtn"
              style={{ marginTop: "1rem", fontSize: "0.8rem", opacity: 0.6 }}
              onClick={() => { clearJournal(); }}
            >
              Clear history
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── archetype quote display ──────────────────────────────────────────────────

import type { QuoteMoment } from "../content/quotes";

function ArchetypeQuoteDisplay({
  game,
  moment,
}: {
  game: Game;
  moment: QuoteMoment;
}) {
  // Pick a random living crew member to quote
  const living = game.crew.filter((c) => c.hp > 0);
  if (living.length === 0) return null;
  const idx = game.rngCounter % living.length;
  const speaker = living[idx];
  if (!speaker) return null;
  const quote = getArchetypeQuote(speaker.archetypeId, moment, game.runSeed, game.rngCounter + 999);
  if (!quote) return null;
  return (
    <p style={{ fontStyle: "italic", color: "#9a8a74", marginTop: "0.5rem" }}>
      {speaker.nickname}: "{quote}"
    </p>
  );
}

function SupportPanel({
  liveCrew,
  alreadySupported,
  supportTarget,
  setSupportTarget,
  dispatch,
  onDone,
}: {
  liveCrew: Game["crew"];
  alreadySupported: Role[];
  supportTarget: Role | "";
  setSupportTarget: (r: Role | "") => void;
  dispatch: Dispatch;
  onDone: () => void;
}) {
  const [supporterRole, setSupporterRole] = useState<Role | "">("");
  const availableSupporters = liveCrew.filter((c) => !alreadySupported.includes(c.role));

  return (
    <div className="panel" style={{ marginTop: "0.5rem", borderStyle: "dashed" }}>
      <p className="muted" style={{ margin: "0 0 0.5rem" }}>
        One crew member supports another: restores 15–25 nerve, may clear minor trauma. Forfeits
        their role action.
      </p>
      <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
        <select
          value={supporterRole}
          onChange={(e) => setSupporterRole(e.target.value as Role | "")}
          style={{ background: "#1a1a1a", color: "#c8b89a", border: "1px solid #444", padding: "0.3rem" }}
        >
          <option value="">— supporter —</option>
          {availableSupporters.map((c) => (
            <option key={c.id} value={c.role}>
              {c.nickname} ({c.role.replaceAll("_", " ")})
            </option>
          ))}
        </select>
        <select
          value={supportTarget}
          onChange={(e) => setSupportTarget(e.target.value as Role | "")}
          style={{ background: "#1a1a1a", color: "#c8b89a", border: "1px solid #444", padding: "0.3rem" }}
        >
          <option value="">— target —</option>
          {liveCrew
            .filter((c) => c.role !== supporterRole)
            .map((c) => (
              <option key={c.id} value={c.role}>
                {c.nickname} ({c.role.replaceAll("_", " ")}) · Nerve {c.constitution}
                {c.traumaStates.length ? ` · ${c.traumaStates[0]}` : ""}
              </option>
            ))}
        </select>
        <button
          type="button"
          className="choiceBtn"
          disabled={!supporterRole || !supportTarget || supporterRole === supportTarget}
          onClick={() => {
            if (!supporterRole || !supportTarget) return;
            dispatch({ type: "CREW_SUPPORT", supporter: supporterRole as Role, target: supportTarget as Role });
            onDone();
          }}
        >
          Confirm support
        </button>
      </div>
    </div>
  );
}
