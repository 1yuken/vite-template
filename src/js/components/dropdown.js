import $ from 'jquery';

function closeAll($except) {
  $('.js-dropdown.is-open').not($except).each(function () {
    const $root = $(this);
    $root.removeClass('is-open');
    $root.find('.js-dropdown-toggle').attr('aria-expanded', 'false');
  });
}

export function initDropdown() {
  const $roots = $('.js-dropdown');
  if (!$roots.length) return;

  $roots.on('click', '.js-dropdown-toggle', function (event) {
    event.preventDefault();
    event.stopPropagation();

    const $root = $(this).closest('.js-dropdown');
    const isOpen = $root.hasClass('is-open');

    closeAll();
    if (!isOpen) {
      $root.addClass('is-open');
      $(this).attr('aria-expanded', 'true');
    }
  });

  $roots.on('click', '.js-dropdown-link', function () {
    closeAll();
  });

  $(document).on('click.dropdown', (event) => {
    if (!$(event.target).closest('.js-dropdown').length) {
      closeAll();
    }
  });

  $(document).on('keydown.dropdown', (event) => {
    if (event.key === 'Escape') {
      closeAll();
    }
  });
}
