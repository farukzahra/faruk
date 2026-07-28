const { test, expect } = require("@playwright/test");

test.describe("Send resume dialog", () => {
  test("shows success snackbar when API returns ok", async ({ page }) => {
    await page.route("**/api/send-resume", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, message: "Resume sent successfully." }),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Enviar Currículo" }).click();
    await expect(page.getByText("Enviar Currículo").first()).toBeVisible();

    await page.getByLabel("E-mail do destinatário").fill("recruiter@example.com");
    await page.locator(".send-resume-dialog__btn-send").click();

    await expect(page.getByText("Currículo enviado de farukz@gmail.com!")).toBeVisible();
  });

  test("shows Gmail expired message when API returns invalid_grant", async ({ page }) => {
    await page.route("**/api/send-resume", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Gmail authorization expired. Run npm run google:auth && npm run sync:gmail.",
        }),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Enviar Currículo" }).click();
    await page.getByLabel("E-mail do destinatário").fill("recruiter@example.com");
    await page.locator(".send-resume-dialog__btn-send").click();

    await expect(page.getByText("Autorização Gmail expirada no servidor")).toBeVisible();
  });

  test("validates recipient email on the server", async ({ page, request }) => {
    const apiBase = `http://localhost:${process.env.FARUK_E2E_API_PORT || "3099"}`;
    const response = await request.post(`${apiBase}/api/send-resume`, {
      data: {
        to: "not-an-email",
        subject: "Test subject",
        language: "en",
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid recipient email address.",
    });
  });
});
