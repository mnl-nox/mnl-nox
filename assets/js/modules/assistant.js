const responses = Object.freeze({
  study: 'O caderno acompanha um estudo independente de Ciência da Computação: lógica, matemática, algoritmos, estruturas de dados, C, arquitetura, sistemas operacionais, redes, Web e segurança.',
  method: 'O método é baseado em primeiros princípios: estudar o conceito, formular uma hipótese, construir um experimento pequeno, observar o resultado, depurar e documentar. O avanço depende de prática verificável.',
  projects: 'Os projetos estão na seção Projetos e nos repositórios públicos do GitHub. CPU Reader, File Manager, BinLab e simpleBash funcionam como laboratórios para transformar estudo em implementação.'
});

export function initAssistant() {
  const toggle = document.getElementById('assistantToggle');
  const panel = document.getElementById('assistantPanel');
  const close = document.getElementById('assistantClose');
  const message = document.getElementById('assistantMessage');
  if (!toggle || !panel || !message) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar guia interativo NOX' : 'Abrir guia interativo NOX');
    if (open) close?.focus();
    else toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close?.addEventListener('click', () => setOpen(false));
  panel.querySelectorAll('[data-assistant-topic]').forEach(button => {
    button.addEventListener('click', () => {
      const response = responses[button.dataset.assistantTopic];
      if (response) message.textContent = response;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
}
