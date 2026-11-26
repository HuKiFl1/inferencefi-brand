# inferencefi-brand

Brand kit, design system and marketing-site design for **Inference Finance** (working name, short form InferenceFi). This repository covers the brand identity (IF-W6), the marketing site design (IF-W7) and the launch content drafts (IF-W8), which together make milestone IF-M2: a brand kit, plus screen designs for swap, pools, liquidity and the agent dashboard, built on Arc UI role tokens in light and dark.

> Testnet rehearsal on HyperEVM testnet (chain 998) with labelled TEST mocks. Unaudited. Nothing deployed. No token exists.

Inference Finance is a stableswap AMM design for FLOP and Pearl inference credits, priced in OMER:

> 1 OMER = 1 IU = 750k input + 250k output tokens of a tier's reference model

FLOP and Pearl are the sources of the credits. The AMM is a separate protocol. Everything here is a design preview: the site and screens use static mock data, make no network calls, and cannot connect a wallet, sign or send.

## Run it locally

Requires Node 20 or later.

```bash
npm install
npm run dev:site      # marketing site at http://127.0.0.1:47321
npm run dev:screens   # app screens at http://127.0.0.1:47322
```

The screens take URL parameters, so every state has a link:

| URL | State |
| --- | --- |
| `?screen=swap` | Four-hop quote with the dynamic-fee readout |
| `?screen=swap&state=stale` | Rates stale, swap disabled |
| `?screen=pools` | StablePool and CryptoPool list (also `&state=loading`, `empty` or `error`) |
| `?screen=lp&mode=imbalanced` | Add liquidity (also `proportional` or `one-coin`) |
| `?screen=lp&tab=remove&pool=stable-t3` | Remove from a pool with stale rates: proportional still works |
| `?screen=dashboard` | Agent ID, spend cap, reward streams |

Add `&theme=dark` or `&theme=light` to any URL, or use the theme switch.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Regenerates `brand/tokens.css` and the logos, then type-checks and builds both apps into `dist/` |
| `npm test` | Builds, then runs every test in `tests/` |
| `npm run check` | Arc Pro guard, contrast check and personal-data scan, without a build |
| `npm run check:runtime` | Checks the built pages for network calls, external loads and trackers |
| `npm run screenshots` | Captures every page and screen in light and dark into `design/` (run `npx playwright install chromium` once first) |
| `npm run export` | Writes a reproducible tarball of the tracked files, with its sha256 |

## Tests and guards

`npm test` fails if any of these fail:

- **Build:** both apps type-check and build.
- **Arc free only** (`scripts/check-arc-pro.mjs`): every vendored Arc item must be on the free list in `shared/arc-tiers.lock.json`. No Pro item may be vendored or imported, no Pro registry may be configured and no Pro token may be referenced. `node scripts/check-arc-pro.mjs --refresh` re-reads the live catalog tiers.
- **Contrast** (`scripts/check-contrast.mjs`): every text and graphics pair in `brand/tokens.json` must meet WCAG AA in both themes.
- **Tokens only:** no raw hex, `rgb()` or `hsl()` values in first-party UI code, and `tokens.css` must match `tokens.json`.
- **Personal data** (`scripts/check-personal-data.mjs`): no emails, local paths, keys, seeds, DIDs or listed names in any tracked file.
- **Runtime** (`scripts/check-runtime.mjs`): the built pages carry a CSP with `connect-src 'none'`, load nothing from another origin, contain no network APIs and no trackers.
- **Copy:** the OMER unit and the chain message appear word for word. There are no live, audited, sale, price or return claims, no ticker or supply for the reward token, and no copy saying the protocol is FLOP-native. There are no em dashes, and the launch drafts are marked DRAFT.

## What is in here

