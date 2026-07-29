# Design System — Wellness App

**Version 1.0 · Derived from product screenshots, typography spec, colour spec and moodboard references**

> **How to use this file.** Paste or attach it as context whenever you ask Claude (or any tool) to produce something "in our style" — a document, a deck, a landing page, a one-pager, a new screen. Everything below is written as instruction, not description. Where a rule says MUST it is a brand rule; where it says SHOULD it is a strong default you may override with a reason.

---

## 1. Design DNA (read this first)

If you only remember five things:

1. **Light is the interface.** The background is never a flat fill — it is a soft vertical gradient that reflects the time of day. Warm gold in the morning, hazy green-blue at midday, deep navy at night. The product feels like it is sitting inside daylight.
2. **Soft, rounded, floating.** Nothing has a hard corner. Nothing has a hard edge. Cards float on wide, low-opacity, cool-tinted shadows. Radii are generous (16–28px on mobile).
3. **One image does the emotional work.** Each screen has a single large hero visual — a 3D-rendered scene with the mascot — and everything else is quiet: type, small colour dots, whitespace.
4. **Colour is a signal, not a surface.** The four accents (yellow, green, blue, purple) appear almost exclusively as small circular icon chips, badges and progress marks. Large areas stay neutral or gradient.
5. **The voice is a calm friend.** Sentence case, second person, short lines, present tense. "Breathe and release." Never clinical, never urgent, never guilt-inducing.

**Aesthetic in one line:** *Google-grade geometric clarity wrapped in Apple-grade atmospheric softness, with a 3D character as the heart.*

---

## 2. Colour

### 2.1 Core palette (canonical)

| Token | Hex | Name | Primary role |
|---|---|---|---|
| `--color-yellow` | `#FFCE44` | Sunbeam | Morning, favourites, warmth, streaks |
| `--color-green` | `#A9E765` | Meadow | Progress, habits, "recently played", growth |
| `--color-blue` | `#4EBCFF` | Sky | Calm, night, data, assessments, links |
| `--color-purple` | `#C877FF` | Aura | Brand magic, the mascot, premium, evening |
| `--color-black` | `#000000` | Ink | Primary text on light |
| `--color-grey` | `#646464` | Slate | Secondary text, captions, inactive |

These six are the only colours that may be quoted as "the brand colours". Everything below is derived.

### 2.2 Extended accent (observed in product)

| Token | Hex | Name | Role |
|---|---|---|---|
| `--color-ember` | `#FF8A5C` | Ember | Playlists, audio, "now playing" |

Use sparingly. It is a functional extension of the palette for media/audio, not a fifth brand colour.

### 2.3 Neutral ramp (derived)

| Token | Hex | Use |
|---|---|---|
| `--n-0` | `#FFFFFF` | Card fills, glass base |
| `--n-50` | `#F6F8FA` | App background base, document page |
| `--n-100` | `#EDF1F4` | Subtle fills, dividers on white |
| `--n-200` | `#DCE3E8` | Borders, table rules |
| `--n-400` | `#A7B0B6` | Disabled text, placeholder |
| `--n-600` | `#646464` | Secondary text (canonical) |
| `--n-800` | `#2A2E31` | Body text on light where pure black is too hard |
| `--n-900` | `#000000` | Headlines (canonical) |

Neutrals carry a faint cool cast. Never use a warm grey.

### 2.4 Accent tints and shades (for icon chips, fills, charts)

Each accent needs three steps. Tint = accent at 12% over white. Deep = accent darkened ~22% for text-on-tint contrast.

| Accent | Tint (fill) | Base | Deep (text/stroke) |
|---|---|---|---|
| Sunbeam | `#FFF6DF` | `#FFCE44` | `#B98A0A` |
| Meadow | `#F0FAE3` | `#A9E765` | `#5F9227` |
| Sky | `#E5F5FF` | `#4EBCFF` | `#0F7CB8` |
| Aura | `#F6EBFF` | `#C877FF` | `#8B33C7` |
| Ember | `#FFEDE5` | `#FF8A5C` | `#C4512A` |

**Contrast rule:** never place base-accent text on white. Use the Deep step. Accent bases are for fills, dots, strokes ≥3px and iconography only.

### 2.5 Time-of-day gradients (signature)

