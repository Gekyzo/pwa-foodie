import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DISTANCES,
  DEFAULT_FILTERS,
  normalizeFilters,
  fold,
  visiblePlaces,
  candidateDishes,
  distanceChip,
} from '#filters';

const here = { lat: 40.4168, lng: -3.7038 };
const near = { lat: 40.4178, lng: -3.7038 };
const mid = { lat: 40.4468, lng: -3.7038 };
const far = { lat: 41.4168, lng: -3.7038 };

let counter = 0;
const place = (fields = {}) => {
  counter += 1;
  return {
    id: `p${counter}`, name: `Place ${counter}`, cuisine: 'other', area: '', tier: 2, location: null,
    favorite: false, rating: null, note: '', dishes: [], created: '2026-01-01T00:00:00.000Z', ...fields,
  };
};
const dish = (fields = {}) => {
  counter += 1;
  return { id: `d${counter}`, name: `Dish ${counter}`, price: null, star: false, rating: null, note: '', ...fields };
};
const doc = (...places) => ({ version: 1, places });
const names = (rows) => rows.map((row) => row.place.name);
const ids = (rows) => rows.map((row) => row.place.id);

test('DISTANCES and DEFAULT_FILTERS have the planned values', () => {
  assert.deepEqual(DISTANCES, [1, 2, 5, 10]);
  assert.deepEqual(DEFAULT_FILTERS, { tiers: [1, 4], km: null, favorites: false, cuisines: [], maxPrice: null });
});

test('fold removes accents, case and outer spaces', () => {
  assert.equal(fold('  Piña COLADA Ñandú é '), 'pina colada nandu e');
});

test('the search ignores accents and case', () => {
  const state = doc(place({ name: 'Piña Colada Bar' }), place({ name: 'Taquería del Sol' }));
  assert.deepEqual(names(visiblePlaces(state, DEFAULT_FILTERS, { query: 'pina' })), ['Piña Colada Bar']);
  assert.deepEqual(names(visiblePlaces(state, DEFAULT_FILTERS, { query: 'TAQUERIA' })), ['Taquería del Sol']);
});

test('the search matches name, area, cuisine name and dish names', () => {
  const state = doc(
    place({ name: 'A', area: 'Malasaña' }),
    place({ name: 'B', cuisine: 'japanese' }),
    place({ name: 'C', dishes: [dish({ name: 'Croquetas' })] }),
    place({ name: 'D' }),
  );
  const find = (query, extra = {}) => names(visiblePlaces(state, DEFAULT_FILTERS, { query, ...extra }));
  assert.deepEqual(find('malasana'), ['A']);
  assert.deepEqual(find('japones', { names: { japanese: 'Japonés' } }), ['B']);
  assert.deepEqual(find('japanese'), ['B']);
  assert.deepEqual(find('croque'), ['C']);
});

test('a blank query matches all', () => {
  const state = doc(place(), place());
  assert.equal(visiblePlaces(state, DEFAULT_FILTERS, { query: '   ' }).length, 2);
  assert.equal(visiblePlaces(state, DEFAULT_FILTERS, {}).length, 2);
});

test('tiers keep the places between the two values', () => {
  const state = doc(place({ tier: 1 }), place({ tier: 2 }), place({ tier: 3 }), place({ tier: 4 }));
  const tiers = (range) => visiblePlaces(state, { ...DEFAULT_FILTERS, tiers: range }, {}).map((row) => row.place.tier).sort();
  assert.deepEqual(tiers([2, 3]), [2, 3]);
  assert.deepEqual(tiers([1, 4]), [1, 2, 3, 4]);
  assert.deepEqual(tiers([4, 4]), [4]);
});

test('favorites keeps the favourite places', () => {
  const state = doc(place({ name: 'Fav', favorite: true }), place({ name: 'Plain' }));
  assert.deepEqual(names(visiblePlaces(state, { ...DEFAULT_FILTERS, favorites: true }, {})), ['Fav']);
});

test('a non-empty cuisines list keeps those cuisines', () => {
  const state = doc(place({ name: 'J', cuisine: 'japanese' }), place({ name: 'I', cuisine: 'italian' }), place({ name: 'M', cuisine: 'mexican' }));
  const rows = visiblePlaces(state, { ...DEFAULT_FILTERS, cuisines: ['japanese', 'mexican'] }, {});
  assert.deepEqual(names(rows).sort(), ['J', 'M']);
});

test('the distance filter drops far places and places with no location when there is a position', () => {
  const state = doc(
    place({ name: 'Near', location: near }),
    place({ name: 'Far', location: far }),
    place({ name: 'None', location: null }),
  );
  const rows = visiblePlaces(state, { ...DEFAULT_FILTERS, km: 1 }, { position: here });
  assert.deepEqual(names(rows), ['Near']);
  assert.ok(rows[0].km > 0 && rows[0].km < 1);
});

test('a distance filter with no position keeps every place', () => {
  const state = doc(place({ location: null }), place({ location: far }));
  const rows = visiblePlaces(state, { ...DEFAULT_FILTERS, km: 1 }, { position: null });
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.km), [null, null]);
});

test('km is null for a place with no location', () => {
  const rows = visiblePlaces(doc(place({ location: null })), DEFAULT_FILTERS, { position: here });
  assert.equal(rows[0].km, null);
});

