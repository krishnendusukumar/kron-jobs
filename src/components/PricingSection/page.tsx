"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Clock, AlertCircle, Crown, Sparkles, Rocket } from 'lucide-react';
import { UserProfileService, PricingPlan, UserProfile } from '../../lib/user-profile-service';

interface PricingSectionProps {
    userProfile?: UserProfile | null;
    onUpgrade?: (plan: 'lifetime' | 'pro') => void;
    className?: string;
    showFAQ?: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({
    userProfile,
    onUpgrade,
    className = "",
    showFAQ = true
}) => {
    const [plans] = useState<PricingPlan[]>(UserProfileService.getPricingPlans());
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeError, setUpgradeError] = useState<string | null>(null);
    const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

    const handleUpgrade = async (planId: string) => {
        if (!userProfile || planId === 'free') return;

        setIsUpgrading(true);
        setUpgradeError(null);

        try {
            if (planId === 'lifetime') {
                // For now, we'll use manual upgrade
                // In production, this would integrate with Stripe
                const success = await UserProfileService.upgradePlan(
                    userProfile.user_id,
                    'lifetime',
                    'manual'
                );

                if (success) {
                    onUpgrade?.('lifetime');
                } else {
                    setUpgradeError('Failed to upgrade plan. Please try again.');
                }
            } else if (planId === 'pro') {
                setUpgradeError('Pro plan is coming soon! Join the waitlist.');
            }
        } catch (error) {
            setUpgradeError('An error occurred. Please try again.');
            console.error('Upgrade error:', error);
        } finally {
            setIsUpgrading(false);
        }
    };

    const getCurrentPlan = () => {
        return userProfile?.plan || 'free';
    };

    const isCurrentPlan = (planId: string) => {
        return getCurrentPlan() === planId;
    };

