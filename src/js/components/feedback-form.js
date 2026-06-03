/** Формы `.js-feedback-form`: отправка и экран «Спасибо» */
export function initFeedbackForm() {
  document.querySelectorAll('.js-feedback-form').forEach((root) => {
    const form = root.querySelector('.feedback-form__form');
    const closeBtn = root.querySelector('[data-feedback-success-close]');

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      root.classList.add('feedback-form__inner--success');
    });

    closeBtn?.addEventListener('click', () => {
      root.classList.remove('feedback-form__inner--success');
      form?.reset();
    });
  });
}
