import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import type { Plugin, UserConfig } from "vite";

const shared = fileURLToPath(new URL("..", import.meta.url));

/**
 * Built pages may load only their own bundled scripts, styles, fonts and images, and may open no network
 * connections at all. Applied to production builds only, so the dev server keeps hot reload.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

function contentSecurityPolicy(): Plugin {
  return {
    name: "inferencefi-csp",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace("<head>", `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="no-referrer" />`);
    },
  };
}

export function appConfig({ devPort, previewPort }: { devPort: number; previewPort: number }): UserConfig {
  return {
    base: "./",
    plugins: [react(), contentSecurityPolicy()],
    resolve: {
      alias: {
        "@arc": `${shared}components/arc`,
        "@shared": shared.replace(/\/$/, ""),
        "next/image": `${shared}shims/next-image.tsx`,
      },
    },
    server: { host: "127.0.0.1", port: devPort, strictPort: true, fs: { allow: [".."] } },
    preview: { host: "127.0.0.1", port: previewPort, strictPort: true },
    build: { sourcemap: false, assetsInlineLimit: 0, chunkSizeWarningLimit: 800, modulePreload: { polyfill: false } },
  };
}
