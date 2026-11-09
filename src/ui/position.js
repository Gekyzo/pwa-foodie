import { freshFix } from '#geo';
import { fix, setFix } from '#ui/context';

// The position of the phone, read through the Geolocation API (LOC-7).
const OPTIONS = { timeout: 10000, maximumAge: 60000 };
// The code of GeolocationPositionError when the user or the browser refuses.
const DENIED = 1;

const failure = (key) => ({ error: { key } });

// One read. A read that works replaces the fix.
export const readPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(failure('error.positionUnavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { lat: coords.latitude, lng: coords.longitude };
        setFix({ location, at: Date.now() });
        resolve({ location });
      },
      (error) => resolve(failure(error?.code === DENIED ? 'error.positionDenied' : 'error.positionUnavailable')),
      OPTIONS,
    );
  });

// The fix while it is fresh (LOC-5), else null.
export const currentFix = () => (freshFix(fix, Date.now()) ? fix : null);

// A read with no prompt: only when the permission is already granted. A failure changes nothing.
export const silentFix = async () => {
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    if (status.state === 'granted') await readPosition();
  } catch {
    // No Permissions API, or no answer: the fix stays as it is.
  }
};
