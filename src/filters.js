import { CUISINES } from '#cuisines';
import { distanceKm } from '#geo';
import { sortDishes } from '#dishes';

// The filters of places and dishes. The query is not stored; the views keep it.
export const DISTANCES = [1, 2, 5, 10];
export const DEFAULT_FILTERS = { tiers: [1, 4], km: null, favorites: false, cuisines: [], maxPrice: null };

const isTier = (value) => Number.isInteger(value) && value >= 1 && value <= 4;

const cleanTiers = (value) =>
  Array.isArray(value) && value.length === 2 && value.every(isTier)
    ? [...value].sort((a, b) => a - b)
    : [...DEFAULT_FILTERS.tiers];

const cleanCuisines = (value) =>
  Array.isArray(value) ? CUISINES.map((cuisine) => cuisine.id).filter((id) => value.includes(id)) : [];

// A clean filters object. Each bad field is its default.
export const normalizeFilters = (value) => {
  const source = typeof value === 'object' && value !== null ? value : {};
  return {
    tiers: cleanTiers(source.tiers),
    km: DISTANCES.includes(source.km) ? source.km : null,
    favorites: source.favorites === true,
    cuisines: cleanCuisines(source.cuisines),
    maxPrice: Number.isInteger(source.maxPrice) && source.maxPrice >= 0 ? source.maxPrice : null,
  };
};

// Lower case with no accents, for the search.
export const fold = (text) =>
  String(text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

const matchesQuery = (place, query, names) => {
  const needle = fold(query);
  if (!needle) return true;
  const fields = [place.name, place.area, names[place.cuisine] ?? place.cuisine, ...place.dishes.map((dish) => dish.name)];
  return fields.some((field) => fold(field).includes(needle));
};

const byId = (a, b) => (a.place.id < b.place.id ? -1 : a.place.id > b.place.id ? 1 : 0);

const byDistance = (a, b) => {
  if (a.km === null && b.km === null) return byId(a, b);
  if (a.km === null) return 1;
  if (b.km === null) return -1;
  return a.km - b.km || byId(a, b);
};

const byCreated = (a, b) => {
  if (a.place.created === b.place.created) return byId(a, b);
  return a.place.created < b.place.created ? 1 : -1;
};

// The places that pass the filters and the query, each with its distance in km (null when unknown).
export const visiblePlaces = (state, filters, { query = '', position = null, names = {} } = {}) => {
  const [minTier, maxTier] = filters.tiers;
  const rows = state.places
    .filter((place) => place.tier >= minTier && place.tier <= maxTier)
    .filter((place) => !filters.favorites || place.favorite)
    .filter((place) => filters.cuisines.length === 0 || filters.cuisines.includes(place.cuisine))
    .filter((place) => matchesQuery(place, query, names))
    .map((place) => ({ place, km: position && place.location ? distanceKm(position, place.location) : null }))
    .filter((row) => !position || filters.km === null || (row.km !== null && row.km <= filters.km));
  return rows.sort(position ? byDistance : byCreated);
};

// The dishes of the places that pass the filters, for the roulette.
export const candidateDishes = (state, filters, { position = null } = {}) =>
  visiblePlaces(state, filters, { position }).flatMap(({ place, km }) =>
    sortDishes(place.dishes)
      .filter((dish) => filters.maxPrice === null || (dish.price !== null && dish.price <= filters.maxPrice))
      .map((dish) => ({ place, dish, km })),
  );

// The distance chip, as a message and its marks (LOC-9). `fresh` is true with a fresh fix, and
// `reading` is `reading` during a read, `error` after a read that failed, else null. The chip is
// pressed exactly when the distance filters (PLC-18).
export const distanceChip = ({ km, fresh, reading }) => {
  if (reading === 'reading') return { key: 'filter.locating', params: {}, pressed: false, state: 'waiting' };
  const error = reading === 'error';
  if (km !== null && fresh) return { key: 'filter.within', params: { km }, pressed: true, state: error ? 'error' : null };
  if (error) return { key: 'filter.noPosition', params: {}, pressed: false, state: 'error' };
  if (km === null) return { key: 'filter.distance', params: {}, pressed: false, state: null };
  return { key: 'filter.waiting', params: { km }, pressed: false, state: 'waiting' };
};
