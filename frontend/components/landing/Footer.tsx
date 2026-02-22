"use client";

import Link from "next/link";
import { Shield, Github, Twitter, Mail } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="py-20 border-t border-white/5 bg-black/50">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">PrivaSeal</span>
                        </Link>
                        <p className="text-gray-500 max-w-sm text-lg leading-relaxed">
                            Advancing global privacy through zero-knowledge infrastructure and decentralized identity.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Resources</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/docs" className="text-gray-500 hover:text-white transition-colors">Documentation</Link>
                            </li>
                            <li>
                                <Link href="/benchmarks" className="text-gray-500 hover:text-white transition-colors">Benchmarks</Link>
                            </li>
                            <li>
                                <Link href="https://github.com" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                                    <Github size={16} /> GitHub
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Protocol</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link href="/whitepaper" className="text-gray-500 hover:text-white transition-colors">Whitepaper</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
                    <p className="text-gray-600 text-sm">
                        © 2026 PrivaSeal Protocol — Open Source & Privacy First.
                    </p>
                    <div className="flex gap-6 text-gray-600">
                        <Link href="#" className="hover:text-white transition-colors"><Twitter size={20} /></Link>
                        <Link href="#" className="hover:text-white transition-colors"><Mail size={20} /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
