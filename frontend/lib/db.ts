import Dexie, { type EntityTable } from 'dexie';

export interface Credential {
    id: string;
    issuerPublicKey: string;
    signature: string; // Base64 encoding of BBS+ signature
    attributes: Record<string, any>;
    issuedAt: string;
    metadata: {
        issuerName: string;
        credentialType: string;
        [key: string]: any;
    };
    issuer?: string;
    subject?: string;
}

export interface Proof {
    id: string;
    credentialId: string;
    verifierId: string;
    predicate: string;
    proof: string; // Base64
    revealed: any;
    timestamp: string;
    verified: boolean;
}

export interface Settings {
    key: string;
    value: any;
}

type AppDB = Dexie & {
    credentials: EntityTable<Credential, 'id'>;
    proofs: EntityTable<Proof, 'id'>;
    settings: EntityTable<Settings, 'key'>;
};

// ─── Lazy singleton ───────────────────────────────────────────────────────────
// Dexie uses IndexedDB which only exists in a browser context.
// We defer construction to the first access so that Next.js SSR (Node.js)
// never tries to touch window.indexedDB and throws "IndexedDB API missing".

let _db: AppDB | null = null;

function getDb(): AppDB {
    if (typeof window === 'undefined') {
        // SSR: return a no-op stub so imports don't crash during pre-rendering.
        // Real DB calls must only happen inside useEffect / event handlers.
        throw new Error('IndexedDB is only available in the browser.');
    }
    if (!_db) {
        const instance = new Dexie('zkp-credentials-db') as AppDB;
        instance.version(1).stores({
            credentials: 'id, issuedAt, metadata.issuerName',
            proofs: 'id, credentialId, verifierId, timestamp',
            settings: 'key',
        });
        _db = instance;
    }
    return _db;
}

// Proxy object — any property access goes through getDb() so callers keep the
// same `db.credentials.toArray()` syntax without changing a line of code.
export const db = new Proxy({} as AppDB, {
    get(_target, prop: string) {
        return getDb()[prop as keyof AppDB];
    },
});