The background gradient is the app's most recognisable asset. It is always a vertical linear gradient, top → bottom, 3–4 stops, ending in near-white (light modes) or a lifted blue (night).

```css
/* MORNING · 05:00–11:00 */
--grad-morning: linear-gradient(180deg, #FFC42E 0%, #FFDD7A 18%, #FFF3D6 42%, #F8FAFB 78%);

/* DAY · 11:00–17:00 */
--grad-day: linear-gradient(180deg, #B9C97E 0%, #CFE0C4 20%, #DCEBF3 50%, #F4F9FC 82%);

/* EVENING · 17:00–21:00 */
--grad-evening: linear-gradient(180deg, #F0A55C 0%, #D98BC4 32%, #9F86E0 62%, #EFEFF8 92%);

/* NIGHT · 21:00–05:00 */
--grad-night: linear-gradient(180deg, #06182C 0%, #0E3355 34%, #1C5786 68%, #2F79AC 100%);
```

Rules:
- The gradient MUST be applied to the page/screen, never to a card or a button.
- The top 20% is the saturated zone; greeting text sits here and must be high-contrast.
- Light gradients resolve to a neutral near-white before the fold ends, so content lower on the page reads on a calm surface.
- Never rotate the gradient. Never use a radial or conic gradient as page background.
- Night mode is a full inversion: text goes white, cards become translucent navy, but the accents keep their exact hex values.

### 2.6 Atmospheric / aura gradients (imagery only)

From the moodboard: soft multi-hue meshes — orange → blue → magenta — blurred to the point where no edge is visible. Use these **inside images, hero panels and cover art only**, never behind text-heavy UI.

```css
--aura-warm-cool: radial-gradient(120% 90% at 20% 20%, #FFD09B 0%, #9CC9F5 45%, #3E4FC9 75%, #C43BD8 100%);
--aura-cool: radial-gradient(100% 100% at 70% 10%, #E8E4FF 0%, #A9B6F5 50%, #5B4FE0 100%);
```

Blur radius on any aura layer: ≥80px. If you can see a hard colour boundary, it's wrong.

### 2.7 Glass surfaces

```css
--glass-light: rgba(255,255,255,0.62);
--glass-light-border: rgba(255,255,255,0.70);
--glass-dark: rgba(12,44,74,0.48);
--glass-dark-border: rgba(255,255,255,0.16);
--glass-blur: blur(24px) saturate(140%);
```

Glass is used for exactly three things: the floating tab bar, overlay chips on top of imagery, and modal sheets. Not for content cards.

---

## 3. Typography

### 3.1 Family

**Primary: Google Sans** — weights Regular (400), Medium (500), Semibold (600), Bold (700). Geometric-humanist; low contrast; open apertures; friendly circular bowls.

Fallback stack, in order of preference:

```css
font-family: "Google Sans", "Google Sans Text", "Figtree", "Plus Jakarta Sans",
             -apple-system, "SF Pro Display", "Segoe UI", system-ui, sans-serif;
```

- **Web/product where Google Sans isn't licensed:** use **Figtree** (closest free geometric match) or **Plus Jakarta Sans**.
- **Word / PowerPoint / client documents:** Google Sans → fallback **Segoe UI** (Windows) / **SF Pro** (Mac). Never Calibri, never Arial, never Times.
- **Never** substitute Poppins, Montserrat or Nunito — they read rounder and more childlike than this brand.

Italics are not used anywhere. Ever. If you need emphasis, change weight or colour.

### 3.2 Mobile type scale

| Role | Size / Line | Weight | Tracking | Notes |
|---|---|---|---|---|
| Greeting eyebrow | 15 / 20 | Medium | 0 | "Good morning!" |
| Greeting display | 28 / 32 | Bold | −0.4 | "How are you, Elizabeth?" |
| Screen title | 24 / 30 | Bold | −0.3 | |
| Section header | 19 / 24 | Semibold | −0.2 | "Your daily plan" |
| Card headline | 20 / 24 | Bold | −0.3 | On imagery, white |
| Tile label | 15 / 19 | Semibold | 0 | "Recently Played" — wraps to 2 lines |
| List title | 15 / 20 | Semibold | 0 | "Catch the thought" |
| Body | 15 / 22 | Regular | 0 | |
| Body small / subtitle | 13 / 18 | Regular | 0 | "Guided meditation" |
| Caption / meta | 12 / 16 | Medium | 0 | "4 min", badge counts |
| Overline | 11 / 14 | Semibold | +0.8 | **UPPERCASE only here** — "THURSDAY" |
| Timestamp | 22 / 24 | Bold | −0.4 | "8:25" with 12/16 Medium "AM" |

