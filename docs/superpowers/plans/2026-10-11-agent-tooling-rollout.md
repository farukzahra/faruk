# Agent tooling rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the 8 projects in `docs/projects.json` a working OpenCode toolchain — shared MCP servers, LSP and formatters enabled, complete skill packs, `opencode` reachable from any terminal.

**Architecture:** One shared global config (`~/.config/opencode/opencode.jsonc`) carries the servers, LSP and formatter policy that apply everywhere. Each project adds an `opencode.jsonc` holding only its own MCP servers. Skills are installed with the existing `npx skills add` mechanism, which copies into `.agents/skills/` and updates `skills-lock.json`. A scoped runner reuses `agent-skills`'s convention sync instead of re-implementing it per repo.

**Tech Stack:** OpenCode V2 (desktop 2.0.26 / CLI 2.0.26) · npm `skills` CLI · PowerShell 5.1 · Node 22 · per-project npm/pnpm/Gradle toolchains

## Global Constraints

- OpenCode **V2 only**. Config field shapes come from `https://opencode.ai/v2/docs/`.
- Config files are `.jsonc`: keep `"$schema": "https://opencode.ai/config.json"`.
- MCP server names are short and unique after normalization: `context7`, `github`, `chrome-devtools`, `prisma`, `azure`, `mobile`.
- Global config path: `%USERPROFILE%\.config\opencode\opencode.jsonc`.
- **Never** `git add -A` / `git add .` in any repo. Stage explicit paths only.
- **No `git push`** in any repo.
- Repos already dirty before this work: financeiro 1, faruk 4, ms-poc 5, job-hunter 6, farmar-aura 18, terapia 47. maco 0, fumei 0, agent-skills 16.
- Skill installs always pass `-a cursor` (verified to copy, not symlink) and `-y`.
- `skills-sh-maintainer` must not remain in any project outside `agent-skills`.
- Success = `opencode mcp list` works and every project's `opencode.jsonc` matches its matrix row.

---

### Task 1: Global OpenCode config

**Files:**
- Modify: `%USERPROFILE%\.config\opencode\opencode.jsonc`
- Create: `%USERPROFILE%\.config\opencode\opencode.jsonc.bak` (backup)

**Interfaces:**
- Produces: global MCP servers `context7` and `github`; global `lsp`/`formatter` policy consumed by every project task.

- [ ] **Step 1: Back up the current config**

```powershell
Copy-Item "$env:USERPROFILE\.config\opencode\opencode.jsonc" `
  "$env:USERPROFILE\.config\opencode\opencode.jsonc.bak" -Force
Get-Content "$env:USERPROFILE\.config\opencode\opencode.jsonc.bak"
```

Expected: the backup prints `{ "$schema": "https://opencode.ai/config.json" }`.

- [ ] **Step 2: Write the new global config**

```powershell
@'
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "context7": {
        "type": "remote",
        "url": "https://mcp.context7.com/mcp"
      },
      "github": {
        "type": "remote",
        "url": "https://api.githubcopilot.com/mcp/"
      }
    }
  },
  "lsp": true,
  "formatter": true
}
'@ | Set-Content "$env:USERPROFILE\.config\opencode\opencode.jsonc" -Encoding UTF8
```

- [ ] **Step 3: Validate the JSON parses**

Run:

```powershell
Get-Content "$env:USERPROFILE\.config\opencode\opencode.jsonc" -Raw | ConvertFrom-Json | Select-Object -ExpandProperty lsp
```

Expected: `True`. A parse error means the file is broken — fix before continuing.

- [ ] **Step 4: Confirm OpenCode loads the servers**

Run (uses the CLI shim from Task 2; if Task 2 is not done yet, call the staged binary directly):

```powershell
opencode mcp list
```

Expected: `context7` present, `github` present. Remote servers connect automatically; `github` may report `needs authentication` — that is the documented state until `POST /mcps` sign-in. Do **not** try to authorise it from the shell.

- [ ] **Step 5: No commit**

The global config lives outside every repository. There is nothing to commit. Stop here.

---

### Task 2: `opencode` CLI on PATH

**Files:**
- Create: `%USERPROFILE%\bin\opencode.cmd`
- Modify: user PATH (user-scope environment variable)

**Interfaces:**
- Produces: `opencode` command usable from any directory, resolving the newest staged CLI. Consumed by Task 1 Step 4 and Task 10's verification.

- [ ] **Step 1: Create the version-agnostic shim**

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\bin" | Out-Null
@'
@echo off
setlocal
set "CLIROOT=%APPDATA%\ai.opencode.desktop\cli"
set "LATEST="
for /f "delims=" %%d in ('dir /b /ad /o-n "%CLIROOT%" 2^>nul') do (
  if not defined LATEST set "LATEST=%%d"
)
if not defined LATEST (
  echo opencode: no staged CLI found under "%CLIROOT%" 1>&2
  exit /b 1
)
"%CLIROOT%\%LATEST%\opencode-cli.exe" %*
'@ | Set-Content "$env:USERPROFILE\bin\opencode.cmd" -Encoding ASCII
```