    const canUpgrade = (planId: string) => {
        if (planId === 'free') return false;
        if (planId === 'pro') return false; // Coming soon
        if (isCurrentPlan(planId)) return false;
        return true;
    };

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'free':
                return <Shield className="w-8 h-8" />;
            case 'lifetime':
                return <Crown className="w-8 h-8" />;
            case 'pro':
                return <Rocket className="w-8 h-8" />;
            default:
                return <Zap className="w-8 h-8" />;
        }
    };

    const getPlanGradient = (planId: string, isPopular: boolean) => {
        if (isPopular) {
            return 'from-gradient-start via-gradient-middle to-gradient-end';
        }
        switch (planId) {
            case 'free':
                return 'from-slate-800 to-slate-900';
            case 'lifetime':
                return 'from-yellow-600/20 to-orange-600/20';
            case 'pro':
                return 'from-purple-600/20 to-pink-600/20';
            default:
                return 'from-slate-800 to-slate-900';
        }
    };

    return (
        <section className={`py-20 px-4 relative overflow-hidden bg-transparent ${className}`}>
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 bg-white text-black backdrop-blur-sm border border-cyan-400/30 rounded-full px-6 py-2 mb-6"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-300 text-sm font-medium">Limited Time Offer</span>
                    </motion.div>

                    <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-6">
                        Choose Your Plan
                    </h2>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Start free and unlock automation when you're ready.
                        <br />
                        <span className="text-cyan-400 font-medium">Our lifetime deal is perfect for early adopters.</span>
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                            whileHover={{
                                y: -8,
                                transition: { type: "spring", stiffness: 300, damping: 20 }
                            }}
                            onHoverStart={() => setHoveredPlan(plan.id)}
                            onHoverEnd={() => setHoveredPlan(null)}
                            className={`relative group cursor-pointer ${plan.isComingSoon ? 'opacity-75' : ''}`}
                        >
                            {/* Card Background with Glassmorphism */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${plan.isPopular
                                ? 'from-cyan-500/20 via-blue-500/20 to-purple-500/20'
                                : getPlanGradient(plan.id, false)
                                } backdrop-blur-xl`}></div>

                            {/* Border Glow Effect */}
                            <div className={`absolute inset-0 rounded-3xl p-[1px] bg-cyan-700/90 transition-all duration-500`}>
                                <div className="w-full h-full rounded-3xl bg-slate-900/90 backdrop-blur-xl"></div>
                            </div>

                            {/* Card Content */}
                            <div className="relative z-10 p-8 h-full flex flex-col">
                                {/* Popular Badge */}
                                {plan.isPopular && (
                                    <motion.div
                                        className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                                        animate={{
                                            scale: hoveredPlan === plan.id ? 1.1 : 1,
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <div className="bg-[#0a182e] text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                                            <Star className="w-4 h-4" />
                                            MOST POPULAR
                                        </div>
                                    </motion.div>
                                )}

                                {/* Coming Soon Badge */}
                                {plan.isComingSoon && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-[#0a182e] text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                                            <Clock className="w-4 h-4" />
                                            COMING SOON
                                        </div>
                                    </div>
                                )}

                                {/* Plan Icon & Header */}
                                <div className="text-center mb-8 pt-4">
                                    <motion.div
                                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${plan.isPopular
                                            ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-400'
                                            : 'bg-slate-800/50 text-slate-400'
                                            } backdrop-blur-sm border border-slate-700/50`}
                                        whileHover={{
                                            scale: 1.1,
                                            rotate: 5,
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        {getPlanIcon(plan.id)}
                                    </motion.div>

                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        {plan.name}
                                    </h3>

                                    {/* Pricing */}
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <motion.span
                                            className={`text-4xl font-black text-white`}
                                            animate={{
                                                scale: hoveredPlan === plan.id ? 1.05 : 1,
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            {plan.price}
                                        </motion.span>
                                        {plan.originalPrice && (
                                            <span className="text-xl text-slate-500 line-through font-medium">
                                                {plan.originalPrice}
                                            </span>
                                        )}
                                        <div className="flex flex-col text-xs">
                                            {plan.id === 'lifetime' && (
                                                <span className="text-cyan-400 font-bold uppercase tracking-wide">
                                                    ONE-TIME
                                                </span>
                                            )}
                                            {plan.id === 'pro' && (
                                                <span className="text-slate-400 font-medium">
                                                    /month
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="flex-grow mb-8">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature, featureIndex) => (
                                            <motion.li
                                                key={featureIndex}
                                                className="flex items-start gap-3"
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 + featureIndex * 0.1 }}
                                            >
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${plan.isPopular
                                                    ? 'bg-[#0a182e] text-white'
                                                    : 'bg-slate-700'
                                                    }`}>
                                                    <Check className={`w-3 h-3 ${plan.isPopular ? 'text-white' : 'text-cyan-400'
                                                        }`} />
                                                </div>
                                                <span className="text-slate-300 text-sm leading-relaxed">
                                                    {feature}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action Button */}
                                <div className="text-center">
                                    {isCurrentPlan(plan.id) ? (
                                        <motion.button
                                            disabled
                                            className="w-full py-4 px-8 bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300 rounded-2xl font-bold text-lg cursor-not-allowed border border-slate-600"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            ✓ Current Plan
                                        </motion.button>
                                    ) : canUpgrade(plan.id) ? (
                                        <motion.button
                                            onClick={() => handleUpgrade(plan.id)}
                                            disabled={isUpgrading}
                                            className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg bg-[#0a182e] text-white border-0 hover:bg-[#162a4d] disabled:opacity-50 disabled:cursor-not-allowed`}
                                            whileHover={{
                                                scale: 1.02,
                                                boxShadow: plan.isPopular
                                                    ? "0 20px 40px rgba(6, 182, 212, 0.4)"
                                                    : "0 20px 40px rgba(71, 85, 105, 0.4)"
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            {isUpgrading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Upgrading...
                                                </div>
                                            ) : plan.isPopular ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Zap className="w-5 h-5" />
                                                    Upgrade Now
                                                </div>
                                            ) : (
                                                'Get Started'
                                            )}
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            disabled
                                            className="w-full py-4 px-8 bg-gradient-to-r from-slate-700 to-slate-800 text-slate-400 rounded-2xl font-bold text-lg cursor-not-allowed border border-slate-600"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            {plan.isComingSoon ? 'Coming Soon' : 'Unavailable'}
                                        </motion.button>
                                    )}
                                </div>

                                {/* Error Message */}
                                {upgradeError && plan.id === 'lifetime' && (
                                    <motion.div
                                        className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <div className="flex items-center gap-3 text-red-400 text-sm">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <span>{upgradeError}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Current Plan Info */}
                {userProfile && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mb-20"
                    >
                        <div className="bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-3xl p-8 max-w-2xl mx-auto">
                            <div className="text-center mb-6">
                                <h4 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                    <Shield className="w-6 h-6 text-cyan-400" />
                                    Your Current Plan
                                </h4>
                                <div className="text-3xl font-black text-white">
                                    {plans.find(p => p.id === getCurrentPlan())?.name}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center p-4 rounded-2xl bg-slate-800/50 border border-slate-600/30">
                                    <div className="text-2xl font-bold text-cyan-400 mb-1">
                                        {userProfile.credits_remaining}
                                    </div>
                                    <div className="text-slate-400 text-sm font-medium">Credits Left</div>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-slate-800/50 border border-slate-600/30">
                                    <div className="text-2xl font-bold text-blue-400 mb-1">
                                        {userProfile.max_cron_jobs}
                                    </div>
                                    <div className="text-slate-400 text-sm font-medium">Cron Jobs</div>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-slate-800/50 border border-slate-600/30">
                                    <div className="text-2xl font-bold text-purple-400 mb-1">
                                        {userProfile.max_daily_fetches}
                                    </div>
                                    <div className="text-slate-400 text-sm font-medium">Daily Fetches</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* FAQ Section */}
                {showFAQ && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center"
                    >
                        <h3 className="text-3xl font-bold text-white mb-12">
                            Frequently Asked Questions
                        </h3>
                        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
                            {[
                                {
                                    question: "What are cron jobs?",
                                    answer: "Cron jobs automatically search for new jobs at scheduled times (10:00 AM, 12:00 PM, 3:00 PM, 6:00 PM, 9:00 PM). You choose when you want the system to run."
                                },
                                {
                                    question: "Can I change my plan later?",
                                    answer: "Yes! You can upgrade from Free to Lifetime anytime. The Pro plan will be available soon with even more features."
                                },
                                {
                                    question: "What happens to my credits?",
                                    answer: "Credits reset daily at midnight UTC. Free users get 3 credits, Lifetime users get 3 credits, and Pro users will get 5 credits."
                                },
                                {
                                    question: "Is the lifetime deal really forever?",
                                    answer: "Yes! The $5 lifetime deal gives you permanent access to automation features. This is a limited-time offer for early adopters."
                                }
                            ].map((faq, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#0a182e]"></div>
                                        {faq.question}
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default PricingSection;