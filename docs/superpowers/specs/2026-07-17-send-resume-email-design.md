# Design Spec — Send Resume Email (subject, language, salary)

**Date:** 2026-07-17  
**Status:** Approved  
**Scope:** Fix `/api/send-resume` PDF attachment + extend send dialog

## Problem

After the Playwright PDF pipeline (`npm run pdf`), the send-resume button may fail when the server cannot resolve the PDF path (especially after deploy/build). The dialog only collects recipient email; subject and body are fixed on the server with no language or salary options.

## Goal

1. Restore reliable PDF attachment on send (dist/public sync on deploy).
2. Dialog fields: recipient, editable subject, language (EN/PT), optional monthly salary with currency.
3. Server builds localized email body; salary paragraph only when checkbox is on **and** amount is valid.

## Locked decisions

| Area | Decision |
|------|----------|
| Architecture | **Approach 1** — templates on server; client sends structured payload |
| Subject default EN | `Application — Faruk Zahra (Senior Fullstack Engineer)` |
| Subject default PT | `Candidatura — Faruk Zahra (Senior Fullstack Engineer)` |
| Language default | English |
| Subject on language change | Update default only if subject still equals previous language default |
| Salary checkbox | Reveals amount + currency (USD \| BRL) |
| Currency default | EN → USD, PT → BRL; follow language when still on previous default |
| Empty salary amount | No salary paragraph (even if checkbox checked) |
| Email body language | Full body EN or PT per dialog language |
| Salary EN | `My monthly salary expectation is USD 8,000.` / `BRL 8,000.` |
| Salary PT | `Minha pretensão salarial mensal é de US$ 8.000.` / `R$ 8.000.` |
| Number format | EN: comma thousands; PT: dot thousands; no decimals for integers |

## API — `POST /api/send-resume`

```json
{
  "to": "recruiter@company.com",
  "subject": "Application — Faruk Zahra (Senior Fullstack Engineer)",
  "language": "en",
  "includeSalary": true,
  "salaryAmount": "8000",
  "salaryCurrency": "USD"
}
```

Validation: `to` (email), non-empty `subject`, `language` ∈ `{ en, pt }`, `salaryCurrency` ∈ `{ USD, BRL }` when salary used.

## PDF resolution (fix)

After frontend build on deploy, copy `frontend/public/assets/Faruk Zahra - CV - Resume.pdf` → `frontend/dist/assets/` if missing. `resolvePdfPath()` prefers dist, falls back to public.

## Out of scope

- Email preview in dialog
- localStorage for language preference
- Changing PDF generation pipeline itself
