# Places

The domain of the app: restaurants, the dishes of each, and where they are. Its files are
`src/places.js`, `src/cuisines.js`, `tests/places.test.js`, `tests/cuisines.test.js`, the
`cuisine.*` keys and the `error.*` keys of the places in the catalogs. `07-notes.md` stays until
the notes demo goes away.

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

## Location

- **LOC-1** A location is valid when `lat` is a finite number from -90 to 90 and `lng` is a
  finite number from -180 to 180. Any other value is not a location.
