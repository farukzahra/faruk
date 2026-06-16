# agents.md — Faruk Resume Site

Guia para agentes/IA que editam este projeto. **Leia antes de alterar CSS ou layout.**

## Regra principal

Não invente padrões novos. Reutilize classes, variáveis e blocos já definidos em `styles.css`. Se precisar de algo diferente, estenda o padrão existente e documente aqui.

---

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura do currículo (ordem do DOM = ordem mobile) |
| `styles.css` | Único stylesheet — todo padrão visual está aqui |
| `assets/` | Foto, PDF, imagens |

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

## Checklist antes de commitar CSS

- [ ] Li `styles.css` e este `agents.md`  
- [ ] Reutilizei variáveis e classes existentes  
- [ ] Separadores = `border-bottom` padrão de seção  
- [ ] Breakpoint 821px respeitado  
- [ ] Testei mobile (coluna branca) e desktop (sidebar azul)
