import { uuid } from "../engine/util.ts";

export type HelpStatus = "OPEN" | "CLOSED";

export interface HelpRequestRecord {
    request: string;
    owner: string;
    title: string;
    description: string;
    status: HelpStatus;
    createdAt: string; // ISO DateTime
}

export class HelpRequestConcept {
    private requests: Map<string, HelpRequestRecord> = new Map();
    private byOwner: Map<string, Set<string>> = new Map();

    createRequest(
        { request, owner, title, description }: {
            request?: string;
            owner: string;
            title: string;
            description: string;
        },
    ): { request: string } {
        const id = request ?? uuid();
        const rec: HelpRequestRecord = {
            request: id,
            owner,
            title,
            description,
            status: "OPEN",
            createdAt: new Date().toISOString(),
        };
        this.requests.set(id, rec);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, new Set());
        this.byOwner.get(owner)!.add(id);
        return { request: id };
    }

    deleteRequest({ request }: { request: string }): { request: string } {
        const rec = this.requests.get(request);
        if (rec) {
            this.byOwner.get(rec.owner)?.delete(request);
            this.requests.delete(request);
        }
        return { request };
    }

    updateTitle(
        { request, title }: { request: string; title: string },
    ): { request: string } {
        const rec = this.requests.get(request);
        if (rec) rec.title = title;
        return { request };
    }

    updateDescription(
        { request, description }: { request: string; description: string },
    ): { request: string } {
        const rec = this.requests.get(request);
        if (rec) rec.description = description;
        return { request };
    }

    closeRequest({ request }: { request: string }): { request: string } {
        const rec = this.requests.get(request);
        if (rec) rec.status = "CLOSED";
        return { request };
    }

    // Queries
    _get(
        { request }: { request: string },
    ): {
        request: string;
        owner: string;
        title: string;
        description: string;
        status: HelpStatus;
        createdAt: string;
    }[] {
        const rec = this.requests.get(request);
        return rec ? [{ ...rec }] : [];
    }

    _listAll(): {
        request: string;
        owner: string;
        title: string;
        description: string;
        status: HelpStatus;
        createdAt: string;
    }[] {
        return [...this.requests.values()].map((r) => ({ ...r }));
    }

    _listByOwner(
        { owner }: { owner: string },
    ): { request: string; title: string; createdAt: string; status: HelpStatus }[] {
        const ids = this.byOwner.get(owner) ?? new Set();
        return [...ids].map((id) => {
            const r = this.requests.get(id)!;
            return {
                request: r.request,
                title: r.title,
                createdAt: r.createdAt,
                status: r.status,
            };
        });
    }

    _getPayload(
        { request }: { request: string },
    ): { payload: unknown }[] {
        const rec = this.requests.get(request);
        if (!rec) return [];
        return [{ payload: { ...rec } }];
    }

    _listAllPayload(): { payload: unknown }[] {
        const payload = this._listAll().sort((a, b) =>
            a.createdAt < b.createdAt ? 1 : -1
        );
        return [{ payload }];
    }
}
