"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { DEFAULT_ATHLETE_AVATAR, getAvatarSrc } from "@/utils/avatar";

type AvatarFut7ProProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  src?: string | null;
  alt: string;
  size?: number;
  width?: number;
  height?: number;
  fallbackSrc?: string;
};

export default function AvatarFut7Pro({
  src,
  alt,
  size = 40,
  width,
  height,
  fallbackSrc = DEFAULT_ATHLETE_AVATAR,
  onError,
  ...props
}: AvatarFut7ProProps) {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;
  const safeSrc = getAvatarSrc(src, fallbackSrc);
  const [currentSrc, setCurrentSrc] = useState<string>(safeSrc);

  useEffect(() => {
    setCurrentSrc(safeSrc);
  }, [safeSrc]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
