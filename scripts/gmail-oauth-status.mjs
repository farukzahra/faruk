#!/usr/bin/env node
/**
 * Diagnose Gmail OAuth setup and print remediation steps.
 * Usage: node scripts/gmail-oauth-status.mjs [--production]
 */
import "dotenv/config";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { verifyEmailCredentials, getEmailConfig } = require("../lib/gmail.js");

const checkProduction = process.argv.includes("--production");

async function checkUrl(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await res.json();
    return { status: res.status, body };
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  const config = getEmailConfig();
  const local = await verifyEmailCredentials();

  console.log("=== Gmail OAuth status ===\n");

  console.log("Local .env");
  console.log(`  configured: ${!!(config.clientId && config.clientSecret && config.refreshToken)}`);
  console.log(`  user: ${config.user}`);
  console.log(`  token ok: ${local.ok}`);
  if (!local.ok) {
    console.log(`  error: ${local.error}`);
    if (local.hint) console.log(`  hint: ${local.hint}`);
  }

  if (checkProduction) {
    const prod = await checkUrl("https://www.faruk.dev.br/api/email-health");
    console.log("\nProduction https://www.faruk.dev.br/api/email-health");
    if (prod.error) {
      console.log(`  fetch error: ${prod.error}`);
    } else {
      console.log(`  http: ${prod.status}`);
      console.log(`  ok: ${prod.body?.ok}`);
      if (!prod.body?.ok) {
        console.log(`  error: ${prod.body?.error}`);
        if (prod.body?.hint) console.log(`  hint: ${prod.body?.hint}`);
      }
    }
  }

  console.log("\n=== What “production” means (common confusion) ===");
  console.log("  VPS / GitHub deploy  !=  Google OAuth “In production”");
  console.log("  Deploy no servidor não altera o status do OAuth consent screen.");
  console.log("  Só o Google Cloud Console → OAuth consent screen → Publish app.");

  console.log("\n=== Evidence from deploy history ===");
  console.log("  Deploys com EMAIL_HEALTH_OK passaram de 28/jul a 06/set (40+ dias).");
  console.log("  Isso NÃO é o padrão de token Testing (expira em 7 dias).");
  console.log("  Causa mais provável do invalid_grant recente:");
  console.log("    • várias execuções de npm run google:auth (prompt=consent) sem sync:gmail");
  console.log("    • limite de 50 refresh tokens por usuário/cliente no Google");
  console.log("    • token de produção revogado quando tokens mais novos acumulam");

  console.log("\n=== Permanent fix checklist ===");
  console.log("  1. Google Cloud → OAuth consent screen → Publishing status = In production");
  console.log("     https://console.cloud.google.com/auth/audience?project=110995015738");
  console.log("  2. Revogar acessos antigos: https://myaccount.google.com/permissions");
  console.log("  3. npm run google:auth  (só quando token quebrado ou após Publish app)");
  console.log("  4. npm run sync:gmail   (obrigatório após auth — GitHub + VPS)");
  console.log("  5. Não rodar google:auth “por precaução” — cada consent gera token novo");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
