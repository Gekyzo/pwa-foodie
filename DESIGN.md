---
name: Warm Gourmet Epikuros
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#5a4138'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#8f7066'
  outline-variant: '#e3bfb2'
  surface-tint: '#a83900'
  primary: '#a43700'
  on-primary: '#ffffff'
  primary-container: '#cd4700'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59a'
  secondary: '#1b6d24'
  on-secondary: '#ffffff'
  secondary-container: '#a0f399'
  on-secondary-container: '#217128'
  tertiary: '#ac2d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#d63c05'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#a3f69c'
  secondary-fixed-dim: '#88d982'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005312'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a0'
  on-tertiary-fixed: '#3b0900'
  on-tertiary-fixed-variant: '#872100'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 21px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 17px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

<!-- Source: Stitch project "Social Food Roulette PWA", projects/6761532087147787488.
     Screens: Explorador y Descubrimiento, Detalle Restaurante y Platos Estrella,
     Ruleta Gastronómica Decisoria, Listas Compartidas y Social. -->

## Brand & Style

This design system delivers an appetizing, tactile, and highly social culinary experience tailored for spontaneous dining decisions and taste-driven exploration. It fuses contemporary lifestyle editorial warmth with the kinetic immediacy of a mobile-first Progressive Web Application.

### Personality & Emotional Resonance
The interface evokes the sensory delight of dining out: warmth, indulgence, conviviality, and culinary confidence. It steers clear of clinical utility and algorithmic coldness, adopting instead the atmosphere of a curated gastropub or artisan bistro menu. Every interaction feels inviting, responsive, and effortlessly decisive.

### Design Movement: Warm Tactile Editorial
The visual signature combines elements of modern editorial design with physical, thumb-friendly tactile UI:
- **Atmospheric Warmth:** Creamy, parchment-soft backgrounds replace harsh digital whites, reducing glare and complementing food photography.
- **Organic Sensuality:** Generous pill radii, continuous squircle cards, and warm-tinted diffused drop shadows suggest soft physical menu tiles and ceramic plates.
- **Culinary Punctuation:** Saturated terracotta and aromatic basil greens serve as focal cues, stimulating appetite and directing decisive micro-actions.

## Colors

The palette is anchored in natural culinary ingredients, contrasting warm spices and garden greens against rich cream ceramic surfaces and dark charcoal text.

### Roles & Semantic Distribution
- **Primary (`#E65100` - Paprika / Terracotta):** The dominant focal engine. Applied to primary call-to-actions, hero selection states, active voting tabs, and key navigational highlights.
- **Secondary (`#2E7D32` - Fresh Basil):** Freshness indicator and affirmative accent. Reserved for dietary badges (vegan, organic, sustainable), positive consensus votes, open hours, and high match scores.
- **Tertiary (`#F4511E` - Saffron Flame):** High-energy companion accent. Used for roulette spins, hot trending badges, flash deal pills, and active user reactions.
- **Neutral Background (`#FAF8F5` - Clotted Cream):** The base canvas tone. Provides an organic, paper-like warmth that makes photography pop while softening high-contrast elements.
- **Text & Foreground (`#1A1A1A` - Charred Truffle):** Rich charcoal that preserves supreme contrast without the severe hardness of pure `#000000`.

### Surface Hierarchy
- **Canvas Base:** `#FAF8F5`
- **Surface Elevation 1 (Cards, Floating Nav):** `#FFFFFF`
- **Surface Elevation 2 (Group Trays, Filter Sheets):** `#F3EEEA`
- **Subtle Stroke / Dividers:** `#E9E2DA`

## Typography

**Plus Jakarta Sans** governs the system entirely. Its clean geometric underpinning, distinct humanist aperture shapes, and balanced letterforms strike an approachable yet polished tone.

### Typographic Rhythm & Scaling
- Headings leverage negative letter spacing and tight line heights to impart editorial impact, creating punchy, magazine-grade restaurant headers.
- Body text retains relaxed leading to guarantee effortless readability during rapid mobile scrolling in varying lighting conditions (e.g., dim restaurants or bright sunlight).
- Micro-labels and dietary badge tags utilize bold and semi-bold weights with slight tracking expansion to guarantee legibility at compact dimensions.

## Layout & Spacing

The layout is built around mobile-first thumb ergonomics, respecting native mobile browser toolbars, swipe zones, and PWA standalone viewport safe areas.

### Mobile Grid & Viewport Model
- **Mobile (< 768px):** Single-column fluid stream with fixed `1rem` outer margins (`margin`) and `1rem` gutters (`gutter`). Interactive controls are pushed into the lower 40% of the viewport (thumb-accessible bottom sheets and floating action modules).
- **Tablet (768px - 1024px):** 6-column fluid grid with `2rem` margins (`margin-tablet`) and `1.25rem` gutters. Content reflows into paired split-views (restaurant card list alongside an interactive map or roulette wheel).
- **Desktop (> 1024px):** Centered fixed-width viewport container (max `1120px`), constrained to 12 columns with `4rem` outer canvas padding (`margin-desktop`) to preserve the intimate feel of an editorial discovery tool.

