import fs from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { render } from 'pug';
import { globSync } from 'glob';
import { normalizePath } from 'vite';

/**
 * В dev плагин @mish.dev/vite-convert-pug-in-html регистрирует страницы только при старте Vite.
 * Этот middleware каждый раз читает `src/pages/*.pug` и отдаёт HTML без перезапуска сервера.
 */
export function dynamicPugPagesDev(getLocals = () => ({})) {
  let viteConfig;
  /** @type {Map<string, string>} */
  let routes = new Map();

  const pugAliasResolver = (filename, source) => {
    const aliases = viteConfig?.resolve?.alias ?? [];
    for (const alias of aliases) {
      const find =
        typeof alias.find === 'string' ? new RegExp(`^${alias.find}`) : alias.find;
      if (find.test(filename)) {
        const aliasedPath = filename.replace(find, alias.replacement);
        if (fs.existsSync(aliasedPath)) return aliasedPath;
        if (fs.existsSync(`${aliasedPath}.pug`)) return `${aliasedPath}.pug`;
      }
    }
    if (source) {
      const resolvedPath = resolve(dirname(source), filename);
      if (fs.existsSync(resolvedPath)) return resolvedPath;
      if (extname(resolvedPath) !== '.pug' && fs.existsSync(`${resolvedPath}.pug`)) {
        return `${resolvedPath}.pug`;
      }
    }
    return filename;
  };

  function rebuildRoutes() {
    const root = normalizePath(viteConfig.root);
    routes = new Map();

    const pageFiles = globSync(`${root}/pages/**/*.pug`, {
      ignore: [`${root}/**/_*.pug`],
      absolute: true,
    });

    for (const pugPath of pageFiles) {
      let entryKey = normalizePath(relative(root, pugPath)).slice(0, -'.pug'.length);
      if (entryKey.startsWith('pages/')) {
        entryKey = entryKey.substring('pages/'.length);
      }
      if (entryKey !== 'index' && !entryKey.endsWith('/index')) {
        entryKey = `${entryKey}/index`;
      }
      routes.set(normalizePath(resolve(root, `${entryKey}.html`)), pugPath);
    }

    const indexPug = resolve(root, 'index.pug');
    if (fs.existsSync(indexPug)) {
      routes.set(normalizePath(resolve(root, 'index.html')), indexPug);
    }
  }

  function renderPug(pugPath) {
    const dependencies = new Set();
    const dependencyTrackingPlugin = {
      lex(tokens) {
        if (!Array.isArray(tokens)) return tokens;
        for (const token of tokens) {
          if ((token.type === 'include' || token.type === 'extends') && token.file?.path) {
            const depPath = pugAliasResolver(token.file.path, pugPath);
            if (fs.existsSync(depPath)) {
              dependencies.add(normalizePath(depPath));
            }
          }
        }
        return tokens;
      },
    };

    const html = render(fs.readFileSync(pugPath, 'utf8'), {
      filename: pugPath,
      basedir: viteConfig.root,
      pretty: true,
      ...getLocals(),
      plugins: [{ resolve: pugAliasResolver }, dependencyTrackingPlugin],
    });

    return { html, dependencies };
  }

  function resolvePugPath(requestPath) {
    let cleanPath = requestPath.slice(1);
    if (!cleanPath || requestPath.endsWith('/')) {
      cleanPath = cleanPath ? `${cleanPath}index.html` : 'index.html';
    }

    let potentialHtmlPath = resolve(
      viteConfig.root,
      cleanPath.endsWith('.html') ? cleanPath : `${cleanPath}/index.html`,
    );
    let pugPath = routes.get(normalizePath(potentialHtmlPath));

    if (!pugPath && !cleanPath.endsWith('.html')) {
      potentialHtmlPath = resolve(viteConfig.root, `${cleanPath}.html`);
      pugPath = routes.get(normalizePath(potentialHtmlPath));
    }

    return pugPath;
  }

  return {
    name: 'dynamic-pug-pages-dev',
    apply: 'serve',
    configResolved(config) {
      viteConfig = config;
      rebuildRoutes();
    },
    configureServer(server) {
      const refresh = () => rebuildRoutes();
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '/';
        const requestPath = url.split('?')[0];
        if (requestPath.includes('.') && !requestPath.endsWith('.html')) {
          return next();
        }

        const pugPath = resolvePugPath(requestPath);
        if (!pugPath) return next();

        try {
          const { html, dependencies } = renderPug(pugPath);
          for (const dep of dependencies) {
            server.watcher.add(dep);
          }
          const transformedHtml = await server.transformIndexHtml(url, html, req.originalUrl);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(transformedHtml);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}
