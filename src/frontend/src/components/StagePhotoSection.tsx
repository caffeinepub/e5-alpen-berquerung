import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { loadConfig, useActor } from "@caffeineai/core-infrastructure";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, MapPin, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type { StagePhoto } from "../backend";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StagePhotoSectionProps {
  stageId: bigint;
  selectedDistance: number | null;
  onClearDistance: () => void;
}

export interface PhotoWithUrl extends StagePhoto {
  imageUrl: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SENTINEL = "!caf!";
const MAX_DESC = 200;

async function getStorageClient(
  agentIdentity?: unknown,
): Promise<StorageClient> {
  const config = await loadConfig();
  const agentOpts: Record<string, unknown> = { host: config.backend_host };
  if (agentIdentity) agentOpts.identity = agentIdentity;
  const agent = new HttpAgent(agentOpts);
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }
  return new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
}

export async function hashToDirectUrl(blobHash: string): Promise<string> {
  const rawHash = blobHash.startsWith(SENTINEL)
    ? blobHash.slice(SENTINEL.length)
    : blobHash;
  const client = await getStorageClient();
  return client.getDirectURL(rawHash);
}

// ─── Admin upload panel ───────────────────────────────────────────────────────

interface UploadPanelProps {
  stageId: bigint;
  actor: ReturnType<typeof createActor>;
  selectedDistance: number | null;
  onClearDistance: () => void;
  onSuccess: () => void;
}

