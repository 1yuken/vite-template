import fs from 'node:fs';
import path from 'node:path';

/**
 * После сборки: dist/<page>/index.html → dist/<page>.html (как в старом Gulp build).
 * Пути ../js/, ../css/, ../fonts/, ../img/, ../assets/ → ./… (файл в корне dist).
 * В dev: запрос /about.html проксируется на /about/index.html для плагина Pug.
 */
export function flatPagesHtml() {
  let outDirAbs = '';

  return {
    name: 'flat-pages-html',
    enforce: 'pre',
    configResolved(config) {
      const o = config.build.outDir;
      outDirAbs = path.isAbsolute(o) ? o : path.resolve(config.root, o);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url || '/';
        const pathname = raw.split('?')[0];
        const m = pathname.match(/^\/([^/]+)\.html$/);
        if (m && m[1] !== 'index') {
          const q = raw.includes('?') ? raw.slice(raw.indexOf('?')) : '';
          req.url = `/${m[1]}/index.html${q}`;
        }
        next();
      });
    },
    closeBundle() {
      if (!outDirAbs || !fs.existsSync(outDirAbs)) return;

      const entries = fs.readdirSync(outDirAbs, { withFileTypes: true });
      for (const ent of entries) {
        if (!ent.isDirectory() || ent.name === 'assets') continue;
        const dirPath = path.join(outDirAbs, ent.name);
        const indexPath = path.join(dirPath, 'index.html');
        if (!fs.existsSync(indexPath)) continue;

        let html = fs.readFileSync(indexPath, 'utf8');
        // HTML был в dist/<page>/index.html — пути с ../. После переноса в dist/<page>.html нужен ./.
        html = html.replace(/\.\.\/(js|css|fonts|img|assets)\//g, './$1/');
        const flatPath = path.join(outDirAbs, `${ent.name}.html`);
        fs.writeFileSync(flatPath, html, 'utf8');
        fs.unlinkSync(indexPath);
        fs.rmdirSync(dirPath);
      }

      normalizeDistAppJs(outDirAbs);
    },
  };
}

/** Rollup при нескольких HTML с одним entry может назвать файл app2.js / app4.js — оставляем js/app.js как в старом шаблоне. */
function normalizeDistAppJs(outDir) {
  const jsDir = path.join(outDir, 'js');
  if (!fs.existsSync(jsDir)) return;

  const numbered = fs.readdirSync(jsDir).filter((f) => /^app\d+\.js$/.test(f));
  const appPath = path.join(jsDir, 'app.js');
  const hasApp = fs.existsSync(appPath);

  if (numbered.length === 1 && !hasApp) {
    fs.renameSync(path.join(jsDir, numbered[0]), appPath);
  } else if (numbered.length >= 1 && hasApp) {
    for (const f of numbered) fs.unlinkSync(path.join(jsDir, f));
  }

  function patchHtml(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    const next = html
      .replace(/\.\/js\/app\d+\.js/g, './js/app.js')
      .replace(/\.\.\/js\/app\d+\.js/g, '../js/app.js');
    if (next !== html) fs.writeFileSync(filePath, next, 'utf8');
  }

  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith('.html')) patchHtml(p);
    }
  }
  walk(outDir);
}
