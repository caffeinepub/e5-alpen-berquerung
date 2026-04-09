import { useActor } from "@caffeineai/core-infrastructure";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Clock, Home, Mountain, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { createActor } from "../backend";
import type { StagePhoto } from "../backend";
import { AuthButton } from "../components/AuthButton";
import { ElevationChart } from "../components/ElevationChart";
import {
  StagePhotoSection,
  hashToDirectUrl,
} from "../components/StagePhotoSection";

// ─── Hardcoded Etappe 3 data ───────────────────────────────────────────────

const ETAPPE3_DATA = {
  distanceKm: 11.7,
  ascentM: 1165,
  descentM: 72,
  profile: [
    { d: 0.0, e: 1266 },
    { d: 0.08, e: 1266 },
    { d: 0.14, e: 1266 },
    { d: 0.21, e: 1267 },
    { d: 0.29, e: 1267 },
    { d: 0.41, e: 1277 },
    { d: 0.49, e: 1283 },
    { d: 0.54, e: 1288 },
    { d: 0.67, e: 1299 },
    { d: 0.76, e: 1310 },
    { d: 0.83, e: 1318 },
    { d: 1.0, e: 1333 },
    { d: 1.09, e: 1339 },
    { d: 1.15, e: 1340 },
    { d: 1.26, e: 1342 },
    { d: 1.39, e: 1349 },
    { d: 1.55, e: 1361 },
    { d: 1.71, e: 1372 },
    { d: 1.92, e: 1389 },
    { d: 2.0, e: 1398 },
    { d: 2.18, e: 1416 },
    { d: 2.41, e: 1435 },
    { d: 2.62, e: 1441 },
    { d: 2.85, e: 1446 },
    { d: 3.22, e: 1461 },
    { d: 3.46, e: 1477 },
    { d: 3.56, e: 1485 },
    { d: 3.71, e: 1496 },
    { d: 3.77, e: 1501 },
    { d: 4.04, e: 1527 },
    { d: 4.23, e: 1547 },
    { d: 4.38, e: 1565 },
    { d: 4.45, e: 1574 },
    { d: 4.58, e: 1595 },
    { d: 4.97, e: 1640 },
    { d: 5.13, e: 1648 },
    { d: 5.39, e: 1660 },
    { d: 5.52, e: 1663 },
    { d: 5.61, e: 1665 },
    { d: 5.67, e: 1666 },
    { d: 5.77, e: 1672 },
    { d: 5.89, e: 1681 },
    { d: 6.03, e: 1700 },
    { d: 6.21, e: 1727 },
    { d: 6.36, e: 1747 },
    { d: 6.49, e: 1763 },
    { d: 6.61, e: 1777 },
    { d: 6.72, e: 1789 },
    { d: 6.83, e: 1803 },
    { d: 7.0, e: 1823 },
    { d: 7.1, e: 1837 },
    { d: 7.18, e: 1843 },
    { d: 7.23, e: 1848 },
    { d: 7.38, e: 1859 },
    { d: 7.57, e: 1871 },
    { d: 7.68, e: 1878 },
    { d: 7.82, e: 1897 },
    { d: 7.93, e: 1914 },
    { d: 8.01, e: 1932 },
    { d: 8.05, e: 1940 },
    { d: 8.11, e: 1951 },
    { d: 8.17, e: 1966 },
    { d: 8.24, e: 1980 },
    { d: 8.27, e: 1988 },
    { d: 8.38, e: 2014 },
    { d: 8.52, e: 2050 },
    { d: 8.65, e: 2086 },
    { d: 8.78, e: 2119 },
    { d: 8.9, e: 2147 },
    { d: 9.01, e: 2169 },
    { d: 9.09, e: 2184 },
    { d: 9.19, e: 2200 },
    { d: 9.33, e: 2221 },
    { d: 9.42, e: 2232 },
    { d: 9.5, e: 2242 },
    { d: 9.56, e: 2252 },
    { d: 9.62, e: 2261 },
    { d: 9.67, e: 2269 },
    { d: 9.72, e: 2277 },
    { d: 9.77, e: 2287 },
    { d: 9.81, e: 2295 },
    { d: 9.84, e: 2301 },
    { d: 9.92, e: 2315 },
    { d: 10.01, e: 2333 },
    { d: 10.08, e: 2344 },
    { d: 10.14, e: 2357 },
    { d: 10.18, e: 2364 },
    { d: 10.23, e: 2375 },
    { d: 10.37, e: 2401 },
    { d: 10.48, e: 2421 },
    { d: 10.51, e: 2424 },
    { d: 10.55, e: 2426 },
    { d: 10.62, e: 2428 },
    { d: 10.65, e: 2429 },
    { d: 10.67, e: 2430 },
    { d: 10.71, e: 2430 },
    { d: 10.86, e: 2409 },
    { d: 10.93, e: 2400 },
    { d: 11.03, e: 2385 },
    { d: 11.14, e: 2374 },
    { d: 11.19, e: 2373 },
    { d: 11.34, e: 2368 },
    { d: 11.45, e: 2362 },
    { d: 11.54, e: 2359 },
    { d: 11.66, e: 2359 },
  ],
} as const;

