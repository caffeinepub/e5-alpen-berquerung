import { useRouter } from "@tanstack/react-router";
import type { Stage } from "../types";

interface StageCardProps {
  stage: Stage;
  distanceKm?: number;
}

const ROUTED_STAGES: Record<string, string> = {
  e1: "/etappe/1",
  e2: "/etappe/2",
  e3: "/etappe/3",
};

export function StageCard({ stage, distanceKm }: StageCardProps) {
  const router = useRouter();
  const href = ROUTED_STAGES[stage.id];

  function handleClick() {
    if (href) {
      router.navigate({ to: href });
    }
  }

  const distanceLabel =
    distanceKm != null
      ? `${distanceKm.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
      : null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`wood-texture card-hover relative rounded-xl bg-card border border-border overflow-hidden w-full text-left ${href ? "cursor-pointer" : "cursor-default"}`}
      data-ocid={`stage-card-${stage.id}`}
      aria-label={`Etappe ${stage.number}: ${stage.isSpecial ? stage.from : `${stage.from} nach ${stage.to}`}, ${stage.date}`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-primary opacity-70" />

      <div className="p-5 flex flex-col gap-3">
        {/* Stage number + label */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="stage-number leading-none">{stage.number}</span>
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Etappe
            </span>
          </div>
          {distanceLabel && (
            <span className="text-xs font-semibold text-primary/70 tabular-nums shrink-0">
              {distanceLabel}
            </span>
          )}
        </div>

        {/* Date */}
        <p className="stage-date">{stage.date}</p>

        {/* Route */}
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Route
          </p>
          {stage.isSpecial ? (
            <p className="stage-route leading-snug">{stage.from}</p>
          ) : (
            <p className="stage-route leading-snug">
              {stage.from}
              <span className="text-primary mx-1">→</span>
              {stage.to}
            </p>
          )}
        </div>
      </div>

      {/* Subtle corner notch decoration */}
      <div
        className="absolute bottom-0 right-0 w-8 h-8 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, oklch(var(--primary)) 50%)",
        }}
      />
    </button>
  );
}