- [ ] **Step 2: Add the shim directory to the user PATH**

```powershell
$bin = "$env:USERPROFILE\bin"
$cur = [Environment]::GetEnvironmentVariable("Path", "User")
if ($cur -notlike "*$bin*") {
  [Environment]::SetEnvironmentVariable("Path", ($cur.TrimEnd(';') + ";" + $bin), "User")
  "PATH updated"
} else { "already present" }
```

Expected: `PATH updated` (or `already present` on re-run — the step is idempotent).

- [ ] **Step 3: Verify the shim resolves a version**

```powershell
& "$env:USERPROFILE\bin\opencode.cmd" --version
```

Expected: `opencode v2.0.26`. A version starting with `1.` means the old `%LOCALAPPDATA%\opencode` install got picked up instead; check the shim body.

- [ ] **Step 4: No commit**

Shim and PATH live in the user profile, outside repositories.

---

### Task 3: Scoped convention sync in `agent-skills`

**Files:**
- Modify: `C:\repo\agent-skills\scripts\sync-agent-conventions.ps1`

**Interfaces:**
- Consumes: nothing.
- Produces: `-Repos <string[]>` and `-SkipSkills` parameters. Every project task calls:
  `& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos <name>`

- [ ] **Step 1: Add the parameter block**

Replace the existing `param(...)` block:

```powershell
param(
    [switch]$SkipSkills
)
```

with:

```powershell
param(
    [switch]$SkipSkills,
    # Restrict processing to these repo directory names. Empty = every repo under the parent.
    [string[]]$Repos = @(),
    # Do not write the global OpenCode command mirror (useful for single-repo runs).
    [switch]$SkipGlobalCommands
)
```

- [ ] **Step 2: Gate the global command mirror**

Wrap the global-commands block. Replace:

```powershell
$GlobalOpenCodeDir = Join-Path $env:USERPROFILE ".config\opencode\commands"
New-Item -ItemType Directory -Force -Path $GlobalOpenCodeDir | Out-Null
Get-ChildItem $CanonicalCommands -Filter *.md |
    ForEach-Object {
        $name = $_.BaseName
        $body = Get-Content $_.FullName -Raw
        Set-TextIfChanged -Path (Join-Path $GlobalOpenCodeDir "$name.md") `
            -Text (New-OpenCodeCommand -Name $name -Body $body) | Out-Null
        Write-Host "OpenCode global: $name"
    }
```

with the same block inside an `if (-not $SkipGlobalCommands) { ... }` guard.

- [ ] **Step 3: Apply the repo filter**

Replace the repo enumeration:

```powershell
Get-ChildItem $RepoParent -Directory |
    Where-Object { $SkipDirs -notcontains $_.Name -and (Test-Path (Join-Path $_.FullName ".git")) } |
```

with:

```powershell
Get-ChildItem $RepoParent -Directory |
    Where-Object {
        $SkipDirs -notcontains $_.Name -and
        (Test-Path (Join-Path $_.FullName ".git")) -and
        ($Repos.Count -eq 0 -or $Repos -contains $_.Name)
      } |
