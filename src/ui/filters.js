import { CUISINES } from '#cuisines';
import { DISTANCES, DEFAULT_FILTERS, distanceChip } from '#filters';
import { parsePrice } from '#dishes';
import { bindSheetDrag } from '#ds/sheet';
import { $, el, ui, t, filters, setFilters, apply, render } from '#ui/context';
import { icon } from '#ui/controls';
import { price, priceInput } from '#ui/place';
import { readPosition, currentFix, silentFix } from '#ui/position';

// The filter chips of Explore and the roulette, and the filter sheet that a chip opens (PLC-32 to
// PLC-36). The chips of both sections share the filters of ui/context.js.

// The read of the distance chip: `reading` during a read, `error` after a read that failed, else null.
let reading = null;
// The number of the last distance pick, so that the answer of an older read is ignored.
let lastPick = 0;

const sameTiers = (tiers) => tiers[0] === DEFAULT_FILTERS.tiers[0] && tiers[1] === DEFAULT_FILTERS.tiers[1];

const priceLabel = ([from, to]) => {
  if (sameTiers([from, to])) return t('filter.price');
  if (from === to) return t(`tier.${from}`);
  return t('filter.tiers', { from: t(`tier.${from}`), to: t(`tier.${to}`) });
};

const cuisineLabel = (ids) => {
  if (ids.length === 0) return t('filter.cuisine');
  if (ids.length > 1) return t('filter.cuisines', { count: ids.length });
  const cuisine = CUISINES.find(({ id }) => id === ids[0]);
  return t('place.cuisineOption', { emoji: cuisine.emoji, name: t(`cuisine.${cuisine.id}`) });
};

// The distance chip: pressed exactly when the distance filters (LOC-9).
const distanceMarks = () => {
  const { key, params, pressed, state } = distanceChip({ km: filters.km, fresh: currentFix() !== null, reading });
  return { text: t(key, params), pressed, state };
};

const chip = (name, { text, pressed, state = null, sheet = true, glyph = null }) => {
  const node = el('button', { className: 'chip filter-chip', type: 'button' }, [...(glyph ? [icon(glyph, 'small')] : []), el('span', { textContent: text })]);
  node.dataset.filter = name;
  node.setAttribute('aria-pressed', String(pressed));
  if (sheet) node.setAttribute('aria-haspopup', 'dialog');
  if (state) node.dataset.state = state;
  node.addEventListener('click', () => (sheet ? openFilterSheet(name) : flipFavorites()));
  return node;
};

// The chips in `container`. `dishes` mode adds Max price, after Price.
export const renderChips = (container, { mode = 'places' } = {}) => {
  const focused = container.contains(document.activeElement) ? document.activeElement.dataset.filter : null;
  const chips = [
    chip('price', { text: priceLabel(filters.tiers), pressed: !sameTiers(filters.tiers) }),
    ...(mode === 'dishes'
      ? [chip('maxPrice', { text: filters.maxPrice === null ? t('filter.maxPrice') : t('filter.upTo', { price: price(filters.maxPrice) }), pressed: filters.maxPrice !== null })]
      : []),
    chip('distance', { ...distanceMarks(), glyph: 'pin' }),
    chip('favorites', { text: t('filter.favorites'), pressed: filters.favorites, sheet: false, glyph: 'heart' }),
    chip('cuisine', { text: cuisineLabel(filters.cuisines), pressed: filters.cuisines.length > 0 }),
  ];
  container.replaceChildren(...chips);
  // A render must not take the focus from the chip that the user pressed.
  if (focused) chips.find((node) => node.dataset.filter === focused)?.focus();
};

const flipFavorites = () => {
  setFilters({ ...filters, favorites: !filters.favorites });
  render();
};

// A read of the position after a tap (LOC-9); its failure shows on the chip and in the toast.
const pickDistance = async (km) => {
  lastPick += 1;
  const pick = lastPick;
  closeFilterSheet();
  if (km === null) {
    reading = null;
    setFilters({ ...filters, km: null });
    render();
    return;
  }
  reading = 'reading';
  render();
  const result = await readPosition();
  // A newer pick owns the chip now.
  if (pick !== lastPick) return;
  if (result.error) {
    reading = 'error';
    render();
    apply(result);
    return;
  }
  reading = null;
  setFilters({ ...filters, km });
  render();
};

