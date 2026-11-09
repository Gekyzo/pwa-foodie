import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_SEGMENTS, SPIN_MS, MODES, candidates, drawWheel, landingAngle } from '#roulette';
import { DEFAULT_FILTERS } from '#filters';

const seq = (...values) => { let i = 0; return () => values[i++ % values.length]; };
const items = (count) => Array.from({ length: count }, (_, i) => ({ id: `i${i}`, label: `Item ${i}` }));

let counter = 0;
const place = (fields = {}) => {
  counter += 1;
  return {
    id: `p${counter}`, name: `Place ${counter}`, cuisine: 'pizza', area: '', tier: 2, location: null,
    favorite: false, rating: null, note: '', dishes: [], created: '2026-01-01T00:00:00.000Z', ...fields,
  };
};
const dish = (fields = {}) => {
  counter += 1;
  return { id: `d${counter}`, name: `Dish ${counter}`, price: null, star: false, rating: null, note: '', ...fields };
};

test('the constants have the planned values', () => {
  assert.equal(MAX_SEGMENTS, 12);
  assert.equal(SPIN_MS, 4000);
  assert.deepEqual(MODES, ['places', 'dishes']);
});

test('no candidates gives no segments and no winner', () =>
  assert.deepEqual(drawWheel([]), { segments: [], total: 0, winner: null }));

test('one candidate wins with no draw', () => {
  const one = items(1);
  const wheel = drawWheel(one, { random: () => { throw new Error('no draw'); } });
  assert.deepEqual(wheel, { segments: one, total: 1, winner: 0 });
});

test('the last winner is left out from 3 candidates, not from 2', () => {
  const three = drawWheel(items(3), { exclude: 'i1', random: seq(0) });
  assert.deepEqual(three.segments.map((item) => item.id), ['i0', 'i2']);
  assert.equal(three.total, 2);
  const two = drawWheel(items(2), { exclude: 'i1', random: seq(0) });
  assert.equal(two.segments.length, 2);
  assert.equal(two.total, 2);
});

test('13 candidates give 12 segments, total 13, all distinct, and the input is unchanged', () => {
  const input = items(13);
  const copy = input.map((item) => ({ ...item }));
  const wheel = drawWheel(input, { random: seq(0.1, 0.9, 0.5, 0.3, 0.7) });
  assert.equal(wheel.segments.length, 12);
  assert.equal(wheel.total, 13);
  assert.equal(new Set(wheel.segments.map((item) => item.id)).size, 12);
  assert.deepEqual(input, copy);
});

test('the winner index comes from random', () => {
  assert.equal(drawWheel(items(4), { random: seq(0.6) }).winner, 2);
});

test('landingAngle lands the pointer inside the winner segment for every jitter', () => {
  for (const r of [0, 0.5, 0.999]) for (const count of [2, 5, 12]) for (let i = 0; i < count; i++) {
    const a = landingAngle(i, count, { random: () => r });
    const under = ((360 - (a % 360)) % 360) / (360 / count);
    assert.equal(Math.floor(under), i);
  }
});

test('landingAngle adds the full turns', () => {
  const a = landingAngle(0, 4, { turns: 3, random: () => 0.5 });
  assert.equal(a, 3 * 360 + 360 - 45);
});

test('candidates in places mode list the visible places and ignore the price cap', () => {
  const a = place({ name: 'Napoli', cuisine: 'pizza' });
  const b = place({ name: 'Tokyo', cuisine: 'japanese', favorite: true });
  const state = { version: 1, places: [a, b] };
  const filters = { ...DEFAULT_FILTERS, favorites: true, maxPrice: 100 };
  assert.deepEqual(candidates(state, filters, 'places'), [
    { id: b.id, kind: 'place', placeId: b.id, label: 'Tokyo', emoji: '🍣' },
  ]);
});

test('an unknown mode is places', () => {
  const a = place();
  const state = { version: 1, places: [a] };
  assert.equal(candidates(state, DEFAULT_FILTERS, 'x')[0].kind, 'place');
});

test('candidates in dishes mode use the place emoji and label "dish · place"', () => {
  const d = dish({ name: 'Margarita', price: 900 });
  const p = place({ name: 'Napoli', cuisine: 'pizza', dishes: [d, dish({ name: 'Dear', price: 5000 })] });
  const state = { version: 1, places: [p] };
  const rows = candidates(state, { ...DEFAULT_FILTERS, maxPrice: 1000 }, 'dishes');
  assert.deepEqual(rows, [{ id: d.id, kind: 'dish', placeId: p.id, label: 'Margarita · Napoli', emoji: '🍕' }]);
});

test('candidates is empty with no places', () => {
  assert.deepEqual(candidates({ version: 1, places: [] }, DEFAULT_FILTERS, 'dishes'), []);
});
