# Stack JS — Faruk Resume

Adaptado de `financeiro/docs/ARQUITETURA.md` para o site de currículo.

Versão atual: **1.0.0**

---

## Estrutura do repositório

```text
faruk/
├── frontend/          # Vue 3 SPA (Vite)
├── lib/               # Gmail API
├── server.js          # Express: API + serve dist/
├── scripts/           # deploy, OAuth, secrets
└── docs/ARQUITETURA.md
```

Sem monorepo pnpm — repo único com `frontend/` separado.

---

## FRONTEND

| Camada | Pacote | Versão |
|--------|--------|--------|
| Framework | `vue` | ^3.5 |
| Build / dev server | `vite` | ^6 |
| Plugin Vue | `@vitejs/plugin-vue` | ^5 |
| Plugin Vuetify | `vite-plugin-vuetify` | ^2 |
| Tipagem SFC | `vue-tsc` | ^2 |
| UI kit | `vuetify` | ^3.7 |
| Ícones UI | `@mdi/font` | ^7.4 |
| Ícones currículo | Font Awesome 6 (CDN) | — |
| HTTP client | `axios` | ^1.7 |
| CSS | CSS puro (`styles.css` + scoped) | — |

### Bootstrap (`frontend/src/main.ts`)

```ts
createApp(App).use(vuetify).mount("#app");
```

- Vuetify via `createVuetify()` em `src/plugins/vuetify.ts`
- Auto-import de componentes Vuetify (`vite-plugin-vuetify`)
- Sem Vue Router / Pinia (SPA de página única)

### Tema Vuetify (`frontend/src/plugins/vuetify.ts`)

Tema **`faruk`** — identidade navy do currículo.

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#3d7ab8` | Botões, links Vuetify |
| `secondary` | `#1a3d63` | Complementar navy |
| `background` | `#e8edf2` | Fundo da página |
| `surface` | `#ffffff` | Cards/dialog |

Layout do currículo usa variáveis CSS em `styles.css` (`--navy-dark`, `--navy-light`, etc.) — **não** tokens Vuetify.

### Estrutura FE

```text
frontend/src/
├── main.ts
├── App.vue
├── styles.css
├── plugins/vuetify.ts
├── composables/useSnackbar.ts
├── components/
│   ├── AppSnackbar.vue
│   └── SendResumeDialog.vue
├── views/ResumeView.vue
└── lib/api.ts
```

### Componentes Vuetify usados

| Componente | Onde |
|------------|------|
| `v-dialog` | SendResumeDialog |
| `v-text-field` | E-mail destinatário |
| `v-btn` | Enviar / Cancelar |
| `v-snackbar` | Feedback global |
| `v-card` | Corpo do dialog |

### Dev

```bash
npm run dev          # Express :3000 + Vite :5173
npm run build        # frontend/dist
npm start            # produção local (serve dist + API)
```

- Vite porta **5173**
- Proxy `/api` → `http://localhost:3000` (sem rewrite — rotas já têm prefixo `/api`)

---

## BACKEND

| Camada | Pacote |
|--------|--------|
| Framework HTTP | `express` |
| Gmail API | `googleapis` |
| Env | `dotenv` |

### Rotas

| Método | Rota | Função |
|--------|------|--------|
| POST | `/api/send-resume` | Envia PDF por Gmail API |
| GET | `/*` | SPA estática (`frontend/dist`) |

Porta padrão: **3000**

---

## PRODUÇÃO (VPS)

```text
Browser → Caddy (HTTPS)
            └─ reverse_proxy → Node Express :3000
                  ├─ /api/*  → API Gmail
                  └─ /*      → frontend/dist (SPA)
```

Deploy: push `main` → GitHub Actions → `scripts/deploy-vps.sh`

O script:
1. Escreve `.env` com secrets Gmail
2. `npm install` + `npm run build` no frontend
3. Reinicia PM2 (`faruk`)
4. Atualiza Caddy: `reverse_proxy 127.0.0.1:3000` (corrige 405 do `file_server`)

Path VPS: `/opt/faruk` — https://faruk.dev.br

---

## Checklist para agentes

1. Layout currículo → `frontend/src/styles.css` + `agents.md`
2. Dialog enviar → `SendResumeDialog.vue` (Vuetify)
3. API → `server.js` + `lib/gmail.js`
4. Nunca commitar `.env`
5. Deploy exige `npm run build` antes do `npm start`
