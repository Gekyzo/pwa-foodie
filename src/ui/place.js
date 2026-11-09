import { CUISINES, cuisineOf } from '#cuisines';
import { addPlace, editPlace, deletePlace, findPlace, toggleFavorite } from '#places';
import { sortDishes } from '#dishes';
import { bindSheetDrag } from '#ds/sheet';
import { $, el, ui, state, t, lang, apply, render } from '#ui/context';
import { icon } from '#ui/controls';
import { setView } from '#ui/nav';

const DEFAULT_TIER = 2;

// The tier and the rating that the sheet holds until Save.
const draft = { tier: DEFAULT_TIER, rating: null };

// The ground of a cuisine tile: the four wheel colours in turn, by the index of the cuisine (PLC-21).
export const wheelOf = (cuisine) => String((CUISINES.indexOf(cuisineOf(cuisine)) % 4) + 1);

// The emoji tile of a place: a new one, or `node` filled again.
export const tile = (place, node = el('span', { className: 'place-tile' })) => {
  node.textContent = cuisineOf(place.cuisine).emoji;
  node.dataset.wheel = wheelOf(place.cuisine);
  return node;
};

// The cuisine name, then the area when there is one.
export const metaOf = (place) => {
  const cuisine = t(`cuisine.${cuisineOf(place.cuisine).id}`);
  return place.area ? t('place.meta', { cuisine, area: place.area }) : cuisine;
};

// The tier, then the own rating when there is one.
export const facts = (place) => [
  el('span', { textContent: t(`tier.${place.tier}`) }),
  ...(place.rating === null
    ? []
    : [el('span', { className: 'place-rating', title: t('place.rated', { rating: place.rating }) }, [icon('star', 'small'), el('span', { textContent: String(place.rating) })])]),
];

export const flipFavorite = (id) => apply(toggleFavorite(state, id));

// The heart of a place: pressed for a favourite (PLC-9).
export const markFavorite = (button, place) => {
  button.setAttribute('aria-pressed', String(place.favorite));
  button.setAttribute('aria-label', t('place.favorite', { name: place.name }));
  return button;
};

// Deletes a place, with Undo in the toast (PLC-8).
export const removePlace = (id) => {
  const place = findPlace(state, id);
  if (!place) return;
  if (ui.placeId === id) ui.placeId = null;
  apply(deletePlace(state, id), { undoText: t('toast.placeDeleted', { name: place.name }) });
};

const price = (cents) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(cents / 100);

const dishRow = (dish) =>
  el('li', { className: 'dish-row' }, [
    ...(dish.star ? [icon('star', 'small')] : []),
    el('span', { className: 'dish-row-name', textContent: dish.name }),
    ...(dish.price === null ? [] : [el('span', { className: 'dish-row-price', textContent: price(dish.price) })]),
  ]);

// Opens the detail of a place in Explore, from any section.
export const openPlace = (id) => {
  setView('explore');
  ui.placeId = id;
  render();
};

export const openPlaceSheet = (id = null) => {
  const place = id === null ? null : findPlace(state, id);
  ui.sheetOpen = true;
  ui.editing = place ? id : null;
  $('place-sheet-title').textContent = t(place ? 'place.editTitle' : 'place.new');
  $('place-cuisine').replaceChildren(
    ...CUISINES.map(({ id: cuisine, emoji }) => el('option', { value: cuisine, textContent: t('place.cuisineOption', { emoji, name: t(`cuisine.${cuisine}`) }) })),
  );
  $('place-name').value = place?.name ?? '';
  $('place-cuisine').value = place?.cuisine ?? cuisineOf(null).id;
  $('place-area').value = place?.area ?? '';
  $('place-note').value = place?.note ?? '';
  Object.assign(draft, { tier: place?.tier ?? DEFAULT_TIER, rating: place?.rating ?? null });
  render();
  $('place-name').focus();
};

export const closePlaceSheet = () => {
  ui.sheetOpen = false;
  ui.editing = null;
  render();
};

const renderSheet = () => {
  $('place-sheet').hidden = !ui.sheetOpen;
  document.querySelectorAll('#place-form [data-tier]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.tier) === draft.tier));
  });
  document.querySelectorAll('#place-form [data-rating]').forEach((button) => {
    const rating = Number(button.dataset.rating);
    button.setAttribute('aria-pressed', String(draft.rating !== null && rating <= draft.rating));
    button.setAttribute('aria-label', t('place.stars', { count: rating }));
  });
};

export const renderPlace = () => {
  const place = ui.placeId === null ? null : findPlace(state, ui.placeId);
  if (!place) ui.placeId = null;
  // The pane shows the detail alone below 840px, and beside the list from 840px (LAY-3).
  if (place) $('explore').dataset.detail = '';
  else delete $('explore').dataset.detail;
  $('place-pick').hidden = Boolean(place);
  $('place-view').hidden = !place;
  if (place) {
    tile(place, $('place-tile'));
    $('place-title').textContent = place.name;
    $('place-meta').textContent = metaOf(place);
    $('place-facts').replaceChildren(...facts(place));
    markFavorite($('place-fav'), place);
    $('place-remark').textContent = place.note;
    $('place-remark').hidden = !place.note;
    $('place-dishes').replaceChildren(...sortDishes(place.dishes).map(dishRow));
    $('place-no-dishes').hidden = place.dishes.length > 0;
  }
  renderSheet();
};

export const bind = () => {
  $('place-veil').addEventListener('click', closePlaceSheet);
  $('place-close').addEventListener('click', closePlaceSheet);
  bindSheetDrag($('place-sheet'), { close: closePlaceSheet });
  $('place-back').addEventListener('click', () => {
    ui.placeId = null;
    render();
  });
  $('place-fav').addEventListener('click', () => flipFavorite(ui.placeId));
  $('place-edit').addEventListener('click', () => openPlaceSheet(ui.placeId));
  $('place-delete').addEventListener('click', () => removePlace(ui.placeId));
  document.querySelectorAll('#place-form [data-tier]').forEach((button) => {
    button.addEventListener('click', () => {
      draft.tier = Number(button.dataset.tier);
      renderSheet();
    });
  });
  // A tap on the star of the current rating clears it.
  document.querySelectorAll('#place-form [data-rating]').forEach((button) => {
    button.addEventListener('click', () => {
      const rating = Number(button.dataset.rating);
      draft.rating = draft.rating === rating ? null : rating;
      renderSheet();
    });
  });
  $('place-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = {
      name: $('place-name').value,
      cuisine: $('place-cuisine').value,
      area: $('place-area').value,
      tier: draft.tier,
      rating: draft.rating,
      note: $('place-note').value,
    };
    const result = ui.editing ? editPlace(state, ui.editing, fields) : addPlace(state, fields);
    if (apply(result)) closePlaceSheet();
  });
};
