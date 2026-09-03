# F1dle — Design System

Apple-inspired design system for the F1dle frontend (`F1dle/`). Source of truth for any UI work. Tokens live in `F1dle/src/index.css`, mapped in `F1dle/tailwind.config.js`; primitives in `F1dle/src/components/ui/`; springs in `F1dle/src/lib/motion.ts`.

## Principles

- **One accent**: F1 red (`--accent`). No rainbow per-card accents, no gradient text, no glow shadows.
- **Semantic tokens only**: pages use `bg-surface`, `text-secondary`, `border-border`, `text-success`… — never `slate-*`, `amber-*`, `emerald-*`, hex, or `dark:` variants. Themes flip via tokens.
- **Tinted for status, solid for game feedback**: passive status = `bg-x/10 border-x/25 text-x`; only game tiles (wordle cells) use solid `bg-success`/`bg-danger` fills.
- **Materials with intent**: blur is reserved for floating chrome (header, modals, popovers). Cards are opaque `bg-surface`.
- **Springs, not durations**: critically damped by default; bounce only when the interaction carries momentum.

## Adaptivity

Light is `:root` default; dark applies via `prefers-color-scheme` unless `.light` is on `<html>`; `.dark` forces dark. `color-scheme` is set per theme so native controls adapt.

The user picks between the three states — the absence of both classes *is* the "follow the system" state:

| Choice | `<html>` class | Source of truth |
|---|---|---|
| Light | `.light` | forced |
| Dark | `.dark` | forced |
| System | *(neither)* | `prefers-color-scheme` |

`ThemeProvider` (`src/theme/ThemeContext.tsx`) owns the choice, persists it under `f1dle-theme`, and keeps `<meta name="theme-color">` in step — a media-query meta cannot, since it would report the OS preference even when the user forced the opposite. `ThemeSwitch` exposes it as a `SegmentedControl` beside `LanguageSwitch` in `AppHeader`. An inline script in `public/index.html` applies the stored class before first paint, so a forced theme never flashes the other palette; it duplicates the storage key and the two chrome colours by necessity — keep it in step with `src/theme/theme.ts`.

Dark token *values* live once, as `--dark-*` on `:root`; `.dark` and the system-dark media query only reassign them. Two selectors need the palette and CSS cannot share a declaration block across a class and a media query, so edit the `--dark-*` definitions and both paths follow.

## Color tokens

| Token | Role |
|---|---|
| `background` / `surface` / `surface-raised` | page → card → hover/raised |
| `foreground` / `secondary` / `tertiary` | text hierarchy (3 levels, use color not opacity) |
| `border` | hairlines everywhere |
| `accent` (+`accent-foreground`) | F1 red — CTAs, active nav, focus rings |
| `success` / `warning` / `danger` | statuses & game feedback |
| `scrim` | overlay dimming (`bg-scrim/50`) |
| `difficulty-1..4` | Connections group colors |

## Typography

System font (`system-ui`). Scale with baked-in tracking/leading — never set `letter-spacing` manually:

`text-display` (welcome hero) · `text-title1` (page h1) · `text-title2` (section/modal) · `text-title3` (card titles, stat values) · `text-body` · `text-callout` · `text-footnote` · `text-caption` (labels).

Eyebrow/label pattern: `text-caption font-medium uppercase tracking-wide text-tertiary`. `tracking-wide` (0.04em) is the only wide tracking allowed, only on uppercase ≤12px. `font-black` and `uppercase` above caption size are banned. Hierarchy = weight (600–700) + size + text color level.

## Shape & elevation

Radius: `rounded-sm` 8px (chips) · `rounded-md` 12px (buttons, inputs, tiles) · `rounded-lg` 16px (cards) · `rounded-xl` 24px (modals). Badges are `rounded-full`.
Shadows: `shadow-1` (card) · `shadow-2` (popover) · `shadow-3` (modal). No custom `shadow-[...]`.
Spacing: card `p-5 sm:p-6`, modal `p-6 sm:p-8`, page gutter `px-4 sm:px-6`, section gap `gap-5`.
z-index ladder: header 30 · modal 40 · confetti 45.

## Motion (`src/lib/motion.ts`)

| Export | Use |
|---|---|
| `spring` (0.35s, bounce 0) | default UI transitions, layout, tiles |
| `springFast` (0.25s) | hovers, small state, exits |
| `springBouncy` (0.4s, bounce 0.2) | momentum only (HigherLower card advance) |
| `modalMaterialize` / `scrimFade` | Modal primitive |
| `staggerContainer(stagger, delay)` + `staggerItem` | list/card entrances (0.04–0.06s stagger, once on mount) |

Rules: game-logic timings (`VICTORY_REVEAL_DELAY_MS`, HigherLower 600ms, Connections reveal setTimeouts) are the source of truth — springs fit inside them. Buttons press-feedback is CSS `active:scale-[0.97]` (instant, pointer-down). Confetti and Connections shake stay CSS keyframes. Reduced motion: `MotionConfig reducedMotion="user"` globally + `useReducedMotion()` cross-fade in Modal + CSS guard on keyframes.

## Primitives (`src/components/ui/`)

`Button` (primary/secondary/ghost/destructive · sm/md/lg · `asChild`) · `Card` (tone neutral/success/warning/danger · padding) · `Badge` · `Modal` (materialize + scrim + Escape) · `StatCard` · `SearchField`+`SuggestionShell` (single owner of the react-autosuggest theme contract) · `PageShell`(width sm/md/lg/xl)+`PageHeader` · `ErrorState` · `LoadingState` · `WinPanel` · `SegmentedControl` (layoutId thumb).

Pages compose primitives; don't re-create shells inline. AppHeader is chrome (translucent material + scroll-edge, no permanent border).
