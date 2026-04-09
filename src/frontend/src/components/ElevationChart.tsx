import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StagePhoto } from "../backend";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfilePoint {
  d: number;
  e: number;
}

interface ElevationChartProps {
  data: ProfilePoint[];
  distanceMax: number;
  elevationDomain: [number, number];
  gradientId: string;
  photos?: StagePhoto[];
  photoUrls?: Record<string, string | null>;
  isAdmin?: boolean;
  pendingMarker?: number | null;
  onPositionSelect?: (distanceKm: number) => void;
}

interface TooltipPayloadItem {
  value: number;
  payload: ProfilePoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { d, e } = payload[0].payload;
  return (
    <div
      className="rounded-lg border border-border bg-card px-3 py-2 shadow-md"
      style={{ boxShadow: "0 2px 12px oklch(var(--foreground) / 0.08)" }}
    >
      <p className="text-sm font-bold font-display text-foreground leading-snug">
        {e.toLocaleString("de-DE")} m ü.d.M.
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {d.toLocaleString("de-DE", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        })}{" "}
        km
      </p>
    </div>
  );
}

// ─── Photo Marker Modal ───────────────────────────────────────────────────────

interface MarkerModalProps {
  photo: StagePhoto;
  imageUrl: string | null;
  onClose: () => void;
}

