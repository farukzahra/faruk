const SUBJECT_DEFAULTS = {
  en: "Application — Faruk Zahra (Senior Software Engineer)",
  pt: "Candidatura — Faruk Zahra (Senior Software Engineer)",
};

const BODY_INTRO = {
  en: `Dear Hiring Manager,

I am excited to apply for the position at your company.

I am a Senior Software Engineer with more than 20 years of professional experience, specializing in Java, Spring Boot, distributed systems, REST APIs, cloud-native applications, and backend architecture. Throughout my career, I have designed and delivered scalable, reliable software while collaborating with cross-functional and international teams.

For the last five years, I worked remotely for a U.S.-based company, collaborating daily with American engineers, product managers, and stakeholders. This experience strengthened both my technical expertise and my ability to communicate effectively in an international environment while delivering high-quality software in agile teams.

My background includes designing and implementing microservices, building resilient APIs, optimizing SQL databases, and applying software engineering best practices such as automated testing, CI/CD, observability, and clean architecture. More recently, I have also been expanding my knowledge of AI engineering, LLM integrations, MCP, and intelligent agent systems.

One of the aspects I value most is professionalism and teamwork. I am proud to have received public recommendations on my LinkedIn profile from my American colleagues and managers, reflecting the trust they placed in my technical skills, work ethic, collaboration, and ability to deliver results. I would be happy to share additional professional references upon request.

I am looking for an opportunity where I can contribute my experience, continue solving complex engineering challenges, and help build high-quality software alongside a talented team.`,
  pt: `Prezado(a) Gestor(a) de Contratação,

Tenho muito prazer em me candidatar à vaga na sua empresa.

Sou Engenheiro de Software Sênior com mais de 20 anos de experiência profissional, especializado em Java, Spring Boot, sistemas distribuídos, APIs REST, aplicações cloud-native e arquitetura de backend. Ao longo da minha carreira, projetei e entreguei software escalável e confiável, colaborando com equipes multifuncionais e internacionais.

Nos últimos cinco anos, trabalhei remotamente para uma empresa baseada nos Estados Unidos, colaborando diariamente com engenheiros, product managers e stakeholders americanos. Essa experiência fortaleceu tanto minha expertise técnica quanto minha capacidade de me comunicar de forma eficaz em um ambiente internacional, entregando software de alta qualidade em equipes ágeis.

Minha trajetória inclui projetar e implementar microsserviços, construir APIs resilientes, otimizar bancos de dados SQL e aplicar boas práticas de engenharia de software, como testes automatizados, CI/CD, observabilidade e arquitetura limpa. Mais recentemente, também tenho ampliado meus conhecimentos em engenharia de IA, integrações com LLMs, MCP e sistemas de agentes inteligentes.

Um dos aspectos que mais valorizo é o profissionalismo e o trabalho em equipe. Tenho orgulho de ter recebido recomendações públicas no meu perfil do LinkedIn de colegas e gestores americanos, refletindo a confiança que depositaram em minhas habilidades técnicas, ética de trabalho, colaboração e capacidade de entregar resultados. Fico feliz em compartilhar referências profissionais adicionais, se necessário.

Busco uma oportunidade em que eu possa contribuir com minha experiência, continuar resolvendo desafios complexos de engenharia e ajudar a construir software de alta qualidade ao lado de uma equipe talentosa.`,
};

const BODY_OUTRO = {
  en: `Thank you for considering my application. I look forward to the opportunity to discuss how my experience and background can contribute to your organization.

Sincerely,

Faruk Zahra`,
  pt: `Agradeço pela consideração da minha candidatura. Fico no aguardo da oportunidade de conversar sobre como minha experiência e trajetória podem contribuir para a sua organização.

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