```

- [ ] **Step 4: Verify the filter is a no-op by default**

```powershell
cd C:\repo\agent-skills
.\scripts\sync-agent-conventions.ps1 -SkipSkills -SkipGlobalCommands -Repos maco
```

Expected: output lines mentioning only `maco` (rule / AGENTS.md / OpenCode commands). No other repo name appears.

- [ ] **Step 5: Verify a scoped run changes nothing in a clean repo**

```powershell
git -C C:\repo\maco status --porcelain
```

Expected: empty. The script writes only when content actually changes.

- [ ] **Step 6: Commit only this file**

```powershell
cd C:\repo\agent-skills
git add scripts/sync-agent-conventions.ps1
git commit -m "feat(scripts): scoped repo filter for convention sync"
git show --stat --oneline HEAD
```

Expected: one file changed, matching the commit message. Other dirty files in `agent-skills` stay uncommitted.

---

### Task 4: faruk

**Files:**
- Create: `C:\repo\faruk\opencode.jsonc`
- Modify: `C:\repo\faruk\docs\superpowers\plans\2026-10-11-agent-tooling-rollout.md` (this plan — check off boxes)

**Interfaces:**
- Consumes: global config (Task 1), scoped sync (Task 3).
- Produces: `opencode.jsonc` with a `chrome-devtools` MCP server.

- [ ] **Step 1: Create the project config**

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
      }
    }
  }
}
```

- [ ] **Step 2: Install the published skill pack**

```powershell
cd C:\repo\faruk
npx --yes skills add farukzahra/agent-skills -a cursor -y
npx --yes skills add mattpocock/skills@handoff -a cursor -y
```

Expected: `farukzahra/agent-skills` lists ~17 skills all marked `(copied)` into `.\.agents\skills\`.

- [ ] **Step 3: Drop `skills-sh-maintainer`**

```powershell
cd C:\repo\faruk
npx --yes skills remove skills-sh-maintainer -y
Test-Path .agents\skills\skills-sh-maintainer
```

Expected: `False`.

- [ ] **Step 4: Sync conventions, scoped to this repo**

```powershell
& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos faruk
```

Expected: lines mentioning `faruk` only.

- [ ] **Step 5: Commit only rollout files**

```powershell
cd C:\repo\faruk
git add opencode.jsonc .agents/skills skills-lock.json .opencode .cursor AGENTS.md docs/superpowers
git status --porcelain
git commit -m "chore(agents): enable opencode MCP, LSP and full skill pack"
git show --stat --oneline HEAD
```

Expected: the commit contains `opencode.jsonc`, skill directories, `skills-lock.json`, the spec and plan docs. Pre-existing faruk changes (if any) stay unstaged — check `git status --porcelain` output before committing.

- [ ] **Step 6: Verify no regression**

```powershell
cd C:\repo\faruk
npm run dev:check
```

Expected: passes, as before this change.

---

### Task 5: financeiro

**Files:**
- Create: `C:\repo\financeiro\opencode.jsonc`

**Interfaces:**
- Consumes: global config (Task 1), scoped sync (Task 3).
- Produces: `opencode.jsonc` with `chrome-devtools`, `cwd` pinned to the web workspace.

- [ ] **Step 1: Create the project config**

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"],
        "cwd": "apps/web"
      }
    }
  }
}
```

- [ ] **Step 2: Install skills**

```powershell
cd C:\repo\financeiro
npx --yes skills add farukzahra/agent-skills -a cursor -y
npx --yes skills add mattpocock/skills@handoff -a cursor -y
```

- [ ] **Step 3: Drop `skills-sh-maintainer`**

```powershell
cd C:\repo\financeiro
npx --yes skills remove skills-sh-maintainer -y
Test-Path .agents\skills\skills-sh-maintainer
```

Expected: `False`.

- [ ] **Step 4: Sync conventions, scoped**

```powershell
& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos financeiro
```

- [ ] **Step 5: Commit only rollout files**

```powershell
cd C:\repo\financeiro
git add opencode.jsonc .agents/skills skills-lock.json .opencode .cursor AGENTS.md
git status --porcelain
git commit -m "chore(agents): enable opencode MCP, LSP and full skill pack"
git show --stat --oneline HEAD
```

Expected: `financeiro` was dirty with 1 file before this task; that file must NOT appear in the commit.

---

### Task 6: job-hunter

**Files:**
- Create: `C:\repo\job-hunter\opencode.jsonc`

**Interfaces:**
- Consumes: global config (Task 1), scoped sync (Task 3).
- Produces: `opencode.jsonc` with `chrome-devtools` and `prisma` (`cwd: backend`).

