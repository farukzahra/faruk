/**
 * Generate resume PDF from the live Vue page (Playwright / Chromium).
 * Writes: frontend/public/assets/Faruk Zahra - CV - Resume.pdf
 *
 * Usage: npm run pdf
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "frontend", "dist");
const OUT = path.join(
  ROOT,
  "frontend",
  "public",
  "assets",
  "Faruk Zahra - CV - Resume.pdf"
);
const OUT_DIST = path.join(
  ROOT,
  "frontend",
  "dist",
  "assets",
  "Faruk Zahra - CV - Resume.pdf"
);

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
      ...opts,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`));
    });
  });
}

async function ensureBuild() {
  if (!existsSync(path.join(DIST, "index.html"))) {
    console.log("Building frontend…");
    await run("npm", ["run", "build"]);
  } else {
    console.log("Rebuilding frontend so PDF matches latest content…");
    await run("npm", ["run", "build"]);
  }
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".woff2")) return "font/woff2";
  if (filePath.endsWith(".woff")) return "font/woff";
  if (filePath.endsWith(".ttf")) return "font/ttf";
  if (filePath.endsWith(".eot")) return "application/vnd.ms-fontobject";
  return "application/octet-stream";
}

async function serveDist() {
  const { createReadStream, promises: fs } = await import("node:fs");
  const server = createServer(async (req, res) => {
    try {
      let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      if (urlPath === "/") urlPath = "/index.html";
      const filePath = path.join(DIST, urlPath.replace(/^\//, ""));
      if (!filePath.startsWith(DIST) || !existsSync(filePath)) {
        // SPA fallback
        const index = path.join(DIST, "index.html");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        createReadStream(index).pipe(res);
        return;
      }
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(500);
      res.end("Error");
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function main() {
  await ensureBuild();
  const { server, baseUrl } = await serveDist();
  console.log(`Serving dist at ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1800 },
      deviceScaleFactor: 1,
    });

    await page.goto(baseUrl + "/", { waitUntil: "networkidle" });
    await page.waitForSelector(".resume");
    await page.emulateMedia({ media: "print" });
    // Fonts / images settle
    await page.waitForTimeout(500);

    await page.pdf({
      path: OUT,
      printBackground: true,
      preferCSSPageSize: false,
      format: "Letter",
      margin: { top: "0.35in", right: "0.35in", bottom: "0.35in", left: "0.35in" },
    });

    // Keep dist copy in sync for Express send-resume after build
    if (existsSync(path.dirname(OUT_DIST))) {
      const { copyFileSync } = await import("node:fs");
      copyFileSync(OUT, OUT_DIST);
    }

    console.log(`PDF written: ${OUT}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
