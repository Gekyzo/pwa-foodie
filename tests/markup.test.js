import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATALOGS } from '#i18n';
import { PAGES } from '#onboarding';
import { SECTIONS } from '#sections';
import { MODULES } from '#modules';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const body = html.slice(html.indexOf('<body'), html.indexOf('<script type="importmap">'));

const textKeys = [...body.matchAll(/data-i18n="([^"]+)"/g)].map(([, key]) => key);
const attrKeys = [...body.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap(([, pairs]) =>
  pairs.split(',').map((pair) => pair.split(':')[1]));

test('the page has translated text and translated attributes', () => {
  assert.ok(textKeys.length > 0);
  assert.ok(attrKeys.length > 0);
});

test('each key of the page is in the Spanish catalog', () => {
  for (const key of [...textKeys, ...attrKeys]) assert.ok(Object.hasOwn(CATALOGS.es, key), key);
});

test('an element with a text key is empty in the markup', () => {
  for (const [, key, text] of body.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)</g)) assert.equal(text.trim(), '', key);
});

test('the markup has no text of its own', () => {
  const visible = body
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<span class="chevron"[^>]*>[^<]*<\/span>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[+\s]/g, '');
  assert.equal(visible, '');
  assert.doesNotMatch(body, /\s(aria-label|placeholder|title)="/);
});

const placeSheet = () => body.match(/<div id="place-sheet" class="sheet-layer"[\s\S]*?<\/form>\s*<\/div>/)?.[0] ?? '';

test('the place sheet has a veil, a dialog and the fields with their maximum lengths', () => {
  const layer = placeSheet();
  assert.match(layer, /<div id="place-veil" class="sheet-veil">/);
  assert.match(layer, /<form id="place-form" class="sheet" role="dialog" aria-modal="true" aria-labelledby="place-sheet-title"/);
  assert.match(layer, /<input id="place-name" class="input field-input" type="text" maxlength="80" required/);
  assert.match(layer, /<select id="place-cuisine" class="select field-input"/);
  assert.match(layer, /<input id="place-area" class="input field-input" type="text" maxlength="60"/);
  assert.match(layer, /<textarea id="place-note" class="input field-input" maxlength="280"/);
});

test('the place sheet has the four tiers and the five stars of the rating', () => {
  const layer = placeSheet();
  const tiers = [...layer.matchAll(/<button class="segment" type="button" data-tier="(\d)" data-i18n="tier\.(\d)"><\/button>/g)];
  assert.deepEqual(tiers.map(([, tier, key]) => [tier, key]), [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]);
  const stars = [...layer.matchAll(/<button class="button icon rating-star" type="button" data-rating="(\d)"/g)].map(([, n]) => n);
  assert.deepEqual(stars, ['1', '2', '3', '4', '5']);
});

test('the place sheet has a head with its title and Close, a body, and Save in its foot', () => {
  const layer = placeSheet();
  assert.match(layer, /<header class="sheet-head"><h2 id="place-sheet-title" class="sheet-title main"><\/h2><button id="place-close" class="button tonal" type="button" data-i18n="place.close"><\/button><\/header>\s*<div class="sheet-body">/);
  assert.match(layer, /<footer class="sheet-foot"><button class="button primary wide" type="submit" data-i18n="place.save"><\/button><\/footer>\s*<\/form>/);
});

