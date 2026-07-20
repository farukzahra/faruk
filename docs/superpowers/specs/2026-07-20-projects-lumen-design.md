# Projects page — Lumen Night Foundry redesign

**Date:** 2026-07-20  
**Status:** Approved  
**Skill:** Hallmark `redesign` · theme **Lumen** · drop **Night Foundry**

## Goal

Replace the generic `/projects` grid with a Cinder-style Lumen showcase while keeping routes, API, and real project data unchanged.

## Locked decisions

| Axis | Choice |
|------|--------|
| Theme | Lumen (atmospheric · AI-tool register) |
| Drop | Night Foundry (dark violet + molten brass) |
| Macrostructure | Marquee Hero + Lumen hairline cards grid |
| Scope | Isolated “Lumen island” on `/projects` only; resume and about unchanged |
| Cards | 3 project cards from `GET /api/projects` |

## Architecture

- **`ProjectsView.vue`** — hero (eyebrow, lowercase headline with verb landmark, lede), CSS/SVG filament apparatus, floating nav pill, project cards grid.
- **`styles.css`** — `.projects-page--lumen` token block + component styles; `body.projects-lumen-active` + `.v-application` dark background; `.site-footer--lumen` variant.
- **`AppFooter.vue`** — adds `site-footer--lumen` on `projects` route.
- **Fonts** — Instrument Serif, Geist Sans, JetBrains Mono loaded on mount when entering `/projects`.

## Content rules (Hallmark)

- Prose lowercase via CSS; mono labels uppercase.
- One accent verb in hero headline (`linked`).
- No invented metrics on apparatus callouts — use real counts/domains/stacks only.
- No glowing orb; filament chamber apparatus only.
- Responsive: 320 / 375 / 414 / 768 px, no horizontal scroll.

## Files

| File | Action |
|------|--------|
| `frontend/src/views/ProjectsView.vue` | Rewrite |
| `frontend/src/styles.css` | Replace `.projects-page` block + add Lumen + footer dark |
| `frontend/src/components/AppFooter.vue` | Route-aware dark class |

## Out of scope

- Changes to `docs/projects.json` schema
- Global site retheme
- E2E tests (none in repo today)
