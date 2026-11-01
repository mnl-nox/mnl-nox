(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.getElementById('themeColorMeta');
  const storedTheme = (() => { try { return localStorage.getItem('mnl-nox-theme'); } catch (_) { return null; } })();
  const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'light' ? '☾ <span>TEMA ESCURO</span>' : '☼ <span>TEMA CLARO</span>';
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
      themeToggle.setAttribute('title', theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
    }
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'light' ? '#f4f6f8' : '#090914');
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
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
        menuToggle.textContent = 'MENU +';
        menuToggle.focus();
      }
    });
  }


  const assistantToggle = document.getElementById('assistantToggle');
  const assistantPanel = document.getElementById('assistantPanel');
  const assistantClose = document.getElementById('assistantClose');
  const assistantMessage = document.getElementById('assistantMessage');
  const assistantReplies = {
    study: 'O caderno acompanha um estudo independente de Ciência da Computação: lógica, matemática, algoritmos, estruturas de dados, C, arquitetura, sistemas operacionais, redes, Web e segurança.',
    method: 'O método é baseado em primeiros princípios: estudar o conceito, formular uma hipótese, construir um experimento pequeno, observar o resultado, depurar e documentar. O avanço depende de prática verificável.',
    projects: 'Os projetos estão na seção Projetos e nos repositórios públicos do GitHub. CPU Reader, File Manager, BinLab e simpleBash funcionam como laboratórios para transformar estudo em implementação.'
  };
  const setAssistantOpen = (open) => {
    if (!assistantToggle || !assistantPanel) return;
    assistantPanel.hidden = !open;
    assistantToggle.setAttribute('aria-expanded', String(open));
    assistantToggle.setAttribute('aria-label', open ? 'Fechar guia interativo NOX' : 'Abrir guia interativo NOX');
    if (open && assistantClose) assistantClose.focus();
    if (!open) assistantToggle.focus();
  };
  if (assistantToggle && assistantPanel) {
    assistantToggle.addEventListener('click', () => setAssistantOpen(assistantPanel.hidden));
    if (assistantClose) assistantClose.addEventListener('click', () => setAssistantOpen(false));
    assistantPanel.querySelectorAll('[data-assistant-topic]').forEach(button => {
      button.addEventListener('click', () => {
        const topic = button.getAttribute('data-assistant-topic');
        if (assistantMessage && assistantReplies[topic]) assistantMessage.textContent = assistantReplies[topic];
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !assistantPanel.hidden) setAssistantOpen(false);
    });
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
