"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Rocket } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import { UserProfile } from '@/lib/user-profile-service';

interface NavbarProps {
    currentPage?: 'home' | 'dashboard';
    userProfile?: UserProfile | null;
}

export default function Navbar({ currentPage = 'home', userProfile }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="relative z-50 bg-black/30 backdrop-blur-2xl border-b border-white/20 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Search className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">
                            KronJobs
                        </span>
                    </motion.div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <motion.a
                            href="/"
                            className={`font-medium transition-colors relative group ${currentPage === 'home'
                                ? 'text-cyan-400'
                                : 'text-gray-300 hover:text-white'
                                }`}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0a182e] transition-all duration-300 group-hover:w-full"></span>
                        </motion.a>
                        <motion.a
                            href="/dashboard"
                            className={`font-medium transition-colors relative group ${currentPage === 'dashboard'
                                ? 'text-cyan-400'
                                : 'text-gray-300 hover:text-white'
                                }`}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Dashboard
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0a182e] transition-all duration-300 group-hover:w-full"></span>
                        </motion.a>
                    </div>

                    {/* User Profile Dropdown (only on dashboard) */}
                    {currentPage === 'dashboard' && (
                        <div className="ml-4 flex items-center">
                            <UserProfileDropdown userProfile={userProfile || null} />
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <motion.button
                        className="md:hidden p-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-sm hover:bg-cyan-500/10 transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
                            <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                            <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                        </div>
                    </motion.button>

                    {/* CTA Button */}
                    {currentPage !== 'dashboard' && (
                        <motion.button
                            className="bg-white text-black px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-xl hover:bg-gray-100 hover:text-black cursor-pointer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="flex items-center space-x-2">
                                <Rocket className="w-4 h-4 text-black" />
                                <span>Start Free</span>
                            </div>
                        </motion.button>
                    )}
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-cyan-500/20"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="px-4 py-6 space-y-4">
                                <motion.a
                                    href="/"
                                    className={`block font-medium transition-colors py-2 ${currentPage === 'home'
                                        ? 'text-cyan-400'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </motion.a>
                                <motion.a
                                    href="/dashboard"
                                    className={`block font-medium transition-colors py-2 ${currentPage === 'dashboard'
                                        ? 'text-cyan-400'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </motion.a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
} 