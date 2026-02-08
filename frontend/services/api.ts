const API_BASE = "http://localhost:8000";

export const api = {
    issuer: {
        init: async (issuerName: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/init`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issuerName }),
            });
            if (!res.ok) throw new Error("Failed to init issuer");
            return await res.json();
        },

        getPublicKey: async (): Promise<string> => {
            const res = await fetch(`${API_BASE}/api/issuer/public-key`);
            if (!res.ok) throw new Error("Failed to fetch issuer key");
            const data = await res.json();
            return data.publicKey;
        },

        // Updated to match new backend
        issueCredential: async (attributes: Record<string, string>): Promise<{ credential: { signature: string, issuerPublicKey: string, attributes: Record<string, string> } }> => {
            const res = await fetch(`${API_BASE}/api/issuer/issue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attributes }),
            });
            if (!res.ok) throw new Error("Failed to issue credential");
            return await res.json();
        },

        getStats: async () => {
            const res = await fetch(`${API_BASE}/api/issuer/stats`);
            if (!res.ok) return { totalIssued: 0, activeCredentials: 0 };
            return await res.json();
        }
    },

    verifier: {
        // New: Request a verification session
        createRequest: async (verifierId: string, predicate: string) => {
            const res = await fetch(`${API_BASE}/api/verify/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verifierId, predicate }),
            });
            if (!res.ok) throw new Error("Failed to create verification request");
            return await res.json(); // returns { requestId, qrCode, predicate }
        },

        // Updated: Submit proof with requestId
        submitProof: async (requestId: string, proof: any, revealed: any, issuerPublicKey: string) => {
            const res = await fetch(`${API_BASE}/api/verify/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    proof, // serialized proof string
                    revealed,
                    issuerPublicKey
                }),
            });
            if (!res.ok) throw new Error("Verification failed");
            return await res.json();
        }
    }
};
