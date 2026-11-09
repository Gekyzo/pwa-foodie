import { test } from 'node:test';
import assert from 'node:assert/strict';
import es from '#locales/es';
import en from '#locales/en';
import {
  FIX_MS, isLocation, parseLocation, distanceKm, routeUrl, freshFix, distanceLabel,
} from '#geo';

const sol = { lat: 40.4168, lng: -3.7038 };
const retiro = { lat: 40.4153, lng: -3.6845 };

test('isLocation accepts finite lat and lng in range only', () => {
  assert.equal(isLocation({ lat: 0, lng: 0 }), true);
  assert.equal(isLocation({ lat: 90, lng: -180 }), true);
  for (const bad of [null, undefined, 'x', {}, { lat: 91, lng: 0 }, { lat: 0, lng: 181 }, { lat: NaN, lng: 0 },
    { lat: 0, lng: Infinity }, { lat: '1', lng: 2 }]) assert.equal(isLocation(bad), false);
});

test('parseLocation reads the forms of a Google Maps URL and a bare pair', () => {
  const at = { location: sol };
  for (const text of [
    'https://www.google.com/maps/place/Sol/@40.4168,-3.7038,17z/data=x',
    'https://www.google.com/maps/place/Sol/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d40.4168!4d-3.7038',
    'https://maps.google.com/?q=40.4168,-3.7038',
    'https://www.google.com/maps/search/?api=1&query=40.4168%2C-3.7038',
    'https://maps.google.com/?ll=40.4168,-3.7038',
    '40.4168, -3.7038',
    '  40.4168,-3.7038  ',
  ]) assert.deepEqual(parseLocation(text), at, text);
});

test('a !3d/!4d pair wins over the @ viewport centre when both are present', () => {
  const url = 'https://www.google.com/maps/place/X/@10.5,20.5,15z/data=!8m2!3d40.4168!4d-3.7038';
  assert.deepEqual(parseLocation(url), { location: sol });
});

test('a maps.app.goo.gl or goo.gl/maps link is error.shortLink', () => {
  for (const text of ['https://maps.app.goo.gl/abc123', 'https://goo.gl/maps/xyz', 'maps.app.goo.gl/abc'])
    assert.deepEqual(parseLocation(text), { error: { key: 'error.shortLink' } }, text);
});

test('junk, an empty text and an out-of-range pair are error.locationInvalid', () => {
  const invalid = { error: { key: 'error.locationInvalid' } };
  for (const text of ['', '   ', 'hello', '91, 0', '0, 181', null, undefined, 42,
    'https://example.com/a/40.4168,-3.7038/b', 'https://www.google.com/maps/place/Sol'])
    assert.deepEqual(parseLocation(text), invalid, String(text));
});

test('a malformed percent escape does not throw', () => {
  assert.deepEqual(parseLocation('https://maps.google.com/?q=40.4168,-3.7038&x=%E0%A4%A'), { location: sol });
});

test('distanceKm from Puerta del Sol to Retiro is about 1.64 km', () => {
  assert.ok(Math.abs(distanceKm(sol, retiro) - 1.64) < 0.02);
  assert.equal(distanceKm(sol, sol), 0);
});

test('a route or a search with text is not a place: error.locationInvalid', () => {
  for (const text of [
    'https://www.google.com/maps/dir/40.1,-3.1/41.2,-2.2/@40.5,-3.0,9z',
    'https://www.google.com/maps/search/Taquer%C3%ADa+del+Sol/@40.41,-3.70,14z',
  ])
    assert.deepEqual(parseLocation(text), { error: { key: 'error.locationInvalid' } });
});

test('a search link with a coordinate query and a bare /maps/@ link still read', () => {
  assert.deepEqual(parseLocation('https://www.google.com/maps/search/?api=1&query=40.4168,-3.7038'), { location: sol });
  assert.deepEqual(parseLocation('https://www.google.com/maps/@40.4168,-3.7038,17z'), { location: sol });
});

test('a q pair needs decimals and must end the value', () => {
  assert.deepEqual(parseLocation('https://www.google.com/maps?q=12,5+Calle+X'), { error: { key: 'error.locationInvalid' } });
  assert.deepEqual(parseLocation('https://www.google.com/maps?q=12.1,5.2+Calle+X'), { error: { key: 'error.locationInvalid' } });
  assert.deepEqual(parseLocation('https://maps.google.com/?q=40.4168,-3.7038&z=15'), { location: sol });
  assert.deepEqual(parseLocation('https://maps.google.com/?q=40.4168,-3.7038#x'), { location: sol });
});

test('distanceLabel: 0.98 km rounds to 1.0 km, not 1000 m', () => {
  assert.deepEqual(distanceLabel(0.98), { key: 'distance.km', params: { km: 1 } });
  assert.deepEqual(distanceLabel(0.97), { key: 'distance.m', params: { m: 950 } });
});

test('distanceLabel: metres rounded to 50, minimum 50, else km with one decimal', () => {
  assert.deepEqual(distanceLabel(0.43), { key: 'distance.m', params: { m: 450 } });
  assert.deepEqual(distanceLabel(0.01), { key: 'distance.m', params: { m: 50 } });
  assert.deepEqual(distanceLabel(1.26), { key: 'distance.km', params: { km: 1.3 } });
  assert.deepEqual(distanceLabel(1), { key: 'distance.km', params: { km: 1 } });
});

test('freshFix is true at 599999 ms and false at 600000 ms', () => {
  const fix = { location: sol, at: 1000 };
  assert.equal(FIX_MS, 600000);
  assert.equal(freshFix(fix, 1000 + 599999), true);
  assert.equal(freshFix(fix, 1000 + 600000), false);
  assert.equal(freshFix(null, 1000), false);
});

test('routeUrl builds the directions URL', () => {
  assert.equal(routeUrl(sol), 'https://www.google.com/maps/dir/?api=1&destination=40.4168,-3.7038');
});

test('the catalogs have the geo keys with the same placeholders', () => {
  for (const [key, ph] of [['error.shortLink', null], ['error.locationInvalid', null], ['distance.m', '{m}'],
    ['distance.km', '{km}']]) {
    for (const catalog of [es, en]) {
      assert.equal(typeof catalog[key], 'string', key);
      if (ph) assert.ok(catalog[key].includes(ph), key);
    }
  }
});
