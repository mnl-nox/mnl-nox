# Website architecture

The portfolio is a static site deployed with GitHub Pages. It intentionally avoids a build step and framework so it stays easy to maintain from the repository.

## Layout

```text
.
├── index.html                    # Semantic page structure and content
├── assets/
│   ├── css/
│   │   └── site.css              # Design tokens, layout, responsive styles, motion
│   ├── js/
│   │   └── site.js               # Mobile navigation, year, reveal effects
│   └── img/                      # Shared profile artwork and SVG illustrations
├── docs/
│   └── website-architecture.md   # This guide
├── .github/
│   └── workflows/
│       └── pages.yml             # Deploys the site on pushes to main
└── README.md                     # Profile dashboard and site entry point
```

## Editing guide

- **Content and semantics:** edit `index.html`. Keep headings hierarchical, links descriptive, and images supplied with alt text.
- **Visual design:** edit `assets/css/site.css`. Shared colors, typography, and spacing are defined as CSS custom properties in `:root`.
- **Interactions:** edit `assets/js/site.js`. Keep the page usable without JavaScript where possible; respect reduced-motion preferences in CSS.
- **Artwork:** store reusable illustrations in `assets/img/` and reference them with relative paths.
- **Deployment:** edit `.github/workflows/pages.yml` only when deployment requirements change. GitHub Pages must be configured to use **GitHub Actions** as its source.

## Local preview

Open `index.html` directly in a browser, or serve the repository root with a local static server. No package installation or build command is required.

## Publishing checklist

1. Confirm the relative asset paths work from the repository root.
2. Test the mobile navigation and all contact/project links.
3. Commit changes to `main`.
4. Check the **Actions** tab for the Pages deployment result.
5. Confirm the published URL after the workflow succeeds.
