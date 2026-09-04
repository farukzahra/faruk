# Resume — design tokens (visual only)

Tokens extraídos de `frontend/src/styles.css`. **Sem layout** — apenas cores, tipografia, escala, bordas, sombras e estados.

Fonte de verdade no código: variáveis `:root`, bloco `.resume.resume--lumen` e `body.lumen-theme-active`.

---

## Temas

| Tema | Classe / contexto | Uso |
|------|-------------------|-----|
| **Classic** | padrão (sem modificador) | CV base: branco + azul navy |
| **Lumen Night Foundry** | `body.lumen-theme-active` + `.resume--lumen` | CV atual no site: escuro + accent laranja |

---

## Escala (`--scale`)

Multiplicador de tamanhos visuais (fontes, bordas, ícones). **Não define layout.**

| Viewport | `--scale` |
|----------|-----------|
| ≤ 820px | `1` |
| ≥ 821px | `2` |

**Regra:** valores visuais = `calc(Npx * var(--scale))`.

Exemplos: corpo `11px`, h1 mobile `24px`, h1 desktop `28px`, h2 seção `12px`, parágrafo `10.5px`.

---

## Fontes

### Classic

| Papel | Stack |
|-------|-------|
| Tudo | `"Open Sans", Arial, sans-serif` |

**Google Fonts:** [Open Sans 400/600/700](https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap)

### Lumen

| Papel | Token | Stack |
|-------|-------|-------|
| Display (nome, cargos timeline) | `--lumen-font-display` | `"Instrument Serif", Georgia, serif` |
| Corpo | `--lumen-font-body` | `"Geist", "Open Sans", system-ui, sans-serif` |
| Labels (cargo, h2, datas) | `--lumen-font-label` | `"JetBrains Mono", ui-monospace, monospace` |

**Carregamento (como no projeto):**

```html
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css" rel="stylesheet" />
```

---

## Paleta — Classic

| Token | Hex | Uso |
|-------|-----|-----|
| `--navy-dark` | `#1a3d63` | Nome (h1), sidebar desktop, hover botão primário |
| `--navy-light` | `#3d7ab8` | Cargo, keywords, h2, links hover, timeline, ícones |
| `--text-dark` | `#1a1a1a` | Texto principal, títulos de item |
| `--text-muted` | `#444444` | Parágrafos, listas, contatos |
| `--border` | `#d0d8e0` | Separadores entre seções |
| *(page bg)* | `#e8edf2` | Fundo externo da página |
| *(surface)* | `#ffffff` | Fundo do documento / sidebar mobile |
| *(on-dark)* | `#ffffff` | Texto e ícones na sidebar desktop |

### Alphas derivados (Classic)

| Valor | Uso |
|-------|-----|
| `rgba(61, 122, 184, 0.08)` | Fundo botão PDF, skill pill bg |
| `rgba(61, 122, 184, 0.14)` | Hover botão PDF |
| `rgba(61, 122, 184, 0.15)` | Borda skill pill |
| `rgba(61, 122, 184, 0.25)` | Borda botão PDF |
| `rgba(255, 255, 255, 0.15)` | Separador na sidebar desktop |
| `rgba(255, 255, 255, 0.25)` | Borda da foto (desktop) |

---

## Paleta — Lumen Night Foundry

| Token | Valor | Uso |
|-------|-------|-----|
| `--lumen-paper` | `oklch(13% 0.014 265)` | Fundo da página (grid blueprint) |
| `--lumen-panel` | `oklch(17% 0.016 265)` | Sidebar desktop, nav pill |
| *(resume surface)* | `oklch(15% 0.014 265)` | Fundo do CV, borda marker timeline |
| `--lumen-ink` | `oklch(96% 0.006 262)` | Título principal, keywords, skill pill text |
| `--lumen-ink-2` | `oklch(72% 0.008 262)` | Corpo, listas, contatos |
| `--lumen-accent` | `oklch(76% 0.17 50)` | Cargo, h2, ícones, timeline, datas, empresa |
| `--lumen-rule` | `oklch(96% 0.006 262 / 0.12)` | Separadores |
| `--lumen-rule-blueprint` | `oklch(96% 0.006 262 / 0.04)` | Grid de fundo da página |

