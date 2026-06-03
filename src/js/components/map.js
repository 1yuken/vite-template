const MAP_SCRIPT_ID = 'yandex-maps-api';
const MAP_NODE_ID = 'map';
const DEFAULT_COORDS = [44.977338, 34.106983];
const DESKTOP_MQ = '(min-width: 1024px)';

const MARKER_ICON_FALLBACK = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="#8E7CFF"/><circle cx="25" cy="25" r="8" fill="#fff"/></svg>',
)}`;

function resolveMarkerIcon() {
  return new Promise((resolve) => {
    const base = import.meta.env.BASE_URL || './';
    const href = `${base}img/map-icon.png`.replace(/([^:]\/)\/+/g, '$1');
    const img = new Image();
    img.onload = () => resolve(href);
    img.onerror = () => resolve(MARKER_ICON_FALLBACK);
    img.src = href;
  });
}

function loadYandexMaps() {
  return new Promise((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(resolve);
      return;
    }

    const existing = document.getElementById(MAP_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => window.ymaps.ready(resolve));
      existing.addEventListener('error', reject);
      return;
    }

    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
    const keyQuery = apiKey ? `apikey=${encodeURIComponent(apiKey)}&` : '';

    const script = document.createElement('script');
    script.id = MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://api-maps.yandex.ru/2.1/?${keyQuery}lang=ru_RU`;
    script.onload = () => window.ymaps.ready(resolve);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function shiftMapCenter(map) {
  const center = map.getGlobalPixelCenter();
  map.setGlobalPixelCenter([center[0] + 15, center[1] + 170]);

  if (window.matchMedia(DESKTOP_MQ).matches) {
    map.setGlobalPixelCenter([center[0] - 100, center[1] - 20]);
  }
}

function setupMapOverlay(mapNode, map) {
  const wrapper = mapNode.parentElement;
  if (!wrapper) return;

  const overlay = document.createElement('div');
  overlay.className = 'map__overlay';
  wrapper.appendChild(overlay);

  let isActive = false;

  const enableMap = () => {
    overlay.style.display = 'none';
    isActive = true;
  };

  const disableMap = () => {
    overlay.style.display = 'block';
    isActive = false;
  };

  overlay.addEventListener('click', (e) => {
    e.stopPropagation();
    enableMap();
  });

  const deactivate = () => {
    if (isActive) disableMap();
  };

  map.events.add('click', deactivate);
  map.events.add('tap', deactivate);
}

/** Инициализация Яндекс.Карты в `#map` */
export function initMap() {
  const mapNode = document.getElementById(MAP_NODE_ID);
  if (!mapNode) return;

  Promise.all([loadYandexMaps(), resolveMarkerIcon()])
    .then(([, iconHref]) => {
      const coords = DEFAULT_COORDS;

      const map = new window.ymaps.Map(MAP_NODE_ID, {
        center: coords,
        zoom: 15,
        controls: [],
      });

      map.geoObjects.add(
        new window.ymaps.Placemark(
          coords,
          {},
          {
            iconLayout: 'default#image',
            iconImageHref: iconHref,
            iconImageSize: [50, 50],
            iconImageOffset: [-25, -25],
          },
        ),
      );

      map.behaviors.enable(['drag', 'scrollZoom', 'multiTouch', 'dblClickZoom']);

      setupMapOverlay(mapNode, map);
      shiftMapCenter(map);
    })
    .catch(() => {
      // API не загрузился — блок остаётся пустым
    });
}
