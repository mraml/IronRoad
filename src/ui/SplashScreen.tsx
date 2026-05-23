import { useState } from "react";

const SPLASH_SKIP_KEY = "iron-road-splash-skip";

export function shouldSkipSplash(): boolean {
  try {
    return localStorage.getItem(SPLASH_SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function SplashScreen({ onContinue }: { onContinue: (skipNextTime: boolean) => void }) {
  const [skipNext, setSkipNext] = useState(false);

  return (
    <section className="splash panel">
      <p className="splash__kicker">European Theater · 1944–45</p>
      <h2 className="splash__title">Iron Road</h2>
      <p className="splash__lead">
        Command a five-man tank crew through missions of travel, combat, and what happens between. This is a
        text-forward survival campaign — decisions in your crew&apos;s voices, outcomes behind the dice. Death
        is permanent.
      </p>

      <div className="splash__block">
        <h3 className="splash__heading">What to expect</h3>
        <p>
          The game is <strong>R-rated</strong> and does not sanitize war. Crew lose nerve, collect scars, run
          out of food and water, and bury friends. Some campaigns end in a hollow win or a lone survivor on
          foot.
        </p>
      </div>

      <div className="splash__block">
        <h3 className="splash__heading">Reading the campaign screen</h3>
        <ul className="splash__list">
          <li>
            <strong>Top row</strong> — <strong>Mission overview</strong> and <strong>Situation log</strong> side
            by side, same height; both scroll inside their panels.
          </li>
          <li>
            <strong>Main panel</strong> — the scene. Read it first, then choose.
          </li>
          <li>
            <strong>Roster below</strong> — centered <strong>Supplies</strong>, then unit cards: tank (hull bar)
            and each crewman (health and nerve bars). <em>Acting</em> marks who speaks for the commander if he
            is gone.
          </li>
        </ul>
      </div>

      <div className="splash__block">
        <h3 className="splash__heading">What you are choosing</h3>
        <ul className="splash__list">
          <li>
            Each option is <strong>one crew role&apos;s call</strong>. Aggressive / Tactical / Cautious
            describe posture — not exact math.
          </li>
          <li>
            <strong>Risk phrases</strong> under a choice (&ldquo;Possible brutal contact&rdquo;, &ldquo;May cost
            rations&rdquo;) are relative warnings, not the final bill.
          </li>
          <li>
            After you commit, <strong>Aftermath</strong> shows real numbers: hull lost, rounds spent, who took
            damage.
          </li>
          <li>
            Keys <kbd>1</kbd>–<kbd>4</kbd> pick choices when the choose step is active.
          </li>
        </ul>
      </div>

      <p className="splash__note muted">
        Field Journal (header) holds the full cross-campaign record. This browser saves your current run
        locally.
      </p>

      <label className="splash__skip">
        <input
          type="checkbox"
          checked={skipNext}
          onChange={(e) => setSkipNext(e.target.checked)}
        />
        Skip this briefing next visit
      </label>

      <button type="button" className="choiceBtn splash__continue" onClick={() => onContinue(skipNext)}>
        Continue
      </button>
    </section>
  );
}

export function persistSplashSkip(skip: boolean): void {
  try {
    if (skip) localStorage.setItem(SPLASH_SKIP_KEY, "1");
    else localStorage.removeItem(SPLASH_SKIP_KEY);
  } catch {
    /* private browsing */
  }
}
