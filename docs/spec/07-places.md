# Places

The domain of the app: restaurants, the dishes of each, and where they are, and the Explore
section that shows them. Its files are `src/places.js`, `src/dishes.js`, `src/cuisines.js`,
`src/geo.js`, `src/filters.js`, the views `src/ui/explore.js` and `src/ui/place.js`, their tests,
the `cuisine.*`, `explore.*`, `place.*`, `places.count` and `tier.*` keys and the `error.*` keys of
the places in the catalogs, the `#explore` section and the `#place-sheet` of `index.html`.

## Doc

- **PLC-1** The doc is `{ version: 1, places: [place] }`, newest place first, stored as JSON under
  `pwa-foodie.places`. A stored doc that is not valid is kept under
  `pwa-foodie.places.corrupt`, and the app starts with no places.
- **PLC-2** A place is `{ id, name, cuisine, area, tier, location, favorite, rating, note, dishes,
  created }`. `location` is `null` or `{ lat, lng }`, `rating` is `null` or an integer from 1 to
  5, and `created` is an ISO date string. A dish is `{ id, name, price, star, rating, note }`,
  and `price` is `null` or integer cents.
- **PLC-3** `normalizePlaces` accepts a doc of version 1 whose places have a non-empty id and a
  name that is not blank, and no place id two times. The dishes of a place have a non-empty id, a
  name that is not blank, a price that is `null` or a whole number of cents of 0 or more, and no
  dish id two times in the place. It trims the texts, drops unknown fields and cleans the other
  values as PLC-5 says. A new version adds its migration here.

## Operations

- **PLC-4** `addPlace` puts a place first, with no dishes, `favorite` off and `created` set to
  the time of the call. The name is trimmed. A blank name is `error.nameRequired`, and a name of
  more than 80 characters is `error.nameTooLong`. An area of more than 60 characters is
  `error.areaTooLong`. A note of more than 280 characters is `error.noteTooLong`.
- **PLC-5** The defaults: `area` and `note` are empty, `tier` is 2, `location` and `rating` are
  `null`. An unknown cuisine is `other`. A tier that is not an integer from 1 to 4 is 2. A rating
  that is not an integer from 1 to 5 is `null`. A location that is not valid is `null`.
- **PLC-6** The cuisines are the ids of `src/cuisines.js`, in order: `spanish`, `tapas`,
  `mexican`, `japanese`, `italian`, `pizza`, `burger`, `asian`, `indian`, `peruvian`,
  `mediterranean`, `vegetarian`, `cafe`, `dessert`, `other`. Each has an emoji and the text
  `cuisine.<id>`. An unknown id is shown as `other`.
- **PLC-7** `editPlace` changes the name, cuisine, area, tier, location, rating and note of one
  place, with the checks of PLC-4 and PLC-5. A field that is not given is kept. The id, favorite,
  dishes and created date never change.
- **PLC-8** `deletePlace` removes one place. The toast offers **Undo** for 5 seconds.
- **PLC-9** `toggleFavorite` flips `favorite` of one place.
- **PLC-10** An id that is not in the doc is `error.placeMissing`, and the state is the same
  object.

## Dishes

- **PLC-11** `parsePrice` reads the text of a price field. It removes `€` and spaces. An empty text
  is `{ cents: null }`. A text of digits with up to two decimals, after `.` or `,`, is whole cents
  with integer math, so `14,50` is 1450. Any other text, and a price over `MAX_PRICE` (99999
  cents), is `error.priceInvalid`.
- **PLC-12** `addDish` appends a dish to the end of one place. The name is trimmed. A blank name,
  or a name that is not text, is `error.dishNameRequired`. A name of more than 80 characters is
  `error.dishNameTooLong`. A note of more than 280 characters is `error.noteTooLong`. A price that
  is not `null` or an integer from 0 to `MAX_PRICE` is `error.priceInvalid`.
- **PLC-13** The defaults of a dish: `price` and `rating` are `null`, `star` is off, `note` is
  empty. A rating that is not an integer from 1 to 5 is `null`. `star` is on only for `true`.
  `editDish` keeps a field that is not given and checks the others as PLC-12 says. `deleteDish`
  removes one dish.
- **PLC-14** An unknown place is `error.placeMissing`, as PLC-10 says. A dish id that is not in
  its place is `error.dishMissing`. In both cases the state is the same object. `sortDishes`
  returns the star dishes first and keeps the order inside each group.
- **PLC-15** The filters are `{ tiers, km, favorites, cuisines, maxPrice }`. The defaults are
  `tiers` `[1, 4]`, `km` `null`, `favorites` off, `cuisines` empty and `maxPrice` `null`.
  `normalizeFilters` gives each bad field its default. `tiers` is two integers from 1 to 4, sorted.
  `km` is 1, 2, 5, 10 or `null`. `cuisines` keeps the known ids. `maxPrice` is an integer number
  of cents or `null`. The query is not a filter and is not stored.
