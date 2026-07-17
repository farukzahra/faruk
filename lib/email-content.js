const SUBJECT_DEFAULTS = {
  en: "Application — Faruk Zahra (Senior Fullstack Engineer)",
  pt: "Candidatura — Faruk Zahra (Senior Fullstack Engineer)",
};

const BODY_INTRO = {
  en: `Hi,

My name is Faruk Zahra, and I am a software developer with extensive experience in Java, Spring Boot, RESTful APIs, databases, cloud services, and software architecture.

I am currently exploring new professional opportunities and would like to apply for a position at your company. I believe my technical background, experience working with international teams, and ability to deliver reliable software solutions could be a strong fit for your team.

Please find my résumé attached for your review. I would be happy to discuss my experience and learn more about any opportunities that match my profile.`,
  pt: `Olá,

Meu nome é Faruk Zahra e sou desenvolvedor de software com ampla experiência em Java, Spring Boot, APIs REST, bancos de dados, serviços em nuvem e arquitetura de software.

Atualmente estou em busca de novas oportunidades profissionais e gostaria de me candidatar a uma vaga na sua empresa. Acredito que minha formação técnica, experiência com equipes internacionais e capacidade de entregar soluções confiáveis podem ser um forte diferencial para a equipe.

Segue meu currículo em anexo para sua análise. Fico à disposição para conversar sobre minha experiência e conhecer oportunidades alinhadas ao meu perfil.`,
};

const BODY_OUTRO = {
  en: `Thank you for your time and consideration.

Best regards,
Faruk Zahra`,
  pt: `Agradeço seu tempo e consideração.

Atenciosamente,
Faruk Zahra`,
};

function normalizeLanguage(language) {
  return language === "pt" ? "pt" : "en";
}

function parseSalaryAmount(raw) {
  if (raw === null || raw === undefined) return null;
  const cleaned = String(raw).replace(/[^\d.,]/g, "").replace(",", ".");
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

function formatSalaryAmount(value, language) {
  const isInteger = Number.isInteger(value);
  const fractionDigits = isInteger ? 0 : 2;

  if (language === "pt") {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function buildSalaryParagraph({ language, amount, currency }) {
  const formatted = formatSalaryAmount(amount, language);

  if (language === "pt") {
    if (currency === "BRL") {
      return `Minha pretensão salarial mensal é de R$ ${formatted}.`;
    }
    return `Minha pretensão salarial mensal é de US$ ${formatted}.`;
  }

  return `My monthly salary expectation is ${currency} ${formatted}.`;
}

function buildEmailBody({ language, includeSalary, salaryAmount, salaryCurrency }) {
  const lang = normalizeLanguage(language);
  const parts = [BODY_INTRO[lang]];

  if (includeSalary) {
    const amount = parseSalaryAmount(salaryAmount);
    const currency = salaryCurrency === "BRL" ? "BRL" : "USD";
    if (amount !== null) {
      parts.push(buildSalaryParagraph({ language: lang, amount, currency }));
    }
  }

  parts.push(BODY_OUTRO[lang]);
  return parts.join("\n\n");
}

function getDefaultSubject(language) {
  return SUBJECT_DEFAULTS[normalizeLanguage(language)];
}

function getDefaultCurrency(language) {
  return normalizeLanguage(language) === "pt" ? "BRL" : "USD";
}

module.exports = {
  SUBJECT_DEFAULTS,
  buildEmailBody,
  getDefaultCurrency,
  getDefaultSubject,
  normalizeLanguage,
  parseSalaryAmount,
};
