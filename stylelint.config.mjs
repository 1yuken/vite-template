/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['**/node_modules/**', 'dist/**', '**/*.sass'],
  rules: {
    'selector-class-pattern': null,
    'scss/at-import-partial-extension': null,
    'scss/load-no-partial-leading-underscore': null,
    'value-keyword-case': [
      'lower',
      {
        ignoreKeywords: ['currentColor'],
      },
    ],
  },
};
