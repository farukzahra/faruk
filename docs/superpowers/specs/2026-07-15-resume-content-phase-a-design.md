# Design Spec — Resume Content Refresh (Phase A)

**Date:** 2026-07-15  
**Status:** Approved and implemented (Phase A content)  
**Scope:** Content-only updates on `faruk.dev.br` resume  
**Source brief:** [2026-07-15-resume-improvement-brief.md](./2026-07-15-resume-improvement-brief.md)

## Problem

The live resume emphasizes technology lists over accomplishment bullets. Recruiters and ATS benefit from action-verb bullets, clearer positioning, and broader keyword coverage (including AI coding agents).

## Goal (Phase A)

Update resume **copy only** so it reads as a modern Senior Fullstack / Java profile with AI-agent fluency — **without** changing layout, CSS, SEO, or adding a Technologies section.

## Out of scope (Phase D — later)

- Dedicated Technologies section
- SEO / meta / Open Graph / Person schema
- Visual / whitespace / hierarchy CSS changes beyond what existing classes already do
- PDF asset regeneration (unless requested later)
- Reordering certifications

## Locked decisions

| Area | Decision |
|------|----------|
| Phase | **A** first; **D** after user reviews content live |
| Header title (`.title`) | `Senior Fullstack Engineer` |
| Header keywords (`.keywords`) | `Java \| Spring \| JavaScript \| TypeScript \| AI Agents` |
| Summary | Brief’s 3 paragraphs + AI agents sentence |
| Core Skills | Brief list + AWS, Azure, Cursor, Codex, Claude, GitHub Copilot (no extra items) |
| BairesDev / Lume | Replace tech-paragraphs with brief UL bullets verbatim |
| Teaching / Education / Previous roles | Unchanged |
| Certifications | Keep **current order** (do not use brief reorder) |
| Layout / CSS | Unchanged — reuse existing list/timeline markup patterns |

## Exact content to apply

### Header

- **Title:** Senior Fullstack Engineer  
- **Keywords line:** Java | Spring | JavaScript | TypeScript | AI Agents  

(Note: the approved one-liner started with “Senior Fullstack Engineer | …”. Split across `.title` + `.keywords` to avoid duplicating the title in the DOM.)

### Summary (4 paragraphs)

1. Senior Software Engineer with 20+ years of experience designing, building, and maintaining enterprise applications using Java, Spring Boot, REST APIs, and cloud-native architectures.

2. Experienced across backend and full-stack development with Vue.js, TypeScript, Node.js, relational databases, and distributed systems.

3. Strong background in software architecture, API design, system integration, performance optimization, and delivering scalable solutions throughout the entire software development lifecycle.

4. Experienced using AI coding agents to accelerate implementation, refactoring, and day-to-day software delivery.

### Core Skills (`skills` array)

```
Java
Spring Boot
Spring Cloud
REST APIs
Microservices
Google Cloud Platform
AWS
Azure
Vue.js
TypeScript
Node.js
PostgreSQL
Docker
Git
JUnit
Mockito
Liquibase
Elasticsearch
CI/CD
Cursor
Claude
Codex
GitHub Copilot
Software Architecture
System Design
```

### BairesDev — bullets grounded in `orders` microservice (updated 2026-07-15)

Job header / dates / location stay as today (`Full Stack Engineer | BairesDev`, May 2021 – Present, Remote).

Source of truth for backend: `C:\repo\orders` (Workstand Orders MS). Frontend bullets deferred until user shares the front repo.

- Built and maintained a multi-tenant Orders microservice (Java 17, Spring Boot) for a retail e-commerce platform — order lifecycle, payments, fulfillment, and store operations.
- Designed contract-first REST APIs with OpenAPI 3, generating Spring interfaces and TypeScript clients for consuming services.
- Implemented event-driven integrations with Google Cloud Pub/Sub (order ingestion, payment updates, POS export results, supplier fulfillment, outbound email).
- Modeled multi-tenant PostgreSQL schemas and Liquibase migrations (orders, transactions, shipments, soft deletes).
- Delivered Elasticsearch-backed order search with indexing, search templates, filters, and aggregations.
- Ran and integrated services on Google Cloud Platform — GKE, Pub/Sub, Cloud SQL, Cloud Storage, and IAM — with OpenFeign between microservices and OAuth2 via the shared security base.
- Built Vue 3 frontend features with TypeScript, Pinia, Vue Router, Axios, and Vite (Composition API with script setup).
- Wrote automated tests across the stack — JUnit 5, Mockito, and MockMvc on the backend; Vitest and Playwright on the Vue frontend.
- Participated in Agile ceremonies, code reviews, and production support.

### Lume — cloud note (updated)

- Delivered cloud-hosted solutions on AWS (EC2, S3, RDS, Lambda, IAM) and Azure (App Service, Blob Storage, Azure SQL, Functions, Entra ID).

**Removed (not factual):** Keycloak. Frontend stack added by user (Vue 3 + Pinia + Vue Router ecosystem). Cloud products for Lume (AWS/Azure) requested by user.

No separate “stack below bullets” block (YAGNI for Phase A).

### Lume Tecnologia — replace prose/legacy/new paragraphs with `<ul><li>`

Job header / dates / location stay as today.

- Led software architecture decisions for enterprise applications.
- Gathered customer requirements and translated them into technical solutions.
- Designed backend systems using Java and Spring Boot.
- Modernized legacy Java EE applications.
- Mentored developers and reviewed code quality.
- Delivered solutions using Vue.js, Flutter, PostgreSQL, and Git.

### Certifications (unchanged order)

1. Oracle Certified Professional, Java EE 5 Web Component Developer  
2. Oracle Certified Professional, Java SE 6 Programmer  
3. IBM Certified Associate Developer – Lotus Notes and Domino 7  
4. IBM Certified Database Associate – DB2 9 Fundamentals  
5. SUN CERTIFIED MOBILE APPLICATION DEVELOPER  

## Files

| File | Change |
|------|--------|
| `frontend/src/views/ResumeView.vue` | Title, keywords, summary, `skills` array, BairesDev/Lume bullets |
| `frontend/src/styles.css` | **No change** (existing `ul`/`li` in timeline should suffice; if bullets need a tiny rule reuse sidebar/section patterns — only if visually broken) |
| PDF in `frontend/public/assets/` | Out of scope unless user asks |

## Markup rules

- Keep semantic structure already present (`header`, `section`, `article`, single `h1`).
- Experience bullets: `ul` / `li` inside `.timeline-content` (ATS-readable text, not images).
- American English as in the brief.
- Do not invent new CSS class names unless required for readable bullets; prefer existing styles.

## Success criteria

- [ ] Header title + keywords match locked copy
- [ ] Summary has 4 paragraphs including AI agents line
- [ ] Core Skills match the locked list (order above)
- [ ] BairesDev and Lume show accomplishment bullets, not tech-only paragraphs
- [ ] Certifications / Education / Other roles / languages unchanged
- [ ] No intentional CSS/layout redesign
- [ ] Site still builds (`npm run build` or project equivalent)

## Self-review

1. **Placeholders:** None.  
2. **Consistency:** Phase A excludes Technologies/SEO/visual; Phase D deferred explicitly.  
3. **Scope:** Single view file; one implementation plan.  
4. **Ambiguity:** Header split (`.title` + `.keywords`) made explicit to avoid duplicated “Senior Fullstack Engineer”.  
5. **Factual:** AWS/Azure/AI tools included by user request; bullets taken from approved brief.

## Next step

After user confirms this file: invoke **writing-plans** → `docs/superpowers/plans/2026-07-15-resume-content-phase-a.md`.
