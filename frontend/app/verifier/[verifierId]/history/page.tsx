export default function VerificationHistoryPage({ params }: { params: { verifierId: string } }) {
    return (
        <div className="container mx-auto p-8 font-primary">
            <h1 className="text-2xl font-bold mb-4">Verification History</h1>
            <p>Log of verification attempts for {params.verifierId}.</p>
            {/* Table would go here */}
        </div>
    );
}
