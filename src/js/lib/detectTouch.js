export function detectTouch() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
