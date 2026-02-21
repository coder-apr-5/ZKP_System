import { create } from 'zustand';
import { db, Credential, Proof } from '@/lib/db';

interface WalletState {
    credentials: Credential[];
    activeCredentialId: string | null;

    // Actions
    refreshCredentials: () => Promise<void>;
    addCredential: (credential: Credential) => Promise<void>;
    removeCredential: (id: string) => Promise<void>;
    setActiveCredential: (id: string | null) => void;
    getCredential: (id: string) => Promise<Credential | undefined>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
    credentials: [],
    activeCredentialId: null,

    refreshCredentials: async () => {
        const creds = await db.credentials.toArray();
        set({ credentials: creds });
    },

    addCredential: async (credential: Credential) => {
        await db.credentials.add(credential);
        await get().refreshCredentials();
    },

    removeCredential: async (id: string) => {
        await db.credentials.delete(id);
        await get().refreshCredentials();
    },

    setActiveCredential: (id: string | null) => {
        set({ activeCredentialId: id });
    },

    getCredential: async (id: string) => {
        return await db.credentials.get(id);
    }
}));

// Initialize store with data — only in browser (IndexedDB unavailable in SSR)
if (typeof window !== 'undefined') {
    db.credentials.toArray().then(creds => useWalletStore.setState({ credentials: creds }));
}
