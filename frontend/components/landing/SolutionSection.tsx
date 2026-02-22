"use client";

import { motion } from "framer-motion";
import { Database, Smartphone, QrCode, ArrowRight } from "lucide-react";

export const SolutionSection = () => {
    return (
        <section className="py-24 relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6"
                    >
                        Zero-Knowledge Infrastructure
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                        Our Solution — Privacy by Design
                    </h2>
                    <p className="text-gray-400 max-w-3xl mx-auto text-xl leading-relaxed">
                        We use <span className="text-white font-semibold">BBS+ Signatures</span> and Zero-Knowledge Proofs to let you prove facts about yourself without sharing the underlying documents.
                    </p>
                </div>

                {/* Animated Diagram */}
                <div className="relative max-w-5xl mx-auto mt-20 p-12 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden">
                    {/* Animated Background Lines */}
                    <div className="absolute inset-0 overflow-hidden opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 800 400">
                            <motion.path
                                d="M 150 200 L 400 200 L 650 200"
                                stroke="url(#grad1)"
                                strokeWidth="4"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="50%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative z-10 items-center">
                        {/* Issuer */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center text-center p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                <Database className="w-8 h-8 text-blue-400" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">1. Issuer</h4>
                            <p className="text-sm text-blue-400 mb-3 font-medium uppercase tracking-wider">Hospital, Govt, Bank</p>
                            <p className="text-gray-400 text-sm">Signs credentials cryptographically. They don't track when you use them.</p>
                        </motion.div>

                        {/* Holder */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 relative"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                Secure Enclave
                            </div>
                            <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 border-2 border-cyan-500/30">
                                <Smartphone className="w-10 h-10 text-cyan-400" />
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-2">2. Holder (You)</h4>
                            <p className="text-sm text-cyan-400 mb-3 font-medium uppercase tracking-wider">Your Device</p>
                            <p className="text-gray-300 text-sm">Stores credentials securely. Generates proofs locally. No private data ever leaves your device.</p>
                        </motion.div>

                        {/* Verifier */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center text-center p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                <QrCode className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">3. Verifier</h4>
                            <p className="text-sm text-emerald-400 mb-3 font-medium uppercase tracking-wider">App, Store, Web</p>
                            <p className="text-gray-400 text-sm">Verifies proofs instantly. Receives only "Yes/No" or minimal data.</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
