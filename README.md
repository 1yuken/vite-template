# vite-template

Стартовый шаблон статических страниц: **Vite 6**, **Pug** (MPA), **Sass**, **PostCSS**. 

## Стек

- **HTML** — Pug (`src/pages/*.pug`), общий layout в `src/templates/`.
- **Стили** — Sass (`@use` / `@forward`), общие стили в `src/sass/`.
- **JS** — ESM, точка входа `src/js/app.js` (иконки, стили, **jQuery**, свой код). Общий UI — `src/js/ui.js`, глобально доступны `$` и `jQuery`.
- **Иконки** — `src/icons/*.svg` → спрайт через `vite-plugin-svg-icons` (цвет через CSS, `fill: currentColor`).
- **Картинки и шрифты** — `src/img/`, `src/fonts/` копируются в `dist/img`, `dist/fonts` при сборке.
- **Качество кода** — ESLint (flat config), Stylelint для SCSS, `.editorconfig`.

## Скрипты


| Команда               | Назначение                                          |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | Dev-сервер, правки в браузере без записи в `dist`.  |
| `npm run build`       | Production в папку `dist/`.                         |
| `npm run build:watch` | Сборка в `dist` при каждом сохранении файлов.       |
| `npm run preview`     | Просмотр собранного `dist` локально.                |
| `npm run format`      | Prettier по проекту (Pug и indented Sass в ignore). |
| `npm run lint`        | ESLint (JS) + Stylelint (SCSS). |
| `npm run lint:js`     | Только `src/**/*.js`. |
| `npm run lint:scss`   | Только `src/**/*.scss` (файлы `.sass` — вне Stylelint). |


## Структура (важное)

- `src/pages/` — страницы сайта; URL вида `/имя.html` → файл `имя.pug`.
- `src/index.yaml` — список страниц для dev-хаба (`ProjectTitle`, `PageList[].file`).
- `src/index.pug` — минимальная точка входа хаба (требование плагина Pug); разметка хаба в `src/templates/dev-hub/index.pug`.
- `public/` — статика как есть (корень сайта).

После `npm run build` HTML страниц лежит в `**dist/*.html`**, ассеты — `**dist/css/app.css`**, `**dist/js/app.js**`, `**dist/img/**`, `**dist/fonts/**`.

## Зависимости

Установка: `npm install`.