"use client";

import { useWalletStore } from "@/stores/useWalletStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Shield, Eye, Lock } from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
    const { credentials, removeCredential } = useWalletStore();

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Shield className="w-8 h-8 text-purple-600" />
                My Credential Wallet
            </h1>

            {credentials.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 rounded-lg">
                    <p className="text-neutral-500 mb-4">No credentials found.</p>
                    <Link href="/issuer">
                        <Button>Get a Credential</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {credentials.map((cred) => (
                        <Card key={cred.id} className="relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => removeCredential(cred.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                                <CardTitle className="flex justify-between items-center text-purple-900">
                                    <span>{cred.issuer}</span>
                                    <Lock className="w-4 h-4 text-purple-400" />
                                </CardTitle>
                                <div className="text-xs text-purple-600 font-mono mt-1">
                                    Issued: {new Date(cred.issuanceDate).toLocaleDateString()}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-2">
                                {Object.entries(cred.attributes).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                        <span className="text-sm font-medium text-neutral-500 capitalize">{key}</span>
                                        <span className="text-sm font-bold text-neutral-800">{value}</span>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="bg-neutral-50/50 p-4 flex justify-between">
                                <div className="text-xs text-neutral-400 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> BBS+ Signed
                                </div>
                                <Link href={`/verify/wallet-demo?cred=${cred.id}`}>
                                    <Button variant="outline" size="sm">
                                        Verify This
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