test('the place sheet has the location field: the pair, Use my position, Clear, and a link with Apply (PLC-28)', () => {
  const layer = placeSheet();
  const [group = ''] = layer.match(/<fieldset class="place-group place-location">[\s\S]*?<\/fieldset>/) ?? [];
  assert.match(group, /<legend class="field-label" data-i18n="location.title"><\/legend>/);
  assert.match(group, /<p id="place-location" class="place-location-pair"><\/p>/);
  assert.match(group, /<div class="cluster"><button id="location-here" class="button tonal" type="button">[\s\S]*?<span data-i18n="location.here"><\/span><\/button><button id="location-clear" class="button outline" type="button" data-i18n="location.clear"><\/button><\/div>/);
  assert.match(group, /<div class="input-row"><input id="location-link" class="input" type="text" inputmode="url" data-i18n-attr="aria-label:location.paste,placeholder:location.paste"><button id="location-apply" class="button primary" type="button" data-i18n="location.apply"><\/button><\/div>/);
  // The location comes before the note.
  assert.ok(layer.indexOf('place-location') < layer.indexOf('place-note'));
});

const dishSheet = () => body.match(/<div id="dish-sheet" class="sheet-layer"[\s\S]*?<\/form>\s*<\/div>/)?.[0] ?? '';

test('the dish sheet has a veil, a dialog and the fields with their maximum lengths (PLC-30)', () => {
  const layer = dishSheet();
  assert.match(layer, /<div id="dish-veil" class="sheet-veil">/);
  assert.match(layer, /<form id="dish-form" class="sheet" role="dialog" aria-modal="true" aria-labelledby="dish-sheet-title"/);
  assert.match(layer, /<input id="dish-name" class="input field-input" type="text" maxlength="80" required/);
  assert.match(layer, /<input id="dish-price" class="input field-input" type="text" inputmode="decimal"/);
  assert.match(layer, /<label class="switch"><span data-i18n="dish.star"><\/span><input id="dish-star" class="switch-input" type="checkbox" role="switch"><\/label>/);
  assert.match(layer, /<textarea id="dish-note" class="input field-input" maxlength="280"/);
  const stars = [...layer.matchAll(/<button class="button icon rating-star" type="button" data-rating="(\d)"/g)].map(([, n]) => n);
  assert.deepEqual(stars, ['1', '2', '3', '4', '5']);
});

test('the dish sheet has a head with its title and Close, a body, and Delete and Save in its foot', () => {
  const layer = dishSheet();
  assert.match(layer, /<header class="sheet-head"><h2 id="dish-sheet-title" class="sheet-title main"><\/h2><button id="dish-close" class="button tonal" type="button" data-i18n="dish.close"><\/button><\/header>\s*<div class="sheet-body">/);
  assert.match(layer, /<footer class="sheet-foot"><button id="dish-delete" class="button outline danger" type="button" hidden>[\s\S]*?<span data-i18n="dish.delete"><\/span><\/button><button class="button primary wide" type="submit" data-i18n="dish.save"><\/button><\/footer>\s*<\/form>/);
});

test('the detail has Route, a link that opens in a new tab, and Add dish beside the dishes (PLC-29, PLC-30)', () => {
  const [view = ''] = body.match(/<div id="place-view" class="place-view" hidden>[\s\S]*?<\/article>/) ?? [];
  assert.match(view, /<a id="place-route" class="button tonal" target="_blank" rel="noopener" hidden>[\s\S]*?<span data-i18n="place.route"><\/span><\/a>/);
  assert.match(view, /<div class="place-dishes-head"><h3 class="place-dishes-title" data-i18n="place.dishes"><\/h3><button id="dish-add" class="button outline" type="button" data-i18n="dish.add"><\/button><\/div>/);
});

test('Explore is a pane: the search and the cards in the list, the place in the detail (LAY-3)', () => {
  const [section = ''] = body.match(/<section id="explore" class="pane">[\s\S]*?<\/section>/) ?? [];
  assert.match(section, /<div class="pane-list">[\s\S]*<input id="explore-query" class="input explore-search" type="search"/);
  assert.match(section, /<ul id="place-list" class="place-list"><\/ul>/);
  assert.match(section, /<div id="explore-empty" class="empty-state" hidden>[\s\S]*?<button id="explore-add" class="button primary" type="button" data-i18n="explore.add"><\/button>/);
  assert.match(section, /<article id="place-detail" class="pane-detail">\s*<button id="place-back" class="button quiet pane-back" type="button" data-i18n="place.back"><\/button>/);
});

