# Website architecture

The portfolio is a static GitHub Pages application. It uses native HTML, CSS and JavaScript ES modules; no framework, bundler or package installation is required.

## Runtime composition

```text
index.html
├── assets/css/site.css
├── assets/css/components/assistant.css
└── assets/js/app.js
    ├── modules/theme.js       # theme state and persistence
    ├── modules/navigation.js  # responsive navigation and Escape handling
    ├── modules/assistant.js   # isolated local study guide
    └── modules/reveal.js      # progressive reveal and reduced-motion fallback
```

Each module owns one UI responsibility. The theme controller does not import, query or mutate assistant state. The guide does not read or write theme preferences. `app.js` is the composition root and initializes each feature independently.

## Components and capabilities

- **Theme control:** toggles light/dark mode and persists the preference in local storage. When storage is unavailable, the page still works and falls back to the system preference.
- **NOX study guide:** provides prewritten, local help topics. It is not an LLM/AI agent, makes no network requests and does not transmit visitor data.
- **Navigation:** supports mobile menu state, closes after selecting a link and handles Escape.
- **Reveal effects:** uses IntersectionObserver when available and respects reduced-motion preferences.

## Editing guide

- **Content and semantics:** edit `index.html`; keep headings hierarchical, links descriptive and images supplied with useful alt text.
- **Global visual system:** edit `assets/css/site.css`.
- **Component styles:** place feature-specific rules under `assets/css/components/`.
- **Interactions:** add a focused module under `assets/js/modules/`, export an `initFeature()` function, then register it in `assets/js/app.js`.
- **Artwork:** store reusable illustrations in `assets/img/` and reference them with relative paths.
- **Deployment:** `.github/workflows/pages.yml` publishes the static site. GitHub Pages must use GitHub Actions as its source.

## Local preview

Serve the repository root with any static HTTP server. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. ES modules should be tested over HTTP rather than opened through `file://`.

## Responsive and accessibility checks

Test at 360 px, 390 px, 768 px, 1024 px and wide desktop. Verify menu keyboard handling, focus visibility, theme persistence, image overflow, no horizontal page scrolling, reduced-motion behavior and that the core content remains usable if third-party dashboard images fail.
