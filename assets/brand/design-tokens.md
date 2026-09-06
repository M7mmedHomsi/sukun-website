# سُكون — Design tokens (website)

Everything here is implemented in [`css/styles.css`](../../css/styles.css) as CSS custom
properties on `:root`. The brand book in `Sukun Brand Guidlines/01_Brandbook/Sukun.pdf`
is the source of truth; this file records how it was translated to the web.

## Logo

| Use | File |
|---|---|
| Header, footer, founder byline | `logo/mark.svg` (gradient squircle mark) |
| Full lockup, when needed | `logo/logotype.svg` |
| Favicon | `logo/mark.svg` |
| Apple touch icon / OG image | `logo/icon-180.png`, `logo/icon-512.png` |

Never recolor, outline, or add a shadow to the mark. Keep clear space of at least half
the mark's height on every side. The old flat violet `logo.png` is superseded and is no
longer referenced by the site.

## Color

Brand gradient stops, read directly from the logo SVGs:

```
#EDB7BE  11%     pink
#C78CBF  39%     orchid
#9887D2  58%     violet
#89ACEE  79%     periwinkle
#A087BF          solid fallback
```

Used as `--grad-brand` (135deg linear) on the eyebrow rules, avatars, the compare-table
brand chip, and the success mark.

Palette from the brand book: `#EEF5FC` ice, `#F9F1FF` lilac, `#B79ACF`, `#A087BF`,
`#967FB3` mauves, `#89ACEE` periwinkle, `#EFB791` peach.

**Ink and surfaces.** `--ink #1C1830` body text, `--ink-deep #15122A` dark blocks (a
deep violet-black rather than neutral black, so dark panels still read as Sukun),
`--muted #6B6685`, `--line #ECE8F4`, `--surface #FFFFFF`, `--ground #FCFBFE`.

**Feature card tints and accents.** Each pair meets WCAG AA (4.5:1) for body text:

| Tint | Accent | Card |
|---|---|---|
| `#EDF4FC` ice | `#3D6BC4` | Breathing |
| `#F6EFFE` lilac | `#7B4FB0` | Audio journeys |
| `#FCEEF0` blush | `#B04A78` | Habits |
| `#FDF3EA` peach | `#A0552A` | Journal |

## Type

**Omnes Arabic** is the only family, served as WOFF2 (with the source TTFs as a
fallback) from `Fonts/OmnesArabic/` at weights
200/300/400/500/600/700 with `font-display: swap`. It carries basic Latin, so English
falls back to **Plus Jakarta Sans** (Google Fonts) only when a glyph is missing;
`html[lang="en"]` flips the stack so English pages lead with Jakarta.

Headings are fluid: `clamp(1.85rem, 1.15rem + 2.9vw, 3.1rem)` for section titles,
`clamp(2.4rem, 1.25rem + 4.9vw, 4.6rem)` for the hero. Body is 16px minimum with a
1.65 line height. Lalezar ships in `Fonts/Lalezar/` but the site does not use it: one
family reads calmer, which is the point of the brand.

## Space, radius, shadow

Spacing runs on an 8pt scale, `--s-1` (4px) through `--s-11` (128px). Sections use 64px
of vertical padding on mobile and 92px from 768px up.

Radii: 12 / 20 / 28 / 36 / pill. Cards use 28px, the hero and dark blocks 36px, buttons
and chips are fully rounded.

Shadows are cool-tinted, never neutral grey: `rgba(28, 24, 48, …)` at five steps from
`--sh-xs` to `--sh-xl`.

## Direction

The layout is written with logical properties so Arabic RTL and English LTR mirror
without duplicate rules. The handful of values CSS cannot mirror (translateX, rotation,
shadow x-offsets, gradient angles) multiply by `--dir`, which is `1` in LTR and `-1`
under `[dir="rtl"]`. Anything that centers uses physical `left: 50%` with a transform,
because centering must not mirror.

## Motion

GSAP 3.13 core plus ScrollTrigger, from cdnjs. Hero elements rise in sequence, content
reveals once on scroll, the mascot travels an ellipse around the phone, and the
breathing card runs a real 4-7-8 timeline. Every one of these is disabled or frozen
under `prefers-reduced-motion: reduce`.
