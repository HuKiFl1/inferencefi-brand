import type { ImgHTMLAttributes } from "react";

/** Vite stand-in for next/image, which one vendored Arc block imports. Renders a plain <img>. */
type ImageProps = ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean };

export default function Image({ fill, priority, style, ...props }: ImageProps) {
  void priority;
  const fillStyle = fill ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "cover" as const } : undefined;
  return <img {...props} style={{ ...fillStyle, ...style }} />;
}