- [ ] **Step 1: Create the project config**

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
      },
      "prisma": {
        "type": "local",
        "command": ["npx", "prisma", "mcp"],
        "cwd": "backend"
      }
    }
  }
}
```

- [ ] **Step 2: Install skills**

```powershell
cd C:\repo\job-hunter
npx --yes skills add farukzahra/agent-skills -a cursor -y
npx --yes skills add mattpocock/skills@handoff -a cursor -y
npx --yes skills add prisma/skills -a cursor -y
npx --yes skills add currents-dev/playwright-best-practices-skill -a cursor -y
```

- [ ] **Step 3: Drop `skills-sh-maintainer`**

```powershell
cd C:\repo\job-hunter
npx --yes skills remove skills-sh-maintainer -y
Test-Path .agents\skills\skills-sh-maintainer
```

Expected: `False`.

- [ ] **Step 4: Sync conventions, scoped**

```powershell
& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos job-hunter
```

- [ ] **Step 5: Verify the Prisma MCP command exists before committing**

```powershell
cd C:\repo\job-hunter\backend
npx --no-install prisma --help | Select-String mcp
```

Expected: a line reading `mcp   Starts an MCP server to use with AI development tools`.

- [ ] **Step 6: Commit only rollout files**

```powershell
cd C:\repo\job-hunter
git add opencode.jsonc .agents/skills skills-lock.json .opencode .cursor AGENTS.md
git status --porcelain
git commit -m "chore(agents): enable opencode MCP, LSP and full skill pack"
git show --stat --oneline HEAD
```

Expected: `job-hunter` was dirty with 6 files; none of them appear in the commit.

---

### Task 7: maco

**Files:**
- Create: `C:\repo\maco\opencode.jsonc`

**Interfaces:**
- Consumes: global config (Task 1), scoped sync (Task 3).
- Produces: `opencode.jsonc` with `chrome-devtools` and `prisma`.

- [ ] **Step 1: Create the project config**

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
      },
      "prisma": {
        "type": "local",
        "command": ["npx", "prisma", "mcp"]
      }
    }
  }
}
```

- [ ] **Step 2: Confirm skills are already complete**

```powershell
cd C:\repo\maco
(Get-ChildItem .agents\skills -Directory).Count
```

Expected: `34` or more. If lower, run `npx --yes skills add farukzahra/agent-skills -a cursor -y`. Do **not** run `skills remove` here — `maco` legitimately keeps its full set.

- [ ] **Step 3: Sync conventions, scoped**

```powershell
& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos maco
```

- [ ] **Step 4: Commit**

```powershell
cd C:\repo\maco
git add opencode.jsonc
git status --porcelain
git commit -m "chore(agents): add opencode MCP config (browser and prisma)"
git show --stat --oneline HEAD
```

Expected: `maco` was clean before this task, so `opencode.jsonc` is the only change unless Step 3 rewrote files — include those paths explicitly if so.

---

### Task 8: farmar-aura

**Files:**
- Create: `C:\repo\farmar-aura\opencode.jsonc`

**Interfaces:**
- Consumes: global config (Task 1), scoped sync (Task 3).
- Produces: `opencode.jsonc` with `chrome-devtools`; story skills in `.agents/skills/`.

- [ ] **Step 1: Create the project config**

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
      }
    }
  }
}
```

- [ ] **Step 2: Install skills**

```powershell
cd C:\repo\farmar-aura
npx --yes skills add farukzahra/agent-skills -a cursor -y
npx --yes skills add mattpocock/skills@handoff -a cursor -y
npx --yes skills add danjdewhurst/story-skills -a cursor -y
```

Expected: `story-skills` installs `chapter-writing`, `character-management`, `plot-structure`, `revision-continuity`, `story-init`, `story-maintenance`, `worldbuilding`.

- [ ] **Step 3: Drop `skills-sh-maintainer`**

```powershell
cd C:\repo\farmar-aura
npx --yes skills remove skills-sh-maintainer -y
Test-Path .agents\skills\skills-sh-maintainer
```

Expected: `False`.

- [ ] **Step 4: Sync conventions, scoped**

```powershell
& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos farmar-aura
```

- [ ] **Step 5: Commit only rollout files**

```powershell
cd C:\repo\farmar-aura
git add opencode.jsonc .agents/skills skills-lock.json .opencode .cursor AGENTS.md
git status --porcelain
git commit -m "chore(agents): enable opencode MCP and add story writing skills"
git show --stat --oneline HEAD
```

Expected: `farmar-aura` was dirty with 18 files; none of them appear in the commit.

---

### Task 9: ms-poc

**Files:**
- Create: `C:\repo\ms-poc\opencode.jsonc`

**Interfaces:**
- Consumes: global config (Task 1), scoped sync (Task 3).
- Produces: `opencode.jsonc` with `chrome-devtools` and `azure`.

- [ ] **Step 1: Create the project config**

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
      },
      "azure": {
        "type": "local",
        "command": ["npx", "-y", "-p", "@azure/mcp@latest", "azmcp", "server", "start"],
        "cwd": "apps/api"
      }
    }
  }
}
```

