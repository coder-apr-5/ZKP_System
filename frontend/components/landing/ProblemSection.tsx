"use client";

import { Upload, EyeOff, Database } from "lucide-react";
import { motion } from "framer-motion";

export const ProblemSection = () => {
    const problems = [
        {
            title: "Over-Disclosure",
            description: "To prove you're 18+, you share your full ID. To get medicine, you reveal your entire medical history.",
            icon: <Upload className="w-8 h-8 text-red-400" />,
            gradient: "from-red-500/20 to-orange-500/20",
        },
        {
            title: "Tracking & Surveillance",
            description: "Every time you verify, you leave a trace. Corporations and data brokers build detailed profiles of your life.",
            icon: <EyeOff className="w-8 h-8 text-orange-400" />,
            gradient: "from-orange-500/20 to-yellow-500/20",
        },
        {
            title: "Data Breaches",
            description: "Centralized databases are honey pots for hackers. Your data is stored in thousands of vulnerable servers.",
            icon: <Database className="w-8 h-8 text-blue-400" />,
            gradient: "from-blue-500/20 to-purple-500/20",
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        The Privacy Crisis
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        Why current verification systems are broken, dangerous, and outdated.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {problems.map((problem, idx) => (
                        <motion.div
                            key={problem.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative p-8 rounded-3xl glass-card border-white/5 hover:border-white/20 transition-all duration-300"
                        >
                            {/* Card Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${problem.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />

                            <div className="relative z-10">
                                <div className="mb-6 p-4 rounded-2xl bg-white/5 inline-block group-hover:scale-110 transition-transform duration-500">
                                    {problem.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{problem.title}</h3>
                                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                    {problem.description}
                                </p>
                            </div>

                            {/* Decorative Glow */}
                            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors rounded-full" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