// ─── Info card ────────────────────────────────────────────────────────────

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="wood-texture relative rounded-xl bg-card border border-border overflow-hidden">
      <div className="h-1 w-full bg-primary opacity-70" />
      <div className="p-4 flex flex-col gap-2 items-center text-center">
        <div className="text-primary opacity-80">{icon}</div>
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold font-display text-foreground leading-none">
          {value}
        </p>
      </div>
      <div
        className="absolute bottom-0 right-0 w-6 h-6 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, oklch(var(--primary)) 50%)",
        }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function Stage3DetailPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor(createActor);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string | null>>({});

  const { data: isAdmin = false } = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity && !isActorFetching,
  });

  const { data: photos = [] } = useQuery<StagePhoto[]>({
    queryKey: ["stagePhotos", "3"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStagePhotos(3n);
    },
    enabled: !!actor && !isActorFetching,
  });

  useEffect(() => {
    if (!photos.length) return;
    for (const photo of photos) {
      if (photoUrls[photo.id] !== undefined) continue;
      setPhotoUrls((prev) => ({ ...prev, [photo.id]: null }));
      hashToDirectUrl(photo.blobHash)
        .then((url) => setPhotoUrls((prev) => ({ ...prev, [photo.id]: url })))
        .catch(() => setPhotoUrls((prev) => ({ ...prev, [photo.id]: null })));
    }
  }, [photos, photoUrls]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200 group"
          data-ocid="back-btn"
          aria-label="Zurück zur Startseite"
        >
          <span className="text-primary group-hover:-translate-x-0.5 transition-transform duration-200">
            ←
          </span>
          Zurück
        </button>
        <span className="text-border">|</span>
        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-semibold">
          E5 · Alpenüberquerung
        </span>
        <div className="ml-auto">
          <AuthButton />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Title block */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 mb-1">
              <div className="h-px w-8 bg-primary opacity-60" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                06. August 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground leading-tight tracking-tight">
              Etappe 3
              <br />
              <span className="text-primary">Holzgau</span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span>Ansbacher Hütte</span>
            </h1>
          </div>

          {/* Info cards */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            data-ocid="info-cards"
          >
            <InfoCard
              icon={<Mountain size={22} />}
              label="Distanz"
              value={`${ETAPPE3_DATA.distanceKm.toLocaleString("de-DE", { minimumFractionDigits: 1 })} km`}
            />
            <InfoCard
              icon={<TrendingUp size={22} />}
              label="Aufstieg"
              value={`+${ETAPPE3_DATA.ascentM.toLocaleString("de-DE")} m`}
            />
            <InfoCard
              icon={<TrendingDown size={22} />}
              label="Abstieg"
              value={`−${ETAPPE3_DATA.descentM.toLocaleString("de-DE")} m`}
            />
            <InfoCard
              icon={<Clock size={22} />}
              label="Gehzeit"
              value="~5,5 h"
            />
          </div>

          {/* Accommodation */}
          <div className="wood-texture relative rounded-xl bg-card border border-border overflow-hidden">
            <div className="h-1 w-full bg-primary opacity-70" />
            <div className="p-5 flex items-center gap-4">
              <Home size={20} className="text-primary opacity-80 shrink-0" />
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-0.5">
                  Unterkunft
                </p>
                <p className="text-lg font-bold font-display text-foreground leading-snug">
                  Ansbacher Hütte
                </p>
              </div>
            </div>
          </div>

          {/* Elevation profile + map */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Strecke &amp; Profil
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Elevation profile */}
              <div className="w-full md:w-1/2 flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground px-1">
                  Höhenprofil
                </p>
                <div
                  className="wood-texture relative rounded-xl bg-card border border-border overflow-hidden"
                  data-ocid="elevation-chart"
                >
                  <div className="h-1 w-full bg-primary opacity-70" />
                  <div className="px-4 pt-5 pb-2">
                    <ElevationChart
                      data={
                        ETAPPE3_DATA.profile as unknown as {
                          d: number;
                          e: number;
                        }[]
                      }
                      distanceMax={ETAPPE3_DATA.distanceKm}
                      elevationDomain={[1200, 2500]}
                      gradientId="elevGradient3"
                      photos={photos}
                      photoUrls={photoUrls}
                      isAdmin={isAdmin}
                      pendingMarker={selectedDistance}
                      onPositionSelect={
                        isAdmin ? setSelectedDistance : undefined
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Route map */}
              <div className="w-full md:w-1/2 flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground px-1">
                  Routenkarte
                </p>
                <div
                  className="w-full rounded-xl overflow-hidden border-2 border-border"
                  data-ocid="route-map"
                >
                  <img
                    src="/assets/images/etappe3.png"
                    alt="Routenkarte Etappe 3: Holzgau → Ansbacher Hütte"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photos & journal */}
          <StagePhotoSection
            stageId={3n}
            selectedDistance={selectedDistance}
            onClearDistance={() => setSelectedDistance(null)}
          />
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
