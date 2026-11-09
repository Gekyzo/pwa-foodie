import { MAX_SEGMENTS, SPIN_MS, MODES, candidates, drawWheel, landingAngle, colourOf } from '#roulette';
import { findPlace } from '#places';
import { routeUrl, distanceKm } from '#geo';
import { $, el, ui, state, filters, t, render } from '#ui/context';
import { tile, metaOf, facts, price, openPlace } from '#ui/place';
import { renderChips, refreshFix } from '#ui/filters';
import { setView } from '#ui/nav';
import { currentFix } from '#ui/position';

// The Roulette section (RUL-10 to RUL-15): the Places and Dishes switch, the chips, the wheel, the
// result card and the empty state. The draw comes from the pure module; the turn only shows it.

// The wheel in view: `{ key, segments, total, winner, spun }`, or null before the first render.
let wheel = null;
// The turn of the disc in degrees. It only grows, so that each spin turns forward.
let turn = 0;
// The item of the last spin that the result card shows, or null.
let result = null;
// The filters and the mode of the last render: a change of either starts the wheel again.
let seen = { filters: null, mode: null };
// The wheel whose segments the disc shows, so that a render draws it only when it is new.
let drawn = null;
// True while the Roulette is in view, so that its open reads the position once (LOC-8).
let shown = false;

// The width of the line between two segments, in degrees.
const SEAM = 0.6;

const stillMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const position = () => currentFix()?.location ?? null;
const itemsNow = () => candidates(state, filters, ui.mode, { position: position() });
const keyOf = (items) => items.map(({ id, label, emoji }) => `${id}\n${label}\n${emoji}`).join('\n\n');

const prepare = (items) => ({ key: keyOf(items), ...drawWheel(items, { exclude: ui.lastWinner }), spun: false });

const drawDisc = () => {
  // The labels are the names of the items, in no language: only a new wheel draws them again.
  if (drawn === wheel) return;
  drawn = wheel;
  const { segments } = wheel;
  const size = 360 / segments.length;
  // A thin line of --surface starts each segment, so that two warm neighbours stay apart.
  const stops = segments.map((_, i) => `var(--surface) ${i * size}deg ${i * size + SEAM}deg, var(--wheel-${colourOf(i, segments.length)}) ${i * size + SEAM}deg ${(i + 1) * size}deg`);
  const disc = $('wheel-disc');
  disc.style.backgroundImage = `conic-gradient(${stops.join(', ')})`;
  disc.replaceChildren(
    ...segments.map((item, i) => {
      const label = el('span', { className: 'wheel-label' }, [
        el('span', { className: 'wheel-label-name', textContent: item.label }),
        el('span', { className: 'wheel-label-emoji', textContent: item.emoji }),
      ]);
      label.dataset.wheel = String(colourOf(i, segments.length));
      label.style.setProperty('--at', `${(i + 0.5) * size}deg`);
      return label;
    }),
  );
};

// The place and, for a dish, the dish of an item, or null when it is gone.
const entryOf = (item) => {
  const place = findPlace(state, item.placeId);
  if (!place) return null;
  if (item.kind !== 'dish') return { place, dish: null };
  const dish = place.dishes.find(({ id }) => id === item.id);
  return dish ? { place, dish } : null;
};

const renderResult = (entry) => {
  const { place, dish } = entry;
  const fix = currentFix();
  const km = fix && place.location ? distanceKm(fix.location, place.location) : null;
  tile(place, $('roulette-result-tile'));
  $('roulette-result-name').textContent = dish ? dish.name : place.name;
  $('roulette-result-place').hidden = !dish;
  $('roulette-result-place').textContent = dish ? t('roulette.at', { place: place.name }) : '';
  $('roulette-result-meta').textContent = metaOf(place);
  $('roulette-result-facts').replaceChildren(...facts(place, km));
  const cost = dish?.price ?? null;
  $('roulette-result-price').hidden = cost === null;
  $('roulette-result-price').textContent = cost === null ? '' : price(cost);
  // With no location there is no route: the link has no address and is disabled.
  const go = $('roulette-go');
  if (place.location) {
    go.href = routeUrl(place.location);
    go.removeAttribute('aria-disabled');
  } else {
    go.removeAttribute('href');
    go.setAttribute('aria-disabled', 'true');
  }
};

