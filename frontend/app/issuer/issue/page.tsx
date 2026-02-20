"use client";

import CredentialForm from "@/components/issuer/CredentialForm";

export default function IssuePage() {
    return (
        <div className="container mx-auto p-4 md:p-8 font-primary">
            <div className="max-w-2xl mx-auto mb-8">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Issue Credential</h1>
                <p className="text-gray-500">
                    Fill out the form below to cryptographically sign and issue a verifiable credential.
                    The user will scan the generated QR code to store it in their PrivaSeal Wallet.
                </p>
            </div>
            <CredentialForm />
        </div>
    );
}
