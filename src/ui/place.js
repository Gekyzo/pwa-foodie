import { CUISINES, cuisineOf } from '#cuisines';
import { addPlace, editPlace, deletePlace, findPlace, toggleFavorite } from '#places';
import { addDish, editDish, deleteDish, sortDishes, parsePrice } from '#dishes';
import { parseLocation, routeUrl, distanceKm, distanceLabel } from '#geo';
import { bindSheetDrag } from '#ds/sheet';
import { $, el, ui, state, t, lang, apply, render } from '#ui/context';
import { icon } from '#ui/controls';
import { collapse } from '#ui/motion';
import { setView } from '#ui/nav';
import { readPosition, currentFix } from '#ui/position';

const DEFAULT_TIER = 2;
// The decimals of a location as the sheet shows it: about 1 m.
const PAIR_DIGITS = 5;

// The tier, the rating and the location that the place sheet holds until Save.
const draft = { tier: DEFAULT_TIER, rating: null, location: null };
// The rating that the dish sheet holds until Save.
const dishDraft = { rating: null };

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

// The row of `id` in `list`, while it shows, so that it closes before it leaves.
const shownRow = (list, id) => {
  const row = [...$(list).children].find((node) => node.dataset.id === id);
  return row?.offsetParent ? [row] : [];
};

// Deletes a place, with Undo in the toast (PLC-8). Its card closes first.
export const removePlace = (id) => {
  const place = findPlace(state, id);
  if (!place) return;
  collapse(shownRow('place-list', id), () => {
    if (!findPlace(state, id)) return;
    if (ui.placeId === id) ui.placeId = null;
    apply(deletePlace(state, id), { undoText: t('toast.placeDeleted', { name: place.name }) });
  });
};

const price = (cents) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(cents / 100);

// A price as the field shows it to edit: 14,50 in Spanish, 14.50 in English.
const priceInput = (cents) =>
  new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(cents / 100);

const rated = (rating) =>
  el('span', { className: 'place-rating', title: t('place.rated', { rating }) }, [icon('star', 'small'), el('span', { textContent: String(rating) })]);

// A dish: the star of a star dish, the name, the rating and the note, the price. A tap edits it.
const dishRow = (dish) => {
  const star = icon('star', 'small');
  star.removeAttribute('aria-hidden');
  star.setAttribute('role', 'img');
  star.setAttribute('aria-label', t('dish.starred'));
  const meta = [...(dish.rating === null ? [] : [rated(dish.rating)]), ...(dish.note ? [el('span', { className: 'dish-row-note', textContent: dish.note })] : [])];
  const node = el('li', { className: 'dish-row' }, [
    el('button', { className: 'dish-row-open', type: 'button', onclick: () => openDishSheet(dish.id) }, [
      ...(dish.star ? [star] : []),
      el('span', { className: 'dish-row-text' }, [
        el('span', { className: 'dish-row-name', textContent: dish.name }),
        ...(meta.length ? [el('span', { className: 'dish-row-meta' }, meta)] : []),
      ]),
      ...(dish.price === null ? [] : [el('span', { className: 'dish-row-price', textContent: price(dish.price) })]),
    ]),
  ]);
  node.dataset.id = dish.id;
  return node;
};

// The distance to a place from a fresh fix, or nothing.
const distanceFact = (place) => {
  const fix = currentFix();
  if (!fix || !place.location) return [];
  const { key, params } = distanceLabel(distanceKm(fix.location, place.location));
  const number = new Intl.NumberFormat(lang);
  const text = t(key, Object.fromEntries(Object.entries(params).map(([name, value]) => [name, number.format(value)])));
  return [el('span', { textContent: text })];
};

const pairText = (location) =>
  location
    ? t('location.pair', { lat: location.lat.toFixed(PAIR_DIGITS), lng: location.lng.toFixed(PAIR_DIGITS) })
    : t('location.none');

