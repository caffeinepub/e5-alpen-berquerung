# Design Brief

## Direction

Rustic Alpine Lodge — warm, editorial landing page for E5 hiking expedition journal with trail guide aesthetic and organic earth tones.

## Tone

Documentary editorial with rustic alpine warmth. Cream and terracotta primary palette evokes vintage trail guides and mountain lodge interiors.

## Differentiation

Large serif stage numbers (Fraunces) dominate cards paired with subtle wood-grain texture overlays and warm shadow depth. Each card reads like a curated trail entry, not a generic list.

## Color Palette

| Token      | OKLCH           | Role                              |
| ---------- | --------------- | --------------------------------- |
| background | 0.96 0.015 75   | Warm cream base (light mode)      |
| foreground | 0.2 0.03 50     | Deep brown-tan body text          |
| card       | 0.98 0.01 75    | Warm off-white card surface       |
| primary    | 0.45 0.12 30    | Terracotta/rust stage accents     |
| accent     | 0.5 0.1 160     | Muted sage green secondary        |
| muted      | 0.92 0.02 75    | Soft taupe borders & dividers     |

## Typography

- Display: Fraunces (serif) — stage numbers, hero title, section headings; warm, editorial authority
- Body: General Sans (sans-serif) — route names, dates, descriptive text; clean readability
- Scale: hero `text-5xl md:text-7xl font-bold`, h2 `text-3xl font-bold`, label `text-sm uppercase tracking-widest`, body `text-base`

## Elevation & Depth

Layered card depth via warm-toned shadows (no harsh contrasts). Wood-grain texture overlay adds tactile organic feeling. Card hover-lift (scale +5%) emphasizes interactivity.

## Structural Zones

| Zone    | Background              | Border      | Notes                                      |
| ------- | ----------------------- | ----------- | ------------------------------------------ |
| Header  | Warm cream (background) | muted/40    | Title + subtitle, centered, spacious       |
| Grid    | Alternating cream/taupe | Subtle      | 12 stage cards, responsive mobile-first   |
| Footer  | Muted taupe             | Subtle top  | Copyright, soft text contrast              |

## Spacing & Rhythm

Spacious gaps (gap-6 md:gap-8) between cards. Section padding 2rem mobile / 4rem desktop. Micro-spacing within cards (p-6) creates generous breathing room typical of editorial design. Vertical rhythm reinforced via staggered card entry animations.

## Component Patterns

- Cards: 6-8px rounded corners, warm cream background, wood texture overlay, scale-on-hover (105%), primary-colored stage number
- Buttons: Primary terracotta fill with cream text, rounded corners, hover lift
- Badges: Soft muted background with foreground text for secondary info (dates, elevations)

## Motion

- Entrance: Subtle fade-in + 2px translate-y over 0.3s on page load; staggered 50ms per card
- Hover: Card scale 105% + shadow increase via `transition-smooth`, 300ms ease-out
- Decorative: None — focus on deliberate, functional micro-interactions

## Constraints

- Warm analog palette only (no cool blues or purples)
- Fraunces display font for numbers/titles only (avoid body text with Fraunces)
- Mobile-first grid: 1 column mobile, 2-3 columns tablet+, respect container safety
- Wood texture overlay subtle (opacity 3-5%) — never dominate card legibility

## Signature Detail

Large serif stage numbers with warm terracotta color + subtle wood-grain texture overlay on cards. Instantly recognizable as alpine trail guide entry, not generic CRUD list.

