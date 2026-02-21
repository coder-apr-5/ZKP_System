"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const BACKEND = "http://localhost:8000";

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>
            {children}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CredentialForm() {
    const router = useRouter();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [credentialType, setCredentialType] = useState<string>("vaccination");
    const [gender, setGender] = useState<string>("male");

    const handleIssue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        // Collect all named form fields into a plain object
        const fd = new FormData(e.currentTarget);
        const fields: Record<string, string> = {};
        fd.forEach((value, key) => { fields[key] = value.toString(); });

        // Attach gender (controlled Select, not a native input)
        if (credentialType === "age_verification") {
            fields["gender"] = gender;
        }

        const payload = {
            credential_type: credentialType,
            issuer_id: "privaseal-hospital-001",
            attributes: fields,
        };

        try {
            const res = await fetch(`${BACKEND}/api/issuer/issue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail ?? `HTTP ${res.status}`);
            }

            const data = await res.json();
            setSuccess(true);
            formRef.current?.reset();

            toast({
                title: "✅ Credential Issued",
                description: `${data.credential?.typeLabel ?? credentialType} has been signed and stored.`,
            });

            // Navigate to the issued log after a short delay
            setTimeout(() => router.push("/issuer/issued"), 1200);

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            toast({
                title: "Issue Failed",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-md">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle>Issue Credential</CardTitle>
                        <CardDescription>Select type and fill details to sign &amp; store.</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {success && (
                    <div className="mb-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        Credential issued — redirecting to Issued Log…
                    </div>
                )}

                <form ref={formRef} onSubmit={handleIssue} className="space-y-6">
                    {/* Credential Type Selector */}
                    <Field label="Credential Type">
                        <Select value={credentialType} onValueChange={setCredentialType}>
                            <SelectTrigger id="credential-type-select">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vaccination">Vaccination Record</SelectItem>
                                <SelectItem value="prescription">Medical Prescription</SelectItem>
                                <SelectItem value="age_verification">Age Verification (ID)</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    {/* ── Vaccination ────────────────────────────────────── */}
                    {credentialType === "vaccination" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Patient Name">
                                    <Input name="patient_name" placeholder="John Doe" required />
                                </Field>
                                <Field label="Patient ID">
                                    <Input name="patient_id" placeholder="MH12345" required />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Vaccine Type">
                                    <Input name="vaccine_type" placeholder="COVID-19 mRNA" required />
                                </Field>
                                <Field label="Manufacturer">
                                    <Input name="manufacturer" placeholder="Pfizer" required />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Date Administered">
                                    <Input name="date_administered" type="date" required />
                                </Field>
                                <Field label="Dose Number">
                                    <Input name="dose_number" type="number" defaultValue={1} min={1} required />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* ── Prescription ───────────────────────────────────── */}
                    {credentialType === "prescription" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Patient Name">
                                    <Input name="patient_name" placeholder="Jane Doe" required />
                                </Field>
                                <Field label="Medication">
                                    <Input name="medication" placeholder="Insulin Glargine" required />
                                </Field>
                            </div>
                            <Field label="Dosage Instructions">
                                <Input name="dosage_instructions" placeholder="10 units daily before breakfast" required />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Prescribed Date">
                                    <Input name="prescribed_date" type="date" required />
                                </Field>
                                <Field label="Valid Until">
                                    <Input name="valid_until" type="date" required />
                                </Field>
                            </div>
                            <Field label="Prescribing Doctor">
                                <Input name="prescribing_doctor" placeholder="Dr. Anjali Verma" required />
                            </Field>
                        </div>
                    )}

                    {/* ── Age Verification ───────────────────────────────── */}
                    {credentialType === "age_verification" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Full Name">
                                    <Input name="full_name" placeholder="Arjun Mehta" required />
                                </Field>
                                <Field label="Date of Birth">
                                    <Input name="date_of_birth" type="date" required />
                                </Field>
                            </div>
                            <Field label="Aadhaar Number">
                                <Input name="aadhaar_number" placeholder="XXXX-XXXX-XXXX" maxLength={14} required />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="State">
                                    <Input name="state" placeholder="Maharashtra" required />
                                </Field>
                                <Field label="Gender">
                                    <Select value={gender} onValueChange={setGender}>
                                        <SelectTrigger id="gender-select">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>
                        </div>
                    )}

                    <Button
                        id="issue-credential-btn"
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors font-semibold"
                        disabled={loading}
                    >
                        {loading
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing &amp; Storing…</>
                            : "Issue Credential & Store"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
