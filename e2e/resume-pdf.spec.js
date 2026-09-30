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