test('Explore has the filter row and the "Can\'t decide?" card under the search (PLC-32, PLC-36)', () => {
  const [list = ''] = body.match(/<div class="pane-list">[\s\S]*?<ul id="place-list"/) ?? [];
  assert.match(list, /<div id="explore-filters" class="cluster scroll filter-bar" role="group" data-i18n-attr="aria-label:filter.label"><\/div>/);
  assert.match(list, /<div id="explore-decide" class="decide"[\s\S]*?<button id="explore-spin" class="button tonal" type="button">[\s\S]*?<span data-i18n="explore.decideSpin"><\/span><\/button>/);
  assert.ok(list.indexOf('explore-query') < list.indexOf('explore-filters'));
  assert.ok(list.indexOf('explore-filters') < list.indexOf('explore-decide'));
});

const filterSheet = () => body.match(/<div id="filter-sheet" class="sheet-layer"[\s\S]*?<\/section>\s*<\/div>/)?.[0] ?? '';

test('the filter sheet has a veil, a dialog with Done, the four parts and Clear filter in its foot (PLC-33)', () => {
  const layer = filterSheet();
  assert.match(layer, /<div id="filter-veil" class="sheet-veil">/);
  assert.match(layer, /<section id="filter-dialog" class="sheet" role="dialog" aria-modal="true" aria-labelledby="filter-sheet-title">/);
  assert.match(layer, /<header class="sheet-head"><h2 id="filter-sheet-title" class="sheet-title main"><\/h2><button id="filter-close" class="button tonal" type="button" data-i18n="filter.done"><\/button><\/header>/);
  for (const part of ['price', 'distance', 'cuisine']) assert.match(layer, new RegExp(`<div id="filter-${part}" class="filter-part[^"]*" hidden>`), part);
  assert.match(layer, /<form id="filter-max" class="filter-part" autocomplete="off" hidden>[\s\S]*?<input id="filter-max-input" class="input" type="text" inputmode="decimal"[\s\S]*?<button class="button primary" type="submit" data-i18n="filter.apply"><\/button>/);
  assert.match(layer, /<footer class="sheet-foot"><button id="filter-clear" class="button outline wide" type="button" data-i18n="filter.clear"><\/button><\/footer>/);
});

