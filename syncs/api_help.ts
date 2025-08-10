import { actions, Frames, Vars } from "../engine/mod.ts";
import { APIConcept } from "../concepts/api.ts";
import { HelpRequestConcept } from "../concepts/help_request.ts";

// Synchronizations between generic API requests and help request behavior
export function makeApiHelpSyncs(API: APIConcept, Help: HelpRequestConcept) {
  // GET /requests -> list all
  const ListRequests = ({ request, payload }: Vars) => ({
    when: actions([API.request, { method: "GET", path: "/requests" }, { request }]),
    where: (frames: Frames) => frames.query(Help._listAllPayload, {}, { payload }),
    then: actions([API.response, { request, output: payload }]),
  });

  // POST /requests -> create
  const CreateRequest = ({ owner, title, description, request }: Vars) => ({
    when: actions([
      API.request,
      { method: "POST", path: "/requests", owner, title, description },
      { request },
    ]),
    then: actions([Help.createRequest, { owner, title, description }]),
  });

  // POST /requests -> respond with id
  const CreateRequestResponse = ({ owner, title, description, requestId, request, payload }: Vars) => ({
    when: actions(
      [API.request, { method: "POST", path: "/requests", owner, title, description }, { request }],
      [Help.createRequest, { owner, title, description }, { request: requestId }],
    ),
    where: (frames: Frames) =>
      frames.map((frame) => ({
        ...frame,
        [payload]: { request: frame[requestId] as string },
      })),
    then: actions([API.response, { request, output: payload }]),
  });

  // GET /requests/:request -> get one
  const GetRequest = ({ request, payload, reqId }: Vars) => ({
    when: actions([API.request, { method: "GET", path: "/requests/:request", request: reqId }, { request }]),
    where: (frames: Frames) => frames.query(Help._getPayload, { request: reqId }, { payload }),
    then: actions([API.response, { request, output: payload }]),
  });

  // PATCH /requests/:request/title
  const UpdateTitle = ({ reqId, title, request }: Vars) => ({
    when: actions([
      API.request,
      { method: "PATCH", path: "/requests/:request/title", request: reqId, title },
      { request },
    ]),
    then: actions([Help.updateTitle, { request: reqId, title }], [API.response, { request, output: { ok: true } }]),
  });

  // PATCH /requests/:request/description
  const UpdateDescription = ({ reqId, description, request }: Vars) => ({
    when: actions([
      API.request,
      { method: "PATCH", path: "/requests/:request/description", request: reqId, description },
      { request },
    ]),
    then: actions(
      [Help.updateDescription, { request: reqId, description }],
      [API.response, { request, output: { ok: true } }],
    ),
  });

  // POST /requests/:request/close
  const CloseRequest = ({ reqId, request }: Vars) => ({
    when: actions([
      API.request,
      { method: "POST", path: "/requests/:request/close", request: reqId },
      { request },
    ]),
    then: actions([Help.closeRequest, { request: reqId }], [API.response, { request, output: { ok: true } }]),
  });

  // DELETE /requests/:request
  const DeleteRequest = ({ reqId, request }: Vars) => ({
    when: actions([
      API.request,
      { method: "DELETE", path: "/requests/:request", request: reqId },
      { request },
    ]),
    then: actions([Help.deleteRequest, { request: reqId }], [API.response, { request, output: { ok: true } }]),
  });

  return {
    ListRequests,
    CreateRequest,
    CreateRequestResponse,
    GetRequest,
    UpdateTitle,
    UpdateDescription,
    CloseRequest,
    DeleteRequest,
  };
}
