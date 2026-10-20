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
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(script);
})();
