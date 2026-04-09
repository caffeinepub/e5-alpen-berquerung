import { useMemo } from "react";
import { HeroHeader } from "../components/HeroHeader";
import { StageCard } from "../components/StageCard";
import type { Stage } from "../types";

// ─── Static distances per stage (km) ──────────────────────────────────────

const STATIC_DISTANCES: Record<string, number> = {
  e1: 6.5,
  e2: 7.7,
  e3: 11.7,
  e4: 22,
  e5: 15,
  e6: 24,
  e7: 18,
  e8: 16,
  e9: 8,
  e10: 14,
  e11: 20,
  e12: 22,
};

const STAGES: Stage[] = [
  {
    id: "e1",
    number: 1,
    date: "04.08.",
    from: "Oberstdorf",
    to: "Kemptner Hütte",
  },
  {
    id: "e2",
    number: 2,
    date: "05.08.",
    from: "Kemptner Hütte",
    to: "Holzgau",
  },
  {
    id: "e3",
    number: 3,
    date: "06.08.",
    from: "Holzgau",
    to: "Ansbacher Hütte",
  },
  {
    id: "e4",
    number: 4,
    date: "07.08.",
    from: "Ansbacher Hütte",
    to: "Zams/Venet",
  },
  { id: "e5", number: 5, date: "08.08.", from: "Zams", to: "Wenns" },
  {
    id: "e6",
    number: 6,
    date: "09.08.",
    from: "Wenns",
    to: "Braunschweiger Hütte",
  },
  {
    id: "e7",
    number: 7,
    date: "10.08.",
    from: "Braunschweiger Hütte",
    to: "Vent",
  },
  { id: "e8", number: 8, date: "11.08.", from: "Vent", to: "Hochjoch Hospiz" },
  {
    id: "e9",
    number: 9,
    date: "12.08.",
    from: "Gipfeltag Guslarspitze",
    to: "",
    isSpecial: true,
  },
  {
    id: "e10",
    number: 10,
    date: "13.08.",
    from: "Hochjoch Hospiz",
    to: "Vernagthütte",
  },
  {
    id: "e11",
    number: 11,
    date: "14.08.",
    from: "Vernagthütte",
    to: "Schnals",
  },
  { id: "e12", number: 12, date: "15.08.", from: "Schnals", to: "Meran" },
];

export function HomePage() {
  const totalKm = useMemo(
    () =>
      Math.round(
        Object.values(STATIC_DISTANCES).reduce((sum, d) => sum + d, 0),
      ),
    [],
  );

  const subtitle = `12 Etappen · Alpenüberquerung · ~${totalKm} km`;

  return (
    <div className="min-h-screen bg-background">
      <HeroHeader
        title="E5 · Oberstdorf → Meran · August 2026"
        subtitle={subtitle}
      />

      {/* Stage grid section */}
      <main className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              Die Etappen
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            data-ocid="stages-grid"
          >
            {STAGES.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                distanceKm={STATIC_DISTANCES[stage.id]}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors duration-200"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