```
brand/
  BRAND.md             name rationale, naming proposal IF-D1, positioning, voice, logo rules, palette
  TYPE_SCALE.md        families, weights and the type scale
  tokens.json          palette and Arc role tokens, light and dark (source of truth)
  tokens.css           generated CSS variables
  logo/                mark, wordmark, short wordmark and lockup: light, dark, mono black, mono white, favicon
  illustrations/       OMER unit grid, reward streams, four step glyphs
  fonts/               OFL license texts and font notes
site/                  marketing site (Vite, React, Arc free components)
app-screens/           read-only Swap, Pools, Liquidity and Dashboard screens with SDK-shaped mock data
shared/                vendored Arc free components, brand React pieces, shared Vite config
content/
  LAUNCH_DRAFTS.md     DRAFT site copy, five X posts, a thread and an announcement. Not to be posted.
design/                PNG screenshots, light and dark
scripts/               token, logo, check, screenshot and export scripts
tests/                 node:test suites
```

### Screenshots

All of these are in `design/`, each as `-light.png` and `-dark.png`:

- `site-desktop`, `site-mobile`
- `brand-sheet`: marks, lockups, role tokens, type scale and illustrations
- `screen-swap`, `screen-swap-rates-stale`, `screen-swap-mobile`
- `screen-pools`
- `screen-lp-add`, `screen-lp-remove-stale`
- `screen-dashboard`

## Design rules

- **UI components:** only Arc UI free components ([uiarc.dev](https://uiarc.dev/)), installed with the shadcn CLI from the public `@uiarc` registry into `shared/components/arc/`. No Arc Pro.
- **Colour:** components use Arc role tokens (`--background`, `--surface`, `--accent` and the rest) and never a raw colour. Brand extensions such as `--brand-ember` are tokens too.
- **Writing:** sentence case, no eyebrow labels, no em dashes, and only weights 400 and 500.
- **Art:** the logo and illustrations are original, hand-written SVG. The only fonts are open fonts under the SIL OFL.
- **Hosting:** nothing is deployed or hosted, no domain has been bought, and no social account has been created.

## Licenses

- **Code:** MIT, see `LICENSE`.
- **Brand assets:** everything in `brand/` except the fonts, the PNGs in `design/`, and `content/LAUNCH_DRAFTS.md` are CC BY 4.0, see `LICENSE-ASSETS.md`. That license grants no trademark rights.
- **Fonts:** Geist, Geist Mono and Inter are under SIL OFL 1.1, see `brand/fonts/FONTS.md`.
- **Arc UI free components:** MIT, see `shared/components/arc/LICENSE`. Other dependencies are listed in `THIRD_PARTY_NOTICES.md`.

Credit: HuKiFl1.

## Open questions for the protocol owner

1. **Naming (IF-D1):** keep "Inference Finance", or pick Creditcurve, Omerswap or Workrate (see `brand/BRAND.md`)? None has had a trademark, domain or handle check. "Omerswap" also needs a sensitivity review, because the omer is a religious observance.
2. **Companion repository framing:** the README of `inferencefi-stableswap` still describes a FLOP-native module. Should it be updated to match this framing, where the AMM is separate and FLOP and Pearl are credit sources?
3. **SDK output shapes:** the mock data follows the field names I could infer (quotes, routes, rates with age, shares, rewards by stream). Please confirm them against the SDK before the screens are treated as a spec.
4. **Reward points:** the dashboard shows points per stream (spend, liquidity, fees) and calls them "not a token". Is "points" the right word, and how should the split between streams be described?
5. **Fee parameters:** base, slope and the fee cap are placeholders. Should any real values be shown, or should the screens stay symbolic?
6. **Epochs and spend caps:** the screens assume a cap in OMER per epoch that takes effect one epoch after it is raised. How long is an epoch, and does lowering a cap take effect at once?
7. **Rate staleness:** the mocks use a 15 minute limit. What is the real limit per tier, and who runs the keepers that update rates?
8. **HyperEVM testnet addresses:** none are set, so the screens show chain 31337 (local rehearsal) for quotes. Should the screens show testnet addresses once they exist?
9. **Pearl:** how should Pearl be named and described, and is there a public link to use? The site currently links only to the FLOP whitepaper.
10. **Domain and accounts:** no domain or social account has been chosen. The drafts link only to the code repository.
11. **Arc license notice:** the vendored Arc free components are MIT, and MIT requires their copyright notice, which names the Arc author, to ship with the code. It is kept in `shared/components/arc/LICENSE`. If no third-party names may appear at all, the alternative is to stop vendoring Arc and install it from the registry at build time.