// Opens the detail of a place in Explore, from any section.
export const openPlace = (id) => {
  setView('explore');
  ui.placeId = id;
  render();
};

export const openPlaceSheet = (id = null) => {
  const place = id === null ? null : findPlace(state, id);
  ui.sheet = 'place';
  ui.editing = place ? id : null;
  $('place-sheet-title').textContent = t(place ? 'place.editTitle' : 'place.new');
  $('place-cuisine').replaceChildren(
    ...CUISINES.map(({ id: cuisine, emoji }) => el('option', { value: cuisine, textContent: t('place.cuisineOption', { emoji, name: t(`cuisine.${cuisine}`) }) })),
  );
  $('place-name').value = place?.name ?? '';
  $('place-cuisine').value = place?.cuisine ?? cuisineOf(null).id;
  $('place-area').value = place?.area ?? '';
  $('place-note').value = place?.note ?? '';
  $('location-link').value = '';
  Object.assign(draft, { tier: place?.tier ?? DEFAULT_TIER, rating: place?.rating ?? null, location: place?.location ?? null });
  render();
  $('place-name').focus();
};

export const closePlaceSheet = () => {
  ui.sheet = null;
  ui.editing = null;
  render();
};

// Opens the dish sheet of the open place: a new dish, or the dish `dishId` to edit (PLC-30).
export const openDishSheet = (dishId = null) => {
  const place = findPlace(state, ui.placeId);
  if (!place) return;
  const dish = place.dishes.find((other) => other.id === dishId) ?? null;
  ui.sheet = 'dish';
  ui.dishId = dish ? dish.id : null;
  $('dish-sheet-title').textContent = t(dish ? 'dish.editTitle' : 'dish.new');
  $('dish-name').value = dish?.name ?? '';
  $('dish-price').value = dish && dish.price !== null ? priceInput(dish.price) : '';
  $('dish-star').checked = dish?.star ?? false;
  $('dish-note').value = dish?.note ?? '';
  $('dish-delete').hidden = !dish;
  dishDraft.rating = dish?.rating ?? null;
  render();
  $('dish-name').focus();
};

export const closeDishSheet = () => {
  ui.sheet = null;
  ui.dishId = null;
  render();
};

// Closes the open sheet with no save: Escape.
export const closeSheet = () => {
  if (ui.sheet === 'dish') closeDishSheet();
  else if (ui.sheet === 'place') closePlaceSheet();
};

// Deletes the dish of the sheet, with Undo in the toast (PLC-31). Its row closes first.
const removeDish = () => {
  const { placeId, dishId } = ui;
  const dish = findPlace(state, placeId)?.dishes.find((other) => other.id === dishId);
  closeDishSheet();
  if (!dish) return;
  collapse(shownRow('place-dishes', dishId), () => {
    apply(deleteDish(state, placeId, dishId), { undoText: t('toast.dishDeleted', { name: dish.name }) });
  });
};

const markRating = (form, rating) => {
  document.querySelectorAll(`#${form} [data-rating]`).forEach((button) => {
    const value = Number(button.dataset.rating);
    button.setAttribute('aria-pressed', String(rating !== null && value <= rating));
    button.setAttribute('aria-label', t('place.stars', { count: value }));
  });
};

const renderSheet = () => {
  $('place-sheet').hidden = ui.sheet !== 'place';
  $('dish-sheet').hidden = ui.sheet !== 'dish';
  document.querySelectorAll('#place-form [data-tier]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.tier) === draft.tier));
  });
  markRating('place-form', draft.rating);
  markRating('dish-form', dishDraft.rating);
  $('place-location').textContent = pairText(draft.location);
  $('location-clear').disabled = !draft.location;
  $('location-apply').disabled = !$('location-link').value.trim();
};

