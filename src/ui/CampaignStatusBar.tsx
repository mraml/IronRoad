import { memo } from "react";
import type { GameState, PlaySub } from "../engine/types";
import { buildCampaignStatus } from "./campaignStatus";

export const CampaignStatusBar = memo(function CampaignStatusBar({
  game,
  sub,
}: {
  game: GameState;
  sub: PlaySub | null;
}) {
  const v = buildCampaignStatus(game, sub);

  return (
    <header className="mission-overview panel panel--compact play-top-panel">
      <h3 className="panel-heading">Mission overview</h3>
      <div className="mission-overview__body">
        <div className="status-bar__row status-bar__primary">
          <span>{v.theater}</span>
          <span className="status-bar__sep">·</span>
          <span>{v.difficulty}</span>
          <span className="status-bar__sep">·</span>
          <span>{v.phaseLabel}</span>
          {v.dayLabel ? (
            <>
              <span className="status-bar__sep">·</span>
              <span>{v.dayLabel}</span>
            </>
          ) : null}
        </div>
        <strong className="status-bar__mission">{v.missionLine}</strong>
        {v.objective ? (
          <p className="status-bar__objective muted" title={v.objective}>
            {v.objective}
          </p>
        ) : null}
        <div className="status-bar__row status-bar__meta">
          {v.weekday ? <span className="tag tag--inline">{v.weekday}</span> : null}
          {v.dateLabel ? <span className="tag tag--inline">{v.dateLabel}</span> : null}
          {v.timeOfDay ? <span className="tag tag--inline">{v.timeOfDay}</span> : null}
          <span className="tag tag--inline">{v.season}</span>
          {v.weather ? <span className="tag tag--inline">{v.weather}</span> : null}
          {v.beatLabel ? <span className="tag tag--inline">{v.beatLabel}</span> : null}
        </div>
        {v.supplyAlerts.length > 0 ? (
          <div className="status-bar__alerts">
            {v.supplyAlerts.map((a) => (
              <p key={a.message} className={`supply-alert supply-alert--${a.level}`}>
                {a.message}
              </p>
            ))}
          </div>
        ) : null}
        {v.uiAlert ? <p className="status-bar__flash">{v.uiAlert}</p> : null}
      </div>
    </header>
  );
});