### Alphas derivados (Lumen)

| Valor | Uso |
|-------|-----|
| `oklch(76% 0.17 50 / 0.05)` | Radial no topo do CV |
| `oklch(76% 0.17 50 / 0.08)` | Radial sidebar, skill pill, botão PDF |
| `oklch(76% 0.17 50 / 0.16)` | Hover botão PDF |
| `oklch(76% 0.17 50 / 0.22)` | Borda skill pill |
| `oklch(76% 0.17 50 / 0.28)` | Borda botão PDF |
| `oklch(76% 0.17 50 / 0.35)` | Borda foto |
| `oklch(80% 0.17 50)` | Hover botão enviar |
| `oklch(17% 0.016 265 / 0.92)` | Nav pill background |
| `oklch(0% 0 0 / 0.35–0.45)` | Sombras |

---

## Tipografia — escala e estilo

`line-height` global: **1.55** (body).

| Elemento | Tamanho | Peso | Letter-spacing | Transform | Classic cor | Lumen font | Lumen cor |
|----------|---------|------|----------------|-----------|-------------|------------|-----------|
| Body | `11px × scale` | 400 | — | — | `--text-dark` | `--lumen-font-body` | `--lumen-ink-2` |
| h1 (nome) | 24 / 28px | 700 / 400 | 0.04em / 0.06em | uppercase | `--navy-dark` | display | `--lumen-ink` |
| `.title` (cargo) | 12 / 13px | 600 / 500 | 0.08em / 0.1em | uppercase | `--navy-light` | label | `--lumen-accent` |
| `.keywords` | 10.5 / 9px | 600 / 500 | — / 0.06em | — / uppercase | `--navy-light` | label | `--lumen-ink` @ 55% opacity |
| Contatos | 10.5px | 400 | — | — | `--text-muted` | body | `--lumen-ink-2` |
| h2 seção | 12px | 700 / 500 | 0.06em / 0.1em | uppercase | `--navy-light` | label | `--lumen-accent` |
| Ícone seção | 11px | — | — | — | `--navy-light` | — | `--lumen-accent` |
| Parágrafo / lista | 10.5px | 400 | — | — | `--text-muted` | body | `--lumen-ink-2` |
| Timeline h3 | 11 / 12px | 700 / 400 | — | — | `--text-dark` | display | `--lumen-ink` |
| `.dates` | 10 / 9px | 600 / 500 | — / 0.04em | — / uppercase | `--text-muted` / inherit | label | `--lumen-accent` |
| `.location` | 10.5px | 600 | — | — | `--navy-light` | — | `--lumen-accent` |
| Roles h3 | 10.5px | 700 / 400 | — | — | `--text-dark` | display | `--lumen-ink` |
| Roles `.company` | 10.5px | 600 | — | — | `--navy-light` | — | `--lumen-accent` |
| Roles `.dates` | 10px | 400 | — | — | `--text-muted` | — | `--lumen-ink-2` |
| Skill pill (mobile) | 11px | 400 | — | — | `--navy-dark` | — | `--lumen-ink` |
| Botões ação | 14px (ícone) | — | — | — | ver abaixo | — | ver abaixo |

**Desktop:** parágrafos em `.section-body` usam `text-align: justify`.

---

## Separadores e bordas

| Token / regra | Classic | Lumen |
|---------------|---------|-------|
| Separador de seção | `1px solid var(--border)` | `1px solid var(--lumen-rule)` |
| Ícone circular (`.section-icon`) | `2px solid var(--navy-light)` | `2px solid var(--lumen-accent)` |
| Timeline linha | `--navy-light` | `--lumen-accent` @ 45% opacity |
| Timeline marker | fill `--navy-light`, ring `--navy-light` | fill `--lumen-accent`, ring `--lumen-accent` |
| Foto perfil | `3px solid rgba(255,255,255,0.25)` | `3px solid oklch(76% 0.17 50 / 0.35)` |

---

## Superfícies e sombras

