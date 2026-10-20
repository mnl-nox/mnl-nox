/*
 * Google Analytics 4 bootstrap.
 * Set MEASUREMENT_ID to your own GA4 web stream ID (format: G-XXXXXXXXXX).
 * No analytics requests are made while this value is empty.
 * Configure GA4 Enhanced Measurement to collect outbound link clicks.
 */
(() => {
  const MEASUREMENT_ID = '';
  if (!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) return;
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.href.startsWith('javascript:')) return;
    const url = new URL(link.href, window.location.href);
    const linkType = url.origin !== window.location.origin ? 'external' : 'internal';
    const linkText = (link.innerText || link.getAttribute('aria-label') || link.title || 'link').trim().slice(0, 100);
    const isCta = link.matches('.button, .nav-cta, .project-link');
    gtag('event', 'portfolio_click', { link_url: url.href, link_text: linkText, link_type: linkType, link_area: isCta ? 'cta' : 'content' });
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(script);
})();
