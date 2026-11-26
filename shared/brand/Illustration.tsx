import omerUnit from "../../brand/illustrations/omer-unit.svg?raw";
import rewardStreams from "../../brand/illustrations/reward-streams.svg?raw";
import glyphCredit from "../../brand/illustrations/glyph-credit.svg?raw";
import glyphOmer from "../../brand/illustrations/glyph-omer.svg?raw";
import glyphPool from "../../brand/illustrations/glyph-pool.svg?raw";
import glyphRoute from "../../brand/illustrations/glyph-route.svg?raw";
import styles from "./illustration.module.css";

const sources = {
  "omer-unit": omerUnit,
  "reward-streams": rewardStreams,
  "glyph-credit": glyphCredit,
  "glyph-omer": glyphOmer,
  "glyph-pool": glyphPool,
  "glyph-route": glyphRoute,
} as const;

export type IllustrationName = keyof typeof sources;

/**
 * Inlines one of the brand SVGs from brand/illustrations so its var(--token) fills follow the page theme.
 * The SVG files are first-party, static and bundled at build time.
 */
export function Illustration({ name, className, size }: { name: IllustrationName; className?: string; size?: "glyph" | "full" }) {
  return (
    <span
      className={[styles.illustration, size === "glyph" ? styles.glyph : styles.full, className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: sources[name] }}
    />
  );
}

export default Illustration;
