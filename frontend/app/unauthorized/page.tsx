"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900/50 border border-red-500/20 backdrop-blur-xl rounded-3xl p-8 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-8">
                    You do not have the necessary permissions to access this area of PrivaSeal.
                    Please contact your administrator if you believe this is an error.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl transition-all font-semibold"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </Link>
            </div>
        </div>
    );
}
