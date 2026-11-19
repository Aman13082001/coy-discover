"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src: string;
  name: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Fills its (relative) parent. Falls back to an initial on a warm tile if the image fails. */
export function ProfilePhoto({ src, name, sizes, priority, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${name} (photo unavailable)`}
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-coral-soft to-paper-deep ${className}`}
      >
        <span className="font-display text-6xl font-semibold text-coral/70">{name.charAt(0)}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`Photo of ${name}`}
      fill
      sizes={sizes}
      priority={priority}
      draggable={false}
      onError={() => setFailed(true)}
      className={`pointer-events-none select-none object-cover ${className}`}
    />
  );
}