function UploadPanel({
  stageId,
  actor,
  selectedDistance,
  onClearDistance,
  onSuccess,
}: UploadPanelProps) {
  const { identity } = useInternetIdentity();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0] ?? null;
    if (!chosen) return;
    setFile(chosen);
    setError(null);
    const url = URL.createObjectURL(chosen);
    setPreview(url);
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Kein Foto ausgewählt");
      if (!actor) throw new Error("Nicht verbunden");

      const bytes = new Uint8Array(await file.arrayBuffer());
      const storageClient = await getStorageClient(identity);
      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setUploadProgress(pct);
      });

      const blobHash = SENTINEL + hash;
      const result = await actor.uploadStagePhoto(
        stageId,
        description.trim(),
        blobHash,
        selectedDistance ?? null,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      clearFile();
      setDescription("");
      setUploadProgress(0);
      setError(null);
      onClearDistance();
      onSuccess();
    },
    onError: (e: Error) => {
      setError(e.message);
      setUploadProgress(0);
    },
  });

  const isPending = uploadMutation.isPending;

  return (
    <div
      className="wood-texture rounded-xl bg-card border border-border overflow-hidden"
      data-ocid="upload-panel"
    >
      <div className="h-1 w-full bg-primary opacity-70" />
      <div className="p-5 flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
          Foto hochladen
        </p>

        {/* File picker */}
        {!preview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/70 bg-background/40 py-10 px-6 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors duration-200 cursor-pointer"
            data-ocid="photo-picker-btn"
            aria-label="Foto aus Galerie oder Kamera auswählen"
          >
            <Camera size={28} className="text-primary opacity-60" />
            <span className="text-sm font-semibold">Foto auswählen</span>
            <span className="text-xs opacity-60">Kamera oder Galerie</span>
          </button>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={preview}
              alt="Vorschau"
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-card/80 border border-border text-foreground hover:bg-card hover:text-primary transition-colors duration-200"
              aria-label="Foto entfernen"
              data-ocid="remove-photo-btn"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
          tabIndex={-1}
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="photo-description"
              className="text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground"
            >
              Beschreibung
            </label>
            <span
              className={`text-xs tabular-nums ${description.length > MAX_DESC - 20 ? "text-primary" : "text-muted-foreground"}`}
            >
              {description.length}/{MAX_DESC}
            </span>
          </div>
          <Textarea
            id="photo-description"
            placeholder="Wo wurde das Foto gemacht? Was ist zu sehen?"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
            rows={3}
            className="resize-none text-sm bg-background/60"
            data-ocid="photo-description-input"
          />
        </div>

        {/* Selected position indicator */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 border text-sm"
          style={{
            borderColor:
              selectedDistance != null
                ? "oklch(var(--accent) / 0.6)"
                : "oklch(var(--border))",
            background:
              selectedDistance != null
                ? "oklch(var(--accent) / 0.08)"
                : "oklch(var(--muted) / 0.3)",
          }}
          data-ocid="position-indicator"
        >
          <MapPin
            size={14}
            style={{
              color:
                selectedDistance != null
                  ? "oklch(var(--accent))"
                  : "oklch(var(--muted-foreground))",
            }}
          />
          <span
            className="flex-1 text-xs font-semibold"
            style={{
              color:
                selectedDistance != null
                  ? "oklch(var(--accent))"
                  : "oklch(var(--muted-foreground))",
            }}
          >
            {selectedDistance != null
              ? `Aufnahmeort: ${selectedDistance.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
              : "Kein Punkt im Höhenprofil gewählt"}
          </span>
          {selectedDistance != null && (
            <button
              type="button"
              onClick={onClearDistance}
              className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-card transition-colors duration-200"
              aria-label="Position zurücksetzen"
              data-ocid="clear-position-btn"
            >
              <X size={10} style={{ color: "oklch(var(--accent))" }} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {isPending && uploadProgress > 0 && (
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right tabular-nums">
              {uploadProgress}%
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Save button */}
        <Button
          type="button"
          onClick={() => uploadMutation.mutate()}
          disabled={!file || isPending}
          className="w-full font-semibold"
          data-ocid="save-photo-btn"
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Wird hochgeladen…
            </>
          ) : (
            <>
              <Upload size={14} />
              Foto speichern
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Photo lightbox ───────────────────────────────────────────────────────────

interface PhotoLightboxProps {
  photo: PhotoWithUrl;
  onClose: () => void;
}

function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(var(--foreground) / 0.6)" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-ocid="photo-lightbox-overlay"
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
          data-ocid="photo-lightbox-close"
        >
          <X size={16} />
        </button>

        {/* Image */}
        <div className="w-full overflow-hidden" style={{ maxHeight: "55dvh" }}>
          {photo.imageUrl ? (
            <img
              src={photo.imageUrl}
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

// ─── Photo card ───────────────────────────────────────────────────────────────

interface PhotoCardProps {
  photo: PhotoWithUrl;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onEnlarge: (photo: PhotoWithUrl) => void;
}

function PhotoCard({
  photo,
  isAdmin,
  onDelete,
  isDeleting,
  onEnlarge,
}: PhotoCardProps) {
  const date = new Date(Number(photo.timestamp / 1_000_000n));
  const formattedDate = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div
      className="wood-texture relative rounded-xl bg-card border border-border overflow-hidden"
      data-ocid={`photo-card-${photo.id}`}
    >
      <div className="h-1 w-full bg-primary opacity-70" />
      {/* Image — clickable to enlarge */}
      <div className="w-full aspect-[4/3] bg-muted overflow-hidden">
        {photo.imageUrl ? (
          <button
            type="button"
            className="w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            onClick={() => onEnlarge(photo)}
            aria-label="Foto vergrößern"
            data-ocid={`enlarge-photo-${photo.id}`}
          >
            <img
              src={photo.imageUrl}
              alt={photo.description || "Etappenfoto"}
              className="w-full h-full object-cover cursor-zoom-in transition-[filter] duration-200 hover:brightness-110"
              loading="lazy"
            />
          </button>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 size={20} className="text-muted-foreground animate-spin" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {photo.description && (
          <p className="text-sm text-foreground leading-relaxed">
            {photo.description}
          </p>
        )}
        {photo.distanceKm != null && (
          <p
            className="text-xs font-semibold"
            style={{ color: "oklch(var(--accent))" }}
          >
            📍{" "}
            {photo.distanceKm.toLocaleString("de-DE", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            km
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formattedDate}
          </span>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onDelete(photo.id)}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200 disabled:opacity-40"
              aria-label="Foto löschen"
              data-ocid={`delete-photo-${photo.id}`}
            >
              {isDeleting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              Löschen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StagePhotoSection({
  stageId,
  selectedDistance,
  onClearDistance,
}: StagePhotoSectionProps) {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor(createActor);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string | null>>({});
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoWithUrl | null>(null);

  // Check admin status
  const { data: isAdmin = false } = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity && !isActorFetching,
  });

  // Fetch photos for this stage
  const photosKey = ["stagePhotos", stageId.toString()];
  const { data: photos = [], isLoading: isLoadingPhotos } = useQuery<
    StagePhoto[]
  >({
    queryKey: photosKey,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStagePhotos(stageId);
    },
    enabled: !!actor && !isActorFetching,
  });

  // Resolve image URLs for each photo
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

  const handleDelete = async (photoId: string) => {
    if (!actor) return;
    setDeletingId(photoId);
    try {
      await actor.deleteStagePhoto(photoId);
      queryClient.invalidateQueries({ queryKey: photosKey });
    } finally {
      setDeletingId(null);
    }
  };

  const photosWithUrls: PhotoWithUrl[] = photos.map((p) => ({
    ...p,
    imageUrl: photoUrls[p.id] ?? null,
  }));

  const showUploadPanel = isAdmin && !!actor;
  const showEmptyHint = isAdmin && !isLoadingPhotos && photos.length === 0;

  return (
    <div className="flex flex-col gap-6" data-ocid="stage-photo-section">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          Fotos &amp; Eindrücke
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Admin upload panel */}
      {showUploadPanel && (
        <UploadPanel
          stageId={stageId}
          actor={actor}
          selectedDistance={selectedDistance}
          onClearDistance={onClearDistance}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: photosKey })
          }
        />
      )}

      {/* Loading state */}
      {isLoadingPhotos && (
        <div
          className="flex items-center justify-center py-10"
          data-ocid="photos-loading"
        >
          <Loader2 size={20} className="text-muted-foreground animate-spin" />
        </div>
      )}

      {/* Empty admin hint */}
      {showEmptyHint && !isLoadingPhotos && (
        <p className="text-center text-xs text-muted-foreground py-4">
          Noch keine Fotos für diese Etappe — lade das erste hoch!
        </p>
      )}

      {/* Photo gallery grid */}
      {photosWithUrls.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-ocid="photos-gallery"
        >
          {photosWithUrls.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              isDeleting={deletingId === photo.id}
              onEnlarge={setLightboxPhoto}
            />
          ))}
        </div>
      )}

      {/* Photo lightbox */}
      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
        />
      )}
    </div>
  );
}