### 3.3 Document / print type scale (A4, for reports, proposals, one-pagers)

| Role | Size | Weight | Colour |
|---|---|---|---|
| Cover title | 44 pt | Bold | `#000000` or white on gradient |
| Cover subtitle | 16 pt | Regular | `#646464` |
| H1 (section) | 26 pt | Bold | `#000000` |
| H2 | 19 pt | Semibold | `#000000` |
| H3 | 15 pt | Semibold | `#2A2E31` |
| Body | 11 pt / 1.55 | Regular | `#2A2E31` |
| Caption / table meta | 9 pt | Medium | `#646464` |
| Overline label | 8.5 pt | Semibold, +0.8 tracking, uppercase | Accent Deep |

### 3.4 Typographic rules

- **Sentence case everywhere.** Titles, buttons, labels, nav. The only uppercase is the Overline style.
- Headlines are set tight: negative tracking, line-height ≈ 1.15. Body is set loose: line-height 1.45–1.55.
- Maximum body measure: **68 characters**. In two-column documents, 46.
- Never centre body copy. Centre only single-line cover titles and empty-state messages.
- Emphasis hierarchy: weight first, then colour, then size. Never underline (except real links), never italic, never all-caps for emphasis.
- Numbers in metrics use Bold with `font-variant-numeric: tabular-nums` in any table or timer.

---

## 4. Space, shape, elevation

### 4.1 Spacing scale (4pt base)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 72`

- Screen side gutter: **20px** (mobile), 64px (A4 document margin), 80px (slide margin).
- Gap between sibling cards: **12px**.
- Gap between a section header and its content: **12px**.
- Gap between sections: **28px**.
- Card internal padding: **16px** (tiles), **20px** (content cards), **0** for full-bleed imagery.

### 4.2 Radii

| Token | Value | Applied to |
|---|---|---|
| `--r-xs` | 8px | Badges, small chips, inline tags |
| `--r-sm` | 12px | Thumbnails, inputs, table cells |
| `--r-md` | 16px | Quick tiles, list rows |
| `--r-lg` | 20px | Content cards, document callouts |
| `--r-xl` | 28px | Hero card, modal sheets, cover panels |
| `--r-full` | 999px | Pills, tab bar, avatars, icon chips, buttons |

Rounding is **continuous/squircle** wherever the platform supports it (iOS `.rect(cornerRadius:style:.continuous)`, CSS `border-radius` + generous value). The colour swatch shapes in the brand spec are squircles — that shape language is deliberate and should show up in icon containers, avatars and image masks.

### 4.3 Elevation

Shadows are wide, soft, cool and low-opacity. Never black, never tight.

```css
--shadow-1: 0 2px 8px rgba(16, 42, 66, 0.06);                                  /* rows, chips */
--shadow-2: 0 8px 24px rgba(16, 42, 66, 0.10);                                 /* cards, tiles */
--shadow-3: 0 16px 40px rgba(16, 42, 66, 0.14);                                /* hero card, sheets */
--shadow-nav: 0 8px 32px rgba(16, 42, 66, 0.16);                               /* floating tab bar */
```

On night backgrounds, replace shadow with a 1px `rgba(255,255,255,0.12)` inner top border — light rims, not drop shadows.

Borders are used only where a shadow can't work (glass, night mode, print). Standard: `1px solid rgba(255,255,255,0.6)` on glass, `1px solid #DCE3E8` in print.

---

## 5. Components

### 5.1 Greeting block

```
Good morning!                        [time-of-day icon]
How are you, Elizabeth?
```
- Two lines: eyebrow (Medium 15) then display (Bold 28), left aligned, 20px gutter, 16px from safe area.
- Always personalised with first name. Always ends the eyebrow with an exclamation mark, never the display line — except the night variant ("Sweet dreams, Elizabeth!").
- Top-right: a **line-art** time-of-day glyph (sun with rays / moon with sparkle). Stroke 2px, `currentColor`, 28×28. This glyph is the only line-art icon that appears at that scale — it's a signature mark.
- Colour: `#000000` on light gradients, `#FFFFFF` on night.

