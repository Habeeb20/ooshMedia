let isLoaded = false;
let isLoading = false;
const callbacks = [];

export const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (isLoaded || window.google) {
      isLoaded = true;
      return resolve();
    }

    // Currently loading — queue the callback
    if (isLoading) {
      callbacks.push({ resolve, reject });
      return;
    }

    isLoading = true;
    callbacks.push({ resolve, reject });

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      callbacks.forEach((cb) => cb.resolve());
      callbacks.length = 0;
    };

    script.onerror = (err) => {
      isLoading = false;
      callbacks.forEach((cb) => cb.reject(err));
      callbacks.length = 0;
    };

    document.head.appendChild(script);
  });
};