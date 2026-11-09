import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APP_SLUG } from '#config';
import {
  PLACES_KEY, LIMITS, emptyPlaces, normalizePlaces, findPlace, addPlace, editPlace, deletePlace, toggleFavorite,
} from '#places';

const NOW = new Date('2026-11-09T12:00:00Z');
const place = (id, extra = {}) => ({
  id, name: `Place ${id}`, cuisine: 'other', area: '', tier: 2, location: null, favorite: false, rating: null,
  note: '', dishes: [], created: '2026-11-09T12:00:00.000Z', ...extra,
});
const build = (...places) => ({ version: 1, places });
const add = (fields) => addPlace(emptyPlaces(), fields, 'p1', NOW);

test('the key of the places has the slug', () => assert.equal(PLACES_KEY, `${APP_SLUG}.places`));

test('addPlace puts a place first with defaults, and the input is unchanged', () => {
  const state = emptyPlaces();
  const { state: next, error } = addPlace(state, { name: '  Taquería del Sol ', cuisine: 'mexican' }, 'p1', NOW);
  assert.equal(error, undefined);
  assert.deepEqual(next.places[0], {
    id: 'p1', name: 'Taquería del Sol', cuisine: 'mexican', area: '', tier: 2, location: null, favorite: false,
    rating: null, note: '', dishes: [], created: '2026-11-09T12:00:00.000Z',
  });
  assert.deepEqual(state, emptyPlaces());
  assert.equal(addPlace(next, { name: 'B' }, 'p2', NOW).state.places[0].id, 'p2');
});

test('a place without an id gets a fresh one', () => {
  const { state } = addPlace(emptyPlaces(), { name: 'A' });
  assert.ok(state.places[0].id.length > 0);
  assert.equal(typeof state.places[0].created, 'string');
});

test('a blank name is error.nameRequired; over 80 chars is error.nameTooLong', () => {
  const state = emptyPlaces();
  for (const name of ['', '  ', null, undefined]) {
    assert.deepEqual(addPlace(state, { name }, 'x', NOW), { state, error: { key: 'error.nameRequired' } });
  }
  assert.deepEqual(addPlace(state, { name: 'a'.repeat(81) }, 'x', NOW), {
    state, error: { key: 'error.nameTooLong', params: { max: 80 } },
  });
  assert.equal(add({ name: 'a'.repeat(LIMITS.name) }).error, undefined);
});

test('an area over 60 is error.areaTooLong; a note over 280 is error.noteTooLong', () => {
  const state = emptyPlaces();
  assert.deepEqual(addPlace(state, { name: 'A', area: 'a'.repeat(61) }, 'x', NOW), {
    state, error: { key: 'error.areaTooLong', params: { max: 60 } },
  });
  assert.deepEqual(addPlace(state, { name: 'A', note: 'a'.repeat(281) }, 'x', NOW), {
    state, error: { key: 'error.noteTooLong', params: { max: 280 } },
  });
  assert.equal(add({ name: 'A', area: 'a'.repeat(60), note: 'a'.repeat(280) }).error, undefined);
});

test('an unknown cuisine becomes other; a bad tier becomes 2; a bad rating becomes null', () => {
  assert.equal(add({ name: 'A', cuisine: 'nope' }).state.places[0].cuisine, 'other');
  for (const tier of [0, 5, 2.5, '3', null]) assert.equal(add({ name: 'A', tier }).state.places[0].tier, 2, String(tier));
  for (const tier of [1, 4]) assert.equal(add({ name: 'A', tier }).state.places[0].tier, tier);
  for (const rating of [0, 6, 3.5, '4', undefined]) assert.equal(add({ name: 'A', rating }).state.places[0].rating, null, String(rating));
  assert.equal(add({ name: 'A', rating: 5 }).state.places[0].rating, 5);
});

test('an invalid location becomes null; a valid one is kept', () => {
  for (const location of [{ lat: 91, lng: 0 }, { lat: 0, lng: 181 }, { lat: NaN, lng: 0 }, { lat: '1', lng: 2 }, 'x', {}]) {
    assert.equal(add({ name: 'A', location }).state.places[0].location, null, JSON.stringify(location));
  }
  assert.deepEqual(add({ name: 'A', location: { lat: 40.4, lng: -3.7, extra: 1 } }).state.places[0].location, { lat: 40.4, lng: -3.7 });
});

