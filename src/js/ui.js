import $ from 'jquery';
import { initDropdown } from '@/js/components/dropdown.js';
import { initFaq } from '@/js/components/faq.js';
import { initSlider } from '@/js/components/slider.js';
import { initLightbox } from '@/js/components/lightbox.js';
import { initCookies } from '@/js/components/cookies.js';

/** Общие UI-скрипты: подключаются на всех страницах с layout */
export function initUi() {
  initHeaderMenu();

  $('.js-example-toggle').on('click', function () {
    $(this).siblings('.js-example-panel').slideToggle(200);
  });

  initDropdown();
  initFaq();
  initSlider();
  initLightbox();
  initCookies();
}

function initHeaderMenu() {
  const burger = document.getElementById('menuToggleBtn');
  const header = document.querySelector('header.header');
  const outHeroBg = document.querySelector('.out--hero-bg');
  const { body } = document;

  if (!burger || !header) return;

  const checkbox = burger.querySelector("input[type='checkbox']");
  if (!checkbox) return;

  const syncHeaderHeightVar = () => {
    if (!outHeroBg) return;
    outHeroBg.style.setProperty('--header-h', `${header.offsetHeight}px`);
  };

  const updateMenuState = () => {
    const isOpen = checkbox.checked;
    header.classList.toggle('header--menu-open', isOpen);
    body.classList.toggle('lock', isOpen);

    if (isOpen) {
      header.classList.add('header--animation-disabled');
    }

    syncHeaderHeightVar();
  };

  checkbox.addEventListener('change', updateMenuState);
  window.addEventListener('resize', syncHeaderHeightVar);
  syncHeaderHeightVar();

  document.querySelectorAll('.header__menu-item a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!checkbox.checked) return;
      checkbox.checked = false;
      updateMenuState();
    });
  });

  const updateHeaderScrolledState = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', updateHeaderScrolledState, { passive: true });
  updateHeaderScrolledState();
}
