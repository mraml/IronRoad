import type { AreaEntryBeat, NarrativeSlide } from "../engine/types";

interface NarrativeSlidePanelProps {
  title: string;
  subtitle?: string;
  slide?: NarrativeSlide;
  areaEntry?: AreaEntryBeat;
  continueLabel?: string;
  onContinue: () => void;
}

export function NarrativeSlidePanel({
  title,
  subtitle,
  slide,
  areaEntry,
  continueLabel = "Continue",
  onContinue,
}: NarrativeSlidePanelProps) {
  const atmosphere = areaEntry?.atmosphere ?? slide?.atmosphere;
  const narrative = areaEntry?.narrative ?? slide?.narrative;
  const quote = slide?.quote;

  return (
    <>
      <h2 style={{ marginBottom: subtitle ? "0.25rem" : undefined }}>{title}</h2>
      {subtitle && (
        <p className="muted" style={{ marginTop: 0 }}>
          {subtitle}
        </p>
      )}
      {areaEntry && (
        <p
          className="narrative-slide__place"
          style={{ fontVariant: "small-caps", letterSpacing: "0.04em" }}
        >
          {areaEntry.placeName}
        </p>
      )}
      {atmosphere && <p className="atmosphere">{atmosphere}</p>}
      {narrative && <p style={{ whiteSpace: "pre-wrap" }}>{narrative}</p>}
      {quote && <p style={{ fontStyle: "italic" }}>{quote}</p>}
      <button type="button" className="choiceBtn" onClick={onContinue}>
        {continueLabel}
      </button>
    </>
  );
}
