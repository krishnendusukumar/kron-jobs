"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Clock, AlertCircle, Crown, Sparkles, Rocket, LogIn } from 'lucide-react';
import { UserProfileService, PricingPlan, UserProfile } from '../../lib/user-profile-service';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface PricingSectionProps {
    userProfile?: UserProfile | null;
    onUpgrade?: (plan: 'weekly' | 'monthly') => void;
    className?: string;
    showFAQ?: boolean;
    isLoadingProfile?: boolean;
}

interface DodoPaymentResponse {
    checkout_url: string;
    session_id: string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
    userProfile,
    onUpgrade,
    className = "",
    showFAQ = true,
    isLoadingProfile = false
}) => {
    const { isSignedIn } = useUser();
    const router = useRouter();
    const [plans] = useState<PricingPlan[]>(UserProfileService.getPricingPlans());
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeError, setUpgradeError] = useState<string | null>(null);
    const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

    // Debug logging
    useEffect(() => {
        console.log('🔍 PricingSection - userProfile:', userProfile, 'isLoadingProfile:', isLoadingProfile);
        console.log('🔍 PricingSection - should show profile section:', (userProfile || isLoadingProfile));
        if (userProfile) {
            console.log('🔍 PricingSection - userProfile details:', {
                plan: userProfile.plan,
                credits_remaining: userProfile.credits_remaining,
                max_cron_jobs: userProfile.max_cron_jobs,
                max_daily_fetches: userProfile.max_daily_fetches
            });
        }
    }, [userProfile, isLoadingProfile]);

    // Plan hierarchy for comparison
    const planHierarchy = {
        'free': 0,
        'weekly': 1,
        'monthly': 2
    };

    const handleUpgrade = async (planId: string) => {
        if (planId === 'free') return;

        // If user is not signed in, redirect to login with return URL
        if (!isSignedIn) {
            const returnUrl = encodeURIComponent('/dashboard?tab=pricing');
            router.push(`/sign-in?redirect_url=${returnUrl}`);
            return;
        }

        if (!userProfile) {
            setUpgradeError('Please complete your profile setup first.');
            return;
        }

        setIsUpgrading(true);
        setUpgradeError(null);

        try {
            // Dodo payment integration for paid plans
            if (planId === 'weekly' || planId === 'monthly') {
                // Build the Dodo payment link dynamically based on plan type
                const weeklyProductId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_WEEKLY;
                const monthlyProductId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_MONTHLY;

                let productId;
                if (planId === 'weekly') {
                    productId = weeklyProductId;
                } else if (planId === 'monthly') {
                    productId = monthlyProductId;
                }

                console.log('🔍 Dodo payment check:', {
                    planId,
                    weeklyProductId: weeklyProductId ? 'SET' : 'MISSING',
                    monthlyProductId: monthlyProductId ? 'SET' : 'MISSING',
                    selectedProductId: productId ? 'SET' : 'MISSING',
                    userProfileEmail: userProfile.email,
                    userProfileId: userProfile.user_id
                });

                if (!productId) {
                    setUpgradeError('Payment system is being configured. Please try again in a few minutes or contact support.');
                    setIsUpgrading(false);
                    return;
                }
                const dodoBase = `https://checkout.dodopayments.com/buy/${productId}`;
                const params = new URLSearchParams({
                    quantity: '1',
                    redirect_url: `${window.location.origin}/dashboard?payment=success&plan=${planId}`,
                    email: userProfile.email,
                    disableEmail: 'true',
                    [`metadata_userId`]: userProfile.user_id,
                    [`metadata_plan`]: planId
                });
                const paymentUrl = `${dodoBase}?${params.toString()}`;
                console.log('🚀 Redirecting to Dodo payment:', paymentUrl);
                window.location.href = paymentUrl;
                return;
            }

            // Manual upgrade fallback (for testing)
            const success = await UserProfileService.upgradePlan(
                userProfile.user_id,
                planId as 'weekly' | 'monthly',
                'manual'
            );

            if (success) {
                onUpgrade?.(planId as 'weekly' | 'monthly');
            } else {
                setUpgradeError('Failed to upgrade plan. Please try again.');
            }
        } catch (error) {
            setUpgradeError('An error occurred. Please try again.');
            console.error('Upgrade error:', error);
        } finally {
            setIsUpgrading(false);
        }
    };

    const getCurrentPlan = () => {
        if (!userProfile) return 'free';
        return userProfile.plan || 'free';
    };

    const isCurrentPlan = (planId: string) => {
        const currentPlan = getCurrentPlan();
        return currentPlan === planId;
    };

    const canUpgrade = (planId: string) => {
        const currentPlan = getCurrentPlan();
        const currentPlanLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
        const targetPlanLevel = planHierarchy[planId as keyof typeof planHierarchy] || 0;
        const isCurrent = isCurrentPlan(planId);

        // Can't upgrade to free plan
        if (planId === 'free') {
            return false;
        }

        // Can't upgrade to current plan
        if (isCurrent) {
            return false;
        }

        // Can upgrade to higher plans
        return targetPlanLevel > currentPlanLevel;
    };



    const getButtonText = (planId: string) => {
        if (planId === 'free') return 'Current Plan';
        if (isCurrentPlan(planId)) return '✓ Current Plan';
        if (!isSignedIn) return 'Sign In to Buy';
        if (!userProfile) return 'Complete Setup';
        return 'Buy Now';
    };

    const getButtonState = (planId: string) => {
        if (planId === 'free') return 'disabled';
        if (isCurrentPlan(planId)) return 'current';
        if (!isSignedIn) return 'login';
        if (!userProfile) return 'disabled';
        if (canUpgrade(planId)) return 'upgrade';
        return 'disabled';
    };

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'free':
                return <Shield className="w-8 h-8" />;
            case 'weekly':
                return <Crown className="w-8 h-8" />;
            case 'monthly':
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
            case 'weekly':
                return 'from-yellow-600/20 to-orange-600/20';
            case 'monthly':
                return 'from-purple-600/20 to-pink-600/20';
            default:
                return 'from-slate-800 to-slate-900';
        }
    };

    const getButtonClasses = (planId: string, isPopular: boolean) => {
        const state = getButtonState(planId);

        switch (state) {
            case 'current':
                return 'w-full py-4 px-8 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-2xl font-bold text-lg cursor-not-allowed border border-cyan-600';
            case 'upgrade':
                return `w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg bg-[#0a182e] text-white border-0 hover:bg-[#162a4d] disabled:opacity-50 disabled:cursor-not-allowed`;
            case 'login':
                return `w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 hover:from-cyan-600 hover:to-blue-700`;
            case 'disabled':
            default:
                return 'w-full py-4 px-8 bg-gradient-to-r from-slate-700 to-slate-800 text-slate-400 rounded-2xl font-bold text-lg cursor-not-allowed border border-slate-600';
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
                        Start free and unlock unlimited job searches when you're ready.
                        <br />
                        <span className="text-cyan-400 font-medium">Choose weekly or monthly plans based on your needs.</span>
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
                                    {/* Current Plan Badge */}
                                    {isCurrentPlan(plan.id) && (
                                        <motion.div
                                            className="absolute -top-2 right-4 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            CURRENT
                                        </motion.div>
                                    )}

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
                                            {plan.id === 'weekly' && (
                                                <span className="text-cyan-400 font-bold uppercase tracking-wide">
                                                    /week
                                                </span>
                                            )}
                                            {plan.id === 'monthly' && (
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
                                    <motion.button
                                        onClick={() => handleUpgrade(plan.id)}
                                        disabled={getButtonState(plan.id) === 'disabled' || getButtonState(plan.id) === 'current' || isUpgrading}
                                        className={getButtonClasses(plan.id, plan.isPopular || false)}
                                        whileHover={{
                                            scale: getButtonState(plan.id) !== 'disabled' ? 1.02 : 1,
                                            boxShadow: plan.isPopular && getButtonState(plan.id) !== 'disabled'
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
                                        ) : getButtonState(plan.id) === 'login' ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <LogIn className="w-5 h-5" />
                                                Sign In to Buy
                                            </div>
                                        ) : (
                                            getButtonText(plan.id)
                                        )}
                                    </motion.button>
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
                {(userProfile || isLoadingProfile || isSignedIn) && (
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
                                    {isLoadingProfile ? 'Loading...' : (plans.find(p => p.id === getCurrentPlan())?.name || 'Free')}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center p-4 rounded-2xl bg-slate-800/50 border border-slate-600/30">
                                    <div className="text-2xl font-bold text-cyan-400 mb-1">
                                        {isLoadingProfile ? '...' : (userProfile?.credits_remaining || 3)}
                                    </div>
                                    <div className="text-slate-400 text-sm font-medium">Credits Left</div>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-slate-800/50 border border-slate-600/30">
                                    <div className="text-2xl font-bold text-blue-400 mb-1">
                                        {isLoadingProfile ? '...' : (userProfile?.max_cron_jobs || 0)}
                                    </div>
                                    <div className="text-slate-400 text-sm font-medium">Cron Jobs</div>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-slate-800/50 border border-slate-600/30">
                                    <div className="text-2xl font-bold text-purple-400 mb-1">
                                        {isLoadingProfile ? '...' : (userProfile?.max_daily_fetches || 3)}
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
                                    answer: "Yes! You can upgrade from Free to Weekly or Monthly anytime. Both paid plans offer unlimited job searches."
                                },
                                {
                                    question: "What happens to my credits?",
                                    answer: "Credits reset daily at midnight UTC. Free users get 3 credits, while Weekly and Monthly users get unlimited job searches."
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