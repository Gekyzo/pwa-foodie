# PWA feature checklist

Source: the specification of `pwa-shopping-list` (Bodega, `docs/spec/`), compared with
`pwa-foodie` on 2026-11-07. Use it to triage a new app or a rollout.

Legend:

- Devices: **P** phone (<600px), **F** foldable (600–839px), **T** tablet (840–1023px),
  **D** desktop (≥1024px). `●` the feature applies, `○` it applies but with less value, `–` no.
- Template: `[x]` the template has it, `[~]` partial, `[ ]` missing.
- Ref: the rule identifier in `pwa-shopping-list/docs/spec/`.

## 1. Install and launch

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [x] | Manifest: `id`, `scope`, `start_url`, `display: standalone`, theme and background colour | ● | ● | ● | ● | VER-14 |
| [x] | Icons 192, 512 and maskable 512, written from one `source.png` | ● | ● | ● | ● | VER-15 |
| [x] | `orientation: any`: the app turns with the device | ● | ● | ● | – | INS-4 |
| [x] | Install offer in Settings: states `idle`, `available`, `installed` (`beforeinstallprompt`, `appinstalled`) | ● | ● | ● | ● | INS-1..3 |
| [x] | Start in `display-mode: standalone` counts as installed | ● | ● | ● | ● | INS-3 |
| [ ] | Launcher shortcuts in the manifest, each with a 192px icon | ● | ● | ○ | ● | SHORT-1, SHORT-4 |
| [ ] | `?open=<section>` start parameter, removed from the URL at once | ● | ● | ● | ● | SHORT-2, SHORT-5 |
| [ ] | Shortcut names from the catalogs, not hard-coded | ● | ● | ● | ● | SHORT-3 |
| [ ] | Start parameter from an outside trigger (`?arrival`: geofence reminder) | ● | – | – | – | ARR-1..5 |
| [ ] | `?voice` start: voice conversation from a shortcut or "Ok Google" | ● | ○ | ○ | – | VOICE-7 |

## 2. Offline, version and deploy

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [x] | Service worker registered at each start; the app works without one | ● | ● | ● | ● | SW-1 |
| [x] | App shell list, downloaded past the HTTP cache at install | ● | ● | ● | ● | SW-2, SW-3 |
| [x] | Old caches deleted at activation, by name prefix | ● | ● | ● | ● | SW-4 |
| [x] | Same-origin `GET` only, stale-while-revalidate, offline fallback for navigation | ● | ● | ● | ● | SW-5..7 |
| [x] | `version.json` with `{ version, date }`; latest read with `?latest=` past the cache | ● | ● | ● | ● | VER-1..5 |
| [x] | Version status in Settings and an **Update** button (`refresh` message to the worker) | ● | ● | ● | ● | VER-6..8 |
| [x] | `npm run release`: bump, changelog, tag; push of a `v*` tag deploys to Pages | ● | ● | ● | ● | VER-9..13, VER-17 |
| [x] | Release notes per language and a **What's new** sheet after an update | ● | ● | ● | ● | VER-18..22 |
| [ ] | Cache name change when the stored state changes shape | ● | ● | ● | ● | SW-10 |

## 3. Storage, backup and sync

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [x] | Persistent storage request (`navigator.storage.persist()`) at each start | ● | ● | ● | ● | STORE-4 |
| [~] | One read at start; each change written at once; validate, clean and migrate the stored state | ● | ● | ● | ● | STORE-1..8 |
| [~] | Write failure keeps the change on screen with a message; in-memory mode without `localStorage` | ● | ● | ● | ● | STORE-9, STORE-10 |
| [x] | Export and import of a JSON backup, import with confirm and undo | ● | ● | ● | ● | BACKUP-1..6 |
| [x] | **Delete all data**, in danger colour, with a confirm | ● | ● | ● | ● | BACKUP-7 |
| [x] | Google sign-in by redirect, saved session that opens offline, expiry 60s early | ● | ● | ● | ● | ACC-1..7 |
| [ ] | Sync queue: diff against the last synced state, queued change wins, deletes as tombstones | ● | ● | ● | ● | SYNC-1..7 |
| [~] | Sync at start, at `online`, 1.5s after a save; offline note over the list | ● | ● | ● | ● | SYNC-3, SYNC-11 |
| [ ] | Sharing a space with another account, by email invite | ● | ● | ● | ● | SHARE-1..16 |
| [ ] | Cross-tab: last writer wins (documented limit) or a `storage` event listener | ○ | ○ | ● | ● | STORE-11 |

## 4. Layout per device class

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [~] | Four width classes in one module (`src/device.js`, one `matchMedia` watcher) | ● | ● | ● | ● | NAV-28, DSV-9 |
| [x] | Bottom bar on phone | ● | – | – | – | NAV-1 |
| [ ] | Rail at the left from 600px, on either hand | – | ● | ● | ● | NAV-26 |
| [ ] | Labelled sidebar in one centred frame from 1024px, current section as a band | – | – | – | ● | DSV-22, DSV-25 |
| [ ] | Header and content as one centred column from 600px | – | ● | ● | ● | DSV-8 |
| [ ] | Settings as a column of at most 960px, each group a row, from 840px | – | – | ● | ● | NAV-27 |
| [ ] | Sheet as a side card (`--panel-width`) from 840px, bottom sheet below | ● | ● | ● | ● | DSV-6 |
| [ ] | Second panel beside the list (postponed items, recipes) on wide screens | – | ○ | ● | ● | DSV-9 |
| [ ] | Phone on its side (height ≤480px): more height for the content | ● | ○ | – | – | DSV-7 |
| [ ] | Dock above the bottom bar that holds `+` and search, below 600px | ● | – | – | – | NAV-24, DSV-17 |
| [ ] | Foldable hinge: `horizontal-viewport-segments` / `env(viewport-segment-*)` | – | ● | ○ | – | not in Bodega |

## 5. Phone and touch

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [x] | `viewport-fit=cover` and safe-area insets on header, bars, `+` and sheets | ● | ● | ○ | – | A11Y-7 |
| [x] | `interactive-widget=resizes-content`: the view resizes with the keyboard | ● | ● | ● | – | A11Y-7 |
| [x] | Horizontal slide changes the section (60px minimum, not on rows) | ● | ● | ○ | – | NAV-2..5 |
| [ ] | Row slide: actions on the left side, an action at release on the right side | ● | ● | ● | ○ | ROW-3..6, ROW-11 |
| [ ] | Click after a drag, hold or slide ignored for 350ms | ● | ● | ● | ○ | ROW-8 |
| [ ] | No browser menu on a long press of a row | ● | ● | ● | – | ROW-10 |
| [ ] | One-time hint: the first row slides open by itself after 600ms | ● | ● | ● | – | ROW-14 |
| [ ] | Haptic tick (`navigator.vibrate?.(10)`) on drag and on an armed action | ● | ● | ○ | – | went with the drag module |
| [~] | Back button and `Escape` close the top layer first | ● | ● | ● | ● | NAV-25 |
| [ ] | Drag down of the grab closes a sheet at 30% | ● | ● | ○ | – | NAV-23 |
| [x] | **Hand** setting: `left` mirrors the controls | ● | ● | ○ | – | NAV-11..14 |

## 6. Desktop, mouse and keyboard

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [ ] | Right click on a row opens its actions as a menu | – | – | ○ | ● | ROW-15 |
| [ ] | Row action buttons on hover, only for `(hover: hover) and (pointer: fine)` | – | – | ○ | ● | ROW-16 |
| [~] | Keyboard shortcuts for sections, add, search and rows, off while typing or with a sheet open | – | ○ | ● | ● | NAV-29 |
| [ ] | Trip menu in the header below 1024px, in the sidebar from 1024px | ● | ● | ● | ● | NAV-9 |
| [ ] | Window Controls Overlay (`display_override`) for an installed desktop window | – | – | – | ● | not in Bodega |

## 7. Look and effects

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [x] | Shared design system in `vendor/design-system/`, app parts in `styles.css` | ● | ● | ● | ● | DSV-1..4 |
| [x] | **Theme**: Automatic, Light, Dark; Automatic follows `prefers-color-scheme` | ● | ● | ● | ● | NAV-15..17, A11Y-6 |
| [ ] | **Density**: Normal and Compact token sets | ○ | ● | ● | ● | NAV-19..21 |
| [ ] | Section content comes in from its side after a slide | ● | ● | ○ | ○ | NAV-5 |
| [ ] | Rows never appear or disappear at once (200ms close, then move) | ● | ● | ● | ● | ROW-9 |
| [x] | Dust effect when a module is turned off | ● | ● | ● | ● | MOD-3 (template) |
| [x] | `prefers-reduced-motion: reduce` removes the animations | ● | ● | ● | ● | A11Y-5, ONB-12 |
| [ ] | Font shipped with the app (no network font) | ● | ● | ● | ● | Hanken Grotesk |
| [ ] | Empty state per section: title and text in the lower half of the list area | ● | ● | ● | ● | NAV-7 |
| [ ] | View Transitions API between sections | ● | ● | ● | ● | not in Bodega |

## 8. Feedback, onboarding and help

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [~] | One message at a time; 3s plain, 5s with **Undo** | ● | ● | ● | ● | MSG-1..2 |
| [ ] | **Undo** puts back the full previous state | ● | ● | ● | ● | MSG-3..6 |
| [x] | Walkthrough at the first start, slide between pages, **Skip**, again from Settings | ● | ● | ● | ● | ONB-1..9 |
| [x] | Walkthrough is a modal dialog; the app below is `inert` | ● | ● | ● | ● | ONB-10, ONB-11 |
| [ ] | Optional sample data from the last walkthrough page, and a row that deletes it | ● | ● | ● | ● | ONB-13, ONB-14 |
| [x] | Modules that Settings turns off, stored per device | ● | ● | ● | ● | MOD-1..2 (template) |

## 9. Languages

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [x] | Catalogs in `src/locales/`, `es.js` the source wording, same keys in each | ● | ● | ● | ● | LANG-7, LANG-8 |
| [x] | Language from `navigator.languages`, **Automatic** in Settings, `lang` attribute follows | ● | ● | ● | ● | LANG-2..6 |
| [x] | Parameters `{name}` and plurals with `Intl.PluralRules`; English fallback | ● | ● | ● | ● | LANG-9..11 |
| [ ] | Pseudo-locale `?lang=pseudo` to find text that is not translated | ● | ● | ● | ● | LANG-18 |
| [ ] | Sort by name with one fixed collation in each language | ● | ● | ● | ● | LANG-15 |

## 10. Accessibility and safety

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [~] | Icon buttons with an `aria-label` that names the action and the object | ● | ● | ● | ● | A11Y-1 |
| [~] | `aria-pressed`, `aria-expanded`, `aria-current="page"` | ● | ● | ● | ● | A11Y-2 |
| [x] | Message is a live region (`role="status"`, `aria-live="polite"`) | ● | ● | ● | ● | A11Y-3 |
| [x] | Closed menu and layers below a dialog are `inert` | ● | ● | ● | ● | A11Y-4 |
| [x] | User text goes in as `textContent`, never as markup | ● | ● | ● | ● | A11Y-8 |

## 11. Device integrations

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [ ] | Voice commands: Web Speech recognition and speech synthesis, a pure interpreter | ● | ○ | ○ | ○ | VOICE-1..8 |
| [ ] | Geofence reminder through an outside automation that opens `?arrival` | ● | – | – | – | ARR-1..5 |
| [ ] | Web Share Target (`share_target`): receive text from other apps | ● | ● | ● | ○ | not in Bodega |
| [ ] | Web Share (`navigator.share`): send the list as text | ● | ● | ● | ○ | not in Bodega |
| [ ] | Badging API: count on the app icon | ● | ○ | ○ | ● | not in Bodega |
| [ ] | Screen Wake Lock while the app is in use at the shop | ● | ○ | ○ | – | not in Bodega |
| [ ] | `launch_handler: navigate-existing`: one window, not a new one per launch | ● | ● | ● | ● | not in Bodega |

## 12. Engineering and checks

| Template | Feature | P | F | T | D | Ref |
|---|---|---|---|---|---|---|
| [x] | Pure state operations, side effects as parameters, `#alias` imports | ● | ● | ● | ● | ENG-1..8 |
| [x] | Specification checked against the code (`tests/spec.test.js`, `pre-commit`) | ● | ● | ● | ● | ENG-12..15 |
| [x] | Browser check at 390, 700, 900 and 1440px, and offline with the server stopped | ● | ● | ● | ● | ENG-11, WORKFLOW |
| [x] | Dev server mode on `localhost` (local API, no cache surprise) | ● | ● | ● | ● | ENG-17, ACC-12 |
