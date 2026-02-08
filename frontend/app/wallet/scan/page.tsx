"use client";

import { useEffect, useState, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QRScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanning, setScanning] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();

        if (scanning && videoRef.current) {
            codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
                if (result) {
                    handleScan(result.getText());
                    codeReader.reset();
                    setScanning(false);
                }
            });
        }

        return () => {
            codeReader.reset();
        };
    }, [scanning]);

    const handleScan = (data: string) => {
        try {
            const url = new URL(data);
            const protocol = url.protocol;

            if (protocol === "mediguard:") {
                const type = url.searchParams.get("type"); // credential or verify
                const payload = url.searchParams.get("payload");
                const reqId = url.searchParams.get("req");

                if (url.pathname.includes("credential")) {
                    // Handle Credential Import
                    const credential = JSON.parse(payload || "{}");
                    const existing = JSON.parse(localStorage.getItem("mediguard_credentials") || "[]");
                    existing.push({ ...credential, issuedAt: new Date().toISOString() });
                    localStorage.setItem("mediguard_credentials", JSON.stringify(existing));

                    toast({ title: "Credential Imported", description: `Added ${credential.type}` });
                    router.push("/wallet");
                } else if (url.pathname.includes("verify")) {
                    // Handle Verification Request
                    router.push(`/wallet/prove?req=${reqId}`);
                }
            } else {
                throw new Error("Invalid QR Code");
            }
        } catch (e) {
            toast({ title: "Error", description: "Invalid QR Code format", variant: "destructive" });
            setScanning(true); // Retry
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => router.back()}
            >
                <X className="w-8 h-8" />
            </Button>

            <div className="relative w-full max-w-sm aspect-square border-2 border-white/50 rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-primary animate-pulse m-8 rounded-lg pointer-events-none"></div>
            </div>

            <p className="text-white mt-8 text-center px-4">
                Point your camera at a MediGuard QR Code to import a credential or verify a request.
            </p>
        </div>
    );
}
