export default function VerifierDashboard({ params }: { params: { verifierId: string } }) {
    return (
        <div className="container mx-auto p-8 font-primary">
            <h1 className="text-3xl font-bold mb-4">Verifier Portal</h1>
            <p className="text-gray-500 mb-8">Verifier ID: {params.verifierId}</p>

            <div className="grid md:grid-cols-2 gap-6">
                <a href={`/verifier/${params.verifierId}/request`} className="block p-6 bg-white border rounded-lg hover:border-privaseal-blue shadow-sm">
                    <h2 className="text-xl font-bold mb-2">Request Verification</h2>
                    <p className="text-gray-600">Generate a QR code to verify a user's credential.</p>
                </a>
                <a href={`/verifier/${params.verifierId}/history`} className="block p-6 bg-white border rounded-lg hover:border-privaseal-blue shadow-sm">
                    <h2 className="text-xl font-bold mb-2">Verification History</h2>
                    <p className="text-gray-600">View audit logs of past verifications.</p>
                </a>
            </div>
        </div>
    );
}
