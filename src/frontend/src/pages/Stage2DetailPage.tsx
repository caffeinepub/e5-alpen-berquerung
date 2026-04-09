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

// ─── Hardcoded Etappe 2 data ───────────────────────────────────────────────

const ETAPPE2_DATA = {
  distanceKm: 7.7,
  ascentM: 165,
  descentM: 908,
  profile: [
    { d: 0.0, e: 1847 },
    { d: 0.03, e: 1847 },
    { d: 0.11, e: 1848 },
    { d: 0.19, e: 1854 },
    { d: 0.25, e: 1859 },
    { d: 0.31, e: 1864 },
    { d: 0.38, e: 1877 },
    { d: 0.48, e: 1894 },
    { d: 0.67, e: 1940 },
    { d: 0.73, e: 1950 },
    { d: 0.76, e: 1953 },
    { d: 0.84, e: 1959 },
    { d: 0.9, e: 1964 },
    { d: 0.93, e: 1961 },
    { d: 1.06, e: 1944 },
    { d: 1.1, e: 1938 },
    { d: 1.12, e: 1932 },
    { d: 1.21, e: 1907 },
    { d: 1.25, e: 1898 },
    { d: 1.34, e: 1871 },
    { d: 1.39, e: 1856 },
    { d: 1.46, e: 1832 },
    { d: 1.51, e: 1818 },
    { d: 1.56, e: 1803 },
    { d: 1.58, e: 1798 },
    { d: 1.61, e: 1788 },
    { d: 1.68, e: 1767 },
    { d: 1.72, e: 1754 },
    { d: 1.84, e: 1723 },
    { d: 1.91, e: 1706 },
    { d: 2.03, e: 1684 },
    { d: 2.11, e: 1667 },
    { d: 2.15, e: 1658 },
    { d: 2.2, e: 1649 },
    { d: 2.24, e: 1640 },
    { d: 2.33, e: 1623 },
    { d: 2.5, e: 1583 },
    { d: 2.63, e: 1556 },
    { d: 2.75, e: 1530 },
    { d: 2.87, e: 1500 },
    { d: 2.93, e: 1482 },
    { d: 3.01, e: 1459 },
    { d: 3.06, e: 1443 },
    { d: 3.19, e: 1406 },
    { d: 3.28, e: 1378 },
    { d: 3.32, e: 1368 },
    { d: 3.42, e: 1352 },
    { d: 3.47, e: 1342 },
    { d: 3.5, e: 1336 },
    { d: 3.57, e: 1334 },
    { d: 3.64, e: 1331 },
    { d: 3.7, e: 1329 },
    { d: 3.76, e: 1325 },
    { d: 3.82, e: 1322 },
    { d: 3.87, e: 1319 },
    { d: 3.96, e: 1313 },
    { d: 4.03, e: 1308 },
    { d: 4.09, e: 1304 },
    { d: 4.19, e: 1295 },
    { d: 4.29, e: 1287 },
    { d: 4.35, e: 1282 },
    { d: 4.42, e: 1278 },
    { d: 4.53, e: 1272 },
    { d: 4.59, e: 1270 },
    { d: 4.67, e: 1269 },
    { d: 4.72, e: 1267 },
    { d: 4.8, e: 1265 },
    { d: 4.88, e: 1262 },
    { d: 4.93, e: 1260 },
    { d: 5.05, e: 1255 },
    { d: 5.1, e: 1252 },
    { d: 5.22, e: 1247 },
    { d: 5.28, e: 1244 },
    { d: 5.4, e: 1244 },
    { d: 5.48, e: 1245 },
    { d: 5.59, e: 1254 },
    { d: 5.66, e: 1260 },
    { d: 5.84, e: 1284 },
    { d: 5.88, e: 1289 },
    { d: 6.03, e: 1285 },
    { d: 6.09, e: 1282 },
    { d: 6.16, e: 1270 },
    { d: 6.21, e: 1260 },
    { d: 6.28, e: 1248 },
    { d: 6.4, e: 1224 },
    { d: 6.44, e: 1215 },
    { d: 6.55, e: 1193 },
    { d: 6.58, e: 1186 },
    { d: 6.67, e: 1169 },
    { d: 6.71, e: 1161 },
    { d: 6.76, e: 1154 },
    { d: 6.83, e: 1144 },
    { d: 6.87, e: 1137 },
    { d: 6.91, e: 1132 },
    { d: 6.97, e: 1127 },
    { d: 7.03, e: 1123 },
    { d: 7.15, e: 1115 },
    { d: 7.3, e: 1108 },
    { d: 7.37, e: 1106 },
    { d: 7.42, e: 1105 },
    { d: 7.49, e: 1104 },
    { d: 7.54, e: 1103 },
    { d: 7.71, e: 1103 },
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

export function Stage2DetailPage() {
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
    queryKey: ["stagePhotos", "2"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStagePhotos(2n);
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
                05. August 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground leading-tight tracking-tight">
              Etappe 2
              <br />
              <span className="text-primary">Kemptner Hütte</span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span>Holzgau</span>
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
              value={`${ETAPPE2_DATA.distanceKm.toLocaleString("de-DE", { minimumFractionDigits: 1 })} km`}
            />
            <InfoCard
              icon={<TrendingUp size={22} />}
              label="Aufstieg"
              value={`+${ETAPPE2_DATA.ascentM.toLocaleString("de-DE")} m`}
            />
            <InfoCard
              icon={<TrendingDown size={22} />}
              label="Abstieg"
              value={`−${ETAPPE2_DATA.descentM.toLocaleString("de-DE")} m`}
            />
            <InfoCard
              icon={<Clock size={22} />}
              label="Gehzeit"
              value="~3,5 h"
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
                  Holzgau
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
                        ETAPPE2_DATA.profile as unknown as {
                          d: number;
                          e: number;
                        }[]
                      }
                      distanceMax={ETAPPE2_DATA.distanceKm}
                      elevationDomain={[1050, 2000]}
                      gradientId="elevGradient2"
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
                    src="/assets/images/etappe2.png"
                    alt="Routenkarte Etappe 2: Kemptner Hütte → Holzgau"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photos & journal */}
          <StagePhotoSection
            stageId={2n}
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
