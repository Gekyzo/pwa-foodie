import { APP_SLUG } from '#config';
import { cuisineOf } from '#cuisines';

// The places doc: restaurants and their dishes, newest place first.
export const PLACES_KEY = `${APP_SLUG}.places`;
export const LIMITS = { name: 80, area: 60, note: 280 };
const DEFAULT_TIER = 2;

export const emptyPlaces = () => ({ version: 1, places: [] });

const missing = (state) => ({ state, error: { key: 'error.placeMissing' } });

const isObject = (value) => typeof value === 'object' && value !== null;
const isText = (value) => typeof value === 'string' && value.trim() !== '';
const inRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

// Local check until #geo is written (Task 3 replaces it with its `isLocation`).
const validLocation = (value) =>
  isObject(value) &&
  Number.isFinite(value.lat) && value.lat >= -90 && value.lat <= 90 &&
  Number.isFinite(value.lng) && value.lng >= -180 && value.lng <= 180;

const cleanLocation = (value) => (validLocation(value) ? { lat: value.lat, lng: value.lng } : null);
const cleanTier = (value) => (inRange(value, 1, 4) ? value : DEFAULT_TIER);
const cleanRating = (value) => (inRange(value, 1, 5) ? value : null);
const text = (value) => String(value ?? '').trim();

const checkLength = (value, field, key) =>
  value.length > LIMITS[field] ? { key, params: { max: LIMITS[field] } } : null;

// The clean editable fields, or an error. `fields` is complete.
const checkFields = (fields) => {
  const name = text(fields.name);
  const area = text(fields.area);
  const note = text(fields.note);
  const error = !name
    ? { key: 'error.nameRequired' }
    : checkLength(name, 'name', 'error.nameTooLong') ??
      checkLength(area, 'area', 'error.areaTooLong') ??
      checkLength(note, 'note', 'error.noteTooLong');
  if (error) return { error };
  return {
    clean: {
      name,
      cuisine: cuisineOf(fields.cuisine).id,
      area,
      tier: cleanTier(fields.tier),
      location: cleanLocation(fields.location),
      rating: cleanRating(fields.rating),
      note,
    },
  };
};

export const findPlace = (state, id) => state.places.find((place) => place.id === id) ?? null;

export const addPlace = (state, fields, id = crypto.randomUUID(), now = new Date()) => {
  const { clean, error } = checkFields(fields ?? {});
  if (error) return { state, error };
  const place = { id, ...clean, favorite: false, dishes: [], created: now.toISOString() };
  return { state: { ...state, places: [place, ...state.places] } };
};

// `fields` may hold only some of name, cuisine, area, tier, location, rating, note; the rest is kept.
export const editPlace = (state, id, fields) => {
  const place = findPlace(state, id);
  if (!place) return missing(state);
  const merged = { ...place };
  for (const key of ['name', 'cuisine', 'area', 'tier', 'location', 'rating', 'note']) {
    if (fields?.[key] !== undefined) merged[key] = fields[key];
  }
  const { clean, error } = checkFields(merged);
  if (error) return { state, error };
  return { state: { ...state, places: state.places.map((other) => (other.id === id ? { ...place, ...clean } : other)) } };
};

export const deletePlace = (state, id) => {
  if (!findPlace(state, id)) return missing(state);
  return { state: { ...state, places: state.places.filter((place) => place.id !== id) } };
};

export const toggleFavorite = (state, id) => {
  const place = findPlace(state, id);
  if (!place) return missing(state);
  return { state: { ...state, places: state.places.map((other) => (other.id === id ? { ...place, favorite: !place.favorite } : other)) } };
};

const validDish = (dish) =>
  isObject(dish) &&
  isText(dish.id) &&
  isText(dish.name) &&
  (dish.price === null || (Number.isInteger(dish.price) && dish.price >= 0));

const cleanDish = (dish) => ({
  id: dish.id,
  name: dish.name.trim(),
  price: dish.price,
  star: dish.star === true,
  rating: cleanRating(dish.rating),
  note: text(dish.note),
});

const validPlace = (place) =>
  isObject(place) &&
  isText(place.id) &&
  isText(place.name) &&
  Array.isArray(place.dishes) &&
  place.dishes.every(validDish) &&
  new Set(place.dishes.map((dish) => dish.id)).size === place.dishes.length;

const cleanPlace = (place) => ({
  id: place.id,
  name: place.name.trim(),
  cuisine: cuisineOf(place.cuisine).id,
  area: text(place.area),
  tier: cleanTier(place.tier),
  location: cleanLocation(place.location),
  favorite: place.favorite === true,
  rating: cleanRating(place.rating),
  note: text(place.note),
  dishes: place.dishes.map(cleanDish),
  created: typeof place.created === 'string' ? place.created : new Date(0).toISOString(),
});

// A clean version 1 doc, or null. Add a migration here when the version goes up.
export const normalizePlaces = (data) => {
  if (!isObject(data) || data.version !== 1 || !Array.isArray(data.places)) return null;
  if (!data.places.every(validPlace)) return null;
  const places = data.places.map(cleanPlace);
  if (new Set(places.map((place) => place.id)).size !== places.length) return null;
  return { version: 1, places };
};
