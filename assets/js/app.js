import { initTheme } from './modules/theme.js';
import { initNavigation } from './modules/navigation.js';
import { initAssistant } from './modules/assistant.js';
import { initReveal } from './modules/reveal.js';

initTheme();
initNavigation();
initAssistant();
initReveal();

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
