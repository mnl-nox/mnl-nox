(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.getElementById('themeColorMeta');
  const storedTheme = (() => { try { return localStorage.getItem('mnl-nox-theme'); } catch (_) { return null; } })();
  const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.textContent = theme === 'light' ? 'TEMA: CLARO' : 'TEMA: ESCURO';
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    }
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'light' ? '#f4f6f8' : '#08090b');
  };
  applyTheme(storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', (event) => {
      event.preventDefault();
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('mnl-nox-theme', next); } catch (_) {}
    });
  }

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
      menuToggle.textContent = open ? 'FECHAR −' : 'MENU +';
    });
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
      menuToggle.textContent = 'MENU +';
    }));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('visible'));
  }
})();
