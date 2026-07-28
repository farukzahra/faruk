const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getEmailConfigError,
  isEmailConfigured,
  verifyEmailCredentials,
} = require("../lib/gmail");

test("isEmailConfigured is false without env vars", () => {
  const original = { ...process.env };
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REFRESH_TOKEN;

  assert.equal(isEmailConfigured(), false);
  Object.assign(process.env, original);
});

test("verifyEmailCredentials reports missing configuration", async () => {
  const original = { ...process.env };
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REFRESH_TOKEN;

  const status = await verifyEmailCredentials();
  assert.equal(status.ok, false);
  assert.equal(status.configured, false);
  assert.match(status.error, /Email not configured/);

  Object.assign(process.env, original);
});

test("verifyEmailCredentials adds hint for invalid_grant", async () => {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return;
  }

  const status = await verifyEmailCredentials();
  if (status.ok) {
    return;
  }

  if (status.error.includes("invalid_grant")) {
    assert.match(status.hint, /google:auth/);
    return;
  }

  assert.fail(`Unexpected verify error: ${status.error}`);
});

test("getEmailConfigError mentions google:auth", () => {
  assert.match(getEmailConfigError(), /google:auth/);
});
