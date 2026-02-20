export default function VerificationRequestPage({ params }: { params: { verifierId: string } }) {
    return (
        <div className="container mx-auto p-8 font-primary">
            <h1 className="text-2xl font-bold mb-4">Request Verification</h1>
            <p>Create a verification request (e.g., Age 18+) and show QR code.</p>
            {/* Form would go here */}
        </div>
    );
}
