# agents.md — Faruk Resume Site

Guia para agentes/IA que editam este projeto. **Leia antes de alterar CSS ou layout.**

## Regra principal

Não invente padrões novos. Reutilize classes, variáveis e blocos já definidos em `frontend/src/styles.css`. Se precisar de algo diferente, estenda o padrão existente e documente aqui.

Stack completa: **`docs/ARQUITETURA.md`** (Vue 3 + Vuetify + Express).

---

## Agent workflow (skills)

Skills em `.agents/skills/` (origem: `../faruk_base`, filtradas para este stack). Fonte de verdade do **quando** usar:

```
brainstorming
  → writing-plans
  → implement (vue-best-practices + frontend-design / nodejs-backend-patterns / tdd)
  → verification-before-completion
  → /commit-push ou "Commita" (caveman-commit + push)
```

| Fase | Skill | Regra |
|------|-------|-------|
| Design | `brainstorming` | Sem código até design aprovado; spec em `docs/superpowers/specs/` |
| Plano | `writing-plans` | Plano em `docs/superpowers/plans/` |
| UI Vue | `vue-best-practices`, `frontend-design` | Respeitar padrões em `styles.css` + este doc |
| API Express | `nodejs-backend-patterns` | Ao tocar `server.js` / `lib/` |
| Testes | `tdd`, `playwright-best-practices` | Quando houver testes / E2E |
| Debug | `systematic-debugging` | Causa raiz antes de patch |
| Done | `verification-before-completion` | Evidência (build/test) antes de afirmar sucesso |
| Commit | `caveman-commit` + `.cursor/commands/commit-push.md` | Só com pedido explícito / `/commit-push` / "Commita" |

Lock externo: `skills-lock.json`. Restaurar após clone: `npx skills experimental_install` (se disponível).

**Não copiados** de faruk_base (fora do stack): `prisma-*`, `vercel-react-best-practices`, `semantic-version`.

---

## Instruções do usuário (atualizar sempre)

**Sempre que o usuário der uma ordem nova**, registrar nesta seção antes de encerrar a tarefa.

| Ordem | O que fazer |
|---|---|
| **Enviar Currículo** | Ícone avião → dialog (destinatário, assunto editável, idioma EN/PT, pretensão salarial opcional) → API `/api/send-resume` via **Gmail API**. Corpo do e-mail montado no servidor conforme idioma. Remetente: `farukz@gmail.com`. Local: `.env` + `npm run google:auth`. Produção: secrets no GitHub. Renovar token: `npm run google:auth` → `npm run sync:gmail` (GitHub + VPS). Deploy copia PDF de `public/assets` para `dist/assets` após build. |
| **Rodapé / Sobre** | Rodapé global (`AppFooter.vue`) fora do `.resume`; oculto em `@media print` (não entra no PDF). Link **Sobre** → `/about` com tabelas da skill `semantic-version` + histórico de `docs/release-history.json` via `GET /api/release-history`. Bump de versão só em `/commit-push`. |
| **Ao terminar task** | Subir ambiente local (`npm run dev`) se não estiver no ar e informar URL **http://localhost:5173/** (Vite + proxy `/api` → :3000). |
| **"Commita" / pedido de commit** | Commitar **tudo** que estiver pendente + **push** para `origin/main` (dispara deploy). Mensagem em Conventional Commits, **em inglês**. Preferir `/commit-push`. |
| **Migrar para Vue 3** | Seguir `docs/ARQUITETURA.md` — Vue 3 + Vuetify + Express; Caddy `reverse_proxy` :3000 |
| **Logs / debug VPS** | SSH via chave compartilhada (ver seção **VPS — acesso e logs** abaixo). Log da app: `/var/log/faruk.log`. Erro Gmail comum: `Send error: invalid_grant` → renovar `GOOGLE_REFRESH_TOKEN`. |
| **GitHub PAT** | Já temos. Usar `GITHUB_TOKEN` do `.env` local (não commitar). Cópia canônica: `../financeiro/planos/vps-secrets/github-pat.txt`. Serve para `npm run github:secrets` / `npm run sync:gmail`. |
| **Skills / Faruk Base** | Manter skills alinhadas a `../faruk_base` quando fizer sentido (Vue/Express/superpowers). Novas features: seguir workflow brainstorming → writing-plans antes de implementar. |
| **Currículo Phase A** | Conteúdo ATS em `ResumeView.vue` per `docs/superpowers/specs/2026-07-15-resume-content-phase-a-design.md`. Phase D (Technologies/SEO/visual) depois que o usuário validar o conteúdo. |
| **PDF do currículo** | Gerar com `npm run pdf` (Playwright/Chromium + `@media print`). Saída: `frontend/public/assets/Faruk Zahra - CV - Resume.pdf`. Rodar após mudar conteúdo. |
| **LinkedIn** | Sem API pessoal para editar About/Experience. Texto para colar: `docs/linkedin-paste.md`. |

---

## Arquivos

| Arquivo | Função |
|---|---|
| `frontend/src/views/ResumeView.vue` | Estrutura do currículo (ordem do DOM = ordem mobile) |
| `frontend/src/styles.css` | Único stylesheet — todo padrão visual está aqui |
| `frontend/src/components/SendResumeDialog.vue` | Dialog Vuetify + POST `/api/send-resume` |
| `frontend/src/components/AppFooter.vue` | Rodapé do site (link Sobre; oculto no print/PDF) |
| `frontend/src/views/AboutView.vue` | Página `/about` — versionamento e histórico de releases |
| `frontend/src/router/index.ts` | Vue Router (`/` currículo, `/about`) |
| `docs/release-history.json` | Histórico semântico de releases (fonte da página Sobre) |
| `.agents/skills/semantic-version/` | Skill de bump de versão (copiada do faruk_base) |
| `frontend/src/lib/api.ts` | Cliente axios |
| `frontend/src/plugins/vuetify.ts` | Tema Vuetify `faruk` |
| `lib/gmail.js` | Gmail API (OAuth refresh token) |
| `server.js` | Express: serve `frontend/dist` + API |
| `scripts/google-auth.js` | Autorização OAuth local (`npm run google:auth`) |
| `scripts/deploy-vps.sh` | Deploy VPS + build + Caddy + PM2 |
| `package.json` | Scripts raiz (`npm run dev`, `npm start`) |
| `.env` | Credenciais locais (não commitar) |
| `frontend/public/assets/` | Foto, PDF, imagens |
| `.agents/skills/` | Skills do agente (brainstorming, Vue, etc.) |
| `.cursor/commands/commit-push.md` | Comando `/commit-push` |
| `docs/superpowers/specs/` | Design specs aprovadas |
| `docs/superpowers/plans/` | Planos de implementação |

---

## Gmail API

### Google Cloud (uma vez)

1. Enable **Gmail API**
2. OAuth client: **Web application**
3. Redirect URI: `http://localhost:3333/oauth2callback`
4. OAuth consent screen → **Test users** → `farukz@gmail.com`

### Local

```bash
cp .env.example .env   # preencher CLIENT_ID e SECRET
npm run google:auth    # gera GOOGLE_REFRESH_TOKEN no .env
npm run build          # frontend/dist
npm start              # ou npm run dev (Vite :5173 + API :3000)
```

### GitHub Secrets (produção)

| Secret | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID do Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Client Secret |
| `GOOGLE_REFRESH_TOKEN` | Token do `npm run google:auth` |
| `GMAIL_USER` | `farukz@gmail.com` (opcional) |

Deploy escreve `.env`, roda `npm run build`, reinicia PM2 e configura Caddy `reverse_proxy` → `:3000`.

### Validade do refresh token (não parametrizável)

**Não existe configuração de “1 ano” no `.env` ou no código.** O Google define a vida do `GOOGLE_REFRESH_TOKEN`:

