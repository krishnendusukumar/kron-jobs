"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full rounded-2xl py-6 px-4 md:px-8 mt-16 mb-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left: Logo and Name */}
                <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">KronJobs</span>
                </motion.div>

                {/* Right: Navigation Links */}
                <motion.div
                    className="flex flex-wrap items-center gap-2 md:gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <motion.a
                        href="#"
                        className="rounded-full bg-[#232329] text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Privacy Policy
                    </motion.a>
                    <motion.a
                        href="#"
                        className="rounded-full bg-[#232329] text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Terms of Use
                    </motion.a>
                    <motion.a
                        href="#"
                        className="rounded-full bg-[#232329] text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Contact us
                    </motion.a>
                    <motion.a
                        href="#"
                        className="rounded-full bg-[#232329] text-white hover:bg-cyan-600 hover:text-white px-4 py-2 text-sm font-semibold transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get started
                    </motion.a>
                </motion.div>
            </div>
        </footer>
    );
} 