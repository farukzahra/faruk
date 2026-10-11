# Agent tooling rollout — MCP, LSP, skills, plugins

**Date:** 2026-10-11
**Status:** Approved
**Skills:** `opencode` (V2 config) · `project-init` · `brainstorming`

## Goal

Give every project listed in `docs/projects.json` a working agent toolchain — shared MCP servers, enabled LSP, functioning formatters, complete skill packs — and document the plugin gap, without touching unrelated uncommitted work in those repos.

## Evidence — current state (measured, not assumed)

| Axis | State before this work |
|------|------------------------|
| Global config `~/.config/opencode/opencode.jsonc` | Only `$schema` — nothing configured |
| Per-project config | No `opencode.json(c)`, `.mcp.json`, or `.cursor/mcp.json` in any project |
| MCP servers | Zero, anywhere |
| LSP | Disabled (OpenCode default is off) |
| Formatter | Disabled (OpenCode default is off) |
| Skills | Working via `.agents/skills/`, but uneven (3 → 38 skills) |
| `opencode` on PATH | Absent; CLI lives at `%APPDATA%\ai.opencode.desktop\cli\<version>\opencode-cli.exe` |

Desktop app is **2.0.26** and its bundled CLI/server is **opencode v2.0.26** (`serve --service`, `127.0.0.1:49374`). All configuration below targets OpenCode **V2**.

### Real stacks (read from each `package.json` / `pyproject.toml`)

| Project | Stack | Playwright | Prisma | `typescript` dep |
|---|---|---|---|---|
| faruk | Express + `frontend` Vue 3/Vuetify/Vite | yes | — | yes |
| financeiro | npm workspaces: Fastify + Drizzle + Postgres / Vue 3 + Pinia | yes | — | yes |
| job-hunter | Fastify + Prisma + pg / Vue 3 | yes | yes (`backend`) | yes |
| maco | Next.js + antd + Auth.js + Prisma + prettier + eslint | yes | yes (root) | yes |
| farmar-aura | Static HTML/CSS/JS + Markdown, no `package.json` | — | — | — |
| ms-poc | Vue 3 + FastAPI (uv workspace) + Semantic Kernel + Azure OpenAI | yes | — | yes |
| terapia | Next.js + Prisma + Stripe + oxlint | yes | yes (root) | yes |
| fumei | Android Kotlin / Compose / Room (Gradle) | — | — | — |

### Prisma MCP is real (verified)

`prisma@6.19.3` installed in `terapia` exposes the subcommand:

```
mcp   Starts an MCP server to use with AI development tools
```

Schema locations: `terapia/prisma/schema.prisma`, `maco/prisma/schema.prisma`, `job-hunter/backend/prisma/schema.prisma`.

### Package verification (npm registry + HTTP, 2026-10-11)

| Package / endpoint | Version | Trust |
|---|---|---|
| `chrome-devtools-mcp` | 1.10.1 (2026-09-23) | active |
| `@mobilenext/mobile-mcp` | 1.0.9 (2026-10-09) | active; bin is `mcp-server-mobile` |
| `@azure/mcp` | 3.0.0-beta.50 | **beta**; bin is `azmcp` |
| `@playwright/mcp` | 0.0.83 | active (not used — see decisions) |
| `https://mcp.context7.com/mcp` | — | documented by OpenCode itself |
| `https://api.githubcopilot.com/mcp/` | HTTP 401 unauthenticated | exists; OAuth required |
| `@modelcontextprotocol/server-postgres` | 0.6.2 (2024-12-04) | **deprecated** — rejected |

## Locked decisions

| Axis | Choice |
|---|---|
| Scope | Global config + per-project MCP + LSP/formatter + skills + `/init` conventions |
| Browser MCP | `chrome-devtools-mcp` only (not Playwright MCP — repos already ship Playwright tests) |
| Config split | Global for shared MCP/LSP/formatter; project file only for project-specific MCP |
| Other repos | Editable and committable, **no push** |
| Postgres MCP | Prisma-native `prisma mcp` where Prisma exists; `financeiro` gets none (official server deprecated, third parties unvetted) |
| Azure MCP | Enabled in `ms-poc`; invocation verified as `azmcp server start` (still beta, 3.0.0-beta.50) |
| Plugins | Documented only — no third-party plugin is published in the V2 docs catalog |

## Architecture

### 1. Global configuration

