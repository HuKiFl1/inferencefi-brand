import "@fontsource-variable/geist";
import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "../components/arc/foundation.css";
import "../../brand/tokens.css";
import "./global.css";

export type Theme = "light" | "dark";

/** Reads ?theme=light|dark, then the OS preference, and sets data-theme on <html> before the first render. */
export function initTheme(): Theme {
  const param = new URLSearchParams(window.location.search).get("theme");
  const theme: Theme = param === "dark" || param === "light"
    ? param
    : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  return theme;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}