### Spacing Density Principles
- Internal card padding defaults to `space-lg` (`1.5rem`) to frame dish imagery with airy elegance.
- Inline controls, tag clouds, and voting reaction clusters use `space-xs` and `space-sm` for compact touch clusters.

## Elevation & Depth

Visual depth is achieved through ambient, warm-tinted shadows paired with tonal surface layering, steering completely clear of stark grey drop shadows.

### Ambient Warmth Shadows
- **Base Level (Resting Cards):** `0px 4px 20px -2px rgba(104, 66, 41, 0.06), 0px 1px 4px 0px rgba(104, 66, 41, 0.04)`. Imparts a gentle lifting effect reminiscent of thick textured paper resting on linen.
- **Interactive Hover & Drag (Active Cards & Modals):** `0px 12px 32px -4px rgba(230, 81, 0, 0.12), 0px 4px 12px 0px rgba(104, 66, 41, 0.06)`. A warm saffron-tinged glow that indicates physical lift during swipe gestures or roulette wheel spinning.
- **Floating Bar & Modals:** `0px 16px 40px -6px rgba(26, 26, 26, 0.12), 0px 0px 0px 1px rgba(233, 226, 218, 0.8)`. Combines deep diffused separation with an ultra-fine warm hairline border.

### Surface Tiers
- Depth does not rely on opacity tricks alone. Subordinate information panels use tinted warm fills (`#F3EEEA`), while active decision cards present pristine, high-contrast `#FFFFFF` bodies.

## Shapes

The design system adopts a soft, pill-forward shape hierarchy (`level 3`), maximizing tactile comfort for thumb interaction and echoing the organic profiles of tableware and ingredients.

### Geometric Application
- **Buttons & Filter Pills:** Full `rounded-full` / `9999px` capsules. They provide ergonomic comfort for fast tapping and clear distinction from content cards.
- **Restaurant & Decision Cards:** `rounded-lg` (`2rem` / `32px`) to `rounded-xl` (`3rem` / `48px`) squircle corners, creating friendly contours that nest seamlessly inside swipe decks.
- **Bottom Sheets & Floating Trays:** Top corners styled with `2rem` roundedness, accented with a rounded grab handle (`4px` height, `36px` width, `#D7CCC8`).
- **Media Containers:** Image viewports within cards mimic the outer card curve minus internal padding offsets for concentric harmony.

## Components

### Buttons
- **Primary Pill (Spin, Commit, Book):** Background `#E65100`, text `#FFFFFF`, height `56px`, pill-shaped (`9999px`). Features a subtle bottom-lit inner gradient and an ambient terracotta glow on press.
- **Secondary Affirmative (Consensus, Matches):** Background `#2E7D32`, text `#FFFFFF`, height `48px`, pill-shaped.
- **Ghost / Tertiary Pill:** Background `#F3EEEA`, text `#1A1A1A`, bordered by a subtle `#E9E2DA` rim. Transitions to `#E65100` tint on active states.

### Chips & Dietary Badges
- Compact capsules (`28px` to `32px` height) with `label-sm` or `label-md` typography.
- **Spicy / Hot Trends:** Tinted `#FBE9E7` fill with `#F4511E` text and icon.
- **Dietary (Vegan, Halal, GF):** Tinted `#E8F5E9` fill with `#2E7D32` text.
- **Distance & Price Tier:** Tinted `#F3EEEA` fill with `#1A1A1A` text.

### Decision Cards & Swipe Decks
- White `#FFFFFF` card body with `24px` internal padding, `rounded-2xl` corners, and ambient warm shadows.
- Media elements span full width with 4:3 or 1:1 aspect ratios, integrated bookmark/spin chips, and stacked taste profile tags.
- Direct gesture response: progressive card tilt and directional color hints (Green right for "Crave", Terracotta left for "Pass").

### Lists & Menu Item Tiles
- Framed in soft inset borders (`1px solid #E9E2DA`) with rounded corners (`16px`).
- Generous touch targets (min `64px` row height), featuring right-aligned pricing capsules and photo thumbnails with `12px` roundedness.

### Checkboxes, Steppers & Radio Badges
- Traditional square checkboxes are replaced with rounded organic selectors.
- Radio buttons feature a concentric bullseye with a warm terracotta active dot.
- Quantity/vote steppers are enclosed within pill-shaped container trays.

### Input Fields & Search Bars
- Search bar adopts an elongated capsule shape (`52px` height), `#FFFFFF` fill, `#E9E2DA` border, and warm shadow.
- Placeholder text in muted charcoal (`rgba(26, 26, 26, 0.5)`). Focus rings display an active `#E65100` outline with a 3px soft ambient halo.

### Specialized App Component: TasteRoulette Wheel Module
- Circular spinning selector integrated into a bottom sheet modal.
- Segmented in alternating terracotta, basil, and saffron hues with high-contrast icon pictograms, stabilized by a central pill action trigger ("SPIN TASTE").
