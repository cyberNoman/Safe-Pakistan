---
kind: error_handling
name: 'Minimal Error Handling: Express Fallback Chain with Local Rules and No Frontend Error UI'
category: error_handling
scope:
    - '**'
source_files:
    - backend/index.js
    - src/screens/ScanScreen.js
    - src/screens/VoiceScreen.js
    - src/screens/VerdictScreen.js
    - src/navigation/AppNavigator.js
    - App.js
---

## What system/approach is used

The codebase uses a very minimal, ad-hoc error-handling approach with no centralized error types, middleware, or frontend error UI.

- **Backend (Express)**: Errors from the primary LLM call path are caught inline in route handlers and treated as failures that trigger an automatic fallback to a secondary model, then to a local regex-based rule engine. There is no custom error class hierarchy, no HTTP status codes returned for errors, and no global error-handling middleware.
- **Frontend (React Native / Expo)**: The screens contain no `try/catch` blocks, no network error handling, no alert/Toast/error banners, and no loading/error state management. All user-facing flows currently navigate directly to a mock Verdict screen without calling the backend.

## Key files and packages

- `backend/index.js` — the only place where runtime errors are handled. It defines:
  - `callQwen(model, text)`: throws plain `Error` objects for non-OK HTTP responses (`throw new Error(j.message || j.code || res.status)`), missing JSON output (`throw new Error('no JSON in output')`), and malformed response shape (`throw new Error('bad JSON shape')`).
  - Route handler `POST /analyze/text` (lines 63–70): wraps each model call in its own `try/catch`, logs the failure via `console.log('[Layer1 YOUR model]', e.message)` or `'[Layer2 qwen-max]'`, and falls through to the next layer or the local rules fallback.
  - `localRules(text)`: a deterministic regex-based fallback that always returns a valid `{ verdict, score, confidence, type, redFlags, explanation_* }` object, so the endpoint never fails even when both LLM calls throw.
  - `POST /family/pair` and `POST /alerts/guardian`: synchronous routes that never throw; they just return JSON.
- `src/screens/ScanScreen.js` — the analyze entry point on the frontend. The `analyze()` function contains commented-out network code and currently hard-codes `navigation.navigate('Verdict', { verdict: 'scam' })`. No error handling exists.
- `src/screens/VoiceScreen.js`, `src/screens/VerdictScreen.js` — presentational screens with no error state, no try/catch, no alerts.
- `src/navigation/AppNavigator.js` — navigation setup only; no error boundary or unhandled-rejection handling.
- `App.js` — root component; no `ErrorBoundary`, no `unhandledrejection` listener.

## Architecture and conventions

1. **Fail-fast, log-and-fallback pattern** — Each LLM call is wrapped in its own `try/catch` inside the route handler. On exception, the error message is logged and execution continues to the next model or the local rules. This is a layered fallback chain rather than a retry mechanism.
2. **Plain `Error` objects** — All errors thrown are native JavaScript `Error` instances with string messages. There are no domain-specific error classes, no error codes, and no structured error payloads.
3. **No HTTP error responses** — When both LLM calls fail, the handler still responds with a successful JSON body from `localRules()`. There is no branch that sends `res.status(5xx)` or an error envelope. The `/family/pair` and `/alerts/guardian` endpoints also never produce error responses.
4. **Logging-only error observation** — Failures are observed exclusively through `console.log` lines prefixed with `[Layer1 YOUR model]` and `[Layer2 qwen-max]`. There is no logging library, no structured log format, and no metrics collection.
5. **Frontend assumes success** — The mobile screens do not implement any error state. Network calls are stubbed out, so there is no need for error UI yet. If wired up, the current design would need to add loading/error states to ScanScreen and a way to surface backend errors to the user.
6. **No middleware, no global handlers** — Express has no `app.use((err, req, res, next) => ...)` handler. React Navigation has no error boundary. Unhandled promise rejections or uncaught exceptions will crash the process/screen.

## Conventions and constraints

Observed conventions (descriptive, not prescriptive):
- External API failures are treated as transient and automatically retried against a different model before falling back to deterministic local rules. This ensures the `/analyze/text` endpoint always returns a usable verdict.
- Errors thrown by `callQwen` carry the upstream provider's message/code/status as the error string, preserving diagnostic information in logs.
- The local rules engine is designed as a guaranteed-dead-end fallback: it always produces a complete result object, so the endpoint cannot fail at the response stage.
- Frontend screens are written as pure presentational components with no async flow; error handling is deferred until the backend integration is added.

Constraints enforced by the implementation:
- Every route must eventually respond with JSON; the fallback chain guarantees this for `/analyze/text`.
- The backend does not expose raw error objects to clients — only successful analysis results are sent over the wire.
- No `panic`/`process.exit` usage exists in the codebase; crashes would come from unhandled exceptions rather than explicit termination.