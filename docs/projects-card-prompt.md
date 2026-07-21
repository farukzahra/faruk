# Prompt — card de projeto para faruk.dev.br

Cole o bloco abaixo no chat do **agente que cuida deste repositório/projeto**. A resposta dele será usada para adicionar um card na página **My Projects** do site de currículo (repo `faruk`, rota `/projects`).

---

## Prompt (copiar e colar)

```
Preciso cadastrar este projeto na página "My Projects" do site de currículo Faruk Zahra (repo faruk, https://www.faruk.dev.br/projects).

Responda SOMENTE com um bloco JSON válido (sem markdown, sem texto antes ou depois) neste formato exato:

{
  "id": "slug-curto-unico",
  "name": "Nome do projeto",
  "stack": "Framework · Backend · DB · … (stack completa, separada por ·)",
  "description": "1–3 frases em inglês para visitantes do currículo — o que é e valor entregue (sem repetir a stack).",
  "url": "https://url-principal-do-projeto"
}

Regras:
- id: kebab-case, único entre todos os projetos (ex.: nfe-bot, job-hunter, financeiro)
- name: título curto, ≤40 caracteres
- stack: tecnologias principais, inglês, separadas por · (ex.: Next.js · React · PostgreSQL · Prisma)
- description: inglês, tom profissional, ≤280 caracteres
- url: URL pública de produção; se não existir ainda, responda com a URL planeada ou diga explicitamente que não há URL pública

Antes do JSON, leia README, package.json e AGENTS.md deste repo para descrever o projeto com precisão.
```

---

## O que fazer com a resposta

No repo **faruk**:

1. Abra `docs/projects.json`
2. Adicione o objeto recebido em `projects[]` (a ordem do array = ordem dos cards na página)
3. Atualize `updatedAt` para a data/hora UTC atual (ISO 8601)
4. Se o `id` já existir, substitua o card em vez de duplicar

Exemplo de entrada em `docs/projects.json`:

```json
{
  "updatedAt": "2026-07-20T12:39:00.000Z",
  "projects": [
    {
      "id": "nfe-bot",
      "name": "NF-e Bot",
      "stack": "Vue 3 · FastAPI · PostgreSQL",
      "description": "SaaS for Brazilian electronic invoice management with LLM-assisted chat for NF-e workflows.",
      "url": "https://nfe.example.com"
    }
  ]
}
```

Para pedir ao agente do **faruk** que inclua o card: envie o JSON retornado pelo agente do outro projeto e peça *"Adiciona este projeto em docs/projects.json"*.
