# Commit and push

Commit all staged/unstaged project changes and push to the tracked remote branch. Follow Faruk resume-site git conventions (`AGENTS.md`).

## Preconditions

- User explicitly invoked `/commit-push` or said **"Commita"** / asked to commit — you may commit and push.
- Never commit secrets (`.env`, `.env.vps`, credentials, keys, PATs).
- Never force-push to `main`/`master`.
- Never skip hooks unless the user explicitly asked.
- Never amend unless user rules allow it.

## Step 1 — Inspect (run in parallel)

```bash
git status
git diff
git diff --cached
git log -5 --oneline
git branch -vv
```

Read the diff. Warn if anything looks like secrets.

## Step 2 — Commit message (`caveman-commit` skill)

- Conventional Commits, **English**
- Subject ≤50 chars when possible
- Body only when "why" is not obvious

## Step 3 — Commit

On Windows PowerShell:

```powershell
git add <relevant files>
git commit -m @"
<subject>

<optional body>
"@
```

Or use a single `-m` for short messages.

If nothing to commit, say so and stop — do not push.

On **"Commita"**: stage **all** pending project files (except secrets) and push to `origin/main` (triggers deploy).

## Step 4 — Push

```bash
git push origin HEAD
```

If upstream is not set:

```bash
git push -u origin HEAD
```

## Step 5 — Confirm

Report to the user:

- Commit SHA(s) and message(s)
- Branch pushed
- Note that push to `main` triggers VPS deploy (if applicable)

## Failures

- Pre-commit hook failed → fix issues, **new commit** (never amend a failed hook commit unless user rules allow)
- Push rejected → report error; do not force-push
- No remote → tell user to add `origin`
