"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { cryptoService } from "@/services/crypto";
import { benchmark } from "@/lib/benchmark/utils";
import { PlayCircle, Download } from "lucide-react";

export default function BenchmarkPage() {
    const [results, setResults] = useState<any>({});
    const [running, setRunning] = useState(false);

    const runBenchmark = async () => {
        setRunning(true);
        const newResults: any = {};

        try {
            // 1. Issuance
            const attributes = { name: "Bench User", age: "30", city: "London" };
            const { time: issuanceTime, result: credentialRes } = await benchmark.measure("Issuance", async () => {
                return await api.issuer.issueCredential(attributes);
            });
            newResults.issuance = issuanceTime;

            const credential = {
                // Construct full cred object
                attributes,
                signature: credentialRes.credential.signature,
                issuerPublicKey: credentialRes.credential.issuerPublicKey,
                id: "bench-cred"
            };

            // 2. Proof Generation
            const { time: proofTime, result: proof } = await benchmark.measure("Proof Gen", async () => {
                return await cryptoService.generateProof(credential, ["age"], "bench-nonce");
            });
            newResults.proofGeneration = proofTime;
            newResults.proofSizeBytes = new Blob([JSON.stringify(proof)]).size;

            // 3. Verification (End-to-End)
            // First create request
            const req = await api.verifier.createRequest("bench-verifier", "age > 18");

            const { time: verifyTime } = await benchmark.measure("Verification", async () => {
                return await api.verifier.submitProof(
                    req.requestId,
                    JSON.stringify(proof),
                    proof.revealed_attributes,
                    credential.issuerPublicKey
                );
            });
            newResults.verificationE2E = verifyTime;

            setResults(newResults);

        } catch (e) {
            console.error(e);
            alert("Benchmark failed: " + e);
        } finally {
            setRunning(false);
        }
    };

    const downloadReport = () => {
        const report = benchmark.export(results);
        const blob = new Blob([report], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `zkp-benchmark-${Date.now()}.json`;
        a.click();
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">System Benchmarks</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-neutral-500">
              Run a full cycle of Issuance -> Proof -> Verification to measure performance on this device.
                        </p>
                        <Button onClick={runBenchmark} disabled={running} className="w-full">
                            {running ? "Running..." : <><PlayCircle className="mr-2 h-4 w-4" /> Run Benchmark</>}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.keys(results).length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex justify-between border-b pb-2">
                                    <span>Issuance Time</span>
                                    <span className="font-mono font-bold">{results.issuance?.toFixed(2)}ms</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Proof Generation</span>
                                    <span className="font-mono font-bold">{results.proofGeneration?.toFixed(2)}ms</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Proof Size</span>
                                    <span className="font-mono font-bold">{results.proofSizeBytes} bytes</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Verification (E2E)</span>
                                    <span className="font-mono font-bold">{results.verificationE2E?.toFixed(2)}ms</span>
                                </div>

                                <Button variant="outline" onClick={downloadReport} className="w-full mt-4">
                                    <Download className="mr-2 h-4 w-4" /> Export Report
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-neutral-400">
                                No results yet. Run the benchmark to see metrics.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