- [ ] **Step 2: Install skills**

```powershell
cd C:\repo\ms-poc
npx --yes skills add farukzahra/agent-skills -a cursor -y
npx --yes skills add mattpocock/skills@handoff -a cursor -y
```

- [ ] **Step 3: Drop `skills-sh-maintainer`**

```powershell
cd C:\repo\ms-poc
npx --yes skills remove skills-sh-maintainer -y
Test-Path .agents\skills\skills-sh-maintainer
```

Expected: `False`.

- [ ] **Step 4: Sync conventions, scoped**

```powershell
& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos ms-poc
```

- [ ] **Step 5: Commit only rollout files**

```powershell
cd C:\repo\ms-poc
git add opencode.jsonc .agents/skills skills-lock.json .opencode .cursor AGENTS.md
git status --porcelain
git commit -m "chore(agents): enable opencode MCP for browser and azure"
git show --stat --oneline HEAD
```

Expected: `ms-poc` was dirty with 5 files; none of them appear in the commit.

---

### Task 10: terapia

**Files:**
- Create: `C:\repo\terapia\opencode.jsonc`

**Interfaces:**
- Consumes: global config (Task 1), scoped sync (Task 3).
- Produces: `opencode.jsonc` with `chrome-devtools` and `prisma`; Prisma/Playwright/TDD/design skills installed.

- [ ] **Step 1: Create the project config**

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
      },
      "prisma": {
        "type": "local",
        "command": ["npx", "prisma", "mcp"]
      }
    }
  }
}
```

- [ ] **Step 2: Install skills**

The `farukzahra/agent-skills` pack is already installed by the earlier verification run; re-running it is idempotent.

```powershell
cd C:\repo\terapia
npx --yes skills add farukzahra/agent-skills -a cursor -y
npx --yes skills add mattpocock/skills@handoff -a cursor -y
npx --yes skills add mattpocock/skills@tdd -a cursor -y
npx --yes skills add prisma/skills -a cursor -y
npx --yes skills add currents-dev/playwright-best-practices-skill -a cursor -y
npx --yes skills add anthropics/skills -s frontend-design -a cursor -y
npx --yes skills add wshobson/agents -s nodejs-backend-patterns -a cursor -y
```

- [ ] **Step 3: Drop `skills-sh-maintainer`**

```powershell
cd C:\repo\terapia
npx --yes skills remove skills-sh-maintainer -y
Test-Path .agents\skills\skills-sh-maintainer
```

Expected: `False`.

- [ ] **Step 4: Sync conventions, scoped**

```powershell
& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos terapia
```

- [ ] **Step 5: Commit only rollout files**

```powershell
cd C:\repo\terapia
git add opencode.jsonc .agents/skills skills-lock.json .opencode .cursor AGENTS.md
git status --porcelain
git commit -m "chore(agents): enable opencode MCP and add prisma, tdd and playwright skills"
git show --stat --oneline HEAD
```

Expected: `terapia` was dirty with 47 files. `AGENTS.md` was **already modified** before this task — staging it would mix unrelated edits. Verify with `git diff --cached AGENTS.md` that only the automation-snippet hunk is staged; if other hunks appear, unstage it with `git restore --staged AGENTS.md` and leave it for the user.

---

### Task 11: fumei

**Files:**
- Create: `C:\repo\fumei\opencode.jsonc`

**Interfaces:**
- Consumes: global config (Task 1), scoped sync (Task 3).
- Produces: `opencode.jsonc` with the `mobile` MCP server; Android skills installed.

- [ ] **Step 1: Create the project config**

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "mobile": {
        "type": "local",
        "command": ["npx", "-y", "-p", "@mobilenext/mobile-mcp@latest", "mcp-server-mobile"]
      }
    }
  }
}
```

- [ ] **Step 2: Install skills**

```powershell
cd C:\repo\fumei
npx --yes skills add farukzahra/agent-skills -a cursor -y
npx --yes skills add mattpocock/skills@handoff -a cursor -y
npx --yes skills add wshobson/agents -s mobile-android-design -a cursor -y
npx --yes skills add hitoshura25/claude-devtools -s android-playstore-setup -a cursor -y
```

