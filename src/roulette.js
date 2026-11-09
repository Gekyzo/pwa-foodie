import { visiblePlaces, candidateDishes } from '#filters';
import { cuisineOf } from '#cuisines';

// The rules of the roulette: what can come up, the draw and the angle of the stop.
export const MAX_SEGMENTS = 12;
export const SPIN_MS = 4000;
export const MODES = ['places', 'dishes'];

// The items of the wheel for a mode. An unknown mode is `places`. Places ignore the price cap.
export const candidates = (state, filters, mode, { position = null } = {}) =>
  mode === 'dishes'
    ? candidateDishes(state, filters, { position }).map(({ place, dish }) => ({
        id: dish.id,
        kind: 'dish',
        placeId: place.id,
        label: `${dish.name} · ${place.name}`,
        emoji: cuisineOf(place.cuisine).emoji,
      }))
    : visiblePlaces(state, filters, { position }).map(({ place }) => ({
        id: place.id,
        kind: 'place',
        placeId: place.id,
        label: place.name,
        emoji: cuisineOf(place.cuisine).emoji,
      }));

// A Fisher-Yates shuffle of a copy.
const shuffled = (items, random) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// The wheel: the segments, the count of candidates before sampling, and the index of the winner.
// The item `exclude` is dropped from 3 candidates up.
export const drawWheel = (items, { random = Math.random, exclude = null } = {}) => {
  const pool = items.length >= 3 && exclude !== null ? items.filter((item) => item.id !== exclude) : [...items];
  if (pool.length === 0) return { segments: [], total: 0, winner: null };
  if (pool.length === 1) return { segments: pool, total: 1, winner: 0 };
  const segments = pool.length > MAX_SEGMENTS ? shuffled(pool, random).slice(0, MAX_SEGMENTS) : pool;
  return { segments, total: pool.length, winner: Math.floor(random() * segments.length) };
};

// The turn in degrees that stops the pointer, at the top, inside segment `winner`.
export const landingAngle = (winner, count, { turns = 4, random = Math.random } = {}) => {
  const size = 360 / count;
  const jitter = (random() - 0.5) * 0.6 * size;
  return turns * 360 + (360 - (winner + 0.5) * size) + jitter;
};
