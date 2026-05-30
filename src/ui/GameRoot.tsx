import { memo, useCallback, useEffect, useState, type ReactNode } from "react";
import { useGameStore } from "../store/gameStore";
import { useJournalStore } from "../store/journalStore";
import type {
  Difficulty,
  EnvironmentId,
  FieldJournalEntry,
  Role,
  RuntimeEvent,
  StakesLevel,
  TankType,
} from "../engine/types";
import { formatRank } from "../content/ranks";
import type { QuoteMoment } from "../content/quotes";
import { CHARM_CATALOG } from "../content/charms";
import { TANK_TYPE_PROFILES } from "../engine/config";
import type { PlaySub } from "../engine/types";
import { conditionWarning } from "../engine/reducer";
import {
  choicesForEncounterStep,
  primaryChoiceFromState,
  reactionDisplayText,
} from "../engine/encounterFlow";
import { ActivityFeed } from "./ActivityFeed";
import { CampaignStatusBar } from "./CampaignStatusBar";
import { envLabel } from "./campaignStatus";
import { ChoiceList } from "./ChoiceList";
import { OutcomePanel } from "./OutcomePanel";
import { TankCrewPanel } from "./TankCrewPanel";
import { persistSplashSkip, shouldSkipSplash, SplashScreen } from "./SplashScreen";
import { formatObjectiveSecret } from "../content/personalObjectives";
import { ACHIEVEMENT_CATALOG } from "../content/achievements";
import { AchievementToastStack } from "./AchievementToastStack";

// ─── labels ──────────────────────────────────────────────────────────────────

