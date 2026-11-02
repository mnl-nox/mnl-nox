const STORAGE_KEY = 'mnl-nox-theme';

function readStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function getPreferredTheme() {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const themeColorMeta = document.getElementById('themeColorMeta');
  const apply = (theme) => {
    root.dataset.theme = theme;
    if (toggle) {
      const light = theme === 'light';
      toggle.innerHTML = light ? '☾ <span>TEMA ESCURO</span>' : '☼ <span>TEMA CLARO</span>';
      toggle.setAttribute('aria-label', light ? 'Ativar tema escuro' : 'Ativar tema claro');
      toggle.setAttribute('aria-pressed', String(light));
      toggle.title = light ? 'Ativar tema escuro' : 'Ativar tema claro';
    }
    themeColorMeta?.setAttribute('content', theme === 'light' ? '#f4f6f8' : '#090914');
  };

  apply(readStoredTheme() ?? getPreferredTheme());
  toggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    apply(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* Storage may be unavailable. */ }
  });
}
