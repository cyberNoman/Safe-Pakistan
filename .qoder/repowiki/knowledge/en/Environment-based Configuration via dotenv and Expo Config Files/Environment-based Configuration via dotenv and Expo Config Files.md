---
kind: configuration_system
name: Environment-based Configuration via dotenv and Expo Config Files
category: configuration_system
scope:
    - '**'
source_files:
    - backend/.env
    - backend/index.js
    - backend/package.json
    - app.json
    - eas.json
---

## What system/approach is used

The repository uses a minimal, environment-driven configuration approach split across two layers:

- **Backend (Express)**: Loads runtime secrets and service endpoints from a `.env` file using the `dotenv` package (`require('dotenv').config()` in `backend/index.js`). All sensitive values — DashScope base URL, Qwen API key, fine-tuned model name, and optional max model name — are read via `process.env`.
- **Frontend (Expo/React Native)**: Uses Expo's declarative config files — `app.json` for app metadata, platform-specific settings (bundle identifiers, icons, splash, plugins), and `eas.json` for EAS Build CLI version and build profiles. No runtime env loading exists in the frontend code; all mobile-side configuration is baked into these JSON manifests at build time.

There is no centralized configuration module, YAML/TOML loader, feature-flag framework, or config validation layer anywhere in the repo.

## Key files and packages

- `backend/.env` — stores `DASHSCOPE_BASE_URL`, `QWEN_API_KEY`, `FT_MODEL` (and by convention `MAX_MODEL`); loaded at startup via `dotenv`.
- `backend/index.js` — reads `process.env.DASHSCOPE_BASE_URL`, `QWEN_API_KEY`, `FT_MODEL`, `MAX_MODEL` directly; no config abstraction.
- `backend/package.json` — declares `dotenv` as a dependency.
- `app.json` — Expo manifest: app name, slug, version, scheme, orientation, icon/splash assets, iOS bundle identifier, Android package name, and enabled plugins (`expo-font`, `expo-av`, `expo-image-picker`).
- `eas.json` — EAS CLI version constraint (`>= 12.0.0`) and a single `preview` build profile producing an internal-distribution Android APK.
- `babel.config.js`, `jsconfig.json` — tooling configs only; not application runtime configuration.

## Architecture and conventions

- **Single source of truth per layer**: Backend secrets live exclusively in `backend/.env`; Expo app identity lives in `app.json`; build behavior lives in `eas.json`. There is no cross-layer config sharing.
- **Direct `process.env` access**: The backend reads environment variables inline where they are consumed (`BASE`, `KEY`, `FT_MODEL`, `MAX_MODEL` declared at the top of `index.js`). There is no config object, schema, or defaults layer beyond the `|| 'qwen-max'` fallback on `MAX_MODEL`.
- **Hardcoded fallbacks**: When LLM calls fail, the server falls back to an on-device regex rule engine (`localRules`) — this is a runtime behavior switch driven by error handling, not by a configuration flag.
- **No frontend env loading**: The React Native screens and components do not import or read any environment variables; all mobile-facing configuration (package names, schemes, plugins) is static in `app.json`.
- **Minimal build-time config**: `eas.json` defines only one build profile (`preview`); there are no separate dev/staging/prod profiles, so environment switching would require editing the same files.

## Conventions and constraints

Observed conventions (descriptive):
- Backend secrets are kept out of source control via `backend/.env` (implied by its presence alongside `.gitignore` at the repo root).
- Environment variable names use uppercase with underscores (`DASHSCOPE_BASE_URL`, `QWEN_API_KEY`, `FT_MODEL`, `MAX_MODEL`).
- Optional backend config uses a default fallback pattern (`process.env.MAX_MODEL || 'qwen-max'`).
- Expo app identity is expressed declaratively in `app.json` rather than through native project edits.
- EAS builds pin the CLI version with a semver range (`>= 12.0.0`).

Enforced rules / documented constraints:
- `eas.json` enforces that the EAS CLI version must be `>= 12.0.0` (the EAS CLI will reject older versions during build).
- `app.json` is the single authoritative source for Expo plugin declarations; adding a new capability requires registering it under `expo.plugins` (e.g., `expo-font`, `expo-av`, `expo-image-picker`).
- The backend listens on port `3000` by default (`app.listen(3000, ...)`); no env var overrides this port.