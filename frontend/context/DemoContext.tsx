"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Credential {
    id: string;
    holderId: string;
    type: "Age" | "Identity" | "Membership" | "Vaccination" | "Prescription";
    category: "Standard" | "Enterprise" | "VIP" | "Restricted";
    description: string;
    issuedDate: string;
    expiryDate: string;
    status: "Active" | "Expired" | "Revoked" | "Archived";
    issuer: string;
    accessLevel: "Public" | "Tier 1" | "Tier 2" | "Secret";
    tags: string[];
}

export interface VerificationLog {
    id: string;
    checkedId: string;
    result: "Verified" | "Not Verified";
    timestamp: string;
    type: string;
    verifier: string;
    ip?: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    target: string;
    detail: string;
}

interface DemoContextType {
    credentials: Credential[];
    verificationLogs: VerificationLog[];
    auditLogs: AuditLog[];
    issueCredential: (cred: Omit<Credential, "id" | "issuedDate" | "status" | "issuer">) => void;
    addVerificationLog: (log: Omit<VerificationLog, "id" | "timestamp">) => void;
    addAuditLog: (action: string, actor: string, target: string, detail: string) => void;
    revokeCredential: (id: string) => void;
    bulkRevoke: (ids: string[]) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        const savedCreds = localStorage.getItem("privaseal_demo_creds");
        const savedLogs = localStorage.getItem("privaseal_demo_logs");
        const savedAudit = localStorage.getItem("privaseal_demo_audit");

        if (savedCreds) {
            setCredentials(JSON.parse(savedCreds));
        } else {
            const initialCreds: Credential[] = [
                {
                    id: "CRED-8821-XP",
                    holderId: "PS-AX71-B291",
                    type: "Age",
                    category: "Standard",
                    description: "Verified age 18+",
                    issuedDate: new Date().toISOString(),
                    expiryDate: "2028-12-31",
                    status: "Active",
                    issuer: "PrivaSeal Root Authority",
                    accessLevel: "Public",
                    tags: ["legal", "compliance"]
                },
                {
                    id: "CRED-9942-ID",
                    holderId: "PS-AX71-B291",
                    type: "Identity",
                    category: "Enterprise",
                    description: "Global Citizen ID",
                    issuedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
                    expiryDate: "2030-01-01",
                    status: "Active",
                    issuer: "Global Identity Council",
                    accessLevel: "Tier 1",
                    tags: ["kyc", "government"]
                },
                {
                    id: "CRED-1102-VA",
                    holderId: "PS-AX71-B291",
                    type: "Vaccination",
                    category: "Standard",
                    description: "Health Immunity Passport",
                    issuedDate: new Date(Date.now() - 86400000 * 20).toISOString(),
                    expiryDate: "2026-06-01",
                    status: "Active",
                    issuer: "World Health Node",
                    accessLevel: "Public",
                    tags: ["health"]
                },
                {
                    id: "CRED-EX-REV",
                    holderId: "PS-AX71-B291",
                    type: "Membership",
                    category: "VIP",
                    description: "Elite Club Membership",
                    issuedDate: "2024-01-01",
                    expiryDate: "2025-01-01",
                    status: "Revoked",
                    issuer: "Nexus Club",
                    accessLevel: "Secret",
                    tags: ["social", "vip"]
                }
            ];
            setCredentials(initialCreds);
            localStorage.setItem("privaseal_demo_creds", JSON.stringify(initialCreds));
        }

        if (savedLogs) {
            setVerificationLogs(JSON.parse(savedLogs));
        } else {
            const initialLogs: VerificationLog[] = [
                { id: "LOG-001", checkedId: "PS-AX71-B291", result: "Verified", timestamp: new Date().toISOString(), type: "Universal Check", verifier: "CloudGate Node", ip: "192.168.1.5" }
            ];
            setVerificationLogs(initialLogs);
            localStorage.setItem("privaseal_demo_logs", JSON.stringify(initialLogs));
        }

        if (savedAudit) {
            setAuditLogs(JSON.parse(savedAudit));
        } else {
            const initialAudit: AuditLog[] = [
                { id: "AUD-001", timestamp: new Date().toISOString(), action: "SYSTEM_INIT", actor: "System", target: "LocalStore", detail: "Demo session initialized" }
            ];
            setAuditLogs(initialAudit);
            localStorage.setItem("privaseal_demo_audit", JSON.stringify(initialAudit));
        }
    }, []);

    useEffect(() => {
        if (credentials.length > 0) localStorage.setItem("privaseal_demo_creds", JSON.stringify(credentials));
    }, [credentials]);

    useEffect(() => {
        if (verificationLogs.length > 0) localStorage.setItem("privaseal_demo_logs", JSON.stringify(verificationLogs));
    }, [verificationLogs]);

    useEffect(() => {
        if (auditLogs.length > 0) localStorage.setItem("privaseal_demo_audit", JSON.stringify(auditLogs));
    }, [auditLogs]);

    const addAuditLog = (action: string, actor: string, target: string, detail: string) => {
        const log: AuditLog = { id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`, timestamp: new Date().toISOString(), action, actor, target, detail };
        setAuditLogs(prev => [log, ...prev]);
    };

    const issueCredential = (cred: Omit<Credential, "id" | "issuedDate" | "status" | "issuer">) => {
        const newCred: Credential = {
            ...cred,
            id: `CRED-${Math.floor(1000 + Math.random() * 9000)}-${cred.type.substring(0, 2).toUpperCase()}`,
            issuedDate: new Date().toISOString(),
            status: "Active",
            issuer: "PrivaSeal Issuer Node #1"
        };
        setCredentials(prev => [newCred, ...prev]);
        addAuditLog("CREDENTIAL_ISSUED", "Issuer_Main", newCred.id, `Type: ${newCred.type}, Holder: ${newCred.holderId}`);
    };

    const addVerificationLog = (log: Omit<VerificationLog, "id" | "timestamp">) => {
        const newLog: VerificationLog = { ...log, id: `LOG-${Math.floor(100 + Math.random() * 899)}`, timestamp: new Date().toISOString() };
        setVerificationLogs(prev => [newLog, ...prev]);
        addAuditLog("VERIFICATION_RESULT", log.verifier, log.checkedId, `Result: ${log.result}`);
    };

    const revokeCredential = (id: string) => {
        setCredentials(prev => prev.map(c => c.id === id ? { ...c, status: "Revoked" } : c));
        addAuditLog("CREDENTIAL_REVOKED", "Issuer_Main", id, "Reason: Manual revocation");
    };

    const bulkRevoke = (ids: string[]) => {
        setCredentials(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: "Revoked" } : c));
        addAuditLog("BULK_REVOKE", "Issuer_Main", `${ids.length} items`, `IDs: ${ids.join(", ")}`);
    };

    return (
        <DemoContext.Provider value={{ credentials, verificationLogs, auditLogs, issueCredential, addVerificationLog, addAuditLog, revokeCredential, bulkRevoke }}>
            {children}
        </DemoContext.Provider>
    );
}

export function useDemoData() {
    const context = useContext(DemoContext);
    if (context === undefined) {
        throw new Error("useDemoData must be used within a DemoProvider");
    }
    return context;
}
