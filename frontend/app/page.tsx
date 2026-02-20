"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Check, X, Pill, Wine, CreditCard, User, ChevronRight, QrCode, Smartphone, Database, Upload, EyeOff, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 font-primary">
      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-privaseal-blue p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">PrivaSeal</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/issuer" className="text-sm font-medium text-gray-600 hover:text-privaseal-blue transition-colors">Issuer Portal</Link>
          <Link href="/wallet" className="text-sm font-medium text-gray-600 hover:text-privaseal-blue transition-colors">Holder Wallet</Link>
          <Link href="/verifier" className="text-sm font-medium text-gray-600 hover:text-privaseal-blue transition-colors">Verifier Portal</Link>
          <Link href="/benchmarks" className="text-sm font-medium text-gray-600 hover:text-privaseal-blue transition-colors">Benchmarks</Link>
        </nav>
        <div className="flex gap-4">
          <Button asChild variant="ghost" className="hidden sm:flex hover:bg-gray-100 text-gray-700">
            <Link href="/docs">Documentation</Link>
          </Button>
          <Button asChild className="bg-privaseal-blue hover:bg-privaseal-blue-dark text-white shadow-lg shadow-privaseal-blue/25 transition-all">
            <Link href="/wallet">Launch Wallet</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-6xl mx-auto overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-privaseal-blue-pale via-white to-white opacity-40"></div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-privaseal-blue/10 text-privaseal-blue text-sm font-semibold mb-8 animate-fade-in border border-privaseal-blue/20">
            <Activity className="w-4 h-4" />
            <span>Universal Privacy-First Verification Protocol</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.1]">
            Verify Anything. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-privaseal-blue to-privaseal-green">Reveal Nothing.</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mb-12 leading-relaxed">
            Prove your identity, age, or eligibility without sharing your data.
            Zero-knowledge proofs ensure you share <strong>only what matters</strong>, keeping your personal information private and secure.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg bg-privaseal-blue hover:bg-privaseal-blue-dark text-white shadow-xl shadow-privaseal-blue/20 rounded-full transition-all hover:scale-105">
              <Link href="/wallet">
                <Smartphone className="mr-2 w-5 h-5" /> Get Your Wallet
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-gray-200 hover:border-privaseal-blue/50 hover:bg-privaseal-blue/5 text-gray-700 rounded-full transition-all">
              <Link href="/issuer">
                Start Issuing
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-14 px-8 text-lg text-gray-600 hover:text-privaseal-blue rounded-full transition-all">
              <Link href="/verifier">
                Verify Proofs <ChevronRight className="ml-1 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Problem & Solution Grid */}
        <section className="px-6 py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">The Privacy Crisis</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Why the current verification systems are broken and dangerous.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  <CardTitle>Over-Disclosure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">To prove you're 18+, you share your full ID (Name, Address, DOB). To get medicine, you reveal your entire medical history.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <CardTitle>Tracking & Surfaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Every time you verify, you leave a trace. Corporations and data brokers build detailed profiles of your life and habits.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-700 mb-4">
                    <Database className="w-6 h-6" />
                  </div>
                  <CardTitle>Data Breaches</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Centralized databases are honey pots for hackers. Your data is stored in thousands of vulnerable servers, waiting to be stolen.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Architecture / Solution Section */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-privaseal-blue font-semibold tracking-wider uppercase text-sm">Our Solution</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Privacy by Design with BBS+ Signatures</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">Use zero-knowledge proofs to selectively disclose information without revealing the underlying data.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Arrows for Desktop */}
              <div className="hidden md:block absolute top-12 left-[30%] w-[10%] h-[2px] bg-gray-200"></div>
              <div className="hidden md:block absolute top-12 right-[30%] w-[10%] h-[2px] bg-gray-200"></div>

              <div className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-privaseal-blue mb-6 group-hover:scale-110 transition-transform duration-300 border-2 border-blue-100">
                  <Database className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Issuer</h3>
                <p className="text-sm text-gray-500 mb-4">Hospital, Govt, Bank</p>
                <p className="text-gray-600">Signs credentials cryptographically. Does not store your usage data.</p>
              </div>

              <div className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-privaseal-green mb-6 group-hover:scale-110 transition-transform duration-300 border-4 border-green-100 shadow-xl">
                  <Smartphone className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Holder (You)</h3>
                <p className="text-sm text-gray-500 mb-4">Your Phone Wallet</p>
                <p className="text-gray-600">Stores credentials securely. Generates proofs on-device. No data leaves your phone without consent.</p>
              </div>

              <div className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300 border-2 border-purple-100">
                  <QrCode className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Verifier</h3>
                <p className="text-sm text-gray-500 mb-4">Pharmacy, App, Store</p>
                <p className="text-gray-600">Verifies proofs instantly. Receives only "True/False" or minimal data needed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Universal Applications</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border hover:border-privaseal-blue transition-colors group cursor-default">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Pill /></div>
                <h3 className="font-bold text-lg mb-2">Healthcare</h3>
                <p className="text-sm text-gray-600">Prove vaccination or prescription without revealing medical history.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border hover:border-privaseal-blue transition-colors group cursor-default">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors"><Wine /></div>
                <h3 className="font-bold text-lg mb-2">Age Control</h3>
                <p className="text-sm text-gray-600">Prove 18+ or 21+ without showing ID card or exact date of birth.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border hover:border-privaseal-blue transition-colors group cursor-default">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><CreditCard /></div>
                <h3 className="font-bold text-lg mb-2">Finance</h3>
                <p className="text-sm text-gray-600">Prove credit score range without revealing actual score or balance.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border hover:border-privaseal-blue transition-colors group cursor-default">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><User /></div>
                <h3 className="font-bold text-lg mb-2">Identity</h3>
                <p className="text-sm text-gray-600">Prove residency or citizenship without exposing full address.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-privaseal-blue" />
            <span className="text-xl font-bold text-white">PrivaSeal</span>
          </div>
          <div className="text-sm text-gray-500">
            © 2026 PrivaSeal Protocol. Open Source & Privacy First.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