test('editPlace keeps id, favorite, dishes and created', () => {
  const dish = { id: 'd1', name: 'Taco', price: 350, star: false, rating: null, note: '' };
  const state = build(place('p1', { favorite: true, dishes: [dish], name: 'Old', area: 'Centro' }));
  const { state: next, error } = editPlace(state, 'p1', { name: ' New ', cuisine: 'pizza', tier: 3, favorite: false, dishes: [], id: 'zz' });
  assert.equal(error, undefined);
  assert.deepEqual(next.places[0], place('p1', { name: 'New', cuisine: 'pizza', tier: 3, area: 'Centro', favorite: true, dishes: [dish] }));
  assert.equal(state.places[0].name, 'Old');
});

test('editPlace checks the fields like addPlace', () => {
  const state = build(place('p1'));
  assert.deepEqual(editPlace(state, 'p1', { name: ' ' }), { state, error: { key: 'error.nameRequired' } });
  assert.equal(editPlace(state, 'p1', { location: { lat: 1, lng: 2 } }).state.places[0].location.lat, 1);
});

test('deletePlace removes one place; toggleFavorite flips favorite', () => {
  const state = build(place('a'), place('b'));
  assert.deepEqual(deletePlace(state, 'a').state.places.map((p) => p.id), ['b']);
  const on = toggleFavorite(state, 'b').state;
  assert.equal(on.places[1].favorite, true);
  assert.equal(toggleFavorite(on, 'b').state.places[1].favorite, false);
  assert.equal(state.places[1].favorite, false);
});

test('an unknown id is error.placeMissing and the state is the same object', () => {
  const state = build(place('a'));
  const missing = { state, error: { key: 'error.placeMissing' } };
  assert.deepEqual(editPlace(state, 'zz', { name: 'x' }), missing);
  assert.equal(editPlace(state, 'zz', { name: 'x' }).state, state);
  assert.equal(deletePlace(state, 'zz').state, state);
  assert.equal(toggleFavorite(state, 'zz').state, state);
  assert.equal(deletePlace(state, 'zz').error.key, 'error.placeMissing');
});

test('findPlace returns the place or null', () => {
  assert.equal(findPlace(build(place('a')), 'a').id, 'a');
  assert.equal(findPlace(build(place('a')), 'zz'), null);
});

test('normalizePlaces keeps a valid doc, drops unknown fields and cleans the values', () => {
  const dish = { id: 'd1', name: ' Taco ', price: 350, star: true, rating: 4, note: ' n ', more: 1 };
  const doc = normalizePlaces(build({ ...place('a', { name: ' A ', cuisine: 'nope', tier: 9, rating: 8, location: { lat: 99, lng: 0 }, dishes: [dish] }), more: 1 }));
  assert.deepEqual(doc, build(place('a', {
    name: 'A', dishes: [{ id: 'd1', name: 'Taco', price: 350, star: true, rating: 4, note: 'n' }],
  })));
});

test('normalizePlaces refuses a bad doc', () => {
  const dish = (id, extra = {}) => ({ id, name: 'D', price: null, star: false, rating: null, note: '', ...extra });
  const bad = [
    null, 42, {}, { version: 2, places: [] }, { version: 1 }, { version: 1, places: {} },
    build(place('a', { name: ' ' })),
    build(place('', {})),
    build(place('a'), place('a')),
    build(place('a', { dishes: [dish('d'), dish('d')] })),
    build(place('a', { dishes: [dish('d', { name: ' ' })] })),
    build(place('a', { dishes: [dish('d', { price: -1 })] })),
    build(place('a', { dishes: [dish('d', { price: 1.5 })] })),
    build(place('a', { dishes: 'x' })),
    build(null),
  ];
  for (const data of bad) assert.equal(normalizePlaces(data), null, JSON.stringify(data));
});

test('the same dish id may be in two places', () => {
  const dish = { id: 'd', name: 'D', price: null, star: false, rating: null, note: '' };
  assert.notEqual(normalizePlaces(build(place('a', { dishes: [dish] }), place('b', { dishes: [dish] }))), null);
});
