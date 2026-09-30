# Resume PDF Synchronization Implementation Plan

> **For agentic workers:** Execute each task in order and verify the downloaded PDF against the rendered resume.

**Goal:** Make the downloadable CV match the site and keep a repeatable test that downloads and checks its PDF text.

**Architecture:** Keep `ResumeView.vue` as the source of truth and retain the existing PDF URL. Regenerate the static public/dist assets with the existing Playwright generator, and add an E2E test that clicks the real download link, extracts PDF text with PDF.js, and verifies all printable resume words are present regardless of column reading order.

**Tech Stack:** Vue 3, Playwright, Node.js 22, `pdfjs-dist`.

## Global Constraints

- Keep the filename `Faruk Zahra - CV - Resume.pdf` and URL `/assets/Faruk Zahra - CV - Resume.pdf`.
- Keep generated copies in `frontend/public/assets/` and `frontend/dist/assets/` synchronized.
- Compare downloaded PDF content with the visible resume, not merely the response status or file existence.
- Do not commit `.env`, `.env.vps`, or unrelated temporary deployment/Gmail log files.
- Before sharing a local URL, require `npm run dev:check` to pass.

---

## File Structure

- `package.json`, `package-lock.json` — add the PDF.js parser as a root development dependency.
- `e2e/resume-pdf.spec.js` — browser test that downloads the PDF and checks extracted printable resume text.
- `frontend/public/assets/Faruk Zahra - CV - Resume.pdf` — canonical static download artifact generated from the site.
- `frontend/dist/assets/Faruk Zahra - CV - Resume.pdf` — built-site copy of the same PDF.
- `agents.md` — record that CV content changes require regenerating and running the PDF download test; correct command-file references if needed.
- `.agents/skills/commit-push/SKILL.md` — expose the commit/push workflow to Agent Host.
- `.github/prompts/commit-push.prompt.md`, `.cursor/commands/commit-push.md` — retain Local agent and Cursor entry points.
- `scripts/dev-check.mjs`, `dev-check.config.json`, `package.json` — provide the mandated local app validation without adding a runtime dependency.

### Task 1: Add the real download/content E2E

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `e2e/resume-pdf.spec.js`

**Interfaces:**
- Test consumes the existing Playwright fixture `page`, download link accessible as `Download PDF`, and `pdfjs-dist/legacy/build/pdf.mjs`.
- Test produces a failing result when PDF text is missing any printable resume word.

- [x] Install the parser: `npm install --save-dev pdfjs-dist`.
- [x] Create the test using the code below.
- [x] Run `npm run test:e2e -- e2e/resume-pdf.spec.js`; it must download a valid PDF and either pass when text is already synchronized or fail with the missing/different text blocks or words.

```js
const { readFile } = require("node:fs/promises");
const { test, expect } = require("@playwright/test");

function normalizeText(text) {
  const words =
    text
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("en-US")
      .match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.join(" ");
}

function wordCounts(text) {
  return normalizeText(text)
    .split(" ")
    .filter(Boolean)
    .reduce((counts, word) => {
      counts.set(word, (counts.get(word) || 0) + 1);
      return counts;
    }, new Map());
}

test("downloaded resume PDF contains the rendered resume content", async ({ page }) => {
  await page.goto("/");
  const expectedBlocks = await page
    .locator(
      ".resume h1, .resume h2, .resume h3, .resume p, .resume li, .resume a, .resume .contact span"
    )
    .allInnerTexts();
  expect(expectedBlocks.length).toBeGreaterThan(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download PDF" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("Faruk Zahra - CV - Resume.pdf");
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const buffer = await readFile(filePath);
  expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");

  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const document = await loadingTask.promise;
  expect(document.numPages).toBeGreaterThan(0);
  let actualText = "";
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const pdfPage = await document.getPage(pageNumber);
    const content = await pdfPage.getTextContent();
    actualText += ` ${content.items.map((item) => item.str).join(" ")}`;
  }
  await loadingTask.destroy();

  const normalizedPdfText = normalizeText(actualText);
  const missing = expectedBlocks
    .map(normalizeText)
    .filter((block) => block && !normalizedPdfText.includes(block));
  expect(missing, "downloaded PDF is missing rendered resume text blocks").toEqual([]);

  const expectedCounts = wordCounts(expectedBlocks.join(" "));
  const actualCounts = wordCounts(actualText);
  const differentWordCounts = [...new Set([...expectedCounts.keys(), ...actualCounts.keys()])]
    .filter((word) => expectedCounts.get(word) !== actualCounts.get(word))
    .map((word) => `${word} (expected ${expectedCounts.get(word) || 0}, got ${actualCounts.get(word) || 0})`);
  expect(differentWordCounts, "downloaded PDF has different resume text").toEqual([]);
});
```