### 5.2 Hero card (the signature element)

The largest object on the home screen. Full-bleed 3D scene, `--r-xl` radius, `--shadow-3`.

Anatomy, top to bottom:
- **Top-left overlay:** large time (Bold 22) + AM/PM (Medium 12) on the line, then day of week in Overline style. White, with a subtle text shadow `0 1px 3px rgba(0,0,0,0.25)` for legibility over imagery.
- **Top-right:** share/action button — 36px circle, `rgba(255,255,255,0.9)`, icon in `#2A2E31`.
- **Bottom band:** a two-column caption. Left column = the affirmation, Bold 20, white, 2 lines max ("Take a deep breath," / "Breathe and release."). Right column = supporting sentence, Regular 12, white at 88% opacity, 3–4 lines. The imbalance between the two columns is intentional — do not equalise them.
- **Scrim:** a bottom-up gradient `linear-gradient(0deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 55%)` so text stays legible whatever the artwork.
- Aspect ratio ≈ **4:3** on mobile.

The hero card is the one place with visual maximalism. Everything else on the screen stays quiet to let it work.

### 5.3 Quick tiles (2×2 grid)

Square-ish cards, `--r-md`, white (`--glass-light` over gradient) or translucent navy at night, `--shadow-2`, 12px gap, 16px padding.

- **Top row of the tile:** a 28px accent icon chip on the left, an optional count badge on the right.
- **Icon chip:** filled circle in the accent base, glyph in white, 16px. One accent per destination and it never changes:
  - Recently Played → Meadow `#A9E765`
  - Playlist → Ember `#FF8A5C`
  - Favourites → Sunbeam `#FFCE44`
  - Assessments → Sky `#4EBCFF`
- **Count badge:** number only, Medium 12, `#646464` (white at 70% on night). No circle, no background.
- **Context pill** (optional, e.g. "Work Stress"): sits inline after the icon, 11px Medium, `#646464`, truncates with ellipsis rather than wrapping.
- **Label:** Semibold 15, bottom-left aligned, wraps to two lines. Tile height is set by the two-line case so the grid stays even.

### 5.4 Section header

```
Your daily plan                                            ⊕
```
Semibold 19 on the left, a 24px circular outline "add" affordance on the right in `#4EBCFF` or `#646464`. No dividers, no "See all" text links — the icon does the job.

### 5.5 Content row

White card, `--r-md`, `--shadow-1`, 12px padding, 12px between rows.

`[ 44px circular image ]  Title (Semibold 15)          4 min (Medium 12, #646464)`
`                         Subtitle (Regular 13, #646464)`

- Thumbnails are **circular** for content, squircle for products/assets.
- Duration/meta is always right-aligned, always `#646464`, always tabular.
- Row is fully tappable; no chevrons.

### 5.6 Floating tab bar

- Pill container, `--r-full`, glass fill + `--glass-blur`, `--shadow-nav`, floating 12px above the safe area, inset 24px from each side.
- 4 items max: Home · Habits · Library · My Space.
- Icons are **outlined**, 22px, stroke 1.75px. Active state = filled glyph + `#000000` label; inactive = outline + `#646464`.
- Labels always visible, Medium 10.
- Never more than 4 tabs. Never a centre FAB.

### 5.7 Buttons

| Variant | Fill | Text | Height / Radius |
|---|---|---|---|
| Primary | `#000000` | `#FFFFFF` Semibold 15 | 52 / full |
| Primary (night) | `#FFFFFF` | `#06182C` | 52 / full |
| Secondary | `--glass-light` + 1px white border | `#000000` | 52 / full |
| Accent | Accent base | White (Sky, Aura, Ember) or `#2A2E31` (Sunbeam, Meadow) | 52 / full |
| Text | none | Accent Deep, Semibold 15 | 44 / — |

All buttons are full-radius pills. No square buttons, no outlines in black, no gradients on buttons.

Labels state the outcome: "Start session", "Save changes", "Continue". Never "Submit", never "OK", never "Click here".

### 5.8 Badges, pills, chips

- **Count badge:** bare number, Medium 12, `#646464`.
- **Status pill:** tint fill + Deep text, `--r-full`, 6px×10px padding, Semibold 11.
- **Filter chip:** white, 1px `#DCE3E8`, `--r-full`; selected = `#000000` fill, white text.

