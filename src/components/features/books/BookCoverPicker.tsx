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
  validateCoverFile,
} from "@/lib/cover-image";
import {
  CameraPermissionsSection,
  useCameraPermission,
} from "@/components/features/books/CameraPermissionsSection";
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const permission = useCameraPermission();

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

  function openCamera() {
    if (permission === "unsupported") {
      cameraInputRef.current?.click();
      return;
    }
    setCameraOpen(true);
  }

  return (
    <div className="space-y-4">
      <CameraPermissionsSection />

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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          className="h-11 w-full gap-2"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 shrink-0" />
          Upload image
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2"
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
        }}
      />
    </div>
  );
}

function CameraCaptureDialog({
  open,
  onOpenChange,
  onCapture,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (dataUrl: string) => void;
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
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setError("Camera permission denied. Allow camera access for this site, then try again.");
        } else if (name === "NotFoundError") {
          setError("No camera found on this device.");
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
  }, [open, stopStream]);

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
      <DialogContent className="flex max-h-[95dvh] w-[calc(100%-1rem)] max-w-lg flex-col gap-3 p-3 sm:w-full sm:p-4 md:max-w-xl">
        <DialogHeader className="text-left">
          <DialogTitle>Take cover photo</DialogTitle>
          <DialogDescription>
            Position the book cover in frame. On mobile and tablet, hold the device steady and use
            good lighting.
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
