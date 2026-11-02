# Security Audit — 2026-11-02

## Scope

Repository metadata, default branch configuration, tracked files, GitHub Actions workflows, static-site entry points, analytics code and the private weekly reporting script were reviewed. This is a repository-level static audit, not a penetration test, runtime browser test, dependency resolution against a lockfile, or a scan of GitHub account secrets.

## Findings

| ID | Severity | Finding | Evidence / impact | Status |
|---|---|---|---|---|
| SEC-001 | High | Default branch is unprotected | GitHub reports `main.protected=false`; no required checks or review rules are configured. Direct pushes can bypass review and CI. | Requires owner settings |
| SEC-002 | Medium | No repository CodeQL workflow | No code-scanning workflow was present in the repository tree. JavaScript and Python static analysis were not configured. | Added in this change |
| SEC-003 | Medium | No dependency update policy | No Dependabot configuration was present. The reporting script depends on Python packages with open-ended compatible version ranges and no lock file. | Added Dependabot and pip-audit |
| SEC-004 | Medium | GitHub Actions references use mutable major tags | Existing and new workflows reference actions such as `actions/checkout@v4` and `github/codeql-action@v3`. Tags can move; pinning full commit SHAs would provide stronger supply-chain integrity. | Follow-up hardening |
| SEC-005 | Low | External README widgets depend on third-party services | Trophy, language and streak SVG cards can fail, be rate-limited or be unavailable. Core README content remains available. | Documented as non-critical |
| SEC-006 | Informational | Analytics currently disabled | The GA4 measurement ID is empty; analytics requests are not initiated by this script. | No action required |
| SEC-007 | Informational | Weekly reporting workflow is gated | Email reporting runs only when `ANALYTICS_REPORT_ENABLED == 'true'`; credentials are injected from GitHub Actions secrets. | Existing control retained |

## Positive controls observed

- Pages deployment declares `contents: read`, `pages: write` and `id-token: write`, with concurrency cancellation.
- Site-quality workflow uses read-only repository permissions.
- Weekly report workflow uses read-only repository permissions and a 10-minute job timeout.
- Analytics bootstrap is disabled unless a valid GA4 measurement ID is configured.
- Weekly report email content is HTML-escaped before interpolation into generated tables.
- The site is static and does not expose an application backend or server-side request handlers in this repository.

## Changes introduced with this audit

- Added CodeQL analysis for JavaScript and Python.
- Added a scheduled Python dependency audit with pip-audit.
- Added Dependabot update schedules for GitHub Actions and Python dependencies.
- Added a private vulnerability reporting policy.
- Expanded the profile README with a trophy hall, language statistics, daily contribution streak and a categorized tool/language inventory.
- Documented limitations of dynamic GitHub profile metrics and third-party cards.

## Required owner actions

1. Enable branch protection or a repository ruleset for `main`: require pull requests, require the Site quality and Security analysis checks, block force pushes and deletions, and require conversation resolution.
2. Enable private vulnerability reporting, Dependabot alerts, Dependabot security updates, secret scanning and push protection where available for this repository and plan.
3. Review GitHub Actions permissions and restrict actions to the approved marketplace actions where practical.
4. Pin third-party and first-party Actions to verified full commit SHAs; configure Dependabot to keep those SHA pins updated.
5. Review repository and account secrets manually. The available read-only audit interface cannot inspect secret values, and no secret values should be copied into logs or reports.
6. Consider adding a Python lock file with hashes for the scheduled reporting environment.

## Validation boundaries

The repository and workflow configuration were inspected through GitHub. The latest Pages deployment on 2026-11-02 completed successfully. CodeQL and pip-audit have been added but their first execution must complete on GitHub Actions before their findings can be assessed. No claim is made that a full penetration test or secret scan has been performed.
