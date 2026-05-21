import { ALLOWED_COVER_TYPES, MAX_COVER_SIZE_BYTES } from "@/lib/constants";

const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,/i;

export type CoverPermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported";

/** Standard Permissions API check for camera (where supported). */
export async function getCameraPermissionState(): Promise<CoverPermissionState> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  if (!navigator.permissions?.query) {
    return "prompt";
  }
  try {
    const result = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    if (result.state === "granted") return "granted";
    if (result.state === "denied") return "denied";
    return "prompt";
  } catch {
    return "prompt";
  }
}

/** Re-check when the user changes camera permission in browser settings. */
export function watchCameraPermission(
  callback: (state: CoverPermissionState) => void
): () => void {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    void getCameraPermissionState().then(callback);
    return () => undefined;
  }

  let disposed = false;
  let permissionStatus: PermissionStatus | null = null;

  const onChange = () => {
    if (!permissionStatus || disposed) return;
    if (permissionStatus.state === "granted") callback("granted");
    else if (permissionStatus.state === "denied") callback("denied");
    else callback("prompt");
  };

  void navigator.permissions
    .query({ name: "camera" as PermissionName })
    .then((status) => {
      if (disposed) return;
      permissionStatus = status;
      onChange();
      status.addEventListener("change", onChange);
    })
    .catch(() => {
      void getCameraPermissionState().then(callback);
    });

  return () => {
    disposed = true;
    permissionStatus?.removeEventListener("change", onChange);
  };
}

export function validateCoverFile(file: File): string | null {
  if (!ALLOWED_COVER_TYPES.includes(file.type)) {
    return "Use JPEG, PNG, or WebP";
  }
  if (file.size > MAX_COVER_SIZE_BYTES) {
    return "Image must be 2MB or smaller";
  }
  return null;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read image"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

export function dataUrlByteLength(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
}

export function isValidCoverDataUrl(value: string): boolean {
  if (!DATA_URL_PATTERN.test(value)) return false;
  return dataUrlByteLength(value) <= MAX_COVER_SIZE_BYTES;
}

export function validateCoverDataUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  if (!DATA_URL_PATTERN.test(value)) return "Invalid cover image format";
  if (dataUrlByteLength(value) > MAX_COVER_SIZE_BYTES) {
    return "Cover image must be 2MB or smaller";
  }
  return null;
}

export function isCoverDataUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("data:image/"));
}
