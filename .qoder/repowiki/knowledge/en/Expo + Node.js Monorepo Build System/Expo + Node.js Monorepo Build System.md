---
kind: build_system
name: Expo + Node.js Monorepo Build System
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - app.json
    - eas.json
    - babel.config.js
    - backend/package.json
    - backend/index.js
    - backend/.env
---

This repository is a monorepo containing an Expo React Native mobile app at the root and a separate Express backend under `backend/`. There is no centralized build orchestration (no Makefile, Dockerfile, CI pipeline, or shell scripts). Each side is built independently using its own toolchain.

**Frontend (Expo / React Native)**
- Entry point: `App.js`, resolved via `package.json` field `main: node_modules/expo/AppEntry.js`.
- Development server and platform-specific builds are driven by Expo CLI scripts in root `package.json`: `start`, `android`, `ios`, `web` — all invoke `expo start` with appropriate flags. No custom build commands exist; `expo build` / `eas build` are used for artifacts.
- App metadata and native bundle identifiers live in `app.json` (`name`, `slug`, `version`, `scheme`, iOS `bundleIdentifier`, Android `package`). Versioning is declared here and also mirrored in root `package.json` (`1.1.0`).
- EAS Build configuration lives in `eas.json`, defining a single `preview` build profile that produces an internal-distribution Android APK. The EAS CLI version is pinned to `>= 12.0.0`.
- Transpilation uses Babel with `babel-preset-expo`; a `module-resolver` plugin aliases `@/*` to `./src/*`, and `react-native-reanimated/plugin` is required last per the reanimated docs.
- Asset bundling includes everything under `assets/` via `assetBundlePatterns: ["**/*"]`.

**Backend (Express / Node.js)**
- Located in `backend/` as a standalone npm package with its own `package.json` (`type: commonjs`, `main: index.js`). Dependencies are `express`, `cors`, and `dotenv`.
- No build step beyond `npm install`; the server is started directly from `index.js` (no webpack/vite/etc.).
- Configuration is loaded via `dotenv` from `backend/.env`.
- The `test` script is a placeholder that exits with error — no tests are wired up.

**Versioning strategy**
- Frontend version is declared in two places: root `package.json#version` and `app.json#expo.version` (both `1.1.0`). They must be kept in sync manually; there is no automated bump script.
- Backend has its own independent version (`1.0.0`) in `backend/package.json`.

**Artifacts produced**
- Mobile: Android APK via `eas build --profile preview` (configured in `eas.json`). iOS builds are not configured in EAS profiles in this repo.
- Backend: plain Node process — no container image, no binary artifact, no packaging script.

**Conventions observed**
- Monorepo layout separates frontend (root) and backend (`backend/`) into sibling npm packages rather than using a workspace manager like pnpm workspaces or lerna.
- Source code aliasing convention: import paths use `@/...` mapped to `./src/*` via Babel module resolver.
- Environment variables for the backend are expected in `backend/.env` (loaded by dotenv); no `.env.example` was found.
- No CI/CD, linting, or test automation exists in this branch — builds are intended to be run locally via `expo start` and `node backend/index.js`.