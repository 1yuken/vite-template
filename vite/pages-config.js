import fs from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

/** Страницы из `src/pages/*.pug` → `/имя.html` */
export function discoverPagesFromDir(pagesDir) {
  if (!fs.existsSync(pagesDir)) return [];

  return fs
    .readdirSync(pagesDir)
    .filter((name) => name.endsWith('.pug') && !name.startsWith('_'))
    .map((name) => ({
      file: `/${name.replace(/\.pug$/, '')}.html`,
      ready: 50,
    }))
    .sort((a, b) => a.file.localeCompare(b.file, 'ru'));
}

/** `index.yaml` + автодобавление страниц из `src/pages/` */
export function readPagesConfig(projectRoot) {
  const yamlPath = resolve(projectRoot, 'src/index.yaml');
  const pagesDir = resolve(projectRoot, 'src/pages');

  let config = { ProjectTitle: 'Pages', PageList: [] };
  if (fs.existsSync(yamlPath)) {
    config = parseYaml(fs.readFileSync(yamlPath, 'utf8')) || config;
  }

  const discovered = discoverPagesFromDir(pagesDir);
  const list = Array.isArray(config.PageList) ? [...config.PageList] : [];
  const known = new Set(list.map((item) => item.file));

  for (const page of discovered) {
    if (!known.has(page.file)) {
      list.push(page);
      known.add(page.file);
    }
  }

  return { ...config, PageList: list };
}

export function createPagesLocals(projectRoot, env = {}) {
  const state = {
    pages: readPagesConfig(projectRoot),
    siteName: env.VITE_SITE_NAME || readPagesConfig(projectRoot).ProjectTitle || 'Site',
  };

  return {
    locals: state,
    refresh() {
      state.pages = readPagesConfig(projectRoot);
      state.siteName =
        env.VITE_SITE_NAME || state.pages.ProjectTitle || 'Site';
    },
  };
}

/** В dev перечитывает список при изменении `index.yaml` или `src/pages/*.pug` */
export function pagesListReloadPlugin(refresh) {
  return {
    name: 'pages-list-reload',
    configureServer(server) {
      const onFsChange = (file) => {
        const normalized = file.replace(/\\/g, '/');
        if (
          normalized.endsWith('/src/index.yaml') ||
          /\/src\/pages\/[^/]+\.pug$/.test(normalized)
        ) {
          refresh();
          server.ws.send({ type: 'full-reload', path: '*' });
        }
      };

      server.watcher.on('add', onFsChange);
      server.watcher.on('unlink', onFsChange);
      server.watcher.on('change', onFsChange);
    },
  };
}
