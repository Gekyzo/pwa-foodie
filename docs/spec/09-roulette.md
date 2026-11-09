# Roulette

The wheel that picks a place or a dish from the ones that pass the filters. Its files are
`src/roulette.js` and `tests/roulette.test.js`. The screen rules come with the screen.

## Candidates

- **RUL-1** The modes are `places` and `dishes`. An unknown mode is `places`.
- **RUL-2** In `places` mode the candidates are the places that pass the filters, with no search
  query. The price cap is not used. An item is `{ id, kind: 'place', placeId, label, emoji }`: `id` and
  `placeId` are the place id, `label` is the name and `emoji` is the one of its cuisine.
- **RUL-3** In `dishes` mode the candidates are the dishes of those places that pass the price
  cap (PLC-19). An item is `{ id, kind: 'dish', placeId, label, emoji }`: `id` is the dish id,
  `label` is `dish · place` and `emoji` is the one of the cuisine of the place.

## Draw

- **RUL-4** `drawWheel` gives `{ segments, total, winner }`. With no items it gives no segments,
  `total` 0 and `winner` `null`. With one item, that item wins and nothing is drawn.
- **RUL-5** The item whose id is `exclude` (the last winner) is left out when there are 3 items or
  more. With 2 items it stays, so **Spin again** can give the same result.
- **RUL-6** A wheel has 12 segments at most. When more items remain, 12 of them are taken by a
  Fisher-Yates shuffle. `total` is the count after the exclude and before this sample.
  The input array is never changed.
- **RUL-7** `winner` is `floor(random() * segments.length)`, an index of `segments`.

## Landing

- **RUL-8** Segment `i` of `n` covers the angles from `i * s` up to `(i + 1) * s`, clockwise from
  the pointer at the top, with `s = 360 / n`. `landingAngle` gives `turns * 360 + (360 - (i + 0.5) * s)`
  plus a jitter of at most 30% of `s` on each side. The pointer always stops inside the winner
  segment. A spin lasts `SPIN_MS`, 4000 ms.
- **RUL-9** With reduced motion (`prefers-reduced-motion`) the wheel does not turn. The result shows
  at once.
