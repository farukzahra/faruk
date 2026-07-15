# Resume Content Phase A Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Phase A resume copy updates in `ResumeView.vue` only (no CSS/SEO redesign).

**Architecture:** Replace header, summary, skills array, and BairesDev/Lume body with approved text from the design spec. Experience uses `ul`/`li` inside existing timeline markup.

**Tech Stack:** Vue 3 + existing `styles.css` (no new design system).

**Spec:** `docs/superpowers/specs/2026-07-15-resume-content-phase-a-design.md`

## Global Constraints

- Content only — no layout redesign, no Technologies section, no SEO.
- American English copy as locked in the spec.
- Certifications / Education / previous roles / languages unchanged.
- Reuse existing CSS; add minimal timeline `ul` rules only if bullets are unreadable.

---

### Task 1: Update ResumeView content

**Files:**
- Modify: `frontend/src/views/ResumeView.vue`
- Optional: `frontend/src/styles.css` (timeline list only if needed)

**Interfaces:**
- Consumes: design spec locked copy
- Produces: updated on-page resume text

- [x] **Step 1: Update title, keywords, skills array, summary paragraphs**

Apply exact strings from the design spec.

- [x] **Step 2: Replace BairesDev and Lume paragraphs with bullet lists**

Use `ul`/`li` with the locked bullets; keep job titles, dates, locations.

- [x] **Step 3: If timeline bullets lack spacing, add minimal CSS**

Reuse `timeline-content p` typography values for `ul`/`li` — no new visual language.

- [x] **Step 4: Build**

Run: `npm run build`  
Expected: exit 0 — **PASS** (2026-07-15)

- [ ] **Step 5: Commit only if user asks**

Do not commit unless user says "Commita" / `/commit-push`.