### 5.9 Progress

- **Ring:** 6px stroke, track `#EDF1F4`, fill Meadow `#A9E765`, round caps, starts at 12 o'clock.
- **Bar:** 8px, `--r-full`, same colours.
- Percentage label in Bold, centred in ring, with a Medium 11 `#646464` caption below.

---

## 6. Iconography

- **System icons:** outlined, 1.75–2px stroke, round caps and joins, 24px grid, geometric construction (circles are true circles). Reference feel: Google Material Symbols (Rounded, weight 300–400) or Phosphor Regular.
- **Category icons:** solid white glyphs inside a filled accent circle (see 5.3). The circle is the identity; the glyph is secondary and should be simple enough to read at 16px.
- **Time-of-day glyphs:** the sun and moon marks are hand-tuned, thicker (2px), and slightly playful — a sun with a semicircle and radiating strokes, a crescent with a four-point sparkle. Treat these as brand marks, not icons.
- Never mix filled and outlined styles within the same row or bar.
- Never use emoji as UI icons. Emoji are permitted only inside user-generated content.

---

## 7. Imagery and illustration

### 7.1 The mascot

A rounded purple creature with closed, contented eyes and a small crown-like crest, always **seated in meditation** on a stone or lily pad, in a shallow reflective pool.

Rules:
- Always calm, always eyes-closed or softly smiling. Never speaking, never gesturing at the UI, never wearing accessories.
- Always rendered in 3D with soft subsurface-scattering, never as flat vector.
- Body colour stays in the Aura family (`#C877FF` core, shifting cooler at night, warmer at dawn).
- One glowing element per scene — a floating orb, a lantern, a firefly. This is the focal point.
- The mascot should occupy 35–45% of the hero card height and sit centred or slightly right of centre.

### 7.2 Scene rendering

- Environment: misty low-poly landscape, shallow water, soft depth-of-field, volumetric light.
- Light direction changes with time of day and must match the page gradient — golden rim light in the morning, cool moonlight at night.
- Colour grading is desaturated in the environment so the mascot's purple reads as the only saturated element.
- Vertical vignette at the bottom for text legibility.

### 7.3 Photography and abstract art

For marketing, covers and section dividers (per the moodboard):
- Blurred aura gradients with a soft human silhouette — used at large scale, always with ≥80px blur.
- Device mockups: single iPhone, held or angled, natural interior setting with wood/slat textures, warm neutral surroundings, shallow DOF. Never flat-lay grids of five devices.
- Product shots: soft cool light, purple/blue cast, matte surfaces.
- Never use stock photos of people meditating in a field. Never use lens flares, never use drop shadows on photos.

### 7.4 Image treatment

- Corner radius on all imagery: `--r-lg` minimum, `--r-xl` for heroes, circle for content thumbnails.
- No borders on images. No captions in italics.
- Overlay text always requires a scrim (see 5.2).

---

## 8. Motion

| Interaction | Duration | Easing |
|---|---|---|
| Tap feedback (scale to 0.97) | 120ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Card/sheet enter | 320ms | `cubic-bezier(0.16, 1, 0.3, 1)` (soft overshoot) |
| Screen transition | 280ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Background gradient shift (time of day) | 1200ms | `ease-in-out` |
| Ambient loop (mascot breathing, orb float) | 4–6s | `ease-in-out`, infinite |

Principles: everything decelerates. Nothing bounces hard. The breathing loop on the hero (a slow 4-second scale between 1.00 and 1.02) is the one ambient animation and it should never be removed — it's what makes the screen feel alive. Respect `prefers-reduced-motion` by freezing ambient loops and shortening transitions to 120ms.

---

## 9. Voice and tone

**Persona:** a calm friend who knows you well and isn't trying to fix you.

Rules:
- Second person, present tense, active voice.
- Sentences under 12 words in UI. Under 20 in documents.
- Sentence case everywhere.
- One exclamation mark per screen, maximum, and only in greetings.
- Affirmations are short imperatives ending in a full stop: "Take a deep breath." / "Breathe and release."
- Supporting copy is a single warm sentence, never a paragraph: *"Tomorrow is a new beginning filled with light, hope, and possibility."*
- Time is always shown as a friendly unit: "4 min", never "00:04:00".
- Name features by what the person does, not how it's built: "Habits", not "Habit tracking module".

