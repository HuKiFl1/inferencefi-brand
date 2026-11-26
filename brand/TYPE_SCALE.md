# Type scale

The type scale is Arc UI's scale with two display sizes added for the marketing site. The tokens are in `brand/tokens.json` and `brand/tokens.css`.

## Families

| Token | Family | Use |
| --- | --- | --- |
| `--font-display` | Geist Variable | Headings, hero, metric values |
| `--font-body` | Inter Variable | Body text, labels, controls |
| `--font-mono` | Geist Mono Variable | Code, CLI and MCP examples, agent IDs |

Fallbacks are the system UI sans and monospace stacks. Fonts are self-hosted, and no font is fetched from a third-party server.

## Weights

There are two weights: 400 (regular) and 500 (medium). Use 500 for headings, labels and emphasis. There is no bold.

## Scale

| Token | rem | px | Use |
| --- | --- | --- | --- |
| `--text-xs` | 0.75 | 12 | Badges, table meta, chart axes |
| `--text-sm` | 0.8125 | 13 | Labels, controls, captions, footer |
| `--text-base` | 0.9375 | 15 | Body text in the app screens |
| `--text-lg` | 1.0625 | 17 | Body text on the site, lead paragraphs |
| `--text-xl` | 1.25 | 20 | Lead lines, such as the OMER definition under the equation |
| `--text-2xl` | 1.375 | 22 | Arc component headings and metric values |
| `--text-3xl` | 1.75 | 28 | Swap estimate, fee rule titles, screen titles on mobile |
| `--text-4xl` | 2.125 | 34 | Screen titles, site section headings on mobile |
| `--text-5xl` | 2.5 | 40 | Site section headings, the OMER equation on mobile |
| `--text-6xl` | 3.25 | 52 | Brand extension: the OMER equation in the hero panel |
| `--text-7xl` | 4 | 64 | Brand extension: reserved for print and slides, not used on screen yet |

The hero title uses the Arc hero block's own fluid size and line length.

## Rhythm

- Display text uses `--leading-display` (1.1) and `--tracking-display` (-0.03em).
- Body text uses `--leading-body` (1.4) and `--tracking-body` (-0.01em).
- Keep body lines to about 65 characters. Keep headings to two lines.
- Every number uses tabular figures (`font-variant-numeric: tabular-nums`, or the `.tabular` class) so columns line up.

## Writing rules for type

- Sentence case everywhere. No uppercase transforms and no eyebrow labels.
- No em dashes. Use a comma, a colon or a new sentence.
- Put the unit with the number: "500 OMER", "48 s", "4 bps".