| Superfície | Classic | Lumen |
|------------|---------|-------|
| Página externa | `#e8edf2` | grid blueprint + `--lumen-paper` |
| Documento CV | `#fff` | radial accent + `oklch(15% 0.014 265)` |
| Sidebar | `#fff` (mobile) / `--navy-dark` (desktop) | `oklch(15%…)` / `--lumen-panel` + radial |
| Sombra CV | `0 4px 24px rgba(0,0,0,0.12)` | `0 4px 32px oklch(0% 0 0 / 0.45)` |

---

## Botões de ação (PDF / Enviar)

Estilo: círculo `32px × scale`, `border-radius: 50%`, transição `0.15s ease`.

### Classic

| Botão | Default | Hover |
|-------|---------|-------|
| PDF (outline) | cor `--navy-light`, bg `rgba(61,122,184,0.08)`, borda `0.25` | bg `0.14`, cor `--navy-dark` |
| Enviar (filled) | bg/borda `--navy-light`, texto `#fff` | bg/borda `--navy-dark` |

**Sidebar desktop (invertido):**

| Botão | Default | Hover |
|-------|---------|-------|
| PDF | texto `#fff`, bg `rgba(255,255,255,0.08)` | bg `0.16` |
| Enviar | bg `#fff`, texto `--navy-dark` | bg `rgba(255,255,255,0.9)` |

### Lumen

| Botão | Default | Hover |
|-------|---------|-------|
| PDF | cor `--lumen-accent`, bg `oklch(76% 0.17 50 / 0.08)` | bg `0.16`, cor `--lumen-ink` |
| Enviar | bg `--lumen-accent`, texto `oklch(15% 0.014 265)` | bg `oklch(80% 0.17 50)` |

---

## Skill pills (mobile)

| | Classic | Lumen |
|---|---------|-------|
| Background | `rgba(61,122,184,0.08)` | `oklch(76% 0.17 50 / 0.08)` |
| Border | `1px solid rgba(61,122,184,0.15)` | `1px solid oklch(76% 0.17 50 / 0.22)` |
| Text | `--navy-dark` | `--lumen-ink` |
| Radius | `999px` | `999px` |
| Padding | `6px 12px` | `6px 12px` |

---

## Ícones

Biblioteca: **Font Awesome 6** (`fa-solid`, `fa-brands`).

| Contexto | Classic | Lumen |
|----------|---------|-------|
| Contatos | `--navy-light` | `--lumen-accent` |
| h2 (`.section-icon`) | `--navy-light` | `--lumen-accent` |
| Sidebar desktop h2 | `#fff` | `--lumen-accent` |
| Link hover contato | `--navy-light` | `--lumen-accent` |

---

## Bloco CSS pronto para copiar

```css
/* ── Classic tokens ── */
:root {
  --navy-dark: #1a3d63;
  --navy-light: #3d7ab8;
  --text-dark: #1a1a1a;
  --text-muted: #444;
  --border: #d0d8e0;
  --scale: 1;
}

@media (min-width: 821px) {
  :root { --scale: 2; }
}

/* ── Lumen tokens (aplicar no body ou wrapper) ── */
.lumen-theme {
  --lumen-paper: oklch(13% 0.014 265);
  --lumen-panel: oklch(17% 0.016 265);
  --lumen-ink: oklch(96% 0.006 262);
  --lumen-ink-2: oklch(72% 0.008 262);
  --lumen-accent: oklch(76% 0.17 50);
  --lumen-rule: oklch(96% 0.006 262 / 0.12);
  --lumen-rule-blueprint: oklch(96% 0.006 262 / 0.04);
  --lumen-font-display: "Instrument Serif", Georgia, serif;
  --lumen-font-body: "Geist", "Open Sans", system-ui, sans-serif;
  --lumen-font-label: "JetBrains Mono", ui-monospace, monospace;
}
```

---

## Mapeamento semântico (referência rápida)

```text
Classic                          Lumen
─────────────────────────────────────────────────
--navy-dark        →  títulos fortes, sidebar bg
--navy-light       →  --lumen-accent (destaques)
--text-dark        →  --lumen-ink
--text-muted       →  --lumen-ink-2
--border           →  --lumen-rule
#fff (surface)     →  oklch(15% 0.014 265)
Open Sans (tudo)   →  display / body / label (3 fontes)
```

---

## Print

Em `@media print`: remove sombra e reseta fundo para branco — **sem alterar tokens de cor do conteúdo**.