| Status do app (OAuth consent screen) | Comportamento |
|---|---|
| **Testing** (modo atual típico) | Refresh token **expira em 7 dias** → `invalid_grant` no log |
| **In production** | Token **não expira por calendário**; vale até revogação, troca de senha (escopos Gmail), 6 meses sem uso, ou limite de 50 tokens por usuário/cliente |

O código já renova o **access token** automaticamente (via `googleapis` + refresh token). O que quebra é o **refresh token** em si — não há como estender isso por código.

**Para parar de renovar a cada semana:**

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **OAuth consent screen**
2. **Publishing status** → **In production** (não “Testing”)
3. Escopo `gmail.send` é sensível/restrito: pode aparecer tela “unverified app” ou exigir verificação Google para uso amplo; para uso **só seu** (`farukz@gmail.com` enviando currículo), publicar em Production costuma bastar
4. Rodar de novo `npm run google:auth` **depois** de publicar (token gerado em Testing continua com limite de 7 dias)
5. Atualizar secret `GOOGLE_REFRESH_TOKEN` no GitHub + redeploy

**Manutenção eventual (modo Production):** reautorizar só se `invalid_grant` voltar (revogação em https://myaccount.google.com/permissions, 6+ meses parado, etc.).

---

## Variáveis CSS (`:root`)

```css
--navy-dark: #1a3d63;      /* sidebar desktop */
--navy-light: #3d7ab8;     /* títulos, links, timeline */
--text-dark: #1a1a1a;
--text-muted: #444;
--border: #d0d8e0;         /* separadores de seção */
--scale: 1;                /* mobile */
--sidebar-width: 240px;
--photo-size: 120px;
--page-pad-x: 20px;
--page-pad-y: 24px;
```

Desktop (`min-width: 821px`): `--scale: 2`, `--sidebar-width: 480px`, paddings maiores.

**Sempre use `calc(... * var(--scale))` para tamanhos derivados do scale.**

---

## Breakpoint único

- **Mobile:** `max-width: 820px` — coluna única, fundo branco, foto oculta
- **Desktop:** `min-width: 821px` — grid 2 colunas, sidebar azul à esquerda

Não criar outros breakpoints sem atualizar este doc.

---

## Layout

### Mobile (coluna única, ordem do DOM)

1. `.resume-header` — nome, cargo, contatos  
2. `.resume-summary`  
3. `.resume-sidebar` — skills, languages, certifications (branco)  
4. `.resume-experience` → `.resume-education` → `.resume-roles`

### Desktop (CSS Grid)

```text
grid-template-areas:
  "sidebar header"
  "sidebar summary"
  "sidebar experience"
  "sidebar education"
  "sidebar roles"
```

Classes de área: `.resume-header`, `.resume-summary`, `.resume-sidebar`, `.resume-experience`, `.resume-education`, `.resume-roles`.

---

## Separador entre seções (padrão do site)

**Este é o único “quebra” visual entre blocos.** Não usar `border-top` customizado, margens extras ou `page-break` salvo pedido explícito.

```css
.main-section,
.sidebar-section {
  margin-bottom: calc(22px * var(--scale));
  padding-bottom: calc(18px * var(--scale));
  border-bottom: calc(1px * var(--scale)) solid var(--border);
}
```

Remover borda só no **último** bloco de cada coluna:

- `.main-section:last-child` — última seção do fluxo principal  
- `.sidebar .sidebar-section:last-child` — **somente desktop** (sidebar azul)

**Importante:** no mobile, a última `.sidebar-section` (Certifications) **mantém** `border-bottom` porque Experience vem depois no DOM. Não usar `.sidebar-section:last-child` globalmente para remover borda.

O header usa o mesmo separador via `.header { border-bottom: ... }`.

---

## Títulos de seção

Compartilhados por `.main-section > h2` e `.sidebar-section > h2`:

- Ícone circular: `.section-icon` + Font Awesome dentro  
- Cor mobile/desktop conteúdo: `var(--navy-light)`  
- Desktop sidebar: `.sidebar .sidebar-section > h2 { color: #fff }` e ícones brancos

---

## Sidebar

| Viewport | Fundo | Texto listas | Foto |
|---|---|---|---|
| Mobile | branco | `--text-muted` | oculta |
| Desktop | `--navy-dark` | `#fff` | visível |

Skills no mobile: tags via `.sidebar-section--skills ul/li` (flex wrap, pills azul claro).

---

## Header e contatos

- `.header` — separador inferior padrão  
- `.contact` — coluna no mobile, row wrap no desktop  

---

## Timeline e roles

- `.timeline` — linha vertical `--navy-light`, marcadores circulares  
- `.roles-grid` — 2 colunas mobile, 4 colunas desktop  

---

## Print

Apenas reset de fundo/sombra em `@media print`. **Sem** `page-break-before/after` por padrão.

---

## Deploy

- Push em `main` → GitHub Actions → SSH VPS → `scripts/deploy-vps.sh`  
- Path VPS: `/opt/faruk`  
- Domínio: `faruk.dev.br`

---

## Credenciais locais (não commitar)

| Variável / recurso | Onde está |
|---|---|
| `GOOGLE_*` / `GMAIL_USER` | `.env` na raiz do faruk |
| `GITHUB_TOKEN` (PAT, escopo `repo`) | `.env` do faruk **e** cópia canônica em `../financeiro/planos/vps-secrets/github-pat.txt` |
| Chave SSH VPS | `../financeiro/planos/vps-secrets/deploy_key` |

Scripts que usam o PAT: `npm run github:secrets`, `npm run sync:gmail`.

---

## VPS — acesso e logs

Credenciais e guia completo ficam no repo **financeiro** (mesma VPS multisite):

| Recurso | Caminho |
|---|---|
| Chave SSH (GitHub Actions / agentes) | `../financeiro/planos/vps-secrets/deploy_key` |
| Guia deploy multisite | `../financeiro/planos/guia-deploy-vps.local.md` |
| Chave alternativa local | `~/.ssh/faruk-vps-deploy` (pode não estar autorizada na VPS) |

### SSH

```bash
ssh -i ../financeiro/planos/vps-secrets/deploy_key root@66.23.231.218
```

| Campo | Valor |
|---|---|
| Host | `66.23.231.218` |
| User | `root` |
| Port | `22` |
| App path | `/opt/faruk` |

### Onde ver logs

A VPS **não tem PM2** instalado para o faruk — o processo roda com `nohup node server.js` (ver `scripts/deploy-vps.sh`).

| O quê | Comando / path |
|---|---|
| **Log principal da app** | `tail -100 /var/log/faruk.log` |
| Processo Node | `ps aux \| grep 'node server.js'` |
| `.env` produção | `/opt/faruk/.env` (Gmail secrets) |
| Caddy | `/etc/caddy/Caddyfile` |

Erros de `/api/send-resume` aparecem em `/var/log/faruk.log` como `Send error: <mensagem>` (ver `server.js`).

### Diagnóstico conhecido (2026-07-09)

500 em `POST /api/send-resume` → log em `/var/log/faruk.log`:

```text
Send error: invalid_grant
```

**Causa:** `GOOGLE_REFRESH_TOKEN` expirado ou revogado na VPS / GitHub Secrets.  
**Causa frequente:** app OAuth ainda em **Testing** (tokens expiram em **7 dias** — ver seção Gmail API).  
**Correção:** publicar app em **In production** no Google Cloud, rodar `npm run google:auth` localmente, atualizar secret `GOOGLE_REFRESH_TOKEN` no GitHub e redeploy (ou editar `/opt/faruk/.env` + reiniciar o processo Node).

---

## Checklist antes de commitar CSS

- [ ] Li `frontend/src/styles.css` e este `agents.md`  
- [ ] Reutilizei variáveis e classes existentes  
- [ ] Separadores = `border-bottom` padrão de seção  
- [ ] Breakpoint 821px respeitado  
- [ ] Testei mobile (coluna branca) e desktop (sidebar azul)
