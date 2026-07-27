# Session & Context Rules

## New feature = new session
Start a fresh Claude Code session for each distinct feature. Reuse context only for related follow-up work (e.g., tests or docs for the same feature).

## Compaction
Use `/compact` with an explicit hint when context grows heavy — e.g., `/compact focus on the auth flow changes`. Avoid letting the session auto-compact silently, which degrades model intelligence.

## Context ceiling
Intelligence degrades past ~300-400k tokens. If a session is dragging (slower reasoning, forgetting earlier decisions), `/compact` or start fresh.

## Commit cadence
Commit as soon as a task completes — don't batch unrelated changes. Enables clean `git bisect` and safe rollback per feature.

## PRs
Keep PRs focused (~100-150 lines). One feature or fix per PR. Squash merge for linear history.

## Before deploying
Always invoke the `senior-dev` agent before `npx vercel --prod`. It takes 30 seconds and has caught critical bugs multiple times.

## Parallel work
Use git worktrees + separate Claude instances for parallel features. Never work on two unrelated features in the same session.