// Use my position: one read of the Geolocation API (PLC-28).
const locateHere = async () => {
  $('location-here').disabled = true;
  const result = await readPosition();
  $('location-here').disabled = false;
  // The sheet may have closed during the read: the answer is then for no field.
  if (ui.sheet !== 'place') return;
  if (result.error) {
    apply(result);
    return;
  }
  draft.location = result.location;
  render();
};

// Apply: the location of a pasted map link or pair. An error shows in the toast (LOC-2).
const applyLink = () => {
  const result = parseLocation($('location-link').value);
  if (result.error) {
    apply(result);
    return;
  }
  draft.location = result.location;
  $('location-link').value = '';
  renderSheet();
};

// A tap on the star of the current rating clears it.
const bindRating = (form, holder) => {
  document.querySelectorAll(`#${form} [data-rating]`).forEach((button) => {
    button.addEventListener('click', () => {
      const rating = Number(button.dataset.rating);
      holder.rating = holder.rating === rating ? null : rating;
      renderSheet();
    });
  });
};

export const renderPlace = () => {
  const place = ui.placeId === null ? null : findPlace(state, ui.placeId);
  if (!place) ui.placeId = null;
  // A dish sheet needs its place: an Undo of the place can take it away.
  if (!place && ui.sheet === 'dish') {
    ui.sheet = null;
    ui.dishId = null;
  }
  // The pane shows the detail alone below 840px, and beside the list from 840px (LAY-3).
  if (place) $('explore').dataset.detail = '';
  else delete $('explore').dataset.detail;
  $('place-pick').hidden = Boolean(place);
  $('place-view').hidden = !place;
  if (place) {
    tile(place, $('place-tile'));
    $('place-title').textContent = place.name;
    $('place-meta').textContent = metaOf(place);
    $('place-facts').replaceChildren(...facts(place), ...distanceFact(place));
    markFavorite($('place-fav'), place);
    $('place-remark').textContent = place.note;
    $('place-remark').hidden = !place.note;
    $('place-route').hidden = !place.location;
    if (place.location) $('place-route').href = routeUrl(place.location);
    else $('place-route').removeAttribute('href');
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
  $('dish-add').addEventListener('click', () => openDishSheet());
  document.querySelectorAll('#place-form [data-tier]').forEach((button) => {
    button.addEventListener('click', () => {
      draft.tier = Number(button.dataset.tier);
      renderSheet();
    });
  });
  bindRating('place-form', draft);
  bindRating('dish-form', dishDraft);
  $('location-here').addEventListener('click', locateHere);
  $('location-clear').addEventListener('click', () => {
    draft.location = null;
    renderSheet();
  });
  $('location-apply').addEventListener('click', applyLink);
  $('location-link').addEventListener('input', renderSheet);
  // Enter in the link applies it; it does not save the place.
  $('location-link').addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    applyLink();
  });
  $('place-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = {
      name: $('place-name').value,
      cuisine: $('place-cuisine').value,
      area: $('place-area').value,
      tier: draft.tier,
      rating: draft.rating,
      location: draft.location,
      note: $('place-note').value,
    };
    const result = ui.editing ? editPlace(state, ui.editing, fields) : addPlace(state, fields);
    if (apply(result)) closePlaceSheet();
  });
  $('dish-veil').addEventListener('click', closeDishSheet);
  $('dish-close').addEventListener('click', closeDishSheet);
  bindSheetDrag($('dish-sheet'), { close: closeDishSheet });
  $('dish-delete').addEventListener('click', removeDish);
  $('dish-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const typed = parsePrice($('dish-price').value);
    if (typed.error) {
      apply(typed);
      return;
    }
    const fields = {
      name: $('dish-name').value,
      price: typed.cents,
      star: $('dish-star').checked,
      rating: dishDraft.rating,
      note: $('dish-note').value,
    };
    const result = ui.dishId ? editDish(state, ui.placeId, ui.dishId, fields) : addDish(state, ui.placeId, fields);
    if (apply(result)) closeDishSheet();
  });
};
