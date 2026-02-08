export interface Credential {
    id: string; // generated locally
    issuer: string;
    subject: string;
    attributes: Record<string, string>;
    signature: string;
    issuanceDate: string;
    issuerPublicKey: string;
}

export interface VerificationRequest {
    verifierId: string;
    predicate: string; // "age > 18"
    nonce: string;
}

export interface VerificationResult {
    verified: boolean;
    revealedAttributes: Record<string, string>;
    message: string;
}

export type ViewState = 'landing' | 'issuer' | 'wallet' | 'verifier';

export interface AuditLog {
    id: number;
    verifierId: string;
    verificationResult: string;
    timestamp: string;
}
