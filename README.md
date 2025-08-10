## Quick start

1. Install deps

```bash
npm install
```

2. Run the dev server

```bash
npm run dev
```

3. Open the app

- UI: http://localhost:5173
- API examples below

## Project structure

- `specs/HelpRequest.concept` — SSF spec for the HelpRequest concept
- `concepts/help_request.ts` — HelpRequest concept implementation (in-memory for MVP)
- `concepts/api.ts` — API concept managing request/response lifecycles
- `syncs/api_help.ts` — Synchronizations wiring API routes to HelpRequest actions
- `engine/` — Runtime (sync engine, frames, actions, vars, types, utils)
- `server.ts` — Express server, routes delegated via API concept and syncs
- `web/` — Minimal client (HTML/CSS/JS)

## Endpoints

All endpoints are under `/api`. Request bodies are JSON.

- `GET /api/requests` — list all requests
- `POST /api/requests` — create a request
  - body: `{ "title": string, "description": string }`
  - response: `{ "request": string }`
- `GET /api/requests/:request` — get a single request
- `PATCH /api/requests/:request/title` — update title
  - body: `{ "title": string }`
- `PATCH /api/requests/:request/description` — update description
  - body: `{ "description": string }`
- `POST /api/requests/:request/close` — close
- `DELETE /api/requests/:request` — delete

Example cURL:

```bash
# list
curl -s http://localhost:5173/api/requests

# create
curl -s -H 'Content-Type: application/json' \
  -d '{"title":"Need babysitter","description":"Today 2-4pm"}' \
  http://localhost:5173/api/requests

# close
curl -s -X POST http://localhost:5173/api/requests/<id>/close
```

## Concept design overview

- A concept is a standalone module with a single purpose. Here:
  - `HelpRequestConcept` manages requests state and actions like `createRequest`, `closeRequest`.
  - `APIConcept` models HTTP-style request/response.
- Concepts do not import each other. They are composed via synchronizations.
- Synchronizations are declarative mappings:
  - `when` — match completed actions and their I/O patterns
  - `where` — pure queries and filtering using frames
  - `then` — invoke new actions with bound variables

See `syncs/api_help.ts` for examples like mapping `API.request` to `Help.createRequest` and returning `API.response`.

## Engine notes

- Initialize and instrument concepts with `SyncConcept` (see `server.ts`).
- Instrumented actions are reactive: calling them triggers registered synchronizations.
- Use `Frames.query` for pure read queries in `where` clauses. Queries must not mutate state.

## Persistence

- MVP uses in-memory Maps inside `HelpRequestConcept`.
- To add MongoDB:
  - Install `mongodb` and set `MONGODB_URI` and `DB_NAME` env vars
  - Replace in-memory maps with a collection; implement queries as pure reads
  - Keep concept independence and sync declarations unchanged

## Development tips

- Logging: set `Sync.logging = Logging.TRACE` (or `VERBOSE`) in `server.ts` for detailed traces.
- Frontend lives in `web/`; feel free to enhance UI/UX.
- Concepts should have unit tests that model their operational principles from `.concept` specs.
