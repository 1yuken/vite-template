import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import fs from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { viteConvertPugInHtml } from '@mish.dev/vite-convert-pug-in-html';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import viteImagemin from 'vite-plugin-imagemin';
import { flatPagesHtml } from './vite/flat-pages-html.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readPageList() {
  const file = resolve(__dirname, 'src/index.yaml');
  if (!fs.existsSync(file)) {
    return { ProjectTitle: 'Pages', PageList: [] };
  }
  return parseYaml(fs.readFileSync(file, 'utf8'));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const pages = readPageList();

  return {
    root: resolve(__dirname, 'src'),
    publicDir: resolve(__dirname, 'public'),
    base: './',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      postcss: resolve(__dirname, 'postcss.config.js'),
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api'],
          loadPaths: [resolve(__dirname, 'src/sass')],
        },
        sass: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api'],
          loadPaths: [resolve(__dirname, 'src/sass')],
        },
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false,
    },
    preview: {
      host: true,
      port: 4173,
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          // Как в старом Gulp: build/css/app.css, build/js/app.js, build/fonts/…
          entryFileNames: 'js/app.js',
          chunkFileNames: 'js/[name].js',
          assetFileNames(assetInfo) {
            const names = assetInfo.names || [];
            const base = names[0] || '';
            if (base.endsWith('.css')) return 'css/app.css';
            if (/\.(woff2?|ttf|otf|eot)$/i.test(base)) return 'fonts/[name][extname]';
            if (/\.(png|jpe?g|gif|webp|svg)$/i.test(base)) return 'img/[name][extname]';
            return 'assets/[name][extname]';
          },
        },
      },
    },
    plugins: [
      flatPagesHtml(),
      viteConvertPugInHtml({
        locals: {
          pages,
          siteName: env.VITE_SITE_NAME || pages.ProjectTitle || 'Site',
        },
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve(__dirname, 'src/icons')],
        symbolId: 'icon-[name]',
        inject: 'body-last',
        // Как в старом gulp sprite-svg: убрать fill/stroke из SVG → цвет из CSS (.icon { fill: currentColor }).
        svgoOptions: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
            {
              name: 'removeAttrs',
              params: {
                attrs: '(fill|stroke)',
              },
            },
          ],
        },
      }),
      viteStaticCopy({
        silent: true,
        targets: [
          // Пути относительно Vite root (папка src), не корень репозитория
          { src: 'img/**/*', dest: 'img' },
          { src: 'fonts/**/*', dest: 'fonts' },
        ],
      }),
      mode === 'production' &&
        viteImagemin({
          gifsicle: false,
          optipng: { optimizationLevel: 7 },
          mozjpeg: { quality: 82 },
          pngquant: { quality: [0.8, 0.9], speed: 4 },
          svgo: {
            plugins: [{ name: 'removeViewBox', active: false }],
          },
        }),
    ].filter(Boolean),
  };
});