// At the open of Explore or the roulette: a read with no prompt (LOC-8). A new fix renders again.
export const refreshFix = async () => {
  const before = currentFix();
  await silentFix();
  if (currentFix() === before) return;
  // A new fix answers an old failure; a read in progress keeps its state.
  if (reading === 'error') reading = null;
  render();
};

export const openFilterSheet = (name) => {
  ui.sheet = 'filter';
  ui.filter = name;
  $('filter-sheet-title').textContent = t(`filter.${name}`);
  if (name === 'maxPrice') $('filter-max-input').value = filters.maxPrice === null ? '' : priceInput(filters.maxPrice);
  render();
  if (name === 'maxPrice') $('filter-max-input').focus();
  else $('filter-close').focus();
};

export const closeFilterSheet = () => {
  if (ui.sheet !== 'filter') return;
  ui.sheet = null;
  ui.filter = null;
  render();
};

const option = (text, pressed, run) => {
  const node = el('button', { className: 'chip', type: 'button', textContent: text, onclick: run });
  node.setAttribute('aria-pressed', String(pressed));
  return node;
};

const markTiers = () => {
  const [from, to] = filters.tiers;
  document.querySelectorAll('#filter-price [data-from]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.from) === from)));
  document.querySelectorAll('#filter-price [data-to]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.to) === to)));
};

// The part of the filter sheet of each chip that opens it.
const PARTS = { price: 'filter-price', distance: 'filter-distance', cuisine: 'filter-cuisine', maxPrice: 'filter-max' };

export const renderFilterSheet = () => {
  const open = ui.sheet === 'filter';
  $('filter-sheet').hidden = !open;
  if (!open) return;
  for (const [name, id] of Object.entries(PARTS)) $(id).hidden = ui.filter !== name;
  // Distance has Any among its choices; the other parts clear in the foot.
  $('filter-clear').hidden = ui.filter === 'distance';
  if (ui.filter === 'price') markTiers();
  if (ui.filter === 'distance') {
    $('filter-distance').replaceChildren(
      option(t('filter.any'), filters.km === null, () => pickDistance(null)),
      ...DISTANCES.map((km) => option(t('filter.within', { km }), filters.km === km, () => pickDistance(km))),
    );
  }
  if (ui.filter === 'cuisine') {
    $('filter-cuisine').replaceChildren(
      ...CUISINES.map(({ id, emoji }) =>
        option(t('place.cuisineOption', { emoji, name: t(`cuisine.${id}`) }), filters.cuisines.includes(id), () => {
          const cuisines = filters.cuisines.includes(id) ? filters.cuisines.filter((other) => other !== id) : [...filters.cuisines, id];
          setFilters({ ...filters, cuisines });
          render();
        })),
    );
  }
};

const clearFilter = () => {
  const name = ui.filter;
  if (name === 'price') setFilters({ ...filters, tiers: DEFAULT_FILTERS.tiers });
  if (name === 'cuisine') setFilters({ ...filters, cuisines: [] });
  if (name === 'maxPrice') {
    setFilters({ ...filters, maxPrice: null });
    $('filter-max-input').value = '';
  }
  render();
};

export const bind = () => {
  $('filter-veil').addEventListener('click', closeFilterSheet);
  $('filter-close').addEventListener('click', closeFilterSheet);
  bindSheetDrag($('filter-sheet'), { close: closeFilterSheet });
  $('filter-clear').addEventListener('click', clearFilter);
  // A pick of one end moves the other end when it would cross it.
  document.querySelectorAll('#filter-price [data-from]').forEach((button) => {
    button.addEventListener('click', () => {
      const from = Number(button.dataset.from);
      setFilters({ ...filters, tiers: [from, Math.max(from, filters.tiers[1])] });
      render();
    });
  });
  document.querySelectorAll('#filter-price [data-to]').forEach((button) => {
    button.addEventListener('click', () => {
      const to = Number(button.dataset.to);
      setFilters({ ...filters, tiers: [Math.min(to, filters.tiers[0]), to] });
      render();
    });
  });
  $('filter-max').addEventListener('submit', (event) => {
    event.preventDefault();
    const typed = parsePrice($('filter-max-input').value);
    if (typed.error) {
      apply(typed);
      return;
    }
    setFilters({ ...filters, maxPrice: typed.cents });
    closeFilterSheet();
  });
};
