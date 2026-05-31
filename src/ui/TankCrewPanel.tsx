import { memo } from "react";
import { formatRank, isActingCommander } from "../content/ranks";
import { TANK_TYPE_PROFILES } from "../engine/config";
import type { GameState } from "../engine/types";
import { StatBar } from "./StatBar";

function formatRole(role: string): string {
  return role.replaceAll("_", " ");
}

const TRAUMA_LABELS: Record<string, string> = {
  shellshocked: "Shellshocked",
  frozen: "Frozen",
  jumpy: "Jumpy",
  thousand_yard_stare: "Thousand-yard stare",
  shaking: "Shaking",
  grief_struck: "Grief-struck",
  rage: "Rage",
  checked_out: "Checked out",
  numb: "Numb",
  breaking: "Breaking",
};

function damagedList(components: GameState["tank"]["components"]): string[] {
  return Object.entries(components)
    .filter(([, v]) => v !== "ok")
    .map(([k, v]) => `${k.replaceAll("_", " ")} (${v})`);
}

function supplyTone(critical: boolean, low: boolean): string {
  if (critical) return "supplies-strip__item--critical";
  if (low) return "supplies-strip__item--low";
  return "";
}

export const TankCrewPanel = memo(function TankCrewPanel({ game }: { game: GameState }) {
  const damaged = damagedList(game.tank.components);
  const prof = TANK_TYPE_PROFILES[game.tankType];
  const hullCrit = game.tank.healthPct <= 30;
  const r = game.resources;
  const noFood = r.foodDays <= 0;
  const noWater = r.waterCanteens <= 0;
  const lowFood = !noFood && r.foodDays <= 2;
  const lowWater = !noWater && r.waterCanteens <= 2;

  return (
    <aside className="unit-roster">
      <div className="supplies-strip panel panel--compact">
        <div className="supplies-strip__row">
          <span className="panel-heading supplies-strip__title">Supplies</span>
          <div className="supplies-strip__items">
            <span>AP {r.ammoAP}</span>
            <span>HE {r.ammoHE}</span>
            <span>WP {r.ammoWP}</span>
            <span>HEAT {r.ammoHEAT}</span>
            <span>Mags {r.smallArmsMags}</span>
            <span>Med {r.medkits}</span>
            <span className={supplyTone(noFood, lowFood)}>
              Food {r.foodDays}d{noFood ? " ⚠" : lowFood ? " low" : ""}
            </span>
            <span className={supplyTone(noWater, lowWater)}>
              Water {r.waterCanteens}
              {noWater ? " ⚠" : lowWater ? " low" : ""}
            </span>
            <span>Salvage {game.salvagePoints}</span>
          </div>
        </div>
      </div>

      <div className="unit-roster__grid">
        <article className="unit-card unit-card--tank">
          <div className="unit-card__head">
            <strong className="unit-card__name">{game.tank.name}</strong>
            <span className="unit-card__role">Tank</span>
          </div>
          <p className="unit-card__meta muted">
            {prof.label} · {prof.passiveLabel}
            {hullCrit ? <span className="unit-card__hull-warn"> · hull critical</span> : null}
          </p>
          <StatBar
            label="Hull"
            value={game.tank.healthPct}
            tone="hull"
            displayValue={`${game.tank.healthPct}%`}
          />
          {damaged.length > 0 ? (
            <p className="unit-card__note unit-card__note--warn">{damaged.join(" · ")}</p>
          ) : (
            <p className="unit-card__note muted">Systems nominal</p>
          )}
        </article>

        {game.crew.map((c) => (
          <article key={c.id} className={`unit-card ${c.hp <= 0 ? "unit-card--kia" : ""}`}>
            <div className="unit-card__head">
              <strong className="unit-card__name">
                <span className="unit-card__nickname">{c.nickname}</span>
                <span className="unit-card__fullname muted">
                  {c.firstName} {c.lastName}
                </span>
              </strong>
              {isActingCommander(game.crew, c) ? (
                <span className="unit-card__badge">Acting</span>
              ) : null}
            </div>
            <p className="unit-card__meta muted">
              {formatRank(c.rank)} · {formatRole(c.role)}
            </p>
            {c.hp > 0 ? (
              <>
                <StatBar label="Health" value={c.hp} tone="health" />
                <StatBar label="Nerve" value={c.constitution} tone="nerve" />
              </>
            ) : (
              <p className="unit-card__kia">KIA</p>
            )}
            {c.coveringRole ? (
              <p className="unit-card__note muted">Covering {formatRole(c.coveringRole)}</p>
            ) : null}
            {c.traumaStates.length > 0 ? (
              <p className="unit-card__note unit-card__note--warn">
                {c.traumaStates.map((t) => TRAUMA_LABELS[t] ?? t).join(" · ")}
              </p>
            ) : null}
            {c.scars.length > 0 ? (
              <p className="unit-card__note muted">{c.scars.map((s) => s.text).join(" · ")}</p>
            ) : null}
          </article>
        ))}
      </div>
    </aside>
  );
});
