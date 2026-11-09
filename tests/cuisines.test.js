import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CUISINES, cuisineOf } from '#cuisines';
import { CATALOGS } from '#i18n';

test('the cuisines have unique ids, 15 entries and other last', () => {
  assert.equal(CUISINES.length, 15);
  assert.equal(new Set(CUISINES.map(({ id }) => id)).size, CUISINES.length);
  assert.equal(CUISINES.at(-1).id, 'other');
  assert.deepEqual(CUISINES.slice(0, 3).map(({ id, emoji }) => `${id} ${emoji}`), ['spanish 🥘', 'tapas 🍤', 'mexican 🌮']);
});

test('cuisineOf returns the entry, or other for an unknown id', () => {
  assert.deepEqual(cuisineOf('pizza'), { id: 'pizza', emoji: '🍕' });
  assert.equal(cuisineOf('nope').id, 'other');
  assert.equal(cuisineOf(undefined).id, 'other');
});

test('each cuisine has its text in both catalogs', () => {
  for (const lang of ['es', 'en']) {
    for (const { id } of CUISINES) assert.equal(typeof CATALOGS[lang][`cuisine.${id}`], 'string', `${lang} ${id}`);
  }
});
