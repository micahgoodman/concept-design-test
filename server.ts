import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

import { Logging, SyncConcept } from "./engine/mod.ts";
import { APIConcept } from "./concepts/api.ts";
import { HelpRequestConcept } from "./concepts/help_request.ts";
import { makeApiHelpSyncs } from "./syncs/api_help.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Req = {
  params?: Record<string, string>;
  body?: unknown;
  query?: Record<string, unknown>;
};

const app = express();
app.use(cors());
app.use(express.json());

// Concepts and sync engine
const Sync = new SyncConcept();
Sync.logging = Logging.TRACE;
const concepts = {
  API: new APIConcept(),
  Help: new HelpRequestConcept(),
};
const { API, Help } = Sync.instrument(concepts);
Sync.register(makeApiHelpSyncs(API, Help));

// Very simple demo user. In production, use auth middleware
const DEMO_USER: { user: string; name: string } = {
  user: "demo-user",
  name: "Helper",
};

function normalize(req: Req): Record<string, unknown> {
  const params = req.params || {};
  const input = Object.assign(
    {},
    (req.body ?? {}) as object,
    (req.query ?? {}) as object,
    params as object,
    {
      owner: DEMO_USER.user,
      user: DEMO_USER.user,
    },
  );
  return input;
}

// Generic handler that funnels to API concept
async function handle(method: string, path: string, req: Req, res: any) {
  const { request } = await API.request({ method, path, ...normalize(req) });
  const output = await (API as any)._waitForResponse({ request });
  if (output === undefined) {
    res.status(500).json({ error: "No response" });
  } else {
    res.json(output);
  }
}

// Routes
app.get("/api/requests", (req, res) => handle("GET", "/requests", req, res));
app.post("/api/requests", (req, res) => handle("POST", "/requests", req, res));
app.get(
  "/api/requests/:request",
  (req, res) => handle("GET", "/requests/:request", req, res),
);
app.patch(
  "/api/requests/:request/title",
  (req, res) => handle("PATCH", "/requests/:request/title", req, res),
);
app.patch(
  "/api/requests/:request/description",
  (req, res) => handle("PATCH", "/requests/:request/description", req, res),
);
app.post(
  "/api/requests/:request/close",
  (req, res) => handle("POST", "/requests/:request/close", req, res),
);
app.delete(
  "/api/requests/:request",
  (req, res) => handle("DELETE", "/requests/:request", req, res),
);

// Static client
app.use(express.static(path.join(__dirname, "web")));

const PORT: number = Number(process.env.PORT) || 5173;
app.listen(PORT, () => console.log(`Community Support Requests running at http://localhost:${PORT}`));
