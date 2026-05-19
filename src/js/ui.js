import $ from 'jquery';
import { initDropdown } from '@/js/components/dropdown.js';

/** Общие UI-скрипты: подключаются на всех страницах с layout */
export function initUi() {
  $('.js-example-toggle').on('click', function () {
    $(this).siblings('.js-example-panel').slideToggle(200);
  });

  initDropdown();
}