Expected: `.agents\skills\` gains `mobile-android-design` and `android-playstore-setup` alongside the existing three.

- [ ] **Step 3: Drop `skills-sh-maintainer`**

```powershell
cd C:\repo\fumei
npx --yes skills remove skills-sh-maintainer -y
Test-Path .agents\skills\skills-sh-maintainer
```

Expected: `False`.

- [ ] **Step 4: Sync conventions, scoped**

```powershell
& C:\repo\agent-skills\scripts\sync-agent-conventions.ps1 -SkipSkills -Repos fumei
```

- [ ] **Step 5: Commit**

`fumei` was clean before this task, so everything staged here is rollout output.

```powershell
cd C:\repo\fumei
git add opencode.jsonc .agents/skills skills-lock.json .opencode .cursor AGENTS.md docs
git status --porcelain
git commit -m "chore(agents): add android MCP and mobile design skills"
git show --stat --oneline HEAD
```

---

### Task 12: Verification

**Files:**
- Modify: `C:\repo\faruk\docs\superpowers\specs\2026-10-11-agent-tooling-rollout-design.md` (record results in the success-criteria section)

**Interfaces:**
- Consumes: every earlier task.
- Produces: evidence that the rollout is real.

- [ ] **Step 1: Confirm the global servers load**

```powershell
opencode mcp list
```

Expected: `context7` listed. Record whether `github` is `connected` or `needs authentication`.

- [ ] **Step 2: Confirm every project has a config matching the matrix**

```powershell
foreach ($p in "faruk","financeiro","job-hunter","maco","farmar-aura","ms-poc","terapia","fumei") {
  $f = "C:\repo\$p\opencode.jsonc"
  if (Test-Path $f) {
    $j = Get-Content $f -Raw | ConvertFrom-Json
    $names = ($j.mcp.servers.PSObject.Properties.Name) -join ","
    Write-Output ("{0,-14} {1}" -f $p, $names)
  } else { Write-Output ("{0,-14} FALTANDO" -f $p) }
}
```

Expected exactly:

```text
faruk          chrome-devtools
financeiro     chrome-devtools
job-hunter     chrome-devtools,prisma
maco           chrome-devtools,prisma
farmar-aura    chrome-devtools
ms-poc         chrome-devtools,azure
terapia        chrome-devtools,prisma
fumei          mobile
```

- [ ] **Step 3: Confirm no project kept `skills-sh-maintainer`**

```powershell
foreach ($p in "faruk","financeiro","job-hunter","farmar-aura","ms-poc","terapia","fumei") {
  Write-Output ("{0,-14} {1}" -f $p, (Test-Path "C:\repo\$p\.agents\skills\skills-sh-maintainer"))
}
```

Expected: `False` on every line.

- [ ] **Step 4: Confirm one commit per touched repo**

```powershell
foreach ($p in "agent-skills","faruk","financeiro","job-hunter","maco","farmar-aura","ms-poc","terapia","fumei") {
  Write-Output ("--- " + $p)
  git -C "C:\repo\$p" log -1 --format="%h %s"
}
```

Expected: each repo's HEAD is the rollout commit created in its task.

- [ ] **Step 5: Confirm nothing was pushed**

```powershell
foreach ($p in "faruk","terapia","fumei") {
  $a = git -C "C:\repo\$p" rev-list --count "@{u}..HEAD" 2>$null
  Write-Output ("{0,-14} ahead={1}" -f $p, $a)
}
```

Expected: `ahead` > 0 — local commits exist and were not pushed. A `0` means the commit went nowhere; verify it exists in Step 4.

- [ ] **Step 6: Record results and commit the spec update in faruk**

```powershell
cd C:\repo\faruk
git add docs/superpowers/specs/2026-10-11-agent-tooling-rollout-design.md
git commit -m "docs(spec): record agent tooling rollout results"
```

---

## Follow-ups (out of scope, recorded for later)

- Add `prettier` (or `oxfmt`) to faruk, financeiro, job-hunter, ms-poc and terapia so `formatter: true` actually formats.
- Install `pyright` in `ms-poc` to activate the Python LSP.
- Add a Postgres MCP to `financeiro` (needs a vetted server; the official one is deprecated).
- Build local `.opencode/plugins/*.ts` to enforce faruk's `AGENTS.md` gates (block push without `dev:check`, force PDF/LinkedIn sync after `ResumeView.vue` edits).
- Sign in to the `github` MCP server via `/mcps`.
