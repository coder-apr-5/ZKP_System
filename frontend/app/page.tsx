import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck, UserCheck, Smartphone, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white dark:bg-neutral-950">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
          <h1 className="text-xl font-bold tracking-tight">ZKP Verifier</h1>
        </div>
        <nav className="flex space-x-4">
          <Link href="/issuer" className="text-sm font-medium hover:text-indigo-600">Issuer</Link>
          <Link href="/wallet" className="text-sm font-medium hover:text-indigo-600">Wallet</Link>
          <Link href="/verify/global" className="text-sm font-medium hover:text-indigo-600">Verifier</Link>
          <Link href="/benchmarks" className="text-sm font-medium hover:text-indigo-600">Benchmarks</Link>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Privacy-Preserving Attribute Verification
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            Prove specific attributes (like age or membership) without revealing your full identity.
            Powered by Zero-Knowledge Proofs and BBS+ signatures.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/demo">
              <Button size="lg" className="rounded-full px-8">Start Demo</Button>
            </Link>
            <Link href="https://github.com/google-deepmind/zkp-system" target="_blank">
              <Button variant="outline" size="lg" className="rounded-full px-8 gap-2">
                GitHub <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Link href="/issuer" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-indigo-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <UserCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Issuer Portal</CardTitle>
                <CardDescription>Issue verifiable credentials to users.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-500">
                  Generate BBS+ signed credentials containing user attributes like Name, Age, and Membership Level.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/wallet" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-purple-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Holder Wallet</CardTitle>
                <CardDescription>Manage and prove your attributes.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-500">
                  Store credentials securely and generate zero-knowledge proofs for specific verification requests.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/verify/bar" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-pink-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>Verifier Interface</CardTitle>
                <CardDescription>Verify proofs without seeing raw data.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-500">
                  Request proofs (e.g., "Over 18") and verify them cryptographically without learning the actual age.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
