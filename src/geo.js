// Locations: the check, the read of a pasted Google Maps link, distances and the route link.
export const FIX_MS = 600000;
const EARTH_KM = 6371;
const NUM = '(-?\\d+(?:\\.\\d+)?)';

export const isLocation = (value) =>
  typeof value === 'object' && value !== null &&
  Number.isFinite(value.lat) && value.lat >= -90 && value.lat <= 90 &&
  Number.isFinite(value.lng) && value.lng >= -180 && value.lng <= 180;

const INVALID = { error: { key: 'error.locationInvalid' } };
const SHORT_LINK = /(?:^|[/.])maps\.app\.goo\.gl\/|(?:^|[/.])goo\.gl\/maps/i;
const MAP_HOST = /(?:^|\.)google\.[a-z.]+$/i;
const PATTERNS = [
  new RegExp(`!3d${NUM}!4d${NUM}`),
  new RegExp(`[?&](?:q|query|ll)=${NUM}\\s*,\\s*${NUM}`),
  new RegExp(`@${NUM},${NUM}`),
];
const BARE_PAIR = new RegExp(`^${NUM}\\s*,\\s*${NUM}$`);

const decode = (text) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text.replace(/%2C/gi, ',');
  }
};

const isMapUrl = (text) => {
  try {
    const { hostname, pathname } = new URL(text);
    return MAP_HOST.test(hostname) && (hostname.startsWith('maps.') || pathname.startsWith('/maps'));
  } catch {
    return false;
  }
};

const result = (lat, lng) => {
  const location = { lat: Number(lat), lng: Number(lng) };
  return isLocation(location) ? { location } : INVALID;
};

// `{ location }` for a Google Maps URL or a bare "lat, lng" pair, else `{ error }`.
export const parseLocation = (text) => {
  if (typeof text !== 'string') return INVALID;
  const trimmed = text.trim();
  if (SHORT_LINK.test(trimmed)) return { error: { key: 'error.shortLink' } };
  const bare = BARE_PAIR.exec(trimmed);
  if (bare) return result(bare[1], bare[2]);
  if (!isMapUrl(trimmed)) return INVALID;
  const decoded = decode(trimmed);
  for (const pattern of PATTERNS) {
    const match = pattern.exec(decoded);
    if (match) return result(match[1], match[2]);
  }
  return INVALID;
};

const radians = (degrees) => (degrees * Math.PI) / 180;

// Haversine distance in km.
export const distanceKm = (a, b) => {
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
};

export const routeUrl = ({ lat, lng }) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

// A fix is `{ location, at }` with `at` in ms.
export const freshFix = (fix, now) => Boolean(fix) && now - fix.at < FIX_MS;

// Below 1 km: metres rounded to 50, at least 50. Else km with one decimal.
export const distanceLabel = (km) => {
  if (km < 1) return { key: 'distance.m', params: { m: Math.max(50, Math.round((km * 1000) / 50) * 50) } };
  return { key: 'distance.km', params: { km: Math.round(km * 10) / 10 } };
};
