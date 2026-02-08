import Dexie, { type EntityTable } from 'dexie';

export interface Credential {
    id: string;
    issuerPublicKey: string;
    signature: string; // Base64 encoding of BBS+ signature
    attributes: {
        name: string;
        birthdate: string;
        licenseNumber: string;
        state: string;
        expiry: string;
        [key: string]: string;
    };
    issuedAt: string;
    metadata: {
        issuerName: string;
        credentialType: string;
    };
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

const db = new Dexie('zkp-credentials-db') as Dexie & {
    credentials: EntityTable<Credential, 'id'>;
    proofs: EntityTable<Proof, 'id'>;
    settings: EntityTable<Settings, 'key'>;
};

// Define schema
db.version(1).stores({
    credentials: 'id, issuedAt, metadata.issuerName',
    proofs: 'id, credentialId, verifierId, timestamp',
    settings: 'key'
});

export { db };
