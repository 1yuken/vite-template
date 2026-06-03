function setFaqState(item, open) {
  const button = item.querySelector('.faq__question');
  const answer = item.querySelector('.faq__answer');
  if (!button || !answer) return;

  item.classList.toggle('is-open', open);
  button.setAttribute('aria-expanded', String(open));
  answer.style.maxHeight = open ? `${answer.scrollHeight}px` : '0px';
}

export function initFaq() {
  const faqItems = document.querySelectorAll('.faq__item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq__question');
    if (!button) return;

    setFaqState(item, item.classList.contains('is-open'));

    button.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      faqItems.forEach((other) => setFaqState(other, false));
      setFaqState(item, willOpen);
    });
  });

  window.addEventListener('resize', () => {
    faqItems.forEach((item) => {
      if (!item.classList.contains('is-open')) return;
      const answer = item.querySelector('.faq__answer');
      if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
    });
  });
}
