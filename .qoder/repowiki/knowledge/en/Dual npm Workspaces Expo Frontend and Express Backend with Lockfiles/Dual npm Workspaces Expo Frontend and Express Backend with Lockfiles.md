---
kind: dependency_management
name: 'Dual npm Workspaces: Expo Frontend and Express Backend with Lockfiles'
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - backend/package.json
    - package-lock.json
    - backend/package-lock.json
    - app.json
    - eas.json
---

## What system/approach is used

This repository uses **npm** as the package manager for both the frontend (Expo/React Native) and backend (Express) subprojects. Each project has its own `package.json` and lockfile, managed independently — there is no monorepo tool (e.g., npm workspaces, pnpm, yarn, lerna) coordinating them.

- Frontend at repo root: an Expo (~52.0.0) + React Native (0.76.5) app using `expo start`, `android`, `ios`, `web` scripts.
- Backend under `backend/`: a CommonJS Express (^5.2.1) server with `cors` and `dotenv`.

No vendoring of third-party code is used; all dependencies are resolved from the public npm registry via `node_modules` directories created by `npm install`. The `.gitignore` excludes `node_modules`, so dependency trees are not committed.

## Key files and packages

- `package.json` (root): declares Expo SDK, React Native, navigation (`@react-navigation/*`), media/haptics/speech/image-picker plugins, fonts, SVG, reanimated, gesture handler, safe-area-context, screens, and AsyncStorage. DevDependencies include `@babel/core` and `babel-plugin-module-resolver`.
- `backend/package.json`: declares runtime dependencies `express`, `cors`, `dotenv`.
- `package-lock.json` (root): present but not shown here; pins exact versions for reproducible installs.
- `backend/package-lock.json`: present in `backend/`; pins backend dependency tree.
- `app.json`, `eas.json`: Expo/EAS configuration that references native modules (e.g., speech, image picker) which must be built into the app binary.
- `jsconfig.json`: IDE-level path/module resolution hints; does not affect runtime dependency resolution.

## Architecture and conventions

- **Separate per-project manifests**: The frontend and backend are independent npm projects with their own `package.json` and lockfile. There is no shared workspace config or hoisted dependency graph.
- **Version pinning style**: Frontend dependencies use caret (`^`) or tilde (`~`) ranges (e.g., `expo: ~52.0.0`, `react-native: 0.76.5`, `react: 18.3.1`). Backend dependencies use caret ranges (e.g., `express: ^5.2.1`, `dotenv: ^17.4.2`). Lockfiles exist to freeze transitive resolutions.
- **Private flag**: Root `package.json` sets `"private": true`, preventing accidental `npm publish` of the app bundle.
- **No private registry configured**: No `.npmrc`, `NPM_CONFIG_REGISTRY`, or scoped private packages are declared beyond the public `@expo-google-fonts` and `@expo-*` / `@react-navigation/*` scopes, which resolve from the public registry.
- **No build-time bundling of deps**: Dependencies are installed into `node_modules` at runtime; there is no `vendor/`, `lib/`, or bundled artifact strategy for third-party code.

## Conventions and constraints

- **Install per project**: Because there is no workspace setup, each subproject must be installed separately (`npm install` at root and `npm install` inside `backend/`).
- **Lockfiles are present**: Both `package-lock.json` files should be committed alongside their manifests to ensure deterministic builds; this is the de facto version constraint enforcement mechanism.
- **Backend uses CommonJS**: `backend/package.json` sets `"type": "commonjs"`, so `require()` is used throughout the backend (e.g., `index.js`); new backend modules should follow this convention.
- **Frontend relies on Expo SDK compatibility**: The `expo` version (`~52.0.0`) constrains compatible versions of `react-native`, `react`, and all `expo-*` plugins; upgrading one typically requires coordinated upgrades across the Expo ecosystem.
- **Dev-only tools separated**: Babel and module resolver are listed only under `devDependencies` in the root manifest, keeping production bundles free of dev tooling.
- **No CI or automated update tooling detected**: There is no visible Dependabot, Renovate, or similar configuration in the repository root; dependency updates would need to be performed manually via `npm update` / `npm audit`.