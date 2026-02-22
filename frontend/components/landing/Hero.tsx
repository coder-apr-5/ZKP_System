"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, ChevronRight, Activity, QrCode, Lock } from "lucide-react";
import { motion } from "framer-motion";

export const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 bg-glow-blob animate-glow" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 bg-glow-blob" style={{ animationDelay: "-2s" }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                            <Activity className="w-4 h-4 animate-pulse" />
                            <span>Universal Privacy-First Verification Protocol</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[0.9]">
                            Verify Anything. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                                Reveal Nothing.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-xl mb-12 leading-relaxed">
                            Prove your identity, age, or eligibility without sharing your data.
                            Zero-knowledge proofs ensure you share only what matters.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 items-center">
                            <Button
                                asChild
                                size="lg"
                                className="h-16 px-10 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl shadow-blue-500/20 rounded-full transition-all hover:scale-105 active:scale-95"
                            >
                                <Link href="/wallet" className="flex items-center gap-2">
                                    <Smartphone className="w-5 h-5" /> Get Your Wallet
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-16 px-10 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-sm"
                            >
                                <Link href="/issuer">Start Issuing</Link>
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                className="text-gray-400 hover:text-white hover:bg-transparent group"
                            >
                                <Link href="/verifier" className="flex items-center gap-2">
                                    Verify Proofs <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10 w-full aspect-square max-w-xl mx-auto flex items-center justify-center">
                            {/* Floating Cards Animation */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-10 left-10 w-48 h-64 glass-card rounded-2xl p-6 border-blue-500/30 flex flex-col justify-between"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-blue-500/20 rounded-full" />
                                    <div className="h-2 w-3/4 bg-blue-500/20 rounded-full" />
                                    <div className="h-6 w-1/2 bg-blue-400/20 rounded-lg mt-4" />
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-10 right-10 w-48 h-64 glass-card rounded-2xl p-6 border-emerald-500/30 flex flex-col justify-between z-20"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-emerald-500/20 rounded-full" />
                                    <div className="h-2 w-2/3 bg-emerald-500/20 rounded-full" />
                                    <div className="h-6 w-3/4 bg-emerald-400/20 rounded-lg mt-4" />
                                </div>
                            </motion.div>

                            {/* Central QR/Shield */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500/30 blur-[60px] group-hover:bg-blue-500/50 transition-colors duration-500" />
                                <div className="relative w-72 h-72 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 rounded-[3rem] border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
                                    <QrCode className="w-40 h-40 text-white/80 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Glowing lines/particles could be added here */}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
