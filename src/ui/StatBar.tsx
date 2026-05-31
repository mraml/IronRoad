import { memo } from "react";

export type StatBarTone = "hull" | "health" | "nerve";

function toneClass(value: number, tone: StatBarTone): string {
  if (tone === "hull" || tone === "health") {
    if (value <= 0) return "stat-bar__fill--empty";
    if (value <= 30) return "stat-bar__fill--crit";
    if (value <= 55) return "stat-bar__fill--warn";
    return "";
  }
  if (value < 20) return "stat-bar__fill--crit";
  if (value < 35) return "stat-bar__fill--warn";
  return "";
}

export const StatBar = memo(function StatBar({
  label,
  value,
  max = 100,
  tone,
  displayValue,
}: {
  label: string;
  value: number;
  max?: number;
  tone: StatBarTone;
  displayValue?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const shown =
    displayValue ?? (value <= 0 && tone === "health" ? "KIA" : String(Math.round(value)));

  return (
    <div className={`stat-bar stat-bar--${tone}`}>
      <div className="stat-bar__head">
        <span className="stat-bar__label">{label}</span>
        <span className="stat-bar__val">{shown}</span>
      </div>
      <div className="stat-bar__track">
        <div className={`stat-bar__fill ${toneClass(value, tone)}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
});
