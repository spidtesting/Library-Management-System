"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ALLOWED_COVER_TYPES, MAX_COVER_SIZE_BYTES } from "@/lib/constants";
import {
  fileToDataUrl,
  getCameraPermissionState,
  validateCoverFile,
  type CoverPermissionState,
} from "@/lib/cover-image";
import { Camera, ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BookCoverPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, setPermission] = useState<CoverPermissionState>("prompt");

  useEffect(() => {
    getCameraPermissionState().then(setPermission);
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const err = validateCoverFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
      toast.success("Cover image added");
    } catch {
      toast.error("Could not read image");
    }
  }

  return (
    <div className="space-y-4">
      <CoverPermissionsCard permission={permission} />

      <div className="space-y-2">
        <Label>Book cover (max 2MB)</Label>
        <div
          className={cn(
            "relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30",
            value && "border-solid"
          )}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Cover preview"
                className="max-h-[280px] w-full object-contain"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 h-8 w-8"
                disabled={disabled}
                onClick={() => onChange(null)}
                aria-label="Remove cover"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-50" />
              <p>Upload a photo or use your camera</p>
              <p className="text-xs">JPEG, PNG, or WebP · up to 2MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_COVER_TYPES.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Upload image
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={disabled || permission === "denied"}
          onClick={() => setCameraOpen(true)}
        >
          <Camera className="h-4 w-4" />
          Take photo
        </Button>
      </div>

      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(dataUrl) => {
          onChange(dataUrl);
          setCameraOpen(false);
          getCameraPermissionState().then(setPermission);
        }}
        onPermissionChange={setPermission}
      />
    </div>
  );
}

function CoverPermissionsCard({ permission }: { permission: CoverPermissionState }) {
  const rows: { label: string; detail: string; status: CoverPermissionState }[] = [
    {
      label: "File upload",
      detail: "Choose an image from your device (no extra permission).",
      status: "granted",
    },
    {
      label: "Camera",
      detail:
        permission === "denied"
          ? "Blocked — allow camera in browser site settings, then retry."
          : permission === "unsupported"
            ? "Not available in this browser; use Upload image instead."
            : permission === "granted"
              ? "Allowed — you can take a photo."
              : "Will ask when you tap Take photo.",
      status: permission === "unsupported" ? "unsupported" : permission,
    },
  ];

  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-sm">
      <p className="mb-2 font-medium">Permissions</p>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="flex gap-2">
            <PermissionBadge state={row.status} />
            <div>
              <p className="font-medium">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PermissionBadge({ state }: { state: CoverPermissionState }) {
  const styles: Record<CoverPermissionState, string> = {
    granted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    denied: "bg-destructive/15 text-destructive",
    prompt: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    unsupported: "bg-muted text-muted-foreground",
  };
  const labels: Record<CoverPermissionState, string> = {
    granted: "Allowed",
    denied: "Blocked",
    prompt: "Ask",
    unsupported: "N/A",
  };
  return (
    <span
      className={cn(
        "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[state]
      )}
    >
      {labels[state]}
    </span>
  );
}

function CameraCaptureDialog({
  open,
  onOpenChange,
  onCapture,
  onPermissionChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (dataUrl: string) => void;
  onPermissionChange: (state: CoverPermissionState) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopStream();
      setError(null);
      return;
    }

    let cancelled = false;

    async function start() {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
        onPermissionChange("granted");
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setError("Camera permission denied. Allow camera access for this site.");
          onPermissionChange("denied");
        } else if (name === "NotFoundError") {
          setError("No camera found on this device.");
          onPermissionChange("unsupported");
        } else {
          setError("Could not open camera. Try uploading an image instead.");
        }
        setReady(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, stopStream, onPermissionChange]);

  function capture() {
    const video = videoRef.current;
    if (!video || !ready) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    let quality = 0.92;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > MAX_COVER_SIZE_BYTES * 1.37 && quality > 0.5) {
      quality -= 0.08;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    const base64Len = (dataUrl.split(",")[1]?.length ?? 0) * 0.75;
    if (base64Len > MAX_COVER_SIZE_BYTES) {
      toast.error("Photo is too large. Move closer or use Upload with a smaller file.");
      return;
    }

    onCapture(dataUrl);
    toast.success("Photo captured");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Take cover photo</DialogTitle>
          <DialogDescription>
            Position the book cover in frame, then capture. Saved as JPEG (max 2MB).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className={cn("h-full w-full object-cover", !ready && "opacity-0")}
            />
            {!ready && !error && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
                Starting camera…
              </p>
            )}
            {error && (
              <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!ready} onClick={capture}>
              Capture
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