function MarkerModal({ photo, imageUrl, onClose }: MarkerModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(var(--foreground) / 0.6)" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-ocid="marker-modal-overlay"
    >
      <div
        className="wood-texture relative w-full max-w-lg rounded-2xl bg-card border border-border overflow-hidden shadow-xl"
        style={{ maxHeight: "90dvh" }}
      >
        <div className="h-1 w-full bg-primary opacity-70" />
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-card/90 border border-border text-foreground hover:text-primary transition-colors duration-200"
          aria-label="Schließen"
          data-ocid="marker-modal-close"
        >
          <X size={16} />
        </button>

        {/* Image */}
        <div className="w-full overflow-hidden" style={{ maxHeight: "55dvh" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={photo.description || "Etappenfoto"}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted">
              <Camera size={32} className="text-muted-foreground opacity-40" />
            </div>
          )}
        </div>

        {/* Description + position */}
        <div className="p-5 flex flex-col gap-3">
          {photo.description && (
            <p className="text-sm text-foreground leading-relaxed">
              {photo.description}
            </p>
          )}
          {photo.distanceKm != null && (
            <p className="text-xs font-semibold text-primary">
              📍{" "}
              {photo.distanceKm.toLocaleString("de-DE", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{" "}
              km
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Photo marker custom label (rendered via ReferenceLine label prop) ────────

interface MarkerLabelProps {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  photo: StagePhoto;
  imageUrl: string | null;
  onClick: () => void;
}

function MarkerLabel({ viewBox, photo, imageUrl, onClick }: MarkerLabelProps) {
  const cx = viewBox?.x ?? 0;
  const cy = 8;
  const size = 22;
  return (
    <g
      transform={`translate(${cx - size / 2}, ${cy})`}
      style={{ cursor: "pointer" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Circle bg */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2}
        fill="oklch(var(--card))"
        stroke="oklch(var(--primary))"
        strokeWidth={1.5}
      />
      {/* Thumbnail or camera icon */}
      {imageUrl ? (
        <>
          <clipPath id={`clip-${photo.id}`}>
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 1.5} />
          </clipPath>
          <image
            href={imageUrl}
            x={1.5}
            y={1.5}
            width={size - 3}
            height={size - 3}
            clipPath={`url(#clip-${photo.id})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          fontSize={12}
          fill="oklch(var(--primary))"
        >
          📷
        </text>
      )}
    </g>
  );
}

// ─── Main ElevationChart component ───────────────────────────────────────────

// Left margin must match YAxis width for pointer position calculation
const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 4 };
const YAXIS_WIDTH = 52;

export function ElevationChart({
  data,
  distanceMax,
  elevationDomain,
  gradientId,
  photos = [],
  photoUrls = {},
  isAdmin = false,
  pendingMarker = null,
  onPositionSelect,
}: ElevationChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalPhoto, setModalPhoto] = useState<StagePhoto | null>(null);

  // Photos that have a distanceKm assigned
  const markedPhotos = photos.filter((p) => p.distanceKm != null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onPositionSelect) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // clientX relative to container
    const relativeX = e.clientX - rect.left;
    // Subtract YAxis width (left margin + YAxis width)
    const chartAreaLeft = CHART_MARGIN.left + YAXIS_WIDTH;
    const chartAreaRight = rect.width - CHART_MARGIN.right;
    const chartWidth = chartAreaRight - chartAreaLeft;

    const clampedX = Math.max(
      0,
      Math.min(relativeX - chartAreaLeft, chartWidth),
    );
    const ratio = clampedX / chartWidth;
    const distance = Math.round(ratio * distanceMax * 10) / 10;
    const clamped = Math.max(0, Math.min(distance, distanceMax));
    onPositionSelect(clamped);
  };

  return (
    <>
      {/* Chart container — pointer events for mobile touch */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        style={{
          position: "relative",
          cursor: onPositionSelect ? "crosshair" : "default",
          touchAction: "none",
        }}
        data-ocid="elevation-chart-interactive"
      >
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(var(--primary))"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(var(--primary))"
                  stopOpacity={0.04}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="d"
              type="number"
              domain={[0, distanceMax]}
              tickCount={8}
              tickFormatter={(v: number) => `${v}`}
              label={{
                value: "Distanz (km)",
                position: "insideBottom",
                offset: -2,
                fontSize: 11,
                fill: "oklch(var(--muted-foreground))",
                fontFamily: "var(--font-body)",
              }}
              tick={{
                fontSize: 11,
                fill: "oklch(var(--muted-foreground))",
                fontFamily: "var(--font-body)",
              }}
              tickLine={false}
              axisLine={{ stroke: "oklch(var(--border))" }}
              height={44}
            />
            <YAxis
              domain={elevationDomain}
              tickFormatter={(v: number) => `${v}`}
              label={{
                value: "Höhe (m)",
                angle: -90,
                position: "insideLeft",
                offset: 14,
                fontSize: 11,
                fill: "oklch(var(--muted-foreground))",
                fontFamily: "var(--font-body)",
              }}
              tick={{
                fontSize: 11,
                fill: "oklch(var(--muted-foreground))",
                fontFamily: "var(--font-body)",
              }}
              tickLine={false}
              axisLine={false}
              width={YAXIS_WIDTH}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "oklch(var(--primary))",
                strokeWidth: 1,
                strokeDasharray: "4 2",
              }}
            />
            <Area
              type="monotone"
              dataKey="e"
              stroke="oklch(var(--primary))"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: "oklch(var(--primary))",
                stroke: "oklch(var(--card))",
                strokeWidth: 2,
              }}
            />

            {/* Pending marker — dashed preview line */}
            {pendingMarker != null && (
              <ReferenceLine
                x={pendingMarker}
                stroke="oklch(var(--accent))"
                strokeWidth={2}
                strokeDasharray="5 3"
                label={{
                  value: `${pendingMarker.toFixed(1)} km`,
                  position: "top",
                  fontSize: 10,
                  fill: "oklch(var(--accent))",
                  fontFamily: "var(--font-body)",
                }}
              />
            )}

            {/* Saved photo markers */}
            {markedPhotos.map((photo) => (
              <ReferenceLine
                key={photo.id}
                x={photo.distanceKm}
                stroke="oklch(var(--primary))"
                strokeWidth={1.5}
                strokeDasharray="3 2"
                label={
                  <MarkerLabel
                    photo={photo}
                    imageUrl={photoUrls[photo.id] ?? null}
                    onClick={() => setModalPhoto(photo)}
                  />
                }
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Instructional hint for admin during upload */}
      {isAdmin && onPositionSelect && (
        <p className="text-xs text-muted-foreground text-center mt-1 px-1">
          Tippe ins Profil um den Aufnahmeort zu markieren (optional)
        </p>
      )}

      {/* Modal for clicked photo markers */}
      {modalPhoto && (
        <MarkerModal
          photo={modalPhoto}
          imageUrl={photoUrls[modalPhoto.id] ?? null}
          onClose={() => setModalPhoto(null)}
        />
      )}
    </>
  );
}
