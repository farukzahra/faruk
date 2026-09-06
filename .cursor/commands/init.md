# Init — bootstrap agent workflow in this repo

**Only runs when the user invokes `/init`** — not automatic. Sets up Superpowers + Faruk mandatory skills, slash commands, and `docs/superpowers/`.

## What `/init` does (summary)

1. Creates `docs/superpowers/specs/` and `plans/`
2. Installs **mandatory skills** (Superpowers + `farukzahra/agent-skills`)
3. Ensures `/commit-push` and `/init` slash commands
4. Optional Cursor rules + `docs/release-history.json` for web apps
5. Merges **AGENTS.md** workflow table (does not replace a rich existing file)

Does **not** scaffold apps, commit, or push.

## When to use

- User invoked **`/init`**
- New repo from Faruk Base, or legacy repo missing Superpowers
- User asks to bootstrap agent conventions in **this** project

## Mandatory skills (install every time)

These are **required** in every Faruk project after `/init`. Install at **project** scope (`-a cursor`, no `-g`).

### Superpowers process (`obra/superpowers`)

| Skill | When the agent MUST use it |
|-------|----------------------------|
| `brainstorming` | New feature, behavior change, UI — **before any code** |
| `writing-plans` | After approved spec — plan in `docs/superpowers/plans/` |
| `systematic-debugging` | Bug, failing test — root cause before fix |
| `verification-before-completion` | Before saying "done", "fixed", or "passing" |

### Faruk published (`farukzahra/agent-skills`)

| Skill | When the agent MUST use it |
|-------|----------------------------|
| `semantic-version` | **`/commit-push` only** — bump `docs/release-history.json` (feeds `/sobre`) |
| `caveman-commit` | **`/commit-push`** — Conventional Commits message |
| `dont-forget` | User says always/every deploy/never forget — encode as **CI/hooks/codegen**, not prose |

### Optional (offer after init)

| Skill | When |
|-------|------|
| `recap` | Long sessions; add `/recap` command in consumer repo if needed |
| `skills-sh-maintainer` | **Only** `C:\repo\agent-skills` — publish skills to skills.sh |

## Step 1 — Inspect repo

Read: `README.md`, `AGENTS.md` / `agents.md`, `package.json`, `docs/stack.md`. Note stack — do not scaffold an app.

## Step 2 — Superpowers folders

Create if missing (never delete existing specs/plans):

```
docs/superpowers/specs/
docs/superpowers/plans/
docs/superpowers/README.md   ← from agent-skills/reference/superpowers/docs-README.md
```

## Step 3 — Install mandatory skills

```bash
# Superpowers core (via lock file)
npx skills experimental_install

# Faruk skills (always)
npx skills add farukzahra/agent-skills \
  --skill semantic-version \
  --skill caveman-commit \
  --skill dont-forget \
  -a cursor -y
```

1. If **`skills-lock.json`** is missing, copy `C:\repo\agent-skills\reference\superpowers\skills-lock.core.json` then run `experimental_install`.
2. If lock already exists (e.g. Faruk Base full template), run `experimental_install` only — **do not overwrite** the lock.
3. Always run the `farukzahra/agent-skills` line above (idempotent).

**Stack skills** (add only when stack matches; skip if already in lock):

| Signal | Skills |
|--------|--------|
| `next` in package.json | `vercel-react-best-practices`, `frontend-design` |
| `vue` | `vue-best-practices`, `frontend-design` |
| `prisma` | `prisma-cli`, `prisma-client-api`, `prisma-database-setup`, `prisma-postgres` |
| `playwright` | `playwright-best-practices` |
| Fastify / Node API | `nodejs-backend-patterns` |

## Step 4 — Slash commands

Copy if missing:

| Command | Source |
|---------|--------|
| `/commit-push` | `C:\repo\agent-skills\reference\commands\commit-push.md` |
| `/init` | this file |

If repo has deploy, ensure `docs/commit-push.json` exists (see `reference/commands/deploy-manifest.json`).

## Step 5 — Cursor rules (if empty)

Copy from `C:\repo\faruk_base\.cursor\rules/`:

- `automate-before-manual.mdc`
- `finish-task-dev-server.mdc`

## Step 6 — Release history (user-facing apps)

If **`docs/release-history.json`** is missing and the repo ships an app:

```json
{
  "currentVersion": "0.1.0",
  "updatedAt": "<ISO-now>",
  "entries": []
}
```

Bump **only** on `/commit-push` via `semantic-version`.

## Step 7 — AGENTS.md (merge, do not replace)

Append if missing:

```markdown
## Agent workflow (mandatory skills)

| Phase | Skill / command | Rule |
|-------|-----------------|------|
| Design | `brainstorming` | No feature code until spec approved → `docs/superpowers/specs/` |
| Plan | `writing-plans` | `docs/superpowers/plans/YYYY-MM-DD-*.md` |
| Recurring guardrails | `dont-forget` | Prefer CI/hooks/codegen over "remember to…" |
| Build | stack skills + `tdd` | Per project stack |
| Verify | `verification-before-completion` | Evidence before "done" |
| Debug | `systematic-debugging` | Root cause before fix |
| Ship | `/commit-push` | `semantic-version` → `caveman-commit` → push → Actions → prod URL |

**Gates:** no feature without approved spec; no "done" without verification; version bump only on `/commit-push`; obligations that must not be forgotten → automate (`dont-forget`).
```

## Step 8 — Report

Tell the user:

- Folders created
- Mandatory skills installed (list)
- Commands: `/init`, `/commit-push`
- Optional: offer `recap` for this project
- Next: `brainstorming` for the next feature

## Do not

- Run `/init` without user invoking it
- Overwrite `skills-lock.json`, specs, or plans without permission
- Commit or push (user uses `/commit-push`)
- Install `skills-sh-maintainer` outside `agent-skills`
