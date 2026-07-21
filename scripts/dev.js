const { spawn } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const PORT_FILE = path.join(ROOT, ".dev-api-port");
const FIRST_PORT = Number(process.env.FARUK_API_PORT_FIRST || 3000);
const LAST_PORT = Number(process.env.FARUK_API_PORT_LAST || 3003);

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

async function pickPort() {
  for (let port = FIRST_PORT; port <= LAST_PORT; port += 1) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free API port between ${FIRST_PORT} and ${LAST_PORT}.`);
}

function run(label, command, args, env) {
  const child = spawn(command, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return child;
}

(async () => {
  const port = await pickPort();
  fs.writeFileSync(PORT_FILE, String(port), "utf8");
  console.log(`[dev] API on http://localhost:${port} (Vite proxy /api → :${port})`);

  const children = [
    run("server", "node", ["server.js"], { PORT: String(port) }),
    run("web", "npm", ["run", "dev", "--prefix", "frontend"], { FARUK_API_PORT: String(port) }),
  ];

  const shutdown = () => {
    for (const child of children) {
      if (!child.killed) child.kill();
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch((err) => {
  console.error("[dev]", err.message);
  process.exit(1);
});
