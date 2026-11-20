"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { DEFAULT_ATHLETE_AVATAR, getAvatarSrc } from "@/utils/avatar";

type AvatarFut7ProProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  src?: string | null;
  alt: string;
  size?: number;
  width?: number;
  height?: number;
  fallbackSrc?: string;
};

export default function AvatarFut7Pro({ src, fallbackSrc, ...props }: AvatarFut7ProProps) {
  const fallback = getAvatarSrc(fallbackSrc, DEFAULT_ATHLETE_AVATAR);
  const source = getAvatarSrc(src, fallback);
  // Uma nova foto (ou sua remoção) reinicia o estado de erro imediatamente.
  return (
    <AvatarImage key={`${source}:${fallback}`} {...props} src={source} fallbackSrc={fallback} />
  );
}

function AvatarImage({
  src,
  fallbackSrc,
  alt,
  size = 40,
  width,
  height,
  onError,
  ...props
}: AvatarFut7ProProps & { src: string; fallbackSrc: string }) {
  const [failed, setFailed] = useState(false);
  const currentSrc = failed ? fallbackSrc : src;
  const placeholder = currentSrc === DEFAULT_ATHLETE_AVATAR;
  const dimensions = props.fill ? {} : { width: width ?? size, height: height ?? size };
  return (
    <Image
      {...props}
      {...dimensions}
      src={currentSrc}
      alt={placeholder && alt ? `${alt} (sem foto)` : alt}
      data-avatar-placeholder={placeholder ? "true" : undefined}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) setFailed(true);
      }}
    />
  );
}
