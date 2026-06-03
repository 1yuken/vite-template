import Glide from '@glidejs/glide';
import '@glidejs/glide/dist/css/glide.core.min.css';

const GLIDE_OPTIONS = {
  type: 'slider',
  perView: 3,
  gap: 15,
  bound: true,
  breakpoints: {
    1024: { perView: 2.2, gap: 16 },
    768: { perView: 1.15, gap: 12 },
  },
};

export function initSlider() {
  document.querySelectorAll('.js-ui-slider').forEach((root) => {
    if (root.dataset.glideMounted === 'true') return;

    const glide = new Glide(root, GLIDE_OPTIONS);
    glide.mount();
    root.dataset.glideMounted = 'true';
  });
}
