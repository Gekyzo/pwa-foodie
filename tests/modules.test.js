import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, switchModule, visibleSections } from '#modules';

test('MODULES is roulette', () => {
  assert.deepEqual(MODULES, ['roulette']);
});

test('visibleSections with no module off is the full navigation', () => {
  assert.deepEqual(visibleSections([]), ['explore', 'roulette', 'settings']);
});

test('visibleSections without roulette keeps explore and settings', () => {
  assert.deepEqual(visibleSections(['roulette']), ['explore', 'settings']);
});

test('visibleSections ignores an unknown id', () => {
  assert.deepEqual(visibleSections(['shops']), ['explore', 'roulette', 'settings']);
});

test('switchModule turns a module off and on', () => {
  assert.deepEqual(switchModule([], 'roulette', false), ['roulette']);
  assert.deepEqual(switchModule(['roulette'], 'roulette', true), []);
  assert.deepEqual(switchModule([], 'roulette', true), []);
});

test('switchModule ignores an unknown id and does not change its input', () => {
  const off = ['roulette'];
  assert.deepEqual(switchModule(off, 'shops', false), ['roulette']);
  assert.deepEqual(off, ['roulette']);
});
