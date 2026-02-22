"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Smartphone, BookOpen } from "lucide-react";

export const CTA = () => {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center p-16 md:p-24 rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1]"
                    >
                        Take Control of Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Identity.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Join the new era of privacy-preserving verification. Secure, decentralized, and user-owned.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="h-16 px-12 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold shadow-xl shadow-white/10 transition-all hover:scale-105"
                        >
                            <Link href="/wallet" className="flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-blue-600" /> Launch Wallet
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-16 px-12 text-lg border-white/20 bg-transparent hover:bg-white/5 text-white rounded-full font-bold transition-all"
                        >
                            <Link href="/docs" className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-gray-400" /> Read Documentation
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
