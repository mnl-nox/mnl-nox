import { initTheme } from './modules/theme.js';
import { initNavigation } from './modules/navigation.js';
import { initReveal } from './modules/reveal.js';

initTheme();
initNavigation();
initReveal();

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