function envWarning(env: EnvironmentId): string | null {
  if (env === "scorching_heat") return "Water burns faster in this heat.";
  if (env === "blizzard" || env === "ice") return "Ice in the bones. Every noise is a threat.";
  if (env === "thick_fog" || env === "heavy_rain") return "Fog and rain. The kind of morning that gets people killed.";
  if (env === "deep_mud" || env === "thaw_mud") return "Ground is soft. Tracks are working for it.";
  if (env === "hard_freeze") return "Engine doesn't like the cold.";
  return null;
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
  const [showSplash, setShowSplash] = useState(() => !shouldSkipSplash());

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (game.meta.t !== "play") return;
      const sub = game.meta.sub;
      const m = missionAt(game);
      let ev: RuntimeEvent | undefined;
      if (sub.t === "event" || sub.t === "foot" || sub.t === "briefing") {
        if (sub.step !== "choose" && sub.step !== "followup_choose") return;
        ev =
          sub.t === "foot"
            ? game.footEvents?.[sub.index]
            : sub.t === "briefing"
              ? m?.briefingEvent
              : m?.days[sub.day]?.events[sub.eventIndex];
      } else if (
        sub.t === "between_missions" &&
        (sub.socialStep === "choose" || sub.socialStep === "followup_choose")
      ) {
        ev = game.socialBeat;
      } else if (
        sub.t === "tank_replacement" &&
        (sub.step === "choose" || sub.step === "followup_choose")
      ) {
        ev = game.tankReplacementBeat;
      } else {
        return;
      }
      if (!ev) return;
      const list = choicesForEncounterStep(game, ev);
      const n = Number(e.key);
      if (n >= 1 && n <= list.length) {
        const ch = list[n - 1];
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

      <header className="app-header row">
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

      <AchievementToastStack game={game} />

      {game.meta.t === "title" && showSplash && (
        <SplashScreen
          onContinue={(skipNext) => {
            persistSplashSkip(skipNext);
            setShowSplash(false);
          }}
        />
      )}

      {game.meta.t === "title" && !showSplash && (
        <TitleScreen
          game={game}
          dispatch={dispatch}
          hardReset={hardReset}
          onShowBriefing={() => setShowSplash(true)}
        />
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
                  <span style={{ fontSize: "0.8em", opacity: 0.7 }}>
                    {" "}
                    · {prof.startHealthPct}% hull · {prof.passiveLabel}
                  </span>
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
                {formatRank(c.rank)} {c.firstName} '<strong>{c.nickname}</strong>' {c.lastName} (
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

      <footer className="app-footer muted">
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
  onShowBriefing,
}: {
  game: Game;
  dispatch: Dispatch;
  hardReset: () => void;
  onShowBriefing: () => void;
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
    <section className="panel panel--compact">
      <p className="muted" style={{ marginBottom: "0.5rem" }}>
        WW2 tank crew survival · R-rated · saved locally in this browser
      </p>
      <div className="choiceList" style={{ marginTop: "0.5rem" }}>
        <button
          type="button"
          className="choiceBtn"
          style={{ fontSize: "0.85rem" }}
          onClick={onShowBriefing}
        >
          Campaign briefing — how to read the UI
        </button>
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

function PlayShell({
  game,
  sub,
  children,
}: {
  game: Game;
  sub: PlaySub;
  children: ReactNode;
}) {
  const objectiveLine = formatObjectiveSecret(game);
  return (
    <div className="playLayout">
      <div className="playLayout__top">
        <CampaignStatusBar game={game} sub={sub} />
        {objectiveLine && (
          <p className="hidden-objective" title="Personal objective — revealed at mission end">
            {objectiveLine}
          </p>
        )}
        <ActivityFeed game={game} />
      </div>
      <div className="playLayout__main">{children}</div>
      <TankCrewPanel game={game} />
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

  if (sub.t === "between_missions") {
    const beat = game.socialBeat;
    const ss = sub.socialStep;
    return (
      <PlayShell game={game} sub={sub}>
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
          {ss === "react" && beat && (
            <EncounterReactPanel
              game={game}
              ev={beat}
              onContinue={() => dispatch({ type: "EVENT_CONTINUE" })}
            />
          )}
          {ss === "choose" && beat && (
            <ChoosePanel ev={beat} game={game} dispatch={dispatch} subT="briefing" panelContext="meta" />
          )}
          {ss === "followup_choose" && beat && (
            <ChoosePanel
              ev={beat}
              game={game}
              dispatch={dispatch}
              subT="briefing"
              panelContext="meta"
              followUpOnly
            />
          )}
          {ss === "outcome" && game.pendingOutcome && (
            <OutcomePanel
              game={game}
              pending={game.pendingOutcome}
              ev={beat}
              moment="win"
              onContinue={() => dispatch({ type: "OUTCOME_CONTINUE" })}
            />
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
      </PlayShell>
    );
  }

  if (sub.t === "tank_replacement") {
    const ev = game.tankReplacementBeat;
    return (
      <PlayShell game={game} sub={sub}>
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
          ) : sub.step === "react" ? (
            <EncounterReactPanel game={game} ev={ev} onContinue={() => dispatch({ type: "EVENT_CONTINUE" })} />
          ) : sub.step === "choose" ? (
            <ChoosePanel ev={ev} game={game} dispatch={dispatch} subT="briefing" panelContext="meta" />
          ) : sub.step === "followup_choose" ? (
            <ChoosePanel
              ev={ev}
              game={game}
              dispatch={dispatch}
              subT="briefing"
              panelContext="meta"
              followUpOnly
            />
          ) : sub.step === "outcome" && game.pendingOutcome ? (
            <OutcomePanel
              game={game}
              pending={game.pendingOutcome}
              ev={ev}
              moment="win"
              onContinue={() => dispatch({ type: "OUTCOME_CONTINUE" })}
            />
          ) : null}
        </section>
      </PlayShell>
    );
  }

  if (sub.t === "debrief") {
    const hasDead = game.crew.some((c) => c.hp <= 0);
    return (
      <PlayShell game={game} sub={sub}>
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
      </PlayShell>
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
      <PlayShell game={game} sub={sub}>
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
      </PlayShell>
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
      <PlayShell game={game} sub={sub}>
        <section className="panel">
          <div className="row" style={{ flexWrap: "wrap", gap: "0.3rem" }}>
            <span className="tag tag--inline">{ev.kind.replaceAll("_", " ")}</span>
            {sub.t === "event" && (
              <span className="tag tag--inline">
                Day {sub.day + 1} · beat {sub.eventIndex + 1}/
                {m.days[sub.day]?.events.length ?? 0}
              </span>
            )}
            {sub.t === "foot" && (
              <span className="tag tag--inline">
                On foot · beat {sub.index + 1}/{game.footEvents?.length ?? 0}
              </span>
            )}
            {sub.t === "briefing" && <span className="tag tag--inline">Briefing</span>}
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

          {sub.step === "react" && (
            <EncounterReactPanel
              game={game}
              ev={ev}
              onContinue={() => dispatch({ type: "EVENT_CONTINUE" })}
            />
          )}

          {sub.step === "choose" && (
            <ChoosePanel
              ev={ev}
              game={game}
              dispatch={dispatch}
              subT={sub.t}
            />
          )}

          {sub.step === "followup_choose" && (
            <ChoosePanel
              ev={ev}
              game={game}
              dispatch={dispatch}
              subT={sub.t}
              followUpOnly
            />
          )}

          {sub.step === "outcome" && game.pendingOutcome && (
            <OutcomePanel
              game={game}
              pending={game.pendingOutcome}
              ev={ev}
              moment={pickOutcomeMoment(game, sub.t)}
              onContinue={() => dispatch({ type: "OUTCOME_CONTINUE" })}
            />
          )}
        </section>
      </PlayShell>
    );
  }

  return null;
}

const CHARM_BTN_STYLE = { background: "transparent", borderStyle: "dashed", fontSize: "0.85rem", borderColor: "#b8860b" } as const;

const CharmButtons = memo(function CharmButtons({
  crew,
  dispatch,
}: {
  crew: Game["crew"];
  dispatch: Dispatch;
}) {
  const eligible = crew.filter((c) => c.hp > 0 && c.charmId && !c.charmUsedThisMission);
  if (eligible.length === 0) return null;
  return (
    <div style={{ marginTop: "0.5rem" }}>
      {eligible.map((c) => {
        const charm = c.charmId ? CHARM_CATALOG[c.charmId] : undefined;
        return (
          <button
            key={c.id}
            type="button"
            className="choiceBtn"
            style={CHARM_BTN_STYLE}
            onClick={() => dispatch({ type: "USE_CHARM", role: c.role })}
          >
            ✦ {c.nickname} uses {charm?.name ?? c.charmId} [{charm?.rarity}]
          </button>
        );
      })}
    </div>
  );
});

function stakesBannerClass(stakes?: StakesLevel): string {
  if (stakes === "critical") return "stakes-banner stakes-critical";
  if (stakes === "elevated") return "stakes-banner stakes-elevated";
  return "stakes-banner stakes-elevated";
}

// ─── choose panel with crew support ──────────────────────────────────────────

function EncounterReactPanel({
  game,
  ev,
  onContinue,
}: {
  game: Game;
  ev: RuntimeEvent;
  onContinue?: () => void;
}) {
  const primary = primaryChoiceFromState(game, ev);
  const text = primary ? reactionDisplayText(primary) : "";
  return (
    <>
      <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>
      {primary?.npcReply && (
        <p style={{ fontStyle: "italic", marginTop: "0.5rem" }}>{primary.npcReply}</p>
      )}
      {onContinue ? (
        <button type="button" className="choiceBtn" onClick={onContinue}>
          Continue
        </button>
      ) : null}
    </>
  );
}

function ChoosePanel({
  ev,
  game,
  dispatch,
  subT,
  panelContext = "mission",
  followUpOnly = false,
}: {
  ev: RuntimeEvent;
  game: Game;
  dispatch: Dispatch;
  subT: "briefing" | "event" | "foot";
  panelContext?: "mission" | "meta";
  followUpOnly?: boolean;
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
  const displayChoices = choicesForEncounterStep(game, ev);

  return (
    <>
      {!followUpOnly && ev.atmosphere && <p className="atmosphere">{ev.atmosphere}</p>}
      {!followUpOnly && <p style={{ whiteSpace: "pre-wrap" }}>{ev.narrative}</p>}
      {!followUpOnly && ev.quote && <p style={{ fontStyle: "italic" }}>{ev.quote}</p>}
      {!followUpOnly && ev.preChoiceNpc && (
        <div className="speech-block">
          <span className="speech-speaker">{ev.preChoiceNpc.speaker}</span>
          <span className="speech-line">"{ev.preChoiceNpc.line}"</span>
        </div>
      )}
      {followUpOnly && (
        <p className="muted" style={{ marginBottom: "0.5rem" }}>
          What happens next?
        </p>
      )}
      {isMission && !followUpOnly && ev.enemy && (
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
          {ev.stakes === "critical" && (
            <span className="tag" style={{ color: game.tank.healthPct <= 30 ? "#e05a5a" : "inherit" }}>
              Hull {game.tank.healthPct}%
            </span>
          )}
        </div>
      )}

      {isMission && !followUpOnly && subT === "event" && ev.useDice && ev.enemy?.idealAmmo && (
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

      {ev.stakesNote && (
        <p className={stakesBannerClass(ev.stakes)}>
          {ev.stakes === "critical" ? "High stakes — " : ""}
          {ev.stakesNote}
        </p>
      )}

      <ChoiceList
        ev={ev}
        choices={displayChoices}
        prompt={
          followUpOnly
            ? `What happens next? (keys 1–${displayChoices.length}):`
            : undefined
        }
        frozenRoles={frozenRoles}
        onChoose={(choiceId) => dispatch({ type: "CHOOSE_OPTION", choiceId })}
      />

      {/* Charm use buttons */}
      {isMission && subT !== "briefing" && (
        <CharmButtons crew={game.crew} dispatch={dispatch} />
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

      {/* Role abilities (§16.2) — Driver terrain read / Asst. Driver suppression */}
      {isMission && subT !== "briefing" && (() => {
        const isInfantry = ev.kind === "infantry_combat" || ev.kind === "defensive_stand";
        const driver = game.crew.find((c) => c.hp > 0 && (c.role === "driver" || c.coveringRole === "driver") && !c.roleAbilityUsed);
        const asstDriver = game.crew.find((c) => c.hp > 0 && (c.role === "asst_driver" || c.coveringRole === "asst_driver") && !c.roleAbilityUsed);
        const showDriver = !!driver;
        const showAsst = !!asstDriver && isInfantry;
        if (!showDriver && !showAsst) return null;
        return (
          <div style={{ marginTop: "0.5rem" }}>
            {showDriver && (
              <button
                type="button"
                className="choiceBtn"
                style={{ background: "transparent", borderStyle: "dashed", fontSize: "0.85rem", borderColor: "#4a8a6a" }}
                onClick={() => dispatch({ type: "USE_ROLE_ABILITY", role: "driver" })}
              >
                ◉ {driver!.nickname} — Terrain Read (once per mission)
              </button>
            )}
            {showAsst && (
              <button
                type="button"
                className="choiceBtn"
                style={{ background: "transparent", borderStyle: "dashed", fontSize: "0.85rem", borderColor: "#4a6a8a" }}
                onClick={() => dispatch({ type: "USE_ROLE_ABILITY", role: "asst_driver" })}
              >
                ◉ {asstDriver!.nickname} — Suppressing Fire (once per mission)
                {game.atSuppressed ? " ✓ ACTIVE" : ""}
              </button>
            )}
          </div>
        );
      })()}

      {/* Terrain preview hint from Driver ability */}
      {game.terrainPreviewHint && (
        <p style={{ fontStyle: "italic", color: "#4a8a6a", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          {game.terrainPreviewHint}
        </p>
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
  const recordCharmDiscovered = useJournalStore((s) => s.recordCharmDiscovered);

  useEffect(() => {
    importMoments(game.fieldJournal, game.runSeed);
    recordCrewFates(game.crew, game.runSeed);
    recordTankFate(
      game.tank.name,
      game.tank.healthPct <= 0 ? "lost" : "operational",
      game.runSeed,
    );
    for (const c of game.crew) {
      if (c.charmId) recordCharmDiscovered(c.charmId);
    }
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
                {formatRank(c.rank)} {c.firstName} '<strong>{c.nickname}</strong>' {c.lastName} ({c.role.replaceAll("_", " ")}){" "}
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

type JournalTab = "moments" | "discoveries" | "crew" | "tanks" | "charms" | "achievements";

function mergeDiscoveryEntries(...sources: FieldJournalEntry[][]): FieldJournalEntry[] {
  const byId = new Map<string, FieldJournalEntry>();
  for (const list of sources) {
    for (const e of list) {
      if (e.kind !== "discovery") continue;
      const prev = byId.get(e.id);
      if (!prev || (e.at ?? 0) >= (prev.at ?? 0)) byId.set(e.id, e);
    }
  }
  return [...byId.values()].sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
}

function JournalModal({ onClose }: { onClose: () => void }) {
  const journal = useJournalStore((s) => s.journal);
  const clearJournal = useJournalStore((s) => s.clearJournal);
  const game = useGameStore((s) => s.game);
  const [tab, setTab] = useState<JournalTab>("moments");
  const discoveries = mergeDiscoveryEntries(game.fieldJournal, journal.moments);
  const historyMoments = journal.moments.filter((m) => m.kind !== "discovery");

  return (
    <div
      className="journal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="journal-modal panel panel--compact">
        <div className="row journal-modal__header">
          <h2 style={{ margin: 0 }}>Field Journal</h2>
          <button type="button" className="choiceBtn choiceBtn--compact" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Current run journal if in-campaign */}
        {game.fieldJournal.length > 0 && (
          <div className="journal-modal__section">
            <h3 className="journal-modal__heading">This campaign</h3>
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
          <div className="journal-modal__section">
            <h3 className="journal-modal__heading">Current charms</h3>
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
        <h3 className="journal-modal__heading">Campaign history</h3>
        {historyMoments.length === 0 &&
          discoveries.length === 0 &&
          journal.crew.length === 0 &&
          journal.tanks.length === 0 && (
          <p className="muted">No history yet. Complete a campaign to record it here.</p>
        )}
        {(historyMoments.length > 0 ||
          discoveries.length > 0 ||
          journal.crew.length > 0 ||
          journal.tanks.length > 0) && (
          <>
            <div className="journal-tabs row">
              {(["moments", "discoveries", "crew", "tanks", "charms", "achievements"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`journal-tab choiceBtn choiceBtn--compact${tab === t ? " journal-tab--active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t}{" "}
                  ({t === "moments"
                    ? historyMoments.length
                    : t === "discoveries"
                      ? discoveries.length
                      : t === "crew"
                        ? journal.crew.length
                        : t === "tanks"
                          ? journal.tanks.length
                          : t === "achievements"
                          ? journal.unlockedAchievements.length
                          : Object.keys(CHARM_CATALOG).length})
                </button>
              ))}
            </div>

            {tab === "moments" && (
              <ul className="journal-scroll">
                {[...historyMoments].reverse().map((m) => (
                  <li key={m.id} className="muted" style={{ marginBottom: "0.2rem" }}>
                    <span className="tag tag--inline" style={{ fontSize: "0.75rem", marginRight: "0.3rem" }}>{m.kind}</span>
                    {m.text}
                  </li>
                ))}
              </ul>
            )}

            {tab === "discoveries" && (
              discoveries.length === 0 ? (
                <p className="muted">
                  No discoveries yet — names, charms, and strange luck write themselves here.
                </p>
              ) : (
                <ul className="journal-scroll">
                  {discoveries.map((d) => (
                    <li key={d.id} className="muted" style={{ marginBottom: "0.35rem" }}>
                      <span className="tag" style={{ fontSize: "0.75rem", marginRight: "0.3rem" }}>
                        discovery
                      </span>
                      {d.text}
                    </li>
                  ))}
                </ul>
              )
            )}

            {tab === "crew" && (
              <ul className="journal-scroll">
                {journal.crew.map((c, i) => (
                  <li key={i} className="muted" style={{ marginBottom: "0.3rem" }}>
                    {formatRank(c.rank)} {c.firstName} '<strong>{c.nickname}</strong>' {c.lastName} · {c.role} ·{" "}
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

            {tab === "charms" && (
              <ul className="journal-scroll">
                {Object.values(CHARM_CATALOG).map((ch) => {
                  const holder = game.crew.find((c) => c.charmId === ch.id);
                  const discovered = journal.discoveredCharmIds.includes(ch.id);
                  return (
                    <li key={ch.id} className="muted" style={{ marginBottom: "0.35rem" }}>
                      <strong>{discovered ? ch.name : "???"}</strong>{" "}
                      <span className="tag">{ch.rarity}</span>
                      {holder ? (
                        <span> — held by {holder.nickname}</span>
                      ) : discovered ? (
                        <span className="muted"> — seen before</span>
                      ) : (
                        <span className="muted"> — not in codex</span>
                      )}
                      <br />
                      <span style={{ fontSize: "0.82rem" }}>
                        {discovered ? ch.flavor : "Found in the field — name unknown until discovered."}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {tab === "achievements" && (
              <ul className="journal-scroll">
                {ACHIEVEMENT_CATALOG.map((a) => {
                  const unlocked = journal.unlockedAchievements.includes(a.id);
                  return (
                    <li key={a.id} className="muted" style={{ marginBottom: "0.35rem" }}>
                      <strong>{unlocked ? a.title : "???"}</strong>
                      <br />
                      <span style={{ fontSize: "0.82rem" }}>
                        {unlocked ? a.description : "Keep marching."}
                      </span>
                    </li>
                  );
                })}
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

function pickOutcomeMoment(game: Game, subT: "briefing" | "event" | "foot" | string): QuoteMoment {
  if (subT === "briefing") return "start";
  const living = game.crew.filter((c) => c.hp > 0);
  const anyTired = living.some((c) => c.constitution < 40);
  if (anyTired && subT === "foot") return "tired";
  const anyCritical = living.some((c) => c.hp <= 2);
  if (anyCritical) return "down";
  return "win";
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
              {formatRank(c.rank)} {c.firstName} '{c.nickname}' ({c.role.replaceAll("_", " ")})
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
                {formatRank(c.rank)} {c.firstName} '{c.nickname}' ({c.role.replaceAll("_", " ")}) · Nerve {c.constitution}
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
