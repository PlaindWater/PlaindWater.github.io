/**
 * theme.js — 三态主题（跟随系统 / 浅色 / 深色）
 */

const STORAGE_KEY = 'blog:theme';
const ORDER = ['auto', 'light', 'dark'];
const media = window.matchMedia('(prefers-color-scheme: dark)');

let current = 'auto';
let listeners = [];

export function initTheme(onChange) {
  const stored = localStorage.getItem(STORAGE_KEY);
  current = ORDER.includes(stored) ? stored : 'auto';
  if (onChange) listeners.push(onChange);

  media.addEventListener('change', () => {
    if (current === 'auto') apply();
  });

  apply();
}

function resolve(theme) {
  return theme === 'auto' ? (media.matches ? 'dark' : 'light') : theme;
}

function apply() {
  const resolved = resolve(current);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = resolved === 'dark' ? '#12131a' : '#fbfbfd';
  listeners.forEach((fn) => fn(current, resolved));
}

export function getTheme() {
  return current;
}

export function cycleTheme() {
  current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  localStorage.setItem(STORAGE_KEY, current);
  apply();
  return current;
}
