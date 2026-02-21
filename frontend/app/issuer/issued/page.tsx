"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
    Plus,
    RefreshCw,
    Search,
    ChevronLeft,
    ChevronRight,
    Download,
    ShieldOff,
    Loader2,
    FileText,
    Syringe,
    IdCard,
    Pill,
    CheckCircle,
    XCircle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND = "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Credential {
    id: string;
    type: string;
    typeLabel: string;
    issuerId: string;
    name: string;
    dob: string;
    aadhaar: string;
    state: string;
    gender: string;
    vaccineType: string;
    manufacturer: string;
    dateAdministered: string;
    doseNumber: string | number;
    medication: string;
    dosageInstructions: string;
    prescribedBy: string;
    issuedAt: string;
    status: "Active" | "Revoked";
    attrHash: string;
    attributeCount: number;
    revokedAt?: string;
}

interface ApiResponse {
    data: Credential[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeIcon(type: string) {
    switch (type) {
        case "vaccination": return <Syringe className="w-3.5 h-3.5" />;
        case "prescription": return <Pill className="w-3.5 h-3.5" />;
        case "age_verification": return <IdCard className="w-3.5 h-3.5" />;
        default: return <FileText className="w-3.5 h-3.5" />;
    }
}

function typeColor(type: string): string {
    switch (type) {
        case "vaccination": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
        case "prescription": return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
        case "age_verification": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400";
        default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
}

function shortId(id: string) {
    return id.slice(0, 8).toUpperCase();
}

// Export credentials as CSV
function exportCSV(data: Credential[]) {
    const headers = ["ID", "Type", "Name", "Issued At", "Status", "Hash"];
    const rows = data.map(c => [
        c.id, c.typeLabel, c.name, c.issuedAt, c.status, c.attrHash,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `issued-credentials-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IssuedCredentialsPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revoking, setRevoking] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const PER_PAGE = 10;

    // Filters
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    // Debounce search
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ------------------------------------------------------------------

    const fetchCredentials = useCallback(async (
        pg = page,
        q = search,
        tf = typeFilter,
    ) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(pg),
                per_page: String(PER_PAGE),
                ...(q ? { search: q } : {}),
                ...(tf !== "all" ? { type_filter: tf } : {}),
            });
            const res = await fetch(`${BACKEND}/api/issuer/issued?${params}`, {
                cache: "no-store",
                signal: AbortSignal.timeout(5000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json: ApiResponse = await res.json();
            setCredentials(json.data ?? []);
            setTotal(json.total ?? 0);
            setTotalPages(json.total_pages ?? 1);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            setError(msg);
            setCredentials([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, typeFilter]);

    // Initial + re-fetch on filter/page change
    useEffect(() => {
        fetchCredentials(page, search, typeFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, typeFilter]);

    // Debounced search
    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            fetchCredentials(1, val, typeFilter);
        }, 350);
    };

    // Revoke
    const handleRevoke = async (cred: Credential) => {
        if (cred.status === "Revoked") return;
        if (!confirm(`Revoke credential ${shortId(cred.id)} for ${cred.name}?`)) return;
        setRevoking(cred.id);
        try {
            const res = await fetch(`${BACKEND}/api/issuer/issued/${cred.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "Revoked by issuer portal" }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            toast({ title: "Credential Revoked", description: `ID ${shortId(cred.id)} has been revoked.` });
            fetchCredentials(page, search, typeFilter);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown";
            toast({ title: "Revoke Failed", description: msg, variant: "destructive" });
        } finally {
            setRevoking(null);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl font-primary space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Issued Credentials Log</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Audit trail of all credentials signed by this institution · {total} record{total !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button
                        id="refresh-credentials-btn"
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCredentials(page, search, typeFilter)}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button
                        id="export-csv-btn"
                        variant="outline"
                        size="sm"
                        onClick={() => exportCSV(credentials)}
                        disabled={credentials.length === 0}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        id="issue-new-btn"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => router.push("/issuer/issue")}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Issue New
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        id="search-credentials"
                        placeholder="Search by name or ID…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                    <SelectTrigger id="type-filter-select" className="w-52">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="age_verification">Age Verification</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                    ⚠️ Could not reach backend: <strong>{error}</strong>
                    <button className="ml-3 underline" onClick={() => fetchCredentials(page, search, typeFilter)}>
                        Retry
                    </button>
                </div>
            )}

            {/* Table Card */}
            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="text-base font-semibold">Credential Records</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading credentials…
                        </div>
                    ) : credentials.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                No credentials issued yet
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 max-w-xs">
                                {search || typeFilter !== "all"
                                    ? "No results match your filter. Try adjusting the search."
                                    : "Issue your first credential to see it appear here."}
                            </p>
                            {!search && typeFilter === "all" && (
                                <Button
                                    id="issue-first-btn"
                                    asChild
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Link href="/issuer/issue">
                                        <Plus className="w-4 h-4 mr-2" /> Issue First Credential
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 px-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-xs uppercase tracking-wider">
                                        <TableHead className="w-24">ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Name / Subject</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Issued At</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {credentials.map((cred) => (
                                        <TableRow
                                            key={cred.id}
                                            className={`transition-colors ${cred.status === "Revoked" ? "opacity-60" : "hover:bg-muted/30"}`}
                                        >
                                            {/* ID */}
                                            <TableCell>
                                                <span
                                                    className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded cursor-help"
                                                    title={cred.id}
                                                >
                                                    {shortId(cred.id)}
                                                </span>
                                            </TableCell>

                                            {/* Type badge */}
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${typeColor(cred.type)}`}>
                                                    {typeIcon(cred.type)}
                                                    {cred.typeLabel}
                                                </span>
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell>
                                                <div className="font-medium text-sm">{cred.name}</div>
                                                {cred.dob && cred.dob !== "—" && (
                                                    <div className="text-xs text-muted-foreground">DOB: {cred.dob}</div>
                                                )}
                                            </TableCell>

                                            {/* Type-specific details */}
                                            <TableCell className="text-xs text-muted-foreground max-w-[180px]">
                                                {cred.type === "vaccination" && (
                                                    <span>{cred.vaccineType} · {cred.manufacturer} · Dose {cred.doseNumber}</span>
                                                )}
                                                {cred.type === "prescription" && (
                                                    <span>{cred.medication} · Dr. {cred.prescribedBy}</span>
                                                )}
                                                {cred.type === "age_verification" && (
                                                    <span>{cred.state} · {cred.gender}</span>
                                                )}
                                                <div className="font-mono text-[10px] text-gray-400 mt-0.5">
                                                    #{cred.attrHash}
                                                </div>
                                            </TableCell>

                                            {/* Issued At */}
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(cred.issuedAt)}
                                            </TableCell>

                                            {/* Status badge */}
                                            <TableCell>
                                                {cred.status === "Active" ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 px-2 py-0.5 rounded-full">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 px-2 py-0.5 rounded-full">
                                                        <XCircle className="w-3 h-3" /> Revoked
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                {cred.status === "Active" && (
                                                    <Button
                                                        id={`revoke-btn-${cred.id}`}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 px-2"
                                                        onClick={() => handleRevoke(cred)}
                                                        disabled={revoking === cred.id}
                                                    >
                                                        {revoking === cred.id
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <><ShieldOff className="w-3.5 h-3.5 mr-1" /> Revoke</>
                                                        }
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Page {page} of {totalPages} · {total} total
                    </span>
                    <div className="flex gap-2">
                        <Button
                            id="prev-page-btn"
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            id="next-page-btn"
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
}
