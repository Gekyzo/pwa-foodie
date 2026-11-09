# Design system

The shared tokens, base rules, components, layouts and icons rules come from `pwa-design-system`.
Its rules DS-1 to DS-8 are in its `docs/spec/01-design-system.md`, and LAY-1 to LAY-4 in its
`docs/spec/02-layout.md`. `vendor/design-system/SOURCE.json` names the version and the commit that
this app uses. `tests/design.test.js` runs each rule of `vendor/design-system/rules.js` over the
files of the app, with no skip. `designs/index.html` shows each part, shared and own.

This document holds the rules of the app only.

## The copy

- **DSV-1** `vendor/design-system/` holds `design-system.css`, `catalog.js`, `rules.js`,
  `sheet.js`, the font `geist.woff2` and `SOURCE.json`: the version, the commit and the sha256 of
  each file, and no other file. Only
  `npm run ds` writes it, from `../pwa-design-system` with no uncommitted change of those files. A
  file that differs from its hash fails `tests/vendor.test.js`. The tests read the copy only, so
  they pass with no `../pwa-design-system`.
- **DSV-2** `index.html` and `designs/index.html` link `vendor/design-system/design-system.css`
  before `styles.css`, and `SHELL` of `sw.js` has both, `sheet.js` and `geist.woff2` (SW-2). The
  page loads `sheet.js` through the alias `#ds/sheet` (ENG-6). A layer of the two sheets is one
  layer: a rule of `styles.css` comes after the shared rules of its layer.
- **DSV-3** `styles.css` starts with the same layer statement and holds the parts of the app only:
  its tokens, the `body` rule and the font of the controls, the screen parts, and the components of the app.
  A version of a shared component starts with the block `/* @extends <name> */`, in the same
  layer, so that it wins; the block documents the parts, variants and states that the app adds.
  A version holds only the rules that differ from the shared ones, so that a change of the shared
  sheet reaches the app. No other rule of `components` or `layouts` repeats a selector of the
  shared sheet. The one version of a shared component is `list-group` in `settings`: the select
  of a row of Preferences lies over the row (SET-1).
- **DSV-4** A change of a shared part is made in `pwa-design-system`, then `npm run ds` here.
  Nothing edits `vendor/` by hand, and `npm run init` copies it as it is (ENG-17).
- **DSV-5** The look is Warm Gourmet of `DESIGN.md`. The tokens layer of `styles.css` sets it
  over the shared tokens, and the shared sheet does not change. Each colour has a light and a dark
  value (`light-dark()`). Text on `--primary` and on `--done` has a contrast of 4.5:1 or more in
  both themes, so `--primary` is a dark paprika and `--paprika` is the brand hue for art only. The
  font is Plus Jakarta Sans, from `fonts/plus-jakarta-sans.woff2` of the app (latin, variable,
  SIL OFL, `fonts/OFL.txt`), in `SHELL` of `sw.js` (SW-2), so it shows offline. No font comes from
  the network.

## Parts of the app

The parts of `styles.css`, by layer. The shared parts are in the design system.

| Layer | Parts |
|---|---|
| tokens | Warm Gourmet (DSV-5): the font Plus Jakarta Sans; `--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--line`, `--control`; `--primary` dark paprika with `--on-primary`, `--paprika` for art, `--done` basil with `--on-done` and `--done-soft`, `--ink`, `--secondary`; `--wheel-1` to `--wheel-4` (paprika, basil, saffron, cocoa) with `--on-wheel-1` to `--on-wheel-4` for the text on a segment (RUL-11), and `--tile-1` to `--tile-4`, their soft tints for the cuisine tiles; `--wheel-size` 400px, `--roulette-max` 1040px and `--spin-ease` for the roulette; `--radius-l` 24px for cards, `--radius-card` 32px for the hero card, capsule buttons, `--radius-xl` 32px sheets; a warm `--shadow-l` |
| screens | explore: `explore-search`, `place-list`, `place-tile`, `place-facts`, `place-fav`, `place-view` · place: `place-form` · roulette: `roulette`, `wheel`, `roulette-result` · settings: `settings` (version of `list-group`), `about`, `version-status` · nav: `dust` · onboarding: `onboarding`, `onboarding-art` |
