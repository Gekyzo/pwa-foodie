# Changelog

User-visible changes, newest first.

## Unreleased

- The app moves to `https://spinach.polarisworks.duckdns.org/` and calls the API at
  `https://api.polarisworks.duckdns.org` (`PRODUCTION_API`, ACC-3). pwa-server serves the legacy
  `spinach.artisandevs.duckdns.org` in parallel, with no redirect, and its migration 18 moves
  `apps.url`.

## 0.2.0 - 2026-11-09

- Spinach replaces the notes demo with places, dishes, filters and the roulette. Pure modules `src/places.js`, `src/dishes.js`, `src/geo.js`, `src/filters.js`, `src/roulette.js` and `src/cuisines.js`; the spec documents `07-places.md` (PLC, LOC) and `09-roulette.md` (RUL) replace `07-notes.md`. The doc is `pwa-foodie.places`; Export and Import carry it. Sections are `explore`, `roulette` and `settings`; `roulette` is the one module (NAV-1, MOD-1). The drag module (`src/ui/drag.js`, `src/reorder.js`) is gone.
- Explore (PLC-20 to PLC-27): `src/ui/explore.js` (cards, search through `visiblePlaces`, empty state, swipe to delete) and `src/ui/place.js` (detail in the `pane`, the place sheet, favourite, delete with Undo, `openPlace`). New icons `compass`, `wheel`, `heart`, `star`; tile tokens `--tile-1` to `--tile-4`.
- Dishes and the location of a place (PLC-24, PLC-28 to PLC-31, LOC-7, LOC-8): the detail lists the dishes with rating and note and edits them in `#dish-sheet` (`addDish`, `editDish`, `deleteDish` with Undo, the price read by `parsePrice`); the place sheet has a location field (Use my position, a pasted map link read by `parseLocation`, Clear) and the detail a **Route** link (`routeUrl`, new tab) and the distance from a fresh fix. New `src/ui/position.js` (`readPosition`, `currentFix`, `silentFix`; the fix lives in `ui/context.js`, `setFix`). `ui.sheet` names the open sheet (`place`, `dish`, `filter` or null), so Escape closes it. `src/ui/motion.js` `collapse` closes a deleted card or dish row. New icons `route` and `pin`.
- Filter chips and distance (PLC-20, PLC-21, PLC-32 to PLC-36, LOC-9, LOC-10): new `src/ui/filters.js` (`renderChips(container, { mode })` with Price, Distance, Favourites, Cuisine and, in `dishes` mode, Max price; `#filter-sheet`). The filters live in `ui/context.js` (`filters`, `setFilters`, saved under `pwa-foodie.filters`). A distance pick reads the position; a failure shows on the chip, a saved distance with no fix waits and filters nothing. Explore and the Roulette call `silentFix` when they come into view; Explore shows the distance on the cards and sorts nearest first. The "Can't decide?" card goes to Roulette and hides with the module off. A horizontal drag on the chip row does not change the section.
- The Roulette section (RUL-10 to RUL-15): `src/ui/roulette.js` (`bind`, `renderRoulette`). A **Places** / **Dishes** switch (`ui.mode`), the shared filter chips, and a wheel of up to 12 segments drawn as a CSS conic gradient with a label and an emoji on each segment, "12 of N" above it. **Spin**, the hub of the wheel, turns the disc to the winner of `drawWheel` by `landingAngle` over `SPIN_MS` (`ui.spinning` disables the controls); reduced motion shows the result at once. The result card has **Let's go** (`routeUrl`, disabled with no location), **Open** (`openPlace`) and **Spin again** (`exclude: ui.lastWinner`); a change of mode or filters clears the last winner. From 840px the switch and the chips are centred over the wheel. 0 candidates show an empty state that goes to Explore, 1 shows the result at once. Tokens `--on-wheel-1` to `--on-wheel-4` keep the segment text at 4.5:1 or more, plus `--wheel-size`, `--roulette-max` and `--spin-ease`.
- The Warm Gourmet look of `DESIGN.md` (DSV-5): cream, paprika and basil tokens with a light and a dark value each, `--wheel-1` to `--wheel-4`, 24px cards, capsule buttons and the font Plus Jakarta Sans, self-hosted in `fonts/` (SIL OFL) and cached in `SHELL`. `--primary` is the dark paprika `#b33f00`, so white text on it reaches 5.8:1.
- The walkthrough has three pages (ONB-2): `places`, `filters` and `roulette`, each with a new drawing; the `welcome` and `offline` pages of the template go.

## 0.1.1 - 2026-11-09

- First release, from pwa-template 0.1.4: offline shell, install, update toast, What's new, Google or offline account, English and Spanish, light and dark themes, Delete all data. The notes demo stands in for the restaurants, dishes and roulette. The release notes start with this version; the template's 0.1.2 to 0.1.4 entries, which this app never shipped, go. `DESIGN.md` holds the design system of the Stitch project "Social Food Roulette PWA" (projects/6761532087147787488), the target design.
- The app runs on `https://spinach.artisandevs.duckdns.org/`, proxied by pwa-server from the Pages site, as Bodega and Attire do, and calls the server at `https://api.artisandevs.duckdns.org` (`PRODUCTION_API`, ACC-3).
