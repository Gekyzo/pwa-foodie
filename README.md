# Food roulette - Spinach

Track the restaurants and dishes you like, filter them by price or distance, and spin a
roulette to choose what to eat. An offline Android PWA in plain HTML, CSS and ES modules: no
build step and no dependencies. Built from `pwa-template`, it has:

- an offline service worker, an update check with an update toast, and an install button;
- an adaptive layout: a bottom bar on a phone, a rail on a tablet, list and detail side by side
  on a wide screen;
- a design system with a live catalogue at `/designs/`;
- English and Spanish text, light and dark themes, a left-hand mode;
- a release script and a GitHub Pages deploy on a version tag;
- structural tests that keep the layers, the text, the design system and the specification in step.

Explore lists your restaurants as cards, with a search, a detail and an add sheet. The dishes,
the filters and the roulette come next. The target design is the Stitch project "Social Food Roulette PWA"; `DESIGN.md` holds its
design system.

## Develop

```sh
npm run serve   # http://localhost:8080
npm test
npm run ds      # copy the design system again from ../pwa-design-system
```

## Account and set-up outside the app

The app opens with **Sign in**: **Continue with Google** (an account on the PocketBase server of
`pwa-server`, approved per app) or **Use offline** (no account). The places stay on the device in
both modes; nothing syncs. The rules are in [docs/spec/08-account.md](docs/spec/08-account.md).

The app runs on `https://spinach.artisandevs.duckdns.org/`: Caddy on pwa-server proxies the Pages
site `https://polaris-works.github.io/pwa-foodie/`. The server slug is `pwa-foodie` (`APP_SLUG`). The
steps outside the app, which the app does not need to work offline, are in
[docs/spec/08-account.md](docs/spec/08-account.md) ("Set-up outside the app").

## Install on Android

Open the deployed URL in Chrome. Use the **Install** button of Settings, or Chrome menu →
**Install app**.

## Release and deploy

Go through [docs/deploy-checklist.md](docs/deploy-checklist.md) first.

1. Write the user-visible changes under `## Unreleased` in `CHANGELOG.md`.
2. `npm run release` (or `npm run release -- minor|major`). It commits `Bump version to X.Y.Z`
   and creates the tag `vX.Y.Z`.
3. `git push --follow-tags`. The workflow `.github/workflows/pages.yml` deploys the tag.

Set the repository's Pages source to "GitHub Actions" once.

## Design system

The shared tokens, components and layouts come from `pwa-design-system`, copied into
`vendor/design-system/` by `npm run ds`; `SOURCE.json` there names the version and the commit.
`index.html` loads `vendor/design-system/design-system.css`, then `styles.css`, which holds the
parts of the app only. Change a shared part in `pwa-design-system`, then run `npm run ds`; never
edit `vendor/` by hand. Open `/designs/` on the dev server for the catalogue.
`docs/spec/04-design-system.md` has the rules of the app and points to the shared ones.