### Task 2: Regenerate and verify both downloadable artifacts

**Files:**
- Modify: `frontend/public/assets/Faruk Zahra - CV - Resume.pdf`
- Modify: `frontend/dist/assets/Faruk Zahra - CV - Resume.pdf`

**Interfaces:**
- Consumes: the built frontend and `scripts/generate-resume-pdf.mjs`.
- Produces: the canonical public PDF and its matching dist copy.

- [x] Run `npm run pdf`; expect a successful frontend build and a `PDF written:` message.
- [x] Run the focused E2E from Task 1; expect the actual browser download to pass the content assertion.
- [x] Verify the public and dist PDF copies have identical SHA-256 hashes.

### Task 3: Record the workflow and provide project dev:check

**Files:**
- Modify: `agents.md`
- Modify: `package.json`
- Create: `scripts/dev-check.mjs`
- Create: `dev-check.config.json`

**Interfaces:**
- `npm run dev:check` fetches the configured Vite URL and verifies the app shell markers and absence of known error markers.
- CV maintenance instructions point to the exact PDF generation and focused download test commands.

- [x] Add `dev:check` as `node scripts/dev-check.mjs` without adding `tsx`.
- [x] Create `dev-check.config.json` with this check:

```json
{
  "baseUrl": "http://localhost:5173",
  "timeoutMs": 15000,
  "checks": [
    {
      "path": "/",
      "status": 200,
      "bodyIncludes": ["Faruk Zahra | Senior Software Engineer", "/src/main.ts"],
      "bodyExcludes": ["Application error", "ENOENT", "app-build-manifest"]
    }
  ]
}
```

- [x] Implement `scripts/dev-check.mjs` to read this JSON, fetch each configured URL with `AbortSignal.timeout(timeoutMs)`, check HTTP status plus every `bodyIncludes`/`bodyExcludes` marker, log each check, and exit with code 1 on any failure. Use `fetch` and Node built-ins; do not install another package.
- [x] Update the CV/PDF rule to require `npm run pdf` and `npm run test:e2e -- e2e/resume-pdf.spec.js`.
- [x] Run `npm run build:check --prefix frontend`, `npm run test:e2e -- e2e/resume-pdf.spec.js`, and `npm run dev:check`; all must pass.

### Task 4: Make `/commit-push` available in Agent Host

**Files:**
- Create: `.agents/skills/commit-push/SKILL.md`
- Modify: `agents.md`
- Retain: `.github/prompts/commit-push.prompt.md`
- Retain: `.cursor/commands/commit-push.md`

**Interfaces:**
- Agent Host discovers the repository skill named `commit-push`.
- Local agent and Cursor keep their existing prompt/command files.
- `agents.md` identifies the Agent Host skill as the canonical procedure and the other files as editor-specific entry points.

- [x] Create `SKILL.md` with YAML `name: commit-push`, a description that says when to invoke it, and the complete existing commit/push procedure copied from `.cursor/commands/commit-push.md`.
- [x] Update `agents.md` commit workflow and file index to reference the skill and retain both editor-specific entry points.
- [x] Verify the skill has valid frontmatter, includes the no-secret/no-force-push safeguards and GitHub Actions/production verification steps, and does not modify either legacy command.

## Completion

- [x] Start the documented local development environment using fallback ports because the defaults were occupied.
- [x] Run `npm run dev:check` successfully against `http://localhost:5174/`.
- Inspect the final diff and commit only task files; exclude pre-existing secrets and temporary logs.
