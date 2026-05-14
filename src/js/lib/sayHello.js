export function sayHello() {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('%c[Vite]', 'color:#646cff;font-weight:bold', 'shablon-new dev');
  }
}
