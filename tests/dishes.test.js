import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PRICE, parsePrice, addDish, editDish, deleteDish, sortDishes } from '#dishes';
import { emptyPlaces, addPlace } from '#places';
import es from '#locales/es';
import en from '#locales/en';

const NOW = new Date('2026-11-09T12:00:00Z');
const base = () => addPlace(addPlace(emptyPlaces(), { name: 'A' }, 'p1', NOW).state, { name: 'B' }, 'p2', NOW).state;
const dishOf = (state, placeId) => state.places.find((place) => place.id === placeId).dishes;
const withDish = (fields = { name: 'Tacos' }) => addDish(base(), 'p1', fields, 'd1').state;

test('parsePrice reads Spanish and English decimals', () => {
  assert.deepEqual(parsePrice('14,50'), { cents: 1450 });
  assert.deepEqual(parsePrice('14.5'), { cents: 1450 });
  assert.deepEqual(parsePrice('14'), { cents: 1400 });
  assert.deepEqual(parsePrice(' 9,9 €'), { cents: 990 });
  assert.deepEqual(parsePrice('0'), { cents: 0 });
  assert.deepEqual(parsePrice(''), { cents: null });
  assert.deepEqual(parsePrice('  '), { cents: null });
  assert.deepEqual(parsePrice(null), { cents: null });
});

test('parsePrice has no float drift', () => {
  assert.deepEqual(parsePrice('0,29'), { cents: 29 });
  assert.deepEqual(parsePrice('1.15'), { cents: 115 });
  assert.deepEqual(parsePrice('999,99'), { cents: MAX_PRICE });
});

test('parsePrice rejects -3, abc, 1,234 and over MAX_PRICE with error.priceInvalid', () => {
  for (const text of ['-3', 'abc', '1,234', '1.2.3', '1000', '999,991', '14,', ',5', '1e3']) {
    assert.deepEqual(parsePrice(text), { error: { key: 'error.priceInvalid' } }, text);
  }
});

test('addDish appends a dish to its place only, and the input is unchanged', () => {
  const state = base();
  const snapshot = structuredClone(state);
  const first = addDish(state, 'p1', { name: ' Tacos ', price: 1450, star: true, rating: 4, note: ' good ' }, 'd1');
  assert.equal(first.error, undefined);
  assert.deepEqual(dishOf(first.state, 'p1'), [
    { id: 'd1', name: 'Tacos', price: 1450, star: true, rating: 4, note: 'good' },
  ]);
  assert.deepEqual(dishOf(first.state, 'p2'), []);
  assert.deepEqual(state, snapshot);
  const second = addDish(first.state, 'p1', { name: 'Flan' }, 'd2');
  assert.deepEqual(dishOf(second.state, 'p1').map((dish) => dish.id), ['d1', 'd2']);
  assert.deepEqual(dishOf(second.state, 'p1')[1], { id: 'd2', name: 'Flan', price: null, star: false, rating: null, note: '' });
});

test('a dish without an id gets a fresh one', () => {
  assert.ok(dishOf(addDish(base(), 'p1', { name: 'A' }).state, 'p1')[0].id.length > 0);
});

test('a blank dish name is error.dishNameRequired; over 80 is error.dishNameTooLong { max: 80 }', () => {
  const state = base();
  for (const name of ['', '  ', null, undefined, 5]) {
    assert.deepEqual(addDish(state, 'p1', { name }, 'x'), { state, error: { key: 'error.dishNameRequired' } });
  }
  assert.deepEqual(addDish(state, 'p1', { name: 'a'.repeat(81) }, 'x'), {
    state, error: { key: 'error.dishNameTooLong', params: { max: 80 } },
  });
  assert.equal(addDish(state, 'p1', { name: 'a'.repeat(80) }, 'x').error, undefined);
});

test('a dish note over 280 is error.noteTooLong', () => {
  const state = base();
  assert.deepEqual(addDish(state, 'p1', { name: 'A', note: 'a'.repeat(281) }, 'x'), {
    state, error: { key: 'error.noteTooLong', params: { max: 280 } },
  });
  assert.equal(addDish(state, 'p1', { name: 'A', note: 'a'.repeat(280) }, 'x').error, undefined);
});

test('a price that is not an int 0..MAX_PRICE is error.priceInvalid', () => {
  const state = base();
  for (const price of [-1, 1.5, MAX_PRICE + 1, '5', NaN, Infinity, true]) {
    assert.deepEqual(addDish(state, 'p1', { name: 'A', price }, 'x'), { state, error: { key: 'error.priceInvalid' } }, String(price));
  }
  for (const price of [0, MAX_PRICE, null, undefined]) assert.equal(addDish(state, 'p1', { name: 'A', price }, 'x').error, undefined);
});

test('a bad rating becomes null; star is true only for true', () => {
  for (const rating of [0, 6, 2.5, '3', null]) {
    assert.equal(dishOf(addDish(base(), 'p1', { name: 'A', rating }, 'x').state, 'p1')[0].rating, null, String(rating));
  }
  assert.equal(dishOf(addDish(base(), 'p1', { name: 'A', star: 'yes' }, 'x').state, 'p1')[0].star, false);
});

test('editDish and deleteDish change one dish', () => {
  const state = addDish(withDish(), 'p1', { name: 'Flan', price: 500 }, 'd2').state;
  const edited = editDish(state, 'p1', 'd1', { name: 'Tacos al pastor', star: true });
  assert.equal(edited.error, undefined);
  assert.deepEqual(dishOf(edited.state, 'p1')[0], { id: 'd1', name: 'Tacos al pastor', price: null, star: true, rating: null, note: '' });
  assert.deepEqual(dishOf(edited.state, 'p1')[1], dishOf(state, 'p1')[1]);
  assert.equal(dishOf(state, 'p1')[0].name, 'Tacos');
  const cleared = editDish(edited.state, 'p1', 'd1', { price: null, rating: 3 });
  assert.equal(dishOf(cleared.state, 'p1')[0].name, 'Tacos al pastor');
  assert.equal(dishOf(cleared.state, 'p1')[0].rating, 3);
  const removed = deleteDish(state, 'p1', 'd1');
  assert.deepEqual(dishOf(removed.state, 'p1').map((dish) => dish.id), ['d2']);
  assert.equal(dishOf(state, 'p1').length, 2);
});

test('editDish checks the fields like addDish', () => {
  const state = withDish();
  assert.deepEqual(editDish(state, 'p1', 'd1', { name: ' ' }), { state, error: { key: 'error.dishNameRequired' } });
  assert.deepEqual(editDish(state, 'p1', 'd1', { price: -5 }), { state, error: { key: 'error.priceInvalid' } });
});

test('an unknown place is error.placeMissing, an unknown dish error.dishMissing', () => {
  const state = withDish();
  const place = { state, error: { key: 'error.placeMissing' } };
  const dish = { state, error: { key: 'error.dishMissing' } };
  assert.deepEqual(addDish(state, 'zz', { name: 'A' }, 'x'), place);
  assert.deepEqual(editDish(state, 'zz', 'd1', { name: 'A' }), place);
  assert.deepEqual(deleteDish(state, 'zz', 'd1'), place);
  assert.deepEqual(editDish(state, 'p1', 'zz', { name: 'A' }), dish);
  assert.deepEqual(deleteDish(state, 'p1', 'zz'), dish);
  assert.deepEqual(deleteDish(state, 'p2', 'd1'), dish);
});

test('sortDishes puts star dishes first and keeps the order inside each group', () => {
  const dish = (id, star) => ({ id, name: id, price: null, star, rating: null, note: '' });
  const dishes = [dish('a', false), dish('b', true), dish('c', false), dish('d', true)];
  assert.deepEqual(sortDishes(dishes).map((item) => item.id), ['b', 'd', 'a', 'c']);
  assert.deepEqual(dishes.map((item) => item.id), ['a', 'b', 'c', 'd']);
  assert.deepEqual(sortDishes([]), []);
});

test('the dish error keys exist in both catalogs', () => {
  for (const key of ['error.dishMissing', 'error.priceInvalid', 'error.dishNameRequired', 'error.dishNameTooLong']) {
    assert.ok(es[key] && en[key], key);
  }
  assert.ok(es['error.dishNameTooLong'].includes('{max}') && en['error.dishNameTooLong'].includes('{max}'));
});