Never:
- Streak-shaming, urgency, countdowns, "Don't lose your progress!"
- Clinical language in the consumer surface (say "how you're feeling", not "symptom severity").
- Claims of diagnosis or treatment.
- Empty states that say "Nothing here". Say what to do next: "Add your first habit to see it here."

Errors explain what happened and what to do, in the interface's voice, without apologising: "Couldn't save that. Check your connection and try again."

---

## 10. Applying the system to documents

This is the most common use of this file: producing decks, proposals, one-pagers, PDFs and Word documents that look like they came from the same studio as the app.

### 10.1 Page architecture

- **A4 portrait**, margins 64px (≈17mm) sides, 56px top, 64px bottom. Slides: 16:9, 80px margins.
- **Background:** `#FFFFFF` or `--n-50` `#F6F8FA`. Never a full-page gradient on an interior page.
- **Cover:** full-bleed time-of-day gradient or aura gradient, with the title in Bold 44pt bottom-left, subtitle in `#646464` (or white at 80% on night gradients), and a single hero image or mascot render. The cover is the only page allowed a gradient background.
- **Section dividers:** a half-height gradient panel with `--r-xl` corners, an Overline label in Accent Deep, and the section title in Bold 26pt.

### 10.2 Document components

- **Callout box:** accent Tint fill, `--r-lg`, 20px padding, no border, a 3px accent-base bar on the left edge, Overline label in Accent Deep, body in `#2A2E31`.
- **Stat block:** number in Bold 34pt `#000000`, label in Medium 9pt uppercase `#646464` underneath, with a 6px accent dot above the number.
- **Tables:** no vertical rules. Header row in Semibold 9.5pt uppercase `#646464` with a 1px `#DCE3E8` bottom rule. Body rows 11pt, 10px vertical padding, alternating rows in `#F6F8FA`. Numeric columns right-aligned and tabular. Outer corners rounded `--r-sm` with the table clipped to them.
- **Cards in documents:** white fill, `--r-lg`, `--shadow-2` translated to print as a 1px `#DCE3E8` border plus 16px internal padding.
- **Charts:** accent palette in fixed order Sky → Meadow → Sunbeam → Aura → Ember. No gridlines except a single horizontal baseline in `#DCE3E8`. Bars get `--r-sm` on the top corners only. Lines are 2.5px with round caps and no markers. Labels in `#646464` Medium 9pt. Never a 3D chart, never a chart legend when direct labelling is possible.
- **Bullets:** a 4px accent-coloured dot, 12px indent, 8px gap between items. Never hyphens, never nested more than two levels.
- **Page footer:** hairline `#DCE3E8` rule, product name left in Medium 8.5pt `#646464`, page number right in tabular Medium 8.5pt.

### 10.3 Density

Documents in this system are **airy**. If a page looks full, cut content or split the page. A good interior page has one idea, one supporting visual and a maximum of three blocks of copy.

### 10.4 Office-app substitutions

| Design intent | Word / PowerPoint equivalent |
|---|---|
| Google Sans | Segoe UI Semibold / SF Pro; set theme fonts, don't override per-run |
| `--shadow-2` | 1px `#DCE3E8` border (shadows print muddy) |
| Squircle corners | Rounded rectangle, corner radius ~8% of width |
| Glass | 90% white fill over the gradient, no blur |
| Time-of-day gradient | Two-stop linear gradient, 90° (top→bottom), using the first and last stops only |

---

## 11. Accessibility floor

- Body text contrast ≥ 4.5:1; large text and icons ≥ 3:1. `#646464` on white passes at 5.9:1 — do not lighten it further.
- Accent bases fail as text colours on white. Always switch to the Deep step.
- Minimum tap target 44×44px, including icon chips inside tiles.
- Colour is never the only signal — pair accent colour with an icon or a label.
- Every ambient animation respects `prefers-reduced-motion`.
- Night mode is a genuine theme, not a filter: text goes to `#FFFFFF`/`rgba(255,255,255,0.7)`, surfaces to translucent navy, accents unchanged.

---

## 12. Do / Don't

**Do**
- Let one hero image carry the emotion and keep everything around it quiet.
- Use accents as small circular signals.
- Keep every corner rounded and every shadow soft, wide and cool.
- Write short, warm, sentence-case copy.
- Change the whole page's light to match the time of day.

