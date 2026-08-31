# SECURITY.md — Safe Pakistan pre-push & secrets policy

> Read this before every `git push`. Last reviewed: 2026-08-31.

## Threat model

The repo contains one real credential class: the **Alibaba Cloud Model Studio
(Qwen) API key** in `backend/.env`. Everything else (Cloud Run URL, Ollama
localhost endpoint, demo copy) is public-safe. The fine-tuned weights
(`backend/hifazat-edge.gguf`) are not secret but are ~1GB and must never be
committed (GitHub rejects files >100MB and the repo would bloat).

## What is excluded from git (and why)

| Path | Reason |
|---|---|
| `backend/.env`, `.env` | Live credentials (Qwen key). Template provided in `backend/.env.example` |
| `backend/hifazat-edge.gguf` | ~1GB model weights; distribute via Ollama/HF registry, not git |
| `backend/test-key.js` | Diagnostic that prints the key prefix to console (log-leak vector) |
| `node_modules/`, `backend/node_modules/` | Dependencies; lockfile is the source of truth |
| `.expo/`, `dist/`, `dist-verify/`, `web-build/` | Build artifacts |
| `*.apk`, `*.log`, `test-result.json` | Artifacts / possible key material in logs |

Verified on 2026-08-31: `backend/.env` has **never** been committed — local
history is clean, and the remote had zero commits at review time.

## Known incident — rotate the Qwen key

The EAS build archive uploaded on 2026-08-31 **included `backend/.env`**
(before `.easignore` existed). Treat the current Qwen key as exposed:
**rotate it in the Alibaba Cloud Model Studio console** and update only your
local `backend/.env`. `.easignore` now prevents recurrence in EAS builds;
`.gitignore` prevents it in git.

## Repository visibility

The GitHub repo (`cyberNoman/Safe-Pakistan`) was created **Public** and empty.
Before the first push, switch it to **Private**:

1. GitHub → repo → **Settings** → **General** → scroll to **Danger Zone**
2. **Change repository visibility** → **Make private** → confirm
3. Invite teammates via **Settings → Collaborators** with the least
   privilege they need (Read/Triage for reviewers, Write for co-developers).
   Keep Admin to the owner only.

Going public after the demo is fine *only after*: the key is rotated,
`backend/.env` was never committed (still true), and the gguf stays ignored.

## Pre-push checklist (run in order)

```powershell
# 1 — nothing sensitive staged or tracked
git ls-files | Select-String -Pattern "env|secret|key|cred|gguf"
git status --short | Select-String -Pattern "env|secret|gguf|apk"

# 2 — ignore rules actually bite
git check-ignore -v backend/.env backend/hifazat-edge.gguf backend/test-key.js dist-verify

# 3 — no literal secrets anywhere outside .env
Select-String -Path src\**\*,backend\*.js -Pattern "sk-[A-Za-z0-9_-]{8,}"

# 4 — review what will actually ship
git diff --cached --stat
```

All of (1) must return nothing; all of (2) must return a `.gitignore` hit.

## Golden rules

1. Secrets live only in `backend/.env` (local, ignored) — never in code,
   comments, decks, or repowiki docs.
2. New env vars get added to `backend/.env.example` with a placeholder,
   never a real value.
3. If a secret is ever committed or uploaded (git, EAS, logs): rotate it
   first, scrub second. Rotation is the fix; history surgery is cosmetic.
4. Model weights travel outside git: Ollama registry, Hugging Face, or a
   shared drive link in the README.
