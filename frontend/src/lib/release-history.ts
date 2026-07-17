import { api } from "@/lib/api";

export interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  type: string;
  commit?: string;
}

export interface ReleaseHistory {
  currentVersion: string;
  updatedAt: string;
  entries: ReleaseEntry[];
}

export const versionBumpRules = [
  {
    change: "Nova funcionalidade visível ao usuário",
    bump: "MINOR",
    example: "0.12.0 → 0.13.0",
  },
  {
    change: "Correção ou ajuste pequeno, sem feature nova",
    bump: "PATCH",
    example: "0.13.0 → 0.13.1",
  },
  {
    change: "Mudança incompatível (API, migração, comportamento removido)",
    bump: "MAJOR",
    example: "0.13.1 → 1.0.0",
  },
  {
    change: "Docs, testes, CI ou refatoração sem efeito visível",
    bump: "Sem bump",
    example: "Não adiciona entrada",
  },
] as const;

export const releaseFieldRules = [
  {
    field: "currentVersion",
    rules: "Última versão MAJOR.MINOR.PATCH; deve coincidir com entries[0].version.",
  },
  {
    field: "updatedAt",
    rules: "Timestamp ISO 8601 UTC da última escrita do arquivo.",
  },
  {
    field: "entries",
    rules: "Mais recente primeiro; não apagar entradas antigas salvo pedido explícito.",
  },
  {
    field: "version",
    rules: "MAJOR.MINOR.PATCH estrito — sempre três partes numéricas.",
  },
  {
    field: "date",
    rules: "YYYY-MM-DD (UTC ou fuso do projeto, consistente).",
  },
  {
    field: "title",
    rules: "Título imperativo ou passado, ≤80 caracteres, linguagem voltada ao usuário.",
  },
  {
    field: "summary",
    rules: "Impacto visível em linguagem simples; sem boilerplate de commit.",
  },
  {
    field: "type",
    rules: "feat | fix | refactor | perf | docs | chore | breaking",
  },
  {
    field: "commit",
    rules: "SHA curto (7 caracteres) após o commit; omitir enquanto rascunho.",
  },
] as const;

export async function fetchReleaseHistory(): Promise<ReleaseHistory> {
  const { data } = await api.get<ReleaseHistory>("/release-history");
  return data;
}
