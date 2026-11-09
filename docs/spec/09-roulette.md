# Roulette

The wheel that picks a place or a dish from the ones that pass the filters. Its files are
`src/roulette.js` and `tests/roulette.test.js`, and the screen `src/ui/roulette.js`.

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
- **RUL-9** With reduced motion (`prefers-reduced-motion`) the wheel does not turn: it stands at
  its end angle at once. The result shows at once.

## Screen

- **RUL-10** The Roulette section has, from the top: the **Places** / **Dishes** switch
  (`ui.mode`, not stored, `places` at the start), the filter chips of Explore with their shared
  filters (PLC-32), then the wheel and the result card. In Dishes mode the chips add **Max price**.
  With no place the switch and the chips hide. The section is one centred column; from 840px
  the switch and the chips are centred over it, and while a result shows, the wheel and the
  result card stand side by side. At the open of the
  section the position is read with no prompt (LOC-8).
- **RUL-11** The wheel draws the `segments` of `drawWheel` clockwise from the pointer at the top,
  in the colours `--wheel-1` to `--wheel-4` in turn (`colourOf`). The last segment of a count of 4k + 1 takes
  `--wheel-2`, so that two neighbours never share a colour. Each segment shows its label, cut with
  an ellipsis, and its emoji at the rim. The text of a segment is in `--on-wheel-1` to
  `--on-wheel-4`, at 4.5:1 or more on its colour in both themes. The wheel is at most
  `--wheel-size` (400px) wide and never wider than the section. Above it, `roulette.count` says
  "12 of N" when `total` is more than `MAX_SEGMENTS`. The disc is an image (`role="img"`) labelled
  `roulette.wheel`; the centre button stands out of it, so that a screen reader reaches it.
- **RUL-12** **Spin** is the centre button. The first spin turns to the winner of the wheel in
  view; a later spin draws again with `exclude` set to `ui.lastWinner` (RUL-5). The disc turns
  forward by `landingAngle` over `SPIN_MS` with an ease-out. While it turns, `ui.spinning` is true
  and the switch, the chips and Spin are disabled. At the end the winner shows in the result card,
  it becomes `ui.lastWinner`, the focus goes to the name of the result, and the whole card
  scrolls into view. With reduced motion the result shows at once (RUL-9).
- **RUL-13** With no candidate the wheel and the result hide, and the empty state
  `roulette.emptyTitle` shows `roulette.noPlaces` with no place, else `roulette.emptyPlaces` or
  `roulette.emptyDishes` by the mode, with
  **See my places**, which goes to Explore. With one candidate the wheel hides and that candidate
  is the result at once, with no **Spin again**.
- **RUL-14** The result card shows the cuisine tile, the name (the dish name for a dish), for a
  dish `roulette.at` with its place, the cuisine and the area, the tier, the distance from a fresh
  fix and the rating, and for a dish with a price that price. **Let's go** opens the route link of
  the place (LOC-4, as PLC-29) in a new tab; with no location it has no address and is disabled. **Open**
  opens the place in Explore (`openPlace`). **Spin again** spins as RUL-12.
- **RUL-15** A change of the mode or of the filters clears `ui.lastWinner` and the result, and
  draws a new wheel. A change of the candidates (a new fix, an edit of a place) draws a new wheel
  and keeps the result while its item is still a candidate. Nothing changes the wheel while it
  turns.