- **PLC-16** `visiblePlaces` keeps a place when its tier is inside `tiers`, it is a favourite
  when `favorites` is on, and its cuisine is in `cuisines` when that list is not empty.
- **PLC-17** The query is folded: accents removed, lower case, outer spaces trimmed. It matches
  the name, the area, the cuisine name and the dish names. `names` gives the cuisine text in the
  current language; with no entry the cuisine id is used. A blank query matches every place.
- **PLC-18** `km` filters only when a position is given. A place with no location, or farther
  than `km`, then drops out. With no position the distance filter keeps every place. The `km` of a
  row is `null` with no position or no location.
- **PLC-19** The order is by `km` ascending with a position, and places with no location last.
  With no position it is by `created`, newest first. Ties are by `id`. `candidateDishes` takes the
  visible places with no query, in that order, and lists their dishes in `sortDishes` order. While
  `maxPrice` is set, a dish with no price or a price above it drops out.

## Screen

- **PLC-20** Explore lists the places as cards, in the order of PLC-19, from `visiblePlaces` with
  the text of the search and no position. Until the filter chips come, the filters are the
  defaults of PLC-15.
- **PLC-21** A card shows the cuisine tile, the name, `place.meta` (the cuisine and the area, or the
  cuisine alone), the tier as `tier.<n>` (`€` to `€€€€`), the own rating with a star, up to two
  star dishes in `sortDishes` order, and the heart. The tile shows the emoji of the cuisine on
  `--tile-<n>`, a soft tint of `--wheel-<n>`: n is the index of the cuisine in `CUISINES`, modulo
  4, plus 1. The tile holds no text.
- **PLC-22** The search above the cards filters them at each key, as PLC-17 says. It is not
  stored. With no place, the search hides and Explore shows `explore.emptyTitle`,
  `explore.empty` and **Add place**. With places and no match, it shows `explore.noMatch`.
- **PLC-23** **+** and **Add place** open the sheet of a new place. A tap on a card opens its
  detail (LAY-3); from 840px the card of the open place is marked. A tap on the heart flips the
  favourite (PLC-9). A card slides left to show **Delete** (PLC-26).
- **PLC-24** The detail shows the large tile, the name, `place.meta`, the tier and the rating, the
  heart, **Edit**, **Delete**, the note, and the dishes, star dishes first (`sortDishes`), each
  with its name and its price in EUR in the language of the screen. With no dish it shows
  `place.noDishes`. **Back** and Escape close it.
- **PLC-25** The place sheet has a name (80 characters), a cuisine (a select of `CUISINES`;
  `other` for a new place), an area (60 characters), a tier (four segments, `€` to `€€€€`; 2 for a
  new place), a rating (five stars; a tap on the current rating clears it) and a note (280
  characters). **Save** runs `addPlace` or `editPlace`; an error shows in the toast and the sheet
  stays open. **Close**, a tap on the veil, a drag down of the head and Escape close it with no
  save.
- **PLC-26** **Delete**, in the detail or behind a card, runs `deletePlace`. The toast
  `toast.placeDeleted` offers **Undo** for 5 seconds.
- **PLC-27** Export writes the places doc. Import reads a file through `normalizePlaces` and asks
  `import.confirm` with the count `places.count` before it replaces the doc.

## Location

- **LOC-1** A location is valid when `lat` is a finite number from -90 to 90 and `lng` is a
  finite number from -180 to 180. Any other value is not a location.
- **LOC-2** `parseLocation` reads a pasted text. A short link (`maps.app.goo.gl` or `goo.gl/maps`)
  is `error.shortLink`. Other text that is not a location is `error.locationInvalid`.
- **LOC-3** A bare pair is `lat, lng` with optional spaces around the comma, and nothing else in
  the text. A Google Maps URL (a `google.*` host with a `maps.` host or a `/maps` path) is decoded
  first. The pair comes from, in order: `!3d<lat>!4d<lng>`, then `q=`, `query=` or `ll=`, then
  `@<lat>,<lng>`. A pair out of range is `error.locationInvalid`.
- **LOC-4** `distanceKm` is the haversine distance in km, with an earth radius of 6371 km.
  `routeUrl` is `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`.
- **LOC-5** A position fix is `{ location, at }`. It is fresh when `now - at` is less than
  `FIX_MS` (600000 ms, 10 minutes).
- **LOC-6** `distanceLabel` below 1 km is `distance.m` with metres rounded to 50 and at least 50.
  From 1 km it is `distance.km` with km to one decimal.
