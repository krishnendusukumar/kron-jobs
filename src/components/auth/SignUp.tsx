"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a182e] via-[#0e223a] to-[#1a2a3d] flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    className="absolute w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        top: "20%",
                        left: "10%",
                    }}
                />
                <motion.div
                    className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 60, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        top: "60%",
                        right: "10%",
                    }}
                />
                <motion.div
                    className="absolute w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -40, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        bottom: "20%",
                        left: "30%",
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.h1
                        className="text-4xl font-bold text-white mb-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Join KronJobs
                    </motion.h1>
                    <motion.p
                        className="text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Start automating your job search today
                    </motion.p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-3xl p-8 shadow-2xl">
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "bg-transparent shadow-none p-0",
                                headerTitle: "text-cyan-200 text-xl font-semibold",
                                headerSubtitle: "text-gray-400 text-sm",
                                formButtonPrimary: "bg-[#0a182e] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:bg-[#162a4d]",
                                formFieldInput: "bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded-xl px-4 py-3",
                                formFieldLabel: "text-cyan-200 text-sm font-medium",
                                footerActionLink: "text-cyan-400 hover:text-cyan-300 transition-colors",
                                dividerLine: "bg-gray-600",
                                dividerText: "text-gray-400",
                                socialButtonsBlockButton: "bg-black/30 border border-cyan-400/20 text-white hover:bg-black/50 transition-all duration-200 rounded-xl",
                                socialButtonsBlockButtonText: "text-white",
                                formFieldLabelRow: "mb-2",
                                formFieldInputShowPasswordButton: "text-gray-400 hover:text-cyan-400",
                                formResendCodeLink: "text-cyan-400 hover:text-cyan-300",
                                formFieldAction: "text-cyan-400 hover:text-cyan-300",
                                identityPreviewText: "text-gray-400",
                                identityPreviewEditButton: "text-cyan-400 hover:text-cyan-300",
                                formFieldActionLink: "text-cyan-400 hover:text-cyan-300",
                                footerAction: "text-gray-400",
                            },
                        }}
                    />
                </div>

                <motion.div
                    className="text-center mt-6 text-gray-400 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <p>Get started with 3 free job searches per day</p>
                    <p className="mt-1">Upgrade anytime for unlimited automation</p>
                </motion.div>
            </motion.div>
        </div>
    );
} 