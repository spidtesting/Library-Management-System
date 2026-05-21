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
  watchCameraPermission,
  type CoverPermissionState,
} from "@/lib/cover-image";
import { Camera, ImageIcon, RefreshCw, Shield, Upload, X } from "lucide-react";
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, setPermission] = useState<CoverPermissionState>("prompt");

  useEffect(() => {
    void getCameraPermissionState().then(setPermission);
    return watchCameraPermission(setPermission);
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

  async function refreshPermission() {
    const next = await getCameraPermissionState();
    setPermission(next);
    toast.message(
      next === "granted"
        ? "Camera access is allowed"
        : next === "denied"
          ? "Camera is still blocked"
          : "Camera will ask when you take a photo"
    );
  }

  function openCamera() {
    if (permission === "unsupported") {
      cameraInputRef.current?.click();
      return;
    }
    setCameraOpen(true);
  }

  return (
    <div className="space-y-4">
      <CoverPermissionsCard permission={permission} onRefresh={refreshPermission} />

      <div className="space-y-2">
        <Label>Book cover (max 2MB)</Label>
        <div
          className={cn(
            "relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30 sm:min-h-[220px]",
            value && "border-solid"
          )}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Cover preview"
                className="max-h-[240px] w-full object-contain sm:max-h-[280px]"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 h-9 w-9 touch-target"
                disabled={disabled}
                onClick={() => onChange(null)}
                aria-label="Remove cover"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-muted-foreground sm:p-6">
              <ImageIcon className="h-10 w-10 opacity-50" />
              <p>Upload a photo or use your camera</p>
              <p className="text-xs">JPEG, PNG, or WebP · up to 2MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:flex sm:flex-wrap">
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
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
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
          className="h-11 w-full gap-2 sm:w-auto"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 shrink-0" />
          Upload image
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 sm:w-auto"
          disabled={disabled || permission === "denied"}
          onClick={openCamera}
        >
          <Camera className="h-4 w-4 shrink-0" />
          {permission === "unsupported" ? "Use camera app" : "Take photo"}
        </Button>
      </div>

      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(dataUrl) => {
          onChange(dataUrl);
          setCameraOpen(false);
          void getCameraPermissionState().then(setPermission);
        }}
        onPermissionChange={setPermission}
      />
    </div>
  );
}

function CoverPermissionsCard({
  permission,
  onRefresh,
}: {
  permission: CoverPermissionState;
  onRefresh: () => void;
}) {
  const rows: { label: string; detail: string; status: CoverPermissionState }[] = [
    {
      label: "Photo library / files",
      detail: "Pick an image from your device. No extra permission needed.",
      status: "granted",
    },
    {
      label: "Camera",
      detail:
        permission === "denied"
          ? "Blocked — enable camera for this site in browser settings, then tap Check again."
          : permission === "unsupported"
            ? "Live preview unavailable here. Use Take photo to open your device camera app."
            : permission === "granted"
              ? "Allowed — live camera preview is ready."
              : "Your browser will ask when you tap Take photo.",
      status: permission === "unsupported" ? "unsupported" : permission,
    },
  ];

  return (
    <div className="rounded-lg border border-brand/20 bg-brand/[0.04] p-3 text-sm sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-medium text-brand">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Camera & photo permissions
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-full gap-2 sm:w-auto"
          onClick={onRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Check again
        </Button>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.label} className="flex gap-3">
            <PermissionBadge state={row.status} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{row.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{row.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      {permission === "denied" && (
        <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/[0.08] p-3 text-xs text-muted-foreground">
          <p className="font-medium text-amber-800 dark:text-amber-300">How to allow camera</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1">
            <li>
              <strong>iPhone/iPad (Safari):</strong> Settings → Safari → Camera → Allow, or tap the
              aA icon in the address bar → Website Settings.
            </li>
            <li>
              <strong>Android (Chrome):</strong> Tap the lock icon in the address bar → Permissions
              → Camera → Allow.
            </li>
            <li>
              <strong>Desktop:</strong> Click the camera icon in the address bar and allow access
              for this site.
            </li>
          </ul>
        </div>
      )}
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
    unsupported: "Fallback",
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
          setError("Camera permission denied. Allow camera access for this site, then try again.");
          onPermissionChange("denied");
        } else if (name === "NotFoundError") {
          setError("No camera found on this device.");
          onPermissionChange("unsupported");
        } else {
          setError("Could not open camera. Try Upload image instead.");
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
      <DialogContent className="flex max-h-[95dvh] w-[calc(100%-0.5rem)] max-w-lg flex-col gap-3 p-3 sm:p-4 md:max-w-xl">
        <DialogHeader className="text-left">
          <DialogTitle>Take cover photo</DialogTitle>
          <DialogDescription>
            Position the book cover in frame. On mobile, hold the device steady and use good
            lighting.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="relative aspect-[3/4] max-h-[55dvh] w-full overflow-hidden rounded-lg bg-black sm:aspect-[4/3]">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={cn("h-full w-full object-cover", !ready && "opacity-0")}
            />
            {!ready && !error && (
              <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-white/80">
                Starting camera…
              </p>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-white">
                <p>{error}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 w-full sm:w-auto"
              disabled={!ready}
              onClick={capture}
            >
              Capture photo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
