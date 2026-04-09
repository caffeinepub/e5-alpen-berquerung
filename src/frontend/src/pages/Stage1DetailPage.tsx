import { useActor } from "@caffeineai/core-infrastructure";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Clock, Home, Mountain, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { createActor } from "../backend";
import type { StagePhoto } from "../backend";
import { AuthButton } from "../components/AuthButton";
import { ElevationChart } from "../components/ElevationChart";
import {
  StagePhotoSection,
  hashToDirectUrl,
} from "../components/StagePhotoSection";

// ─── Hardcoded Etappe 1 data ───────────────────────────────────────────────

const ETAPPE1_DATA = {
  distanceKm: 6.5,
  ascentM: 789,
  descentM: 2,
  profile: [
    { d: 0.0, e: 993 },
    { d: 0.08, e: 993 },
    { d: 0.13, e: 992 },
    { d: 0.2, e: 991 },
    { d: 0.26, e: 991 },
    { d: 0.33, e: 991 },
    { d: 0.39, e: 993 },
    { d: 0.46, e: 995 },
    { d: 0.52, e: 997 },
    { d: 0.59, e: 1000 },
    { d: 0.65, e: 1004 },
    { d: 0.72, e: 1007 },
    { d: 0.78, e: 1011 },
    { d: 0.85, e: 1015 },
    { d: 0.91, e: 1019 },
    { d: 0.98, e: 1023 },
    { d: 1.04, e: 1026 },
    { d: 1.11, e: 1031 },
    { d: 1.18, e: 1037 },
    { d: 1.24, e: 1043 },
    { d: 1.31, e: 1049 },
    { d: 1.37, e: 1057 },
    { d: 1.43, e: 1065 },
    { d: 1.5, e: 1073 },
    { d: 1.56, e: 1079 },
    { d: 1.62, e: 1086 },
    { d: 1.69, e: 1092 },
    { d: 1.75, e: 1098 },
    { d: 1.82, e: 1103 },
    { d: 1.88, e: 1108 },
    { d: 1.94, e: 1114 },
    { d: 2.01, e: 1120 },
    { d: 2.07, e: 1126 },
    { d: 2.14, e: 1132 },
    { d: 2.2, e: 1138 },
    { d: 2.26, e: 1143 },
    { d: 2.33, e: 1151 },
    { d: 2.39, e: 1159 },
    { d: 2.46, e: 1168 },
    { d: 2.52, e: 1175 },
    { d: 2.59, e: 1180 },
    { d: 2.65, e: 1184 },
    { d: 2.71, e: 1189 },
    { d: 2.78, e: 1194 },
    { d: 2.84, e: 1198 },
    { d: 2.9, e: 1203 },
    { d: 2.97, e: 1213 },
    { d: 3.03, e: 1224 },
    { d: 3.09, e: 1233 },
    { d: 3.15, e: 1248 },
    { d: 3.22, e: 1262 },
    { d: 3.28, e: 1276 },
    { d: 3.34, e: 1292 },
    { d: 3.4, e: 1309 },
    { d: 3.46, e: 1324 },
    { d: 3.52, e: 1338 },
    { d: 3.58, e: 1349 },
    { d: 3.65, e: 1360 },
    { d: 3.71, e: 1370 },
    { d: 3.77, e: 1374 },
    { d: 3.84, e: 1378 },
    { d: 3.9, e: 1381 },
    { d: 3.96, e: 1394 },
    { d: 4.02, e: 1407 },
    { d: 4.08, e: 1420 },
    { d: 4.15, e: 1433 },
    { d: 4.21, e: 1446 },
    { d: 4.27, e: 1459 },
    { d: 4.33, e: 1469 },
    { d: 4.4, e: 1477 },
    { d: 4.46, e: 1485 },
    { d: 4.53, e: 1492 },
    { d: 4.59, e: 1498 },
    { d: 4.66, e: 1505 },
    { d: 4.72, e: 1510 },
    { d: 4.79, e: 1514 },
    { d: 4.85, e: 1517 },
    { d: 4.92, e: 1522 },
    { d: 4.98, e: 1530 },
    { d: 5.04, e: 1537 },
    { d: 5.11, e: 1546 },
    { d: 5.17, e: 1558 },
    { d: 5.24, e: 1570 },
    { d: 5.3, e: 1582 },
    { d: 5.36, e: 1598 },
    { d: 5.42, e: 1613 },
    { d: 5.48, e: 1629 },
    { d: 5.54, e: 1644 },
    { d: 5.6, e: 1659 },
    { d: 5.67, e: 1676 },
    { d: 5.73, e: 1690 },
    { d: 5.79, e: 1703 },
    { d: 5.86, e: 1716 },
    { d: 5.92, e: 1729 },
    { d: 5.99, e: 1739 },
    { d: 6.05, e: 1749 },
    { d: 6.11, e: 1758 },
    { d: 6.18, e: 1766 },
    { d: 6.24, e: 1773 },
    { d: 6.31, e: 1780 },
    { d: 6.5, e: 1780 },
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

export function Stage1DetailPage() {
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
    queryKey: ["stagePhotos", "1"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStagePhotos(1n);
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
                04. August 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground leading-tight tracking-tight">
              Etappe 1
              <br />
              <span className="text-primary">Oberstdorf</span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span>Kemptner Hütte</span>
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
              value={`${ETAPPE1_DATA.distanceKm.toLocaleString("de-DE", { minimumFractionDigits: 1 })} km`}
            />
            <InfoCard
              icon={<TrendingUp size={22} />}
              label="Aufstieg"
              value={`+${ETAPPE1_DATA.ascentM.toLocaleString("de-DE")} m`}
            />
            <InfoCard
              icon={<TrendingDown size={22} />}
              label="Abstieg"
              value={`−${ETAPPE1_DATA.descentM.toLocaleString("de-DE")} m`}
            />
            <InfoCard icon={<Clock size={22} />} label="Gehzeit" value="~5 h" />
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
                  Kemptner Hütte
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
                        ETAPPE1_DATA.profile as unknown as {
                          d: number;
                          e: number;
                        }[]
                      }
                      distanceMax={ETAPPE1_DATA.distanceKm}
                      elevationDomain={[900, 1850]}
                      gradientId="elevGradient1"
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
                    src="/assets/images/etappe1.png"
                    alt="Routenkarte Etappe 1: Oberstdorf → Kemptner Hütte"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photos & journal */}
          <StagePhotoSection
            stageId={1n}
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
