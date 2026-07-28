const { test, expect } = require("@playwright/test");

test.describe("Email health API", () => {
  test("returns structured error when Gmail token is invalid", async ({ request }) => {
    const apiBase = `http://localhost:${process.env.FARUK_E2E_API_PORT || "3099"}`;
    const response = await request.get(`${apiBase}/api/email-health`);
    const body = await response.json();

    expect(response.status()).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.error).toBeTruthy();

    if (body.error.includes("invalid_grant")) {
      expect(body.hint).toContain("npm run google:auth");
    }
  });
});
