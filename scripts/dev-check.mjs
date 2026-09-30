import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "dev-check.config.json");

async function main() {
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const baseUrl = process.env.DEV_CHECK_BASE_URL || config.baseUrl;
  const timeoutMs = config.timeoutMs || 15_000;
  const errors = [];

  console.log(`[dev:check] base=${baseUrl} checks=${config.checks.length}`);

  for (const check of config.checks) {
    const url = new URL(check.path, baseUrl).toString();
    let response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${check.path}: request failed (${message})`);
      console.error(`  fail ${errors.at(-1)}`);
      continue;
    }

    const body = await response.text();
    const checkErrors = [];
    const expectedStatus = check.status ?? 200;
    if (response.status !== expectedStatus) {
      checkErrors.push(`expected status ${expectedStatus}, got ${response.status}`);
    }
    for (const marker of check.bodyIncludes ?? []) {
      if (!body.includes(marker)) checkErrors.push(`body missing "${marker}"`);
    }
    for (const marker of check.bodyExcludes ?? []) {
      if (body.includes(marker)) checkErrors.push(`body contains forbidden "${marker}"`);
    }

    if (checkErrors.length === 0) {
      console.log(`  ok ${check.path}`);
    } else {
      for (const message of checkErrors) {
        errors.push(`${check.path}: ${message}`);
        console.error(`  fail ${errors.at(-1)}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`[dev:check] FAILED (${errors.length} issue(s))`);
    process.exitCode = 1;
    return;
  }

  console.log("[dev:check] OK");
}

main().catch((error) => {
  console.error("[dev:check] unexpected error:", error);
  process.exitCode = 1;
});
