import { LIMITS, findPlace } from '#places';

// The dishes of a place. A price is integer cents or null.
export const MAX_PRICE = 99999;

const PRICE_PATTERN = /^(\d+)(?:[.,](\d{1,2}))?$/;
const FIELDS = ['name', 'price', 'star', 'rating', 'note'];

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const inRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const invalidPrice = () => ({ error: { key: 'error.priceInvalid' } });

// Reads what a person types: 14,50 or 14.5 or 14 or "9,9 €". Empty means no price.
export const parsePrice = (value) => {
  const typed = typeof value === 'string' ? value.replace(/[€\s]/g, '') : '';
  if (typed === '') return { cents: null };
  const match = PRICE_PATTERN.exec(typed);
  if (!match) return invalidPrice();
  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return cents <= MAX_PRICE ? { cents } : invalidPrice();
};

const checkFields = (fields) => {
  const name = text(fields.name);
  const note = text(fields.note);
  const price = fields.price ?? null;
  if (!name) return { error: { key: 'error.dishNameRequired' } };
  if (name.length > LIMITS.name) return { error: { key: 'error.dishNameTooLong', params: { max: LIMITS.name } } };
  if (note.length > LIMITS.note) return { error: { key: 'error.noteTooLong', params: { max: LIMITS.note } } };
  if (price !== null && !inRange(price, 0, MAX_PRICE)) return invalidPrice();
  return {
    clean: { name, price, star: fields.star === true, rating: inRange(fields.rating, 1, 5) ? fields.rating : null, note },
  };
};

const missingPlace = (state) => ({ state, error: { key: 'error.placeMissing' } });
const missingDish = (state) => ({ state, error: { key: 'error.dishMissing' } });

const withDishes = (state, placeId, dishes) => ({
  state: { ...state, places: state.places.map((place) => (place.id === placeId ? { ...place, dishes } : place)) },
});

export const addDish = (state, placeId, fields, id = crypto.randomUUID()) => {
  const place = findPlace(state, placeId);
  if (!place) return missingPlace(state);
  const { clean, error } = checkFields(fields ?? {});
  if (error) return { state, error };
  return withDishes(state, placeId, [...place.dishes, { id, ...clean }]);
};

// `fields` may hold only some of name, price, star, rating, note; the rest is kept.
export const editDish = (state, placeId, dishId, fields) => {
  const place = findPlace(state, placeId);
  if (!place) return missingPlace(state);
  const dish = place.dishes.find((other) => other.id === dishId);
  if (!dish) return missingDish(state);
  const merged = { ...dish };
  for (const key of FIELDS) {
    if (fields?.[key] !== undefined) merged[key] = fields[key];
  }
  const { clean, error } = checkFields(merged);
  if (error) return { state, error };
  return withDishes(state, placeId, place.dishes.map((other) => (other.id === dishId ? { ...dish, ...clean } : other)));
};

export const deleteDish = (state, placeId, dishId) => {
  const place = findPlace(state, placeId);
  if (!place) return missingPlace(state);
  if (!place.dishes.some((dish) => dish.id === dishId)) return missingDish(state);
  return withDishes(state, placeId, place.dishes.filter((dish) => dish.id !== dishId));
};

// Star dishes first; the order inside each group stays.
export const sortDishes = (dishes) => [...dishes.filter((dish) => dish.star), ...dishes.filter((dish) => !dish.star)];
