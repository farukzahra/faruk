# Design Spec — Resume PDF synchronization

**Date:** 2026-09-30  
**Status:** Approved and implemented
**Scope:** Regenerate the downloadable resume PDF, add an end-to-end content check, and make the commit-push workflow discoverable in Agent Host.

## Problem

The resume page is the source of truth, but the Download button serves a committed static PDF. The committed PDF is older than the current page, so the downloaded resume can contain stale content.

The repository also stores `/commit-push` as prompt files. VS Code Agent Host does not load prompt files, so the workflow is unavailable in this chat even though the files exist.

## Goal

Refresh the downloadable PDF from the current built Vue resume and add a repeatable browser test that verifies the real download contains the page's resume content.

## Design

- Keep `frontend/src/views/ResumeView.vue` as the content source and preserve the existing download URL and filename.
- Use the existing `npm run pdf` generator to rebuild the frontend and write the PDF to `frontend/public/assets/` and, when present, `frontend/dist/assets/`.
- Add a Playwright E2E test that opens the resume page, clicks the Download PDF control, reads the downloaded file, extracts its text, and checks that the printable resume content is represented in the PDF. Normalize whitespace and compare content independently of page/column reading order.
- Use a maintained PDF text extraction library as a development dependency so the test is reproducible on supported Node environments.
- Record the new instruction in `agents.md` so future resume-content changes include PDF synchronization and validation.
- Migrate the commit-push workflow into `.agents/skills/commit-push/SKILL.md`, which Agent Host supports. Keep editor-specific prompt/command files available for Local agent and Cursor use.

## Alternatives considered

1. **Refresh only the PDF:** smallest change, but stale content can recur undetected.
2. **Refresh the PDF and add an E2E download/content test:** catches divergence whenever the E2E is run, without changing deploy infrastructure. **Selected.**
3. **Also regenerate/verify PDFs in CI/deploy:** stronger enforcement, but adds Chromium setup and pipeline complexity outside the requested scope.
4. **Keep `/commit-push` only as prompt files:** they remain usable by Local agent and Cursor but are not loaded by Agent Host. **Rejected** because the user needs the workflow in this chat host.

## Error handling

The test must fail if the download does not occur, the downloaded file is not a readable PDF, or resume text is missing. It must not pass based only on an HTTP status or file existence.

## Validation

- Run `npm run pdf` and verify the generated public and dist artifacts.
- Run the focused Playwright E2E and verify the actual download's extracted text against the rendered resume.
- Run the repository's relevant build check.

## Self-review

- No placeholders or unresolved decisions remain.
- The existing PDF URL and filename remain unchanged.
- The selected scope intentionally does not add CI/deploy browser installation.
- Text comparison accounts for the resume's multi-column print layout while checking content rather than PDF byte identity.
- Agent Host command discovery is addressed by providing the same workflow as an agent skill; legacy editor-specific entry points remain intact.
