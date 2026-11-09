import { CUISINES } from '#cuisines';
import { sortDishes } from '#dishes';
import { visiblePlaces } from '#filters';
import { settle } from '#swipe';
import { SIDE_BUTTON, DRAG_START, $, el, ui, state, filters, t, render, guardClick, isOn } from '#ui/context';
import { icon, iconButton } from '#ui/controls';
import { tile, metaOf, facts, markFavorite, flipFavorite, removePlace, openPlaceSheet } from '#ui/place';
import { renderChips, refreshFix } from '#ui/filters';
import { setView } from '#ui/nav';
import { currentFix } from '#ui/position';

// The star dishes that a card names.
const CARD_DISHES = 2;

const openDetail = (id) => {
  ui.placeId = id;
  render();
};

const moveBody = (body, x) => {
  body.style.transform = x ? `translateX(${x}px)` : '';
};

// Lets a horizontal drag of the card show Delete behind it (`settle` decides).
const bindSwipe = (body, width, id) => {
  let drag = null;
  body.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, base: ui.openId === id ? -width : 0, active: false };
  });
  body.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dy) > DRAG_START && Math.abs(dy) >= Math.abs(dx)) drag = null;
      if (!drag || Math.abs(dx) < DRAG_START) return;
      drag.active = true;
      body.setPointerCapture(event.pointerId);
      body.classList.add('dragging');
    }
    drag.at = Math.max(-width, Math.min(0, drag.base + dx));
    moveBody(body, drag.at);
  });
  const finish = (event) => {
    if (!drag) return;
    const { active, x, at } = drag;
    drag = null;
    if (!active) return;
    // The click that follows a drag must not open the place.
    guardClick();
    const side = settle(event.clientX - x, { start: 0, end: width }, ui.openId === id ? 'end' : null);
    ui.openId = side ? id : null;
    ui.settleFrom = { id, x: at };
    render();
  };
  body.addEventListener('pointerup', finish);
  body.addEventListener('pointercancel', finish);
};

// A card: the cuisine tile, the name, the cuisine and the area, the tier, the distance and the
// rating, up to two star dishes and the heart. It slides left to show Delete.
const card = ({ place, km }) => {
  const open = ui.openId === place.id;
  const actions = [iconButton('trash', t('place.deleteNamed', { name: place.name }), () => removePlace(place.id), { variant: 'danger' })];
  const width = actions.length * SIDE_BUTTON;
  const stars = sortDishes(place.dishes).filter((dish) => dish.star).slice(0, CARD_DISHES);
  const text = el('span', { className: 'place-card-text' }, [
    el('span', { className: 'place-card-name', textContent: place.name }),
    el('span', { className: 'place-card-meta', textContent: metaOf(place) }),
    el('span', { className: 'place-facts' }, facts(place, km)),
    ...(stars.length
      ? [el('span', { className: 'place-card-dishes' }, stars.map((dish) => el('span', { className: 'place-card-dish' }, [icon('star', 'small'), el('span', { textContent: dish.name })])))]
      : []),
  ]);
  const button = el('button', { className: 'place-card-open', type: 'button', onclick: () => openDetail(place.id) }, [tile(place), text]);
  const heart = markFavorite(el('button', { className: 'button icon place-fav', type: 'button', onclick: () => flipFavorite(place.id) }, [icon('heart')]), place);
  const body = el('div', { className: 'place-card-body' }, [button, heart]);
  if (place.id === ui.placeId) body.setAttribute('aria-current', 'true');
  const from = ui.settleFrom?.id === place.id ? ui.settleFrom.x : null;
  if (from !== null) {
    // Start where the drag ended, then move to the settled place with the CSS transition.
    moveBody(body, from);
    requestAnimationFrame(() => requestAnimationFrame(() => moveBody(body, open ? -width : 0)));
  } else moveBody(body, open ? -width : 0);
  bindSwipe(body, width, place.id);
  const box = el('div', { className: open ? 'item-row-swipe open' : 'item-row-swipe' }, [
    el('div', { className: 'item-row-actions', inert: !open }, actions),
    body,
  ]);
  const node = el('li', { className: 'place-card' }, [box]);
  node.dataset.id = place.id;
  return node;
};

// The cuisine names in the current language, for the search (PLC-17).
const cuisineNames = () => Object.fromEntries(CUISINES.map(({ id }) => [id, t(`cuisine.${id}`)]));

// True while Explore is in view, so that its open reads the position once (LOC-8).
let shown = false;

export const renderExplore = () => {
  const visible = ui.view === 'explore';
  if (visible && !shown) refreshFix();
  shown = visible;
  $('explore').hidden = !visible;
  $('fab').hidden = !visible || ui.sheet !== null;
  if (ui.openId && !state.places.some((place) => place.id === ui.openId)) ui.openId = null;
  // With no fresh fix a distance filter keeps every place (PLC-18).
  const rows = visiblePlaces(state, filters, { query: ui.query, position: currentFix()?.location ?? null, names: cuisineNames() });
  $('place-list').replaceChildren(...rows.map(card));
  ui.settleFrom = null;
  const none = state.places.length === 0;
  // With no place the search hides, so it must not keep a text that the user cannot see.
  if (none && ui.query) {
    ui.query = '';
    $('explore-query').value = '';
  }
  $('explore-empty').hidden = !none;
  $('explore-query').hidden = none;
  $('explore-filters').hidden = none;
  if (!none) renderChips($('explore-filters'), { mode: 'places' });
  $('explore-decide').hidden = none || !isOn('roulette');
  $('explore-none').hidden = none || rows.length > 0;
};

export const bind = () => {
  $('fab').addEventListener('click', () => openPlaceSheet());
  $('explore-add').addEventListener('click', () => openPlaceSheet());
  $('explore-spin').addEventListener('click', () => setView('roulette'));
  $('explore-query').addEventListener('input', (event) => {
    ui.query = event.target.value;
    render();
  });
  // A tap out of the open card closes it, without a render, so that the tap still does its work.
  document.addEventListener(
    'pointerdown',
    (event) => {
      const box = document.querySelector('.place-card .item-row-swipe.open');
      if (!box || box.contains(event.target)) return;
      ui.openId = null;
      box.classList.remove('open');
      moveBody(box.querySelector('.place-card-body'), 0);
      box.querySelector('.item-row-actions').inert = true;
    },
    true,
  );
};
