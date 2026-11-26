# Third-party notices

This repository includes or depends on the open-source work below. No third-party art and no Arc Pro items are included. The logo and illustrations are original.

## Included in this repository

| Work | Where | License | Notice |
| --- | --- | --- | --- |
| Arc UI free components and blocks ([uiarc.dev](https://uiarc.dev/)) | `shared/components/arc/` | MIT | `shared/components/arc/LICENSE` |
| Geist, Geist Mono | `brand/fonts/` (license texts), bundled from npm | SIL OFL 1.1 | `brand/fonts/OFL-geist.txt`, `brand/fonts/OFL-geist-mono.txt` |
| Inter | `brand/fonts/` (license text), bundled from npm | SIL OFL 1.1 | `brand/fonts/OFL-inter.txt` |

Only Arc free items are vendored. `shared/arc-tiers.lock.json` records the tier of every Arc catalog item, and `npm run check:arc-pro` fails if a Pro item is vendored, imported or configured.

The vendored Arc files were installed with the shadcn CLI from the public `@uiarc` registry. The `next/image` import in the Arc site header is served by a small shim in `shared/shims/next-image.tsx`, not by Next.js.

## npm dependencies (not vendored)

These are installed by `npm install` and bundled into the built pages. Their license files ship in their npm packages.

| Package | License |
| --- | --- |
| `react`, `react-dom` | MIT |
| `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip` | MIT |
| `motion` | MIT |
| `lucide-react` (interface icons such as arrows and chevrons; not used in the logo or illustrations) | ISC |
| `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource-variable/inter` | OFL-1.1 |

Build and test tools (`vite`, `@vitejs/plugin-react`, `typescript`, `playwright`) are used only during development and are not part of the built pages.
