const STORAGE_KEY = 'cookiesAccepted';

/** Баннер cookies: показ до принятия, сохранение в localStorage */
export function initCookies() {
  const banner = document.querySelector('.cookies');
  const acceptBtn = document.querySelector('[data-cookie-accept]');

  if (!banner) return;

  const isAccepted = localStorage.getItem(STORAGE_KEY) === '1';
  if (!isAccepted) {
    banner.classList.remove('cookies--hidden');
  }

  if (!acceptBtn) return;

  acceptBtn.addEventListener('click', () => {
    banner.classList.add('cookies--hidden');
    localStorage.setItem(STORAGE_KEY, '1');
  });
}