**Don't**
- Put gradients on buttons, cards, tables or text.
- Use more than two accent colours in a single view.
- Use uppercase for anything except the Overline style.
- Use italics, underlines, hard black shadows, or 90° corners.
- Fill a page. Whitespace is a brand asset here.
- Introduce a second typeface.

---

## 13. Token appendix

```css
:root {
  /* Brand */
  --color-yellow:#FFCE44; --color-green:#A9E765; --color-blue:#4EBCFF;
  --color-purple:#C877FF; --color-ember:#FF8A5C;
  --color-black:#000000;  --color-grey:#646464;

  /* Accent deep (text-safe) */
  --yellow-deep:#B98A0A; --green-deep:#5F9227; --blue-deep:#0F7CB8;
  --purple-deep:#8B33C7; --ember-deep:#C4512A;

  /* Accent tint */
  --yellow-tint:#FFF6DF; --green-tint:#F0FAE3; --blue-tint:#E5F5FF;
  --purple-tint:#F6EBFF; --ember-tint:#FFEDE5;

  /* Neutral */
  --n-0:#FFFFFF; --n-50:#F6F8FA; --n-100:#EDF1F4; --n-200:#DCE3E8;
  --n-400:#A7B0B6; --n-600:#646464; --n-800:#2A2E31; --n-900:#000000;

  /* Radius */
  --r-xs:8px; --r-sm:12px; --r-md:16px; --r-lg:20px; --r-xl:28px; --r-full:999px;

  /* Space */
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:20px;
  --s-6:24px; --s-7:32px; --s-8:40px; --s-9:56px; --s-10:72px;

  /* Elevation */
  --shadow-1:0 2px 8px rgba(16,42,66,.06);
  --shadow-2:0 8px 24px rgba(16,42,66,.10);
  --shadow-3:0 16px 40px rgba(16,42,66,.14);
  --shadow-nav:0 8px 32px rgba(16,42,66,.16);

  /* Glass */
  --glass-light:rgba(255,255,255,.62);
  --glass-dark:rgba(12,44,74,.48);
  --glass-blur:blur(24px) saturate(140%);

  /* Type */
  --font:"Google Sans","Figtree","Plus Jakarta Sans",-apple-system,"Segoe UI",sans-serif;
  --w-regular:400; --w-medium:500; --w-semibold:600; --w-bold:700;

  /* Motion */
  --ease-out:cubic-bezier(.2,0,0,1);
  --ease-soft:cubic-bezier(.16,1,.3,1);
  --dur-tap:120ms; --dur-enter:320ms; --dur-screen:280ms;
}
```

```json
{
  "gradients": {
    "morning": ["#FFC42E 0%", "#FFDD7A 18%", "#FFF3D6 42%", "#F8FAFB 78%"],
    "day":     ["#B9C97E 0%", "#CFE0C4 20%", "#DCEBF3 50%", "#F4F9FC 82%"],
    "evening": ["#F0A55C 0%", "#D98BC4 32%", "#9F86E0 62%", "#EFEFF8 92%"],
    "night":   ["#06182C 0%", "#0E3355 34%", "#1C5786 68%", "#2F79AC 100%"]
  },
  "categoryColors": {
    "recentlyPlayed": "#A9E765",
    "playlist": "#FF8A5C",
    "favourites": "#FFCE44",
    "assessments": "#4EBCFF"
  },
  "chartOrder": ["#4EBCFF", "#A9E765", "#FFCE44", "#C877FF", "#FF8A5C"]
}
```

---

## 14. Prompt snippet (for reuse)

> Design this in our house style: Google Sans (fallback Figtree) in sentence case, tight bold headlines and loose 1.5 body; a soft vertical time-of-day gradient as the only large colour surface, resolving to near-white; white squircle cards with 16–28px radii and wide soft cool shadows (`0 8px 24px rgba(16,42,66,.10)`); accents used only as small circular chips, dots and badges — `#FFCE44`, `#A9E765`, `#4EBCFF`, `#C877FF`, plus `#FF8A5C` for media; text `#000000` and `#646464`; one large 3D hero image carrying all the emotion and everything else quiet and airy; warm, short, second-person copy. No italics, no square corners, no gradient buttons, no more than two accents per view.