`~/.config/opencode/opencode.jsonc` becomes the single shared surface:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" },
      "github": { "type": "remote", "url": "https://api.githubcopilot.com/mcp/" }
    }
  },
  "lsp": true,
  "formatter": true
}
```

`github` is OAuth: registration is not enough; sign-in happens once via `/mcps` in the app. It is reported as *configured, awaiting sign-in* until then.

### 2. Per-project configuration

Each project gets `<repo>/opencode.jsonc` holding **only** its own MCP servers. `cwd` is set where the server must run outside the repo root.

| Project | MCP added | Command / URL | Notable fields |
|---|---|---|---|
| faruk | chrome-devtools | `npx -y chrome-devtools-mcp@latest` | — |
| financeiro | chrome-devtools | same | `cwd: apps/web` |
| job-hunter | chrome-devtools, prisma | `npx -y chrome-devtools-mcp@latest`, `npx prisma mcp` | prisma `cwd: backend` |
| maco | chrome-devtools, prisma | same | — |
| farmar-aura | chrome-devtools | same | — |
| ms-poc | chrome-devtools, azure | `npx -y chrome-devtools-mcp@latest`, `npx -y -p @azure/mcp@latest azmcp server start` | — |
| terapia | chrome-devtools, prisma | same | — |
| fumei | mobile | `npx -y -p @mobilenext/mobile-mcp@latest mcp-server-mobile` | Android emulator/device |

### 3. Skills

Installed through the existing mechanism (`npx skills add …`), which copies into `.agents/skills/` and updates `skills-lock.json` — no new tooling invented.

| Project | Added |
|---|---|
| faruk, financeiro, job-hunter, ms-poc, farmar-aura, terapia | `farukzahra/agent-skills` (all published) + `mattpocock/skills@handoff` |
| terapia (extra) | `prisma-*`, `playwright-best-practices`, `tdd`, `frontend-design`, `nodejs-backend-patterns` |
| farmar-aura (extra) | `danjdewhurst/story-skills` — story-init, chapter-writing, character-management, worldbuilding, plot-structure, revision-continuity, story-maintenance |
| fumei | `farukzahra/agent-skills` + `wshobson/agents@mobile-android-design` + `hitoshura25/claude-devtools@android-playstore-setup` |
| maco | already complete — no skill change |

`skills-sh-maintainer` is removed after install outside the `agent-skills` repo (documented rule in `project-init`).

### 4. CLI availability

A version-agnostic shim at `%USERPROFILE%\bin\opencode.cmd` resolves the newest staged CLI under `%APPDATA%\ai.opencode.desktop\cli\`, so `opencode mcp list` works from any terminal and survives desktop updates.

### 5. Commit policy (dirty repos)

`git status` before this work: maco 0, fumei 0, financeiro 1, faruk 4, ms-poc 5, job-hunter 6, farmar-aura 18, terapia 47.

- Clean repos commit normally.
- Dirty repos stage **only** files this rollout creates or rewrites (`.agents/skills/**`, `skills-lock.json`, `opencode.jsonc`, `.opencode/**`). Pre-existing modifications stay untouched.
- No `git push` anywhere.

## Per-project LSP / formatter activation

With `lsp: true` and `formatter: true` globally, built-ins activate only where their dependency exists:

| Project | LSP that activates | Formatter that runs |
|---|---|---|
| faruk | typescript, vue | none (no prettier/biome dep) |
| financeiro | typescript, vue | none |
| job-hunter | typescript, vue, prisma | none |
| maco | typescript, eslint, prisma | prettier |
| farmar-aura | none | none |
| ms-poc | typescript, vue (pyright needs a `pyright` dep) | uv (`.py`) |
| terapia | typescript, oxlint, prisma | none (`oxlint` is a linter; `oxfmt` not a dep) |
| fumei | kotlin-ls | ktlint (needs the command installed) |

Adding `prettier`/`oxfmt` to the projects with no formatter is **out of scope** here and recorded as follow-up.

## Non-goals

- Writing any plugin. The V2 docs publish no plugin catalog (`/v2/docs/ecosystem/` → 404); plugins are reported as an opportunity, not delivered.
- Adding MCP to `financeiro` for Postgres.
- Installing `prettier`/`oxfmt` into projects that lack one.
- `git push`, deploy, or CI changes.
- Touching repos outside the 8 catalog projects (e.g. `blog`, `sounds`, `zoora`) even though the existing sync scripts would.

## Risks

| Risk | Mitigation |
|---|---|
| `lsp: true` globally starts language servers in every project, including large ones | Documented; set `OPENCODE_DISABLE_LSP_DOWNLOAD=true` to stop auto-downloads. Per-project `lsp: false` remains available |
| Global config has no git history | Back up to `~/.config/opencode/opencode.jsonc.bak` before writing |
| Dirty repos mixing unrelated work | Stage explicit paths only; never `git add -A` |
| `github` MCP stays unauthenticated | Report status honestly; user signs in with `/mcps` |
| `npx skills add` network dependency | Failure is non-fatal per repo; report which repos failed |

## Success criteria

1. `opencode mcp list` shows `context7` connected and `github` configured.
2. Every one of the 8 projects has an `opencode.jsonc` whose MCP servers match the matrix.
3. `skills-lock.json` in each touched repo lists the newly installed skills; `skills-sh-maintainer` is absent outside `agent-skills`.
4. Each touched repo has a commit containing only rollout files.
5. `npm run dev:check` in faruk still passes (no regression from tooling).