export const renderRoulette = () => {
  const visible = ui.view === 'roulette';
  if (visible && !shown) refreshFix();
  shown = visible;
  $('roulette').hidden = !visible;
  if (!visible) return;

  // A new mode or new filters start again: no last winner and no result (RUL-15).
  if (!ui.spinning && (filters !== seen.filters || ui.mode !== seen.mode)) {
    seen = { filters, mode: ui.mode };
    ui.lastWinner = null;
    result = null;
    wheel = null;
  }
  const items = itemsNow();
  // The wheel stays as it is while it turns; else it follows the candidates.
  if (!ui.spinning && (wheel === null || wheel.key !== keyOf(items))) {
    wheel = prepare(items);
    if (result && !items.some(({ id }) => id === result.id)) result = null;
  }
  // One candidate is the result at once, with no spin (RUL-4).
  if (wheel.total === 1) result = wheel.segments[0];
  const entry = result ? entryOf(result) : null;
  if (!entry) result = null;

  const none = state.places.length === 0;
  const empty = wheel.total === 0;
  const single = wheel.total === 1;
  $('roulette-mode').hidden = none;
  $('roulette-filters').hidden = none;
  if (!none) renderChips($('roulette-filters'), { mode: ui.mode });
  document.querySelectorAll('#roulette-mode [data-mode]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.mode === ui.mode));
  });

  $('roulette-empty').hidden = !empty;
  $('roulette-empty-text').textContent = t(none ? 'roulette.noPlaces' : ui.mode === 'dishes' ? 'roulette.emptyDishes' : 'roulette.emptyPlaces');
  $('roulette-stage').hidden = empty;
  $('roulette-board').hidden = empty || single;
  $('roulette-title').textContent = t(ui.mode === 'dishes' ? 'roulette.titleDishes' : 'roulette.titlePlaces');
  $('roulette-count').hidden = wheel.total <= MAX_SEGMENTS;
  $('roulette-count').textContent = t('roulette.count', { shown: wheel.segments.length, total: wheel.total });
  if (!empty && !single) {
    $('wheel-disc').setAttribute('aria-label', t('roulette.wheel', { count: wheel.segments.length }));
    drawDisc();
  }
  const disc = $('wheel-disc');
  disc.style.transitionDuration = ui.spinning ? `${SPIN_MS}ms` : '0ms';
  disc.style.transform = `rotate(${turn}deg)`;

  $('roulette-result').hidden = !entry || ui.spinning;
  if (entry) renderResult(entry);
  $('roulette-again').hidden = single;

  // Nothing changes the draw while the wheel turns.
  for (const node of document.querySelectorAll('#roulette-mode button, #roulette-filters button, #roulette-spin')) node.disabled = ui.spinning;
};

// The end of a spin: the winner shows in the card and leaves the next draw (RUL-5).
const land = () => {
  ui.spinning = false;
  result = wheel.segments[wheel.winner];
  ui.lastWinner = result.id;
  render();
  // The focus that was on a control of the roulette goes to the name of the result.
  const focus = document.activeElement;
  if (ui.view === 'roulette' && (!focus || focus === document.body || $('roulette').contains(focus))) $('roulette-result-name').focus({ preventScroll: true });
  // The whole card comes into view, with its buttons.
  if (ui.view === 'roulette') $('roulette-result').scrollIntoView({ block: 'nearest', behavior: stillMotion() ? 'auto' : 'smooth' });
};

// A spin: the pure module draws the winner first, then the disc turns to it (RUL-8, RUL-9).
const spin = () => {
  if (ui.spinning || !wheel || wheel.segments.length < 2) return;
  // The first spin uses the wheel in view; a later one draws again and leaves out the last winner.
  if (wheel.spun) wheel = prepare(itemsNow());
  if (wheel.segments.length < 2) {
    render();
    return;
  }
  wheel.spun = true;
  turn = Math.ceil(turn / 360) * 360 + landingAngle(wheel.winner, wheel.segments.length);
  result = null;
  if (stillMotion()) {
    land();
    return;
  }
  ui.spinning = true;
  render();
  setTimeout(land, SPIN_MS);
};

const setMode = (mode) => {
  if (ui.spinning || !MODES.includes(mode) || mode === ui.mode) return;
  ui.mode = mode;
  render();
};

export const bind = () => {
  document.querySelectorAll('#roulette-mode [data-mode]').forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });
  $('roulette-spin').addEventListener('click', spin);
  $('roulette-again').addEventListener('click', spin);
  $('roulette-open').addEventListener('click', () => {
    if (result) openPlace(result.placeId);
  });
  $('roulette-explore').addEventListener('click', () => setView('explore'));
};
