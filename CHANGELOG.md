# Changelog

User-visible changes, newest first.

## Unreleased

- The Warm Gourmet look of `DESIGN.md` (DSV-5): cream, paprika and basil tokens with a light and a dark value each, `--wheel-1` to `--wheel-4`, 24px cards, capsule buttons and the font Plus Jakarta Sans, self-hosted in `fonts/` (SIL OFL) and cached in `SHELL`. `--primary` is the dark paprika `#b33f00`, so white text on it reaches 5.8:1.

## 0.1.1 - 2026-11-09

- First release, from pwa-template 0.1.4: offline shell, install, update toast, What's new, Google or offline account, English and Spanish, light and dark themes, Delete all data. The notes demo stands in for the restaurants, dishes and roulette. The release notes start with this version; the template's 0.1.2 to 0.1.4 entries, which this app never shipped, go. `DESIGN.md` holds the design system of the Stitch project "Social Food Roulette PWA" (projects/6761532087147787488), the target design.
- The app runs on `https://spinach.artisandevs.duckdns.org/`, proxied by pwa-server from the Pages site, as Bodega and Attire do, and calls the server at `https://api.artisandevs.duckdns.org` (`PRODUCTION_API`, ACC-3).
