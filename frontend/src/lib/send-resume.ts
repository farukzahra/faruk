export type EmailLanguage = "en" | "pt";
export type SalaryCurrency = "USD" | "BRL";

export const SUBJECT_DEFAULTS: Record<EmailLanguage, string> = {
  en: "Application — Faruk Zahra (Senior Full Stack Engineer)",
  pt: "Candidatura — Faruk Zahra (Senior Full Stack Engineer)",
};

export function defaultCurrencyForLanguage(language: EmailLanguage): SalaryCurrency {
  return language === "pt" ? "BRL" : "USD";
}
