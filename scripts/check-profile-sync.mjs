/**
 * Fails when the canonical positioning (docs/profile.json) drifts between
 * the resume site, PDF source, e-mail defaults, LinkedIn paste pack and docs.
 *
 * Usage: npm run check:profile
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const files = {
  profile: "docs/profile.json",
  resume: "frontend/src/views/ResumeView.vue",
  index: "frontend/index.html",
  devCheck: "dev-check.config.json",
  emailContent: "lib/email-content.js",
  sendResume: "frontend/src/lib/send-resume.ts",
  sendDialog: "frontend/src/components/SendResumeDialog.vue",
  linkedin: "docs/linkedin-paste.md",
  emailPreview: "docs/email-preview.md",
};

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function squash(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/>\s+/g, ">")
    .replace(/\s+</g, "<")
    .trim();
}

function checkIncludes(content, needle, label) {
  return squash(content).includes(squash(needle)) ? null : `${label}: missing "${needle}"`;
}

async function main() {
  const profile = JSON.parse(await read(files.profile));
  const keywordsLine = profile.keywords.join(" | ");
  const composed = `${profile.title} | ${keywordsLine}`;
  const errors = [];

  if (composed !== profile.headline) {
    errors.push(
      `docs/profile.json: title + keywords (${composed}) do not match headline (${profile.headline})`
    );
  }

  const [resume, index, devCheck, emailContent, sendResume, sendDialog, linkedin, emailPreview] =
    await Promise.all([
      read(files.resume),
      read(files.index),
      read(files.devCheck),
      read(files.emailContent),
      read(files.sendResume),
      read(files.sendDialog),
      read(files.linkedin),
      read(files.emailPreview),
    ]);

  const devCheckConfig = JSON.parse(devCheck);
  const devCheckBodies = (devCheckConfig.checks ?? []).flatMap((c) => c.bodyIncludes ?? []);
  if (!devCheckBodies.includes(profile.siteTitle)) {
    errors.push(`${files.devCheck}: bodyIncludes missing "${profile.siteTitle}"`);
  }

  const expectations = [
    [resume, `<p class="title">${profile.title}</p>`, files.resume],
    [resume, `<p class="keywords">${keywordsLine}</p>`, files.resume],
    [resume, `${profile.summaryOpening} with 20+ years`, files.resume],
    [index, `<title>${profile.siteTitle}</title>`, files.index],
    [emailContent, `I am a ${profile.summaryOpening} with more than 20 years`, files.emailContent],
    [emailContent, profile.emailSubject.en, files.emailContent],
    [emailContent, profile.emailSubject.pt, files.emailContent],
    [sendResume, profile.emailSubject.en, files.sendResume],
    [sendResume, profile.emailSubject.pt, files.sendResume],
    [sendDialog, profile.emailSubject.en, files.sendDialog],
    [linkedin, profile.headline, files.linkedin],
    [emailPreview, `**Assunto:** ${profile.emailSubject.en}`, files.emailPreview],
    [emailPreview, `**Assunto:** ${profile.emailSubject.pt}`, files.emailPreview],
  ];

  for (const [content, needle, label] of expectations) {
    const error = checkIncludes(content, needle, label);
    if (error) errors.push(error);
  }

  if (errors.length > 0) {
    console.error("[check:profile] divergências encontradas:");
    for (const error of errors) console.error(`  - ${error}`);
    console.error("\nAtualize docs/profile.json e todos os artefatos antes de commitar.");
    process.exit(1);
  }

  console.log(`[check:profile] ok — ${profile.headline}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