test('with a position the order is by distance, no location last; ties by id', () => {
  const state = doc(
    place({ id: 'z', name: 'None', location: null }),
    place({ id: 'b', name: 'Far', location: far }),
    place({ id: 'a', name: 'Mid', location: mid }),
    place({ id: 'd', name: 'Tie2', location: near }),
    place({ id: 'c', name: 'Tie1', location: near }),
    place({ id: 'y', name: 'None2', location: null }),
  );
  assert.deepEqual(ids(visiblePlaces(state, DEFAULT_FILTERS, { position: here })), ['c', 'd', 'a', 'b', 'y', 'z']);
});

test('with no position the order is by created descending; ties by id', () => {
  const state = doc(
    place({ id: 'a', created: '2026-01-01T00:00:00.000Z' }),
    place({ id: 'c', created: '2026-03-01T00:00:00.000Z' }),
    place({ id: 'b', created: '2026-03-01T00:00:00.000Z' }),
  );
  assert.deepEqual(ids(visiblePlaces(state, DEFAULT_FILTERS, {})), ['b', 'c', 'a']);
});

test('visiblePlaces does not change the state', () => {
  const state = doc(place({ id: 'a' }), place({ id: 'b', created: '2027-01-01T00:00:00.000Z' }));
  const before = JSON.stringify(state);
  visiblePlaces(state, DEFAULT_FILTERS, {});
  assert.equal(JSON.stringify(state), before);
});

test('candidateDishes lists the dishes of the passing places, star first', () => {
  const state = doc(
    place({ id: 'a', name: 'A', dishes: [dish({ id: 'a1', name: 'plain' }), dish({ id: 'a2', name: 'star', star: true })] }),
    place({ id: 'b', name: 'B', tier: 4, dishes: [dish({ id: 'b1' })] }),
  );
  const rows = candidateDishes(state, { ...DEFAULT_FILTERS, tiers: [1, 3] }, {});
  assert.deepEqual(rows.map((row) => row.dish.id), ['a2', 'a1']);
  assert.equal(rows[0].place.id, 'a');
  assert.equal(rows[0].km, null);
});

test('candidateDishes follows the order of visiblePlaces and carries km', () => {
  const state = doc(
    place({ id: 'f', location: far, dishes: [dish({ id: 'f1' })] }),
    place({ id: 'n', location: near, dishes: [dish({ id: 'n1' })] }),
  );
  const rows = candidateDishes(state, DEFAULT_FILTERS, { position: here });
  assert.deepEqual(rows.map((row) => row.dish.id), ['n1', 'f1']);
  assert.ok(rows[0].km < rows[1].km);
});

test('maxPrice drops the dishes that cost more or have no price', () => {
  const state = doc(place({ dishes: [
    dish({ id: 'cheap', price: 500 }), dish({ id: 'edge', price: 1000 }),
    dish({ id: 'dear', price: 1001 }), dish({ id: 'none', price: null }),
  ] }));
  const filters = { ...DEFAULT_FILTERS, maxPrice: 1000 };
  assert.deepEqual(candidateDishes(state, filters, {}).map((row) => row.dish.id), ['cheap', 'edge']);
  assert.equal(candidateDishes(state, DEFAULT_FILTERS, {}).length, 4);
});

test('normalizeFilters turns junk into the defaults', () => {
  assert.deepEqual(normalizeFilters({ tiers: [5, 0], km: 3, cuisines: ['nope'], maxPrice: -1 }), DEFAULT_FILTERS);
  assert.deepEqual(normalizeFilters(null), DEFAULT_FILTERS);
  assert.deepEqual(normalizeFilters('x'), DEFAULT_FILTERS);
});

test('normalizeFilters keeps good values and sorts tiers', () => {
  assert.deepEqual(
    normalizeFilters({ tiers: [3, 2], km: 5, favorites: true, cuisines: ['pizza', 'nope'], maxPrice: 1500 }),
    { tiers: [2, 3], km: 5, favorites: true, cuisines: ['pizza'], maxPrice: 1500 },
  );
  assert.equal(normalizeFilters({ favorites: 'yes' }).favorites, false);
  assert.equal(normalizeFilters({ maxPrice: 1.5 }).maxPrice, null);
  assert.deepEqual(normalizeFilters({ tiers: [2] }).tiers, [1, 4]);
});

test('distanceChip is off with no km and no read (LOC-9)', () => {
  assert.deepEqual(distanceChip({ km: null, fresh: false, reading: null }), { key: 'filter.distance', params: {}, pressed: false, state: null });
});

test('distanceChip is pressed while a km filters with a fresh fix', () => {
  assert.deepEqual(distanceChip({ km: 2, fresh: true, reading: null }), { key: 'filter.within', params: { km: 2 }, pressed: true, state: null });
});

test('distanceChip waits while a saved km has no fresh fix', () => {
  assert.deepEqual(distanceChip({ km: 2, fresh: false, reading: null }), { key: 'filter.waiting', params: { km: 2 }, pressed: false, state: 'waiting' });
});

test('distanceChip shows the read in progress', () => {
  assert.deepEqual(distanceChip({ km: 2, fresh: true, reading: 'reading' }), { key: 'filter.locating', params: {}, pressed: false, state: 'waiting' });
});

test('distanceChip shows No position after a failed read when nothing filters', () => {
  const off = { key: 'filter.noPosition', params: {}, pressed: false, state: 'error' };
  assert.deepEqual(distanceChip({ km: null, fresh: true, reading: 'error' }), off);
  assert.deepEqual(distanceChip({ km: 2, fresh: false, reading: 'error' }), off);
});

test('distanceChip stays pressed with the error mark when the old km still filters', () => {
  assert.deepEqual(distanceChip({ km: 2, fresh: true, reading: 'error' }), { key: 'filter.within', params: { km: 2 }, pressed: true, state: 'error' });
});
