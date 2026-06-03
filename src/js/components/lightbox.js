import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';

const LIGHTBOX_SELECTOR = '[data-gallery], [data-glightbox]';

let lightboxInstance = null;

export function initLightbox() {
  if (!document.querySelector(LIGHTBOX_SELECTOR)) return;
  if (lightboxInstance) return;

  lightboxInstance = GLightbox({
    selector: LIGHTBOX_SELECTOR,
    touchNavigation: true,
    loop: true,
  });
}