test('the price part of the filter sheet has From and To, four tiers each (PLC-34)', () => {
  const [part = ''] = filterSheet().match(/<div id="filter-price"[\s\S]*?<\/div>\s*<\/fieldset>\s*<\/div>/) ?? [];
  const ends = (name) => [...part.matchAll(new RegExp(`<button class="segment" type="button" data-${name}="(\\d)" data-i18n="tier\\.(\\d)"><\/button>`, 'g'))].map(([, tier, key]) => [tier, key]);
  const tiers = [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']];
  assert.deepEqual(ends('from'), tiers);
  assert.deepEqual(ends('to'), tiers);
});

const roulette = () => body.match(/<section id="roulette" class="roulette" hidden>[\s\S]*?<\/section>/)?.[0] ?? '';

test('the Roulette section has the Places and Dishes switch, then the filter row (RUL-10)', () => {
  const section = roulette();
  assert.match(section, /<div id="roulette-mode" class="segmented roulette-mode" role="group" data-i18n-attr="aria-label:roulette.mode"><button class="segment" type="button" data-mode="places" data-i18n="roulette.places"><\/button><button class="segment" type="button" data-mode="dishes" data-i18n="roulette.dishes"><\/button><\/div>/);
  assert.match(section, /<div id="roulette-filters" class="cluster scroll filter-bar" role="group" data-i18n-attr="aria-label:filter.label"><\/div>/);
  assert.ok(section.indexOf('roulette-mode') < section.indexOf('roulette-filters'));
});

test('the Roulette section has the wheel with its pointer, its disc and the centre button (RUL-11, RUL-12)', () => {
  const [board = ''] = roulette().match(/<div id="roulette-board" class="roulette-board">[\s\S]*?<p class="roulette-hint"/) ?? [];
  assert.match(board, /<h2 id="roulette-title" class="roulette-title"><\/h2>/);
  assert.match(board, /<p id="roulette-count" class="roulette-count" hidden><\/p>/);
  assert.match(board, /<div id="wheel" class="wheel" role="img">\s*<span class="wheel-pointer"><\/span>\s*<div id="wheel-disc" class="wheel-disc"><\/div>\s*<button id="roulette-spin" class="button wheel-hub" type="button"><svg class="icon" aria-hidden="true"><use href="icons.svg#wheel"\/><\/svg><span data-i18n="roulette.spin"><\/span><\/button>\s*<\/div>/);
});

test('the result card has the tile, the texts, and Let\'s go, Open and Spin again (RUL-14)', () => {
  const [card = ''] = roulette().match(/<article id="roulette-result" class="roulette-result" aria-labelledby="roulette-result-name" hidden>[\s\S]*?<\/article>/) ?? [];
  assert.match(card, /<p class="roulette-result-kicker" data-i18n="roulette.winner"><\/p>/);
  assert.match(card, /<span id="roulette-result-tile" class="place-tile large"><\/span>/);
  assert.match(card, /<h3 id="roulette-result-name" class="roulette-result-name" tabindex="-1"><\/h3>/);
  for (const id of ['roulette-result-place', 'roulette-result-meta']) assert.match(card, new RegExp(`<p id="${id}" class="[^"]+"( hidden)?><\\/p>`), id);
  assert.match(card, /<p id="roulette-result-facts" class="place-facts"><\/p>/);
  assert.match(card, /<a id="roulette-go" class="button primary wide" target="_blank" rel="noopener">[\s\S]*?<span data-i18n="roulette.go"><\/span><\/a>/);
  assert.match(card, /<button id="roulette-open" class="button tonal" type="button" data-i18n="roulette.open"><\/button>/);
  assert.match(card, /<button id="roulette-again" class="button tonal" type="button">[\s\S]*?<span data-i18n="roulette.again"><\/span><\/button>/);
});

test('the Roulette section has an empty state that goes to Explore (RUL-13)', () => {
  assert.match(roulette(), /<div id="roulette-empty" class="empty-state" hidden>\s*<h2 class="empty-state-title" data-i18n="roulette.emptyTitle"><\/h2>\s*<p id="roulette-empty-text"><\/p>\s*<button id="roulette-explore" class="button primary" type="button" data-i18n="roulette.explore"><\/button>/);
});

test('the navigation has one item for each section, in the order of SECTIONS (NAV-1)', () => {
  const items = [...body.matchAll(/<button class="nav-item" type="button" data-view="([^"]+)">/g)].map(([, view]) => view);
  assert.deepEqual(items, SECTIONS);
});

test('Modules has one switch for each module, in the order of MODULES (MOD-1)', () => {
  const switches = [...body.matchAll(/data-module="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(switches, MODULES);
});

test('the walkthrough has one drawing for each page, in the order of the pages', () => {
  const [layer = ''] = body.match(/<div id="onboarding"[\s\S]*?<input id="import-file"/) ?? [];
  const drawings = [...layer.matchAll(/<svg data-page="([^"]+)"/g)].map(([, page]) => page);
  assert.deepEqual(drawings, PAGES);
});

test('the walkthrough shows the app icon first, out of the page that changes, with no text', () => {
  const [, layer = ''] = body.match(/<div id="onboarding"[^>]*>\s*([\s\S]*?)<div id="onboarding-page"/) ?? [];
  assert.match(layer, /^<img class="onboarding-logo" src="\.\/icons\/logo\.png" alt="">\s*$/);
});

test('the walkthrough has Saltar and the next button in one bar at the bottom, Saltar first', () => {
  const [bar = ''] = body.match(/<div class="onboarding-actions">[\s\S]*?<\/div>/) ?? [];
  const buttons = [...bar.matchAll(/<button id="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(buttons, ['onboarding-skip', 'onboarding-next']);
  assert.doesNotMatch(body, /onboarding-top/);
});

test('the What\'s new sheet has a veil, a dialog with its title and Close, and a body (VER-22)', () => {
  const [layer = ''] = body.match(/<div id="whatsnew-sheet" class="sheet-layer"[\s\S]*?<\/section>\s*<\/div>/) ?? [];
  assert.match(layer, /<div id="whatsnew-veil" class="sheet-veil">/);
  assert.match(layer, /<section id="whatsnew" class="sheet" role="dialog" aria-modal="true" aria-labelledby="whatsnew-title">/);
  assert.match(layer, /<h2 id="whatsnew-title" class="sheet-title main" data-i18n="whatsNew.title"><\/h2><button id="whatsnew-close" class="button tonal" type="button" data-i18n="whatsNew.close"><\/button>/);
  assert.match(layer, /<div id="whatsnew-body" class="sheet-body whatsnew-body"><\/div>/);
});

test('Help in Settings has the What\'s new row, hidden until there are notes (VER-23)', () => {
  assert.match(body, /<button id="show-whatsnew" class="settings-row" type="button" hidden><span class="settings-row-label" data-i18n="settings.whatsNew"><\/span><span class="chevron" aria-hidden="true">›<\/span><\/button>/);
});

test('the account screens cover the app: Sign in with Google or offline, and Waiting for approval (ACC-2)', () => {
  const [layer = ''] = body.match(/<section id="auth" class="account" role="dialog" aria-modal="true"[\s\S]*?<\/section>/) ?? [];
  assert.match(layer, /<div id="login" class="account-page">/);
  assert.match(layer, /<h2 id="login-title" class="account-title" tabindex="-1" data-i18n="account.login.title">/);
  assert.match(layer, /<button id="login-google" class="button tonal wide" type="button"><svg class="icon small" aria-hidden="true"><use href="icons.svg#google"\/><\/svg>/);
  assert.match(layer, /<p id="login-error" class="input-help danger" role="alert" hidden><\/p>\s*<button id="login-offline" class="button accent" type="button" data-i18n="account.offline"><\/button>/);
  assert.match(layer, /<div id="waiting" class="account-page" hidden>/);
  assert.match(layer, /<h2 id="waiting-title" class="account-title" tabindex="-1" data-i18n="account.waiting.title">/);
  const buttons = [...layer.matchAll(/<button id="(waiting-[^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(buttons, ['waiting-check', 'waiting-logout']);
});

test('Settings has the Account group: the email and Log out, or Sign in with Google (ACC-8)', () => {
  const [group = ''] = body.match(/<div id="account-group" hidden>[\s\S]*?<\/div>\s*<\/div>/) ?? [];
  assert.match(group, /data-i18n="settings.account"/);
  assert.match(group, /<span id="account-email" class="settings-row-label"><\/span>/);
  assert.match(group, /<div id="account-row" class="settings-row"><span id="account-email" class="settings-row-label"><\/span><\/div>/);
  assert.match(group, /<button id="logout" class="settings-row" type="button">/);
  assert.match(group, /<button id="account-login" class="settings-row" type="button"><span class="settings-row-label" data-i18n="account.signIn"><\/span>/);
});

test('Backup ends with Delete all data, a danger row with no chevron (SET-2)', () => {
  assert.match(body, /<button id="import" class="settings-row" type="button">.*?<\/button>\s*<button id="reset" class="settings-row danger" type="button"><span class="settings-row-label" data-i18n="settings.reset"><\/span><\/button>\s*<\/div>/);
});
