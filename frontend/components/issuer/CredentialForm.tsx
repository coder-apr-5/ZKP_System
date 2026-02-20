"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CredentialForm() {
    const [loading, setLoading] = useState(false);
    const [credentialType, setCredentialType] = useState<string>("vaccination");
    const { toast } = useToast();

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Credential Issued",
                description: `Successfully issued ${credentialType} credential.`,
            });
        }, 1500);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-md">
            <CardHeader>
                <CardTitle>Issue Credential</CardTitle>
                <CardDescription>Select credential type and enter details to sign.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleIssue} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Credential Type</Label>
                        <Select value={credentialType} onValueChange={setCredentialType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vaccination">Vaccination Record</SelectItem>
                                <SelectItem value="prescription">Prescription</SelectItem>
                                <SelectItem value="age_verification">Age Verification (ID)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {credentialType === "vaccination" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Patient Name</Label><Input placeholder="John Doe" required /></div>
                                <div className="space-y-2"><Label>Patient ID</Label><Input placeholder="MH12345" required /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Vaccine Type</Label><Input placeholder="COVID-19 mRNA" required /></div>
                                <div className="space-y-2"><Label>Manufacturer</Label><Input placeholder="Pfizer" required /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Date Administered</Label><Input type="date" required /></div>
                                <div className="space-y-2"><Label>Dose Number</Label><Input type="number" defaultValue={1} min={1} required /></div>
                            </div>
                        </div>
                    )}

                    {credentialType === "prescription" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Patient Name</Label><Input placeholder="Jane Doe" required /></div>
                                <div className="space-y-2"><Label>Medication</Label><Input placeholder="Insulin Glargine" required /></div>
                            </div>
                            <div className="space-y-2"><Label>Dosage Instructions</Label><Input placeholder="10 units daily before breakfast" required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Prescribed Date</Label><Input type="date" required /></div>
                                <div className="space-y-2"><Label>Valid Until</Label><Input type="date" required /></div>
                            </div>
                            <div className="space-y-2"><Label>Prescribing Doctor</Label><Input placeholder="Dr. Anjali Verma" required /></div>
                        </div>
                    )}

                    {credentialType === "age_verification" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Arjun Mehta" required /></div>
                                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" required /></div>
                            </div>
                            <div className="space-y-2"><Label>Aadhaar Number</Label><Input placeholder="XXXX-XXXX-XXXX" required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>State</Label><Input placeholder="Maharashtra" required /></div>
                                <div className="space-y-2"><Label>Gender</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-privaseal-blue hover:bg-privaseal-blue-dark transition-colors" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Issue Credential & Generate QR"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
