import Glide from '@glidejs/glide';
import '@glidejs/glide/dist/css/glide.core.min.css';

const DEFAULT_BREAKPOINTS = {
  1024: { perView: 2.2, gap: 16 },
  768: { perView: 1.15, gap: 12 },
};

function readGlideOptions(root) {
  const options = {
    type: 'slider',
    perView: 3,
    gap: 15,
    bound: true,
    breakpoints: { ...DEFAULT_BREAKPOINTS },
  };

  if (root.dataset.perView) {
    options.perView = parseFloat(root.dataset.perView, 10);
  }
  if (root.dataset.gap) {
    options.gap = parseInt(root.dataset.gap, 10);
  }
  if (root.dataset.breakpoints) {
    try {
      options.breakpoints = JSON.parse(root.dataset.breakpoints);
    } catch {
      // оставляем дефолтные breakpoints
    }
  }

  return options;
}

/** Инициализация всех `.js-ui-slider` на странице */
export function initSlider() {
  document.querySelectorAll('.js-ui-slider').forEach((root) => {
    if (root.dataset.glideMounted === 'true') return;

    const glide = new Glide(root, readGlideOptions(root));
    glide.mount();
    root.dataset.glideMounted = 'true';
  });
}
