"use client";

import { motion } from "framer-motion";
import { Database, Smartphone, CheckCircle, ShieldCheck, Zap } from "lucide-react";

export const RolesSection = () => {
    const roles = [
        {
            role: "Issuer",
            entity: "Hospital, Govt, Bank",
            action: "Signs credentials cryptographically.",
            icon: <Database className="w-10 h-10" />,
            color: "blue",
            details: ["BBS+ Signature", "Selective Disclosure", "Revocation Support"]
        },
        {
            role: "Holder (You)",
            entity: "Your Phone Wallet",
            action: "Stores credentials securely.",
            icon: <Smartphone className="w-10 h-10" />,
            color: "cyan",
            details: ["On-device Storage", "Full Ownership", "Biometric Lock"]
        },
        {
            role: "Verifier",
            entity: "Pharmacy, App, Store",
            action: "Receives only True/False result.",
            icon: <ShieldCheck className="w-10 h-10" />,
            color: "emerald",
            details: ["ZK Proof Verification", "No Data Storage", "Instant Validation"]
        }
    ];

    return (
        <section className="py-32 relative overflow-hidden bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-5xl font-extrabold text-white mb-6">The Trust Ecosystem</h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        A three-way secure protocol that eliminates the need for central data silos.
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Horizontal Line */}
                    <div className="absolute top-[100px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-emerald-500/0 hidden md:block" />

                    <div className="grid md:grid-cols-3 gap-12 relative z-10">
                        {roles.map((item, idx) => (
                            <motion.div
                                key={item.role}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="group flex flex-col items-center"
                            >
                                {/* Glow Icon Container */}
                                <div className={`
                  w-48 h-48 rounded-full flex items-center justify-center relative mb-12
                  transition-all duration-500 group-hover:scale-110
                  ${item.color === 'blue' ? 'bg-blue-600/10 border-blue-500/30' : ''}
                  ${item.color === 'cyan' ? 'bg-cyan-600/10 border-cyan-500/30' : ''}
                  ${item.color === 'emerald' ? 'bg-emerald-600/10 border-emerald-500/30' : ''}
                  border-4
                `}>
                                    <div className={`
                    absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity
                    ${item.color === 'blue' ? 'bg-blue-500' : ''}
                    ${item.color === 'cyan' ? 'bg-cyan-500' : ''}
                    ${item.color === 'emerald' ? 'bg-emerald-500' : ''}
                  `} />
                                    <div className={`
                    text-white
                    ${item.color === 'blue' ? 'text-blue-400' : ''}
                    ${item.color === 'cyan' ? 'text-cyan-400' : ''}
                    ${item.color === 'emerald' ? 'text-emerald-400' : ''}
                  `}>
                                        {item.icon}
                                    </div>

                                    {/* Step Number Badge */}
                                    <div className="absolute -top-4 right-4 w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center shadow-2xl">
                                        {idx + 1}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-white mb-2">{item.role}</h3>
                                    <p className="text-gray-400 font-medium mb-4">{item.entity}</p>
                                    <p className="text-gray-300 mb-8 max-w-[250px]">{item.action}</p>

                                    <div className="space-y-3 inline-block text-left">
                                        {item.details.map((detail) => (
                                            <div key={detail} className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                                                <Zap className="w-4 h-4 text-yellow-500/50" />
                                                {detail}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
