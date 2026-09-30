---
name: commit-push
description: Commit relevant project changes, push to origin, wait for GitHub Actions, and verify production. Use when the user invokes /commit-push, says "Commita", or explicitly asks to commit and push.
---

# Commit and push

Commit the relevant project changes, push to the remote branch, wait for GitHub Actions when configured, and verify production with a real page check (not a health endpoint alone).

## Preconditions

- The user invoked `/commit-push`, said "Commita", or explicitly asked to commit and push.
- Never commit secrets (`.env`, credentials, keys, PATs).
- Never force-push to `main`/`master`.
- Never skip hooks unless the user explicitly asked.
- Never amend unless user rules allow it.

## Step 1 — Inspect

Run in parallel:

```bash
git status
git diff
git diff --cached
git log -5 --oneline
git branch -vv
```

Read the diff. Decide whether a release-history bump is needed.

## Step 2 — Version bump (`semantic-version` skill)

Only when `docs/release-history.json` exists in this repo. This is the only step where the agent may bump `docs/release-history.json`.

Read and follow the `semantic-version` skill. If the change is user-visible (UI, API, behavior users notice) or a template deliverable (`AGENTS.md`, `docs/stack.md`, `.github/prompts/`, new skills, etc.):

1. Bump `docs/release-history.json` (feeds `/about` and changelogs).
2. Include that file in the commit.

Skip the bump for internal-only refactors, tests, CI-only changes, or docs with no user impact.

## Step 3 — Commit message (`caveman-commit` skill)

Read and follow the `caveman-commit` skill.

- Conventional Commits, in English
- Subject 50 characters or fewer when possible
- Body only when the reason is not obvious

## Step 4 — Commit

Stage only relevant task files and commit them:

```bash
git add <relevant files>
git commit -m "<subject>" -m "<optional body>"
```

On Windows PowerShell, use a here-string for multi-line messages if needed. Include the required `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` trailer. If nothing relevant is left to commit, say so and stop; do not push.

## Step 5 — Link release entry to commit

After the main commit, if `docs/release-history.json` was updated and the newest entry lacks `commit`:

1. Run `git rev-parse --short HEAD`.
2. Set `commit` on the new entry.
3. Commit the link:

```bash
git add docs/release-history.json
git commit -m "chore: link release entry to commit <sha>"
```

## Step 6 — Push

```bash
git push origin HEAD
```

If upstream is missing, use `git push -u origin HEAD`. Never force-push.

Push authentication on Windows: if HTTPS asks for a password and `gh` is unavailable, use the PAT from `C:\repo\secrets\github\pat.txt` (line starting with `ghp_`). Never display or commit it.

## Step 7 — GitHub Actions

Skip when `.github/workflows/` does not exist. Deploy runs on GitHub Actions; do not SSH to VPS or run local deploy scripts as part of this workflow.

1. Resolve the repository from `docs/commit-push.json` (`github.owner` + `github.repo`) or `git remote get-url origin`.
2. Poll the workflow run for the pushed commit until success or timeout (~10 minutes). Use `gh run list` and `gh run watch` when available; otherwise use GitHub API with the PAT from `C:\repo\secrets\github\pat.txt`.
3. If a required job fails, read its logs, fix, commit, push, and repeat. Do not report completion while Actions is red.

## Step 8 — Verify production

Skip when `docs/commit-push.json` has `"verify": null` or the repo has no production URL.

Read `docs/commit-push.json` first (canonical per repo). Fallback order: `AGENTS.md` → `docs/deploy-vps.md` → `README.md`.

- Fetch the configured `verifyUrl` or `productionUrl`.
- Confirm HTTP 200 and that the page content matches `expectInBody` or `expectTitle`.
- Do not treat `/api/health` or `{"ok":true}` alone as sufficient when a user-facing URL is configured.
- For Android-only CI, confirm the configured workflow succeeded.
- If production verification fails while Actions is green, investigate and fix, push, and verify again.

## Step 9 — Report

Include commit SHA(s) and messages, pushed branch, new release version if bumped, GitHub Actions run URL and status (or that no workflows exist), and the production URL plus the actual check result.

## Failures

- If a pre-commit hook fails, fix it and create a new commit; do not amend a failed hook unless user rules allow it.
- If push is rejected, report it; do not force-push.
- If no remote exists, tell the user to add `origin`.
- Do not finish with failing Actions or production verification.
