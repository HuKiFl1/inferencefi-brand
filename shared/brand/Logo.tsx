import { logoData } from "./logo-data";
import styles from "./logo.module.css";

type LogoVariant = "mark" | "lockup" | "wordmark" | "short";

export interface LogoProps {
  variant?: LogoVariant;
  /** Rendered height in px. */
  height?: number;
  /** Accessible name. Pass an empty string when a visible label sits beside the logo. */
  title?: string;
  className?: string;
}

function Mark({ x = 0, y = 0, size = 100 }: { x?: number; y?: number; size?: number }) {
  const { tile, curve, curveWidth, axes, axesWidth, dot } = logoData.mark;
  const scale = size / 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect className={styles.tile} x={tile.x} y={tile.y} width={tile.width} height={tile.height} rx={tile.rx} />
      <path className={styles.axes} d={axes} strokeWidth={axesWidth} />
      <path className={styles.curve} d={curve} strokeWidth={curveWidth} />
      <circle className={styles.dot} cx={dot.cx} cy={dot.cy} r={dot.r} strokeWidth={dot.ring} />
    </g>
  );
}

function Word({ text, x = 0 }: { text: "full" | "short"; x?: number }) {
  const word = logoData[text];
  return (
    <g transform={`translate(${x} 0)`}>
      <g className={styles.ink} strokeWidth={logoData.stroke}>
        {word.parts.map((part, index) => (
          <g key={index} transform={`translate(${part.x} 0)`}>
            {part.d.map(d => <path key={d} d={d} />)}
          </g>
        ))}
      </g>
      {word.parts.map((part, index) => part.dot && <circle key={`dot-${index}`} className={styles.letterDot} cx={part.dot.cx} cy={part.dot.cy} r={part.dot.r} />)}
    </g>
  );
}

export function Logo({ variant = "lockup", height = 28, title = "Inference Finance", className }: LogoProps) {
  const { top, height: wordHeight } = logoData;
  const gap = 40;
  let width: number;
  let viewBox: string;
  let content;
  if (variant === "mark") {
    width = 100;
    viewBox = "0 0 100 100";
    content = <Mark />;
  } else if (variant === "lockup") {
    width = wordHeight + gap + logoData.full.width;
    viewBox = `0 ${top} ${width} ${wordHeight}`;
    content = <><Mark y={top} size={wordHeight} /><Word text="full" x={wordHeight + gap} /></>;
  } else {
    const word = variant === "short" ? logoData.short : logoData.full;
    width = word.width;
    viewBox = `0 ${top} ${width} ${wordHeight}`;
    content = <Word text={variant === "short" ? "short" : "full"} />;
  }
  const ratio = variant === "mark" ? 1 : width / wordHeight;
  const decorative = title === "";
  return (
    <svg
      className={[styles.logo, className].filter(Boolean).join(" ")}
      viewBox={viewBox}
      height={height}
      width={Math.round(height * ratio)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    >
      {content}
    </svg>
  );
}

export default Logo;
