"use client";

import { motion } from "framer-motion";
import { Pill, Wine, CreditCard, User, Check } from "lucide-react";

export const Applications = () => {
    const cases = [
        {
            title: "Healthcare",
            description: "Prove vaccination or prescription without revealing medical history.",
            icon: <Pill className="w-10 h-10" />,
            color: "blue",
            accent: "bg-blue-500",
        },
        {
            title: "Age Control",
            description: "Prove 18+ or 21+ without showing ID card or exact date of birth.",
            icon: <Wine className="w-10 h-10" />,
            color: "amber",
            accent: "bg-amber-500",
        },
        {
            title: "Finance",
            description: "Prove credit score range without revealing actual score or balance.",
            icon: <CreditCard className="w-10 h-10" />,
            color: "indigo",
            accent: "bg-indigo-500",
        },
        {
            title: "Identity",
            description: "Prove residency or citizenship without exposing full address.",
            icon: <User className="w-10 h-10" />,
            color: "emerald",
            accent: "bg-emerald-500",
        },
    ];

    return (
        <section className="py-24 relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Universal Applications</h2>
                        <p className="text-gray-400 text-lg max-w-xl">
                            From regulated industries to everyday interactions, PrivaSeal brings privacy to every transaction.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 font-medium">
                        <Check className="text-emerald-500" /> Selective Disclosure
                        <Check className="text-emerald-500" /> Zero-Knowledge
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {cases.map((useCase, idx) => (
                        <motion.div
                            key={useCase.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="group relative overflow-hidden p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                        >
                            {/* Animated Background Light */}
                            <div className={`absolute -top-24 -right-24 w-64 h-64 ${useCase.accent} opacity-[0.03] blur-[100px] group-hover:opacity-[0.1] transition-opacity`} />

                            <div className="relative z-10 flex gap-8 items-start">
                                <div className={`p-5 rounded-2xl bg-white/5 text-white group-hover:scale-110 transition-transform duration-500`}>
                                    {useCase.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                        {useCase.title}
                                    </h3>
                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        {useCase.description}
                                    </p>
                                </div>
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                    <Check className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
