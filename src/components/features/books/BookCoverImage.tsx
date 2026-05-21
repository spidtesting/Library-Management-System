import Image from "next/image";
import { isCoverDataUrl } from "@/lib/cover-image";
import { cn } from "@/lib/utils";

export function BookCoverImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
}) {
  if (isCoverDataUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- base64 data URLs
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(className, fill && "h-full w-full object-cover")}
      />
    );
  }

  if (fill) {
    return (
      <Image src={src} alt={alt} fill className={cn("object-cover", className)} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 200}
      height={height ?? 280}
      className={className}
    />
  );
}
