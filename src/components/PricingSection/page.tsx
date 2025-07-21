"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Clock, AlertCircle } from 'lucide-react';
import { UserProfileService, PricingPlan, UserProfile } from '../../lib/user-profile-service';

interface PricingSectionProps {
    userProfile?: UserProfile | null;
    onUpgrade?: (plan: 'lifetime' | 'pro') => void;
    className?: string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
    userProfile,
    onUpgrade,
    className = ""
}) => {
    const [plans] = useState<PricingPlan[]>(UserProfileService.getPricingPlans());
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeError, setUpgradeError] = useState<string | null>(null);

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

    return (
        <section className={`py-16 px-4 ${className}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Choose Your Plan
                    </h2>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Start free and upgrade when you're ready for automation.
                        Our lifetime deal is perfect for early adopters.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`relative rounded-2xl p-8 ${plan.isPopular
                                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50'
                                    : 'bg-white/5 border border-white/10'
                                } ${plan.isComingSoon ? 'opacity-75' : ''}`}
                        >
                            {/* Popular Badge */}
                            {plan.isPopular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                                        <Star className="w-4 h-4" />
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            {/* Coming Soon Badge */}
                            {plan.isComingSoon && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Coming Soon
                                    </div>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {plan.name}
                                </h3>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-3xl font-bold text-white">
                                        {plan.price}
                                    </span>
                                    {plan.originalPrice && (
                                        <span className="text-lg text-gray-400 line-through">
                                            {plan.originalPrice}
                                        </span>
                                    )}
                                    {plan.id === 'lifetime' && (
                                        <span className="text-sm text-cyan-400 font-medium">
                                            one-time
                                        </span>
                                    )}
                                    {plan.id === 'pro' && (
                                        <span className="text-sm text-gray-400">
                                            /month
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-300 text-sm">
                                    {plan.description}
                                </p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* Action Button */}
                            <div className="text-center">
                                {isCurrentPlan(plan.id) ? (
                                    <button
                                        disabled
                                        className="w-full py-3 px-6 bg-gray-600 text-gray-300 rounded-lg font-medium cursor-not-allowed"
                                    >
                                        Current Plan
                                    </button>
                                ) : canUpgrade(plan.id) ? (
                                    <button
                                        onClick={() => handleUpgrade(plan.id)}
                                        disabled={isUpgrading}
                                        className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-3 px-6 bg-gray-600 text-gray-300 rounded-lg font-medium cursor-not-allowed"
                                    >
                                        {plan.isComingSoon ? 'Coming Soon' : 'Unavailable'}
                                    </button>
                                )}
                            </div>

                            {/* Error Message */}
                            {upgradeError && plan.id === 'lifetime' && (
                                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        {upgradeError}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Current Plan Info */}
                {userProfile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-12 text-center"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-md mx-auto">
                            <h4 className="text-lg font-semibold text-white mb-2">
                                Your Current Plan
                            </h4>
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <span className="text-2xl font-bold text-cyan-400">
                                    {plans.find(p => p.id === getCurrentPlan())?.name}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between">
                                    <span>Credits Remaining:</span>
                                    <span className="font-medium">{userProfile.credits_remaining}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Max Cron Jobs:</span>
                                    <span className="font-medium">{userProfile.max_cron_jobs}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Daily Fetches:</span>
                                    <span className="font-medium">{userProfile.max_daily_fetches}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <h3 className="text-2xl font-bold text-white mb-8">
                        Frequently Asked Questions
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">
                                    What are cron jobs?
                                </h4>
                                <p className="text-gray-300 text-sm">
                                    Cron jobs automatically search for new jobs at scheduled times (10:00 AM, 12:00 PM, 3:00 PM, 6:00 PM, 9:00 PM).
                                    You choose when you want the system to run.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">
                                    Can I change my plan later?
                                </h4>
                                <p className="text-gray-300 text-sm">
                                    Yes! You can upgrade from Free to Lifetime anytime. The Pro plan will be available soon with even more features.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">
                                    What happens to my credits?
                                </h4>
                                <p className="text-gray-300 text-sm">
                                    Credits reset daily at midnight UTC. Free users get 3 credits, Lifetime users get 3 credits, and Pro users will get 5 credits.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">
                                    Is the lifetime deal really forever?
                                </h4>
                                <p className="text-gray-300 text-sm">
                                    Yes! The $5 lifetime deal gives you permanent access to automation features. This is a limited-time offer for early adopters.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default PricingSection; 