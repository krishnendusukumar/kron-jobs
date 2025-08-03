"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Users, Settings, BarChart3, Plus, RefreshCw, Eye, CheckCircle, XCircle, Clock, Filter, ChevronDown, ChevronUp, User, LogOut, CreditCard, Calendar, Target, Zap, Shield, Globe, Star, TrendingUp, Building2, MapPin, Mail, Phone, ExternalLink, Trash2, Edit3, Save, X, AlertCircle, Check, ArrowRight, Download, Upload, Database, Server, Network, Wifi, WifiOff, Activity, BarChart, PieChart, LineChart, AreaChart, ListChecks, Brain, Linkedin, FileText, Code } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import GradientButton from '@/components/shared/GradientButton';
import AnimatedBlob from '@/components/shared/AnimatedBlob';
import ProxyTest from '@/components/ProxyTest/page';
import { toast, Toaster } from 'react-hot-toast';
import { UserProfileService, UserProfile } from '../../lib/user-profile-service';
import { ProfileService, Resume } from '../../lib/profile-service';
import PricingSection from '../../components/PricingSection/page';
import CronManager from '../../components/CronManager/page';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import ResumeDisplay from '../../components/ResumeDisplay';
import { ParsedResume } from '../../lib/resume-parser';

type SidebarItem = {
    key: string;
    label: string;
    icon: any;
    adminOnly?: boolean;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
    { key: 'job-search', label: 'Job Search', icon: Search },
    { key: 'tasks', label: 'Tasks', icon: ListChecks },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'resume-upload', label: 'Resume Upload', icon: FileText },
    { key: 'pricing', label: 'Pricing', icon: CreditCard },
];

const PAGE_SIZE = 10;

// Floating Particles Component
const FloatingParticles = () => {
    const [particles, setParticles] = useState<{ id: number; left: string; top: string; delay: number; duration: number }[]>([]);

    useEffect(() => {
        // Only generate particles on the client side
        const particlesData = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: Math.random() * 8,
            duration: Math.random() * 20 + 15,
        }));
        setParticles(particlesData);
    }, []);

    // Don't render anything on server side
    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className={`absolute rounded-full ${particle.id % 4 === 0 ? 'w-2 h-2 bg-cyan-400/50' :
                        particle.id % 4 === 1 ? 'w-1.5 h-1.5 bg-emerald-400/40' :
                            particle.id % 4 === 2 ? 'w-1 h-1 bg-violet-400/30' :
                                'w-0.5 h-0.5 bg-amber-400/20'
                        }`}
                    animate={{
                        x: [0, Math.random() * 200 - 100, 0],
                        y: [0, Math.random() * -200, 0],
                        opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                    }}
                    style={{
                        left: particle.left,
                        top: particle.top,
                    }}
                />
            ))}
        </div>
    );
};

function Sidebar({ selected, onSelect, isMobileOpen, setIsMobileOpen }: {
    selected: string,
    onSelect: (key: string) => void,
    isMobileOpen: boolean,
    setIsMobileOpen: (open: boolean) => void
}) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex sticky top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-[#0a182e] to-[#1a2a3d] backdrop-blur-md border-r border-cyan-400/30 flex-col py-8 px-4 z-20">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        KronJobs
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">AI-Powered Job Search</p>
                </div>
                <nav className="flex flex-col gap-2">
                    {SIDEBAR_ITEMS.filter(item => !item.adminOnly).map((item, index) => (
                        <motion.button
                            key={item.key}
                            onClick={() => onSelect(item.key)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-left ${selected === item.key
                                ? 'bg-[#0a182e] text-white shadow-lg border border-cyan-400/30'
                                : 'hover:bg-white/10 text-cyan-100 hover:text-cyan-200'
                                }`}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <item.icon className={`w-5 h-5 ${selected === item.key ? 'text-cyan-300' : 'text-cyan-200/70'}`} />
                            {item.label}
                        </motion.button>
                    ))}
                </nav>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        className="md:hidden fixed inset-0 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
                        <motion.aside
                            className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-[#0a182e] to-[#1a2a3d] backdrop-blur-md border-r border-cyan-400/30 flex flex-col py-8 px-4"
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-white">
                                    KronJobs Admin
                                </h2>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/10"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-2">
                                {SIDEBAR_ITEMS.map((item, index) => (
                                    <motion.button
                                        key={item.key}
                                        onClick={() => {
                                            onSelect(item.key);
                                            setIsMobileOpen(false);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-left ${selected === item.key
                                            ? 'bg-[#0a182e] text-white shadow-lg border border-cyan-400/30'
                                            : 'hover:bg-white/10 text-cyan-100 hover:text-cyan-200'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <item.icon className={`w-5 h-5 ${selected === item.key ? 'text-cyan-300' : 'text-cyan-200/70'}`} />
                                        {item.label}
                                    </motion.button>
                                ))}
                            </nav>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Job Search Section Component
function JobSearchSection({ userProfile, setUserProfile }: { userProfile: UserProfile | null, setUserProfile: (profile: UserProfile | null) => void }) {
    const [formData, setFormData] = useState({
        jobTitle: '',
        location: '',
        keywords: '',
        experience: 'entry',
        jobType: 'full-time'
    });
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchHistory, setSearchHistory] = useState<any[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission
        if (isSearching) {
            console.log('🔄 Search already in progress, ignoring duplicate request');
            return;
        }

        console.log('🔍 Job search form submitted:', formData);

        if (!userProfile) {
            console.log('❌ No user profile available');
            toast.error('Please wait while we load your profile...');
            return;
        }

        console.log('🔍 User profile:', userProfile);

        // Check remaining credits directly from user profile
        if (userProfile.credits_remaining <= 0) {
            console.log('❌ No credits remaining');
            toast.error('❌ No credits remaining! Please upgrade your plan or wait for daily reset tomorrow.');
            return;
        }

        console.log(`✅ Credits available: ${userProfile.credits_remaining}`);

        setIsSearching(true);

        try {
            // First, save or update job preferences
            console.log('💾 Saving job preferences...');
            const preferencesResponse = await fetch('/api/submit-preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userProfile.email,
                    jobTitle: formData.jobTitle,
                    keywords: formData.keywords,
                    location: formData.location,
                    experience: formData.experience,
                    notifyMethod: 'Mail'
                }),
            });

            const preferencesResult = await preferencesResponse.json();
            if (!preferencesResult.success) {
                throw new Error(preferencesResult.error || 'Failed to save preferences');
            }

            console.log('✅ Job preferences saved');

            // Use the load-more-jobs API to scrape jobs (starts from 5)
            console.log('🚀 Starting job scraping via load-more-jobs...');
            const scrapingResponse = await fetch('/api/load-more-jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userProfile.user_id,
                    keywords: `${formData.jobTitle} ${formData.keywords}`.trim(),
                    location: formData.location,
                    start: 5, // Start from 5 as per the API design
                    f_WT: '2', // Remote work preference
                    timespan: 'r86400' // Last 24 hours
                }),
            });

            console.log('🔍 Scraping API response status:', scrapingResponse.status);
            const scrapingResult = await scrapingResponse.json();
            console.log('🔍 Scraping API response:', scrapingResult);

            if (!scrapingResult.success) {
                console.error('❌ Scraping failed:', scrapingResult.error, scrapingResult.message);
                toast.error(scrapingResult.message || '❌ Job search failed. Please try again.');
                return;
            }

            // Log credit consumption for debugging
            console.log('💰 Credit consumption check - Before reloading user profile');
            console.log('💰 Current userProfile credits:', userProfile?.credits_remaining);

            if (scrapingResult.success) {
                // Credit consumption is now handled in the backend API
                console.log('✅ Job search completed successfully');

                // Reload user profile to get updated credit count
                const updatedProfile = await UserProfileService.getUserProfile(userProfile.user_id);
                if (updatedProfile) {
                    // Update the userProfile state to reflect new credit count
                    // This will trigger a re-render of the credits display
                    setUserProfile(updatedProfile);
                }

                // Wait a moment for jobs to be saved to database
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Fetch actual job count from database
                try {
                    const jobsResponse = await fetch(`/api/jobs?userId=${encodeURIComponent(userProfile.user_id)}&limit=1&sortBy=created_at&sortOrder=desc`);
                    const jobsData = await jobsResponse.json();

                    if (jobsData.success) {
                        const actualJobsCount = jobsData.pagination?.total || 0;
                        const recentJobsCount = jobsData.jobs?.length || 0;

                        toast.success(`✅ Job search completed! Found ${recentJobsCount} recent jobs (${actualJobsCount} total in database). Credit deducted.`);

                        // Add to search history with actual counts
                        const newSearch = {
                            id: Date.now(),
                            ...formData,
                            status: 'completed',
                            timestamp: new Date().toISOString(),
                            jobsFound: recentJobsCount,
                            newJobsCount: recentJobsCount,
                            totalJobs: actualJobsCount
                        };
                        setSearchHistory(prev => [newSearch, ...prev]);

                        // Trigger a refresh of the tasks section
                        window.dispatchEvent(new CustomEvent('refreshTasks'));
                    } else {
                        toast.success(`✅ Job search completed! Jobs are being processed. Credit deducted.`);
                    }
                } catch (fetchError) {
                    console.log('Could not fetch job count, but search completed successfully');
                    toast.success(`✅ Job search completed! Jobs are being processed. Credit deducted.`);
                }

                // Clear form
                setFormData({
                    jobTitle: '',
                    location: '',
                    keywords: '',
                    experience: 'entry',
                    jobType: 'full-time'
                });
            } else {
                toast.error(scrapingResult.error || 'Failed to start job search');
            }
        } catch (error) {
            console.error('❌ Search error:', error);
            toast.error('Failed to start job search. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                    Job Search
                </h1>
                <p className="text-gray-400 text-lg">
                    Find your next opportunity with AI-powered job matching
                </p>

                {/* Credits Display */}
                {userProfile && (
                    <div className="mt-4 p-4 bg-[#0a182e] rounded-2xl border border-cyan-400/20">
                        <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                                <p className="text-cyan-200 text-sm">Credits Remaining</p>
                                <p className="text-2xl font-bold text-cyan-400">{userProfile.credits_remaining}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-purple-200 text-sm">Plan</p>
                                <p className="text-lg font-semibold text-purple-400 capitalize">{userProfile.plan}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Job Title */}
                            <div>
                                <label className="block text-cyan-200 text-sm font-medium mb-2">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Software Engineer, Marketing Manager"
                                    className="w-full bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded-xl px-4 py-3"
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-cyan-200 text-sm font-medium mb-2">
                                    Location *
                                </label>
                                <LocationAutocomplete
                                    value={formData.location}
                                    onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                                    placeholder="e.g., New York, NY or Remote"
                                    required
                                />
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-cyan-200 text-sm font-medium mb-2">
                                    Keywords (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleInputChange}
                                    placeholder="e.g., React, Python, AWS, Agile"
                                    className="w-full bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded-xl px-4 py-3"
                                />
                            </div>

                            {/* Experience Level */}
                            <div>
                                <label className="block text-cyan-200 text-sm font-medium mb-2">
                                    Experience Level
                                </label>
                                <select
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/30 border border-cyan-400/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded-xl px-4 py-3"
                                >
                                    <option value="entry">Entry Level</option>
                                    <option value="mid">Mid Level</option>
                                    <option value="senior">Senior Level</option>
                                    <option value="executive">Executive</option>
                                </select>
                            </div>

                            {/* Job Type */}
                            <div>
                                <label className="block text-cyan-200 text-sm font-medium mb-2">
                                    Job Type
                                </label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/30 border border-cyan-400/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded-xl px-4 py-3"
                                >
                                    <option value="full-time">Full Time</option>
                                    <option value="part-time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="text-center pt-4">
                            <button
                                type="submit"
                                disabled={isSearching || !userProfile || userProfile.credits_remaining <= 0}
                                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 inline-flex items-center space-x-3 ${isSearching || !userProfile || userProfile.credits_remaining <= 0
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#0a182e] text-white shadow-xl hover:bg-[#162a4d]'
                                    }`}
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-6 h-6" />
                                        <span>Start Job Search</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-6">Recent Searches</h3>
                    <div className="space-y-4">
                        {searchHistory.map((search) => (
                            <div
                                key={search.id}
                                className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-semibold text-white">
                                            {search.jobTitle} in {search.location}
                                        </h4>
                                        <p className="text-gray-400 text-sm">
                                            {search.experience} • {search.jobType}
                                            {search.keywords && ` • Keywords: ${search.keywords}`}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            {new Date(search.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                                            {search.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function AutomationSection({ userProfile }: { userProfile: UserProfile | null }) {
    if (!userProfile) {
        return (
            <motion.div
                key="automation"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
            >
                <motion.h2
                    className="text-4xl font-bold mb-6 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Automation
                </motion.h2>
                <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-cyan-400/20 p-8 min-h-[400px] shadow-2xl">
                    <div className="text-center text-gray-400 py-12">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                        <p className="text-lg">Loading user profile...</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            key="automation"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
        >
            <motion.h2
                className="text-4xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Automation
            </motion.h2>
            <CronManager userProfile={userProfile} />
        </motion.div>
    );
}

function TopBar({ selectedUser, onRefresh, onLogout }: { selectedUser: any, onRefresh: () => void, onLogout: () => void }) {
    return (
        <div className="sticky top-0 z-30 w-full bg-black/30 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-6 py-4 mb-4 shadow-lg">
            <div className="flex items-center gap-4">
                <span className="text-cyan-300 font-mono text-lg">
                    {selectedUser ? selectedUser.email : 'No user selected'}
                </span>
            </div>
            <div className="flex gap-2">
                <GradientButton size="sm" variant="outline" onClick={onRefresh}>Refresh</GradientButton>
                <GradientButton size="sm" variant="primary" onClick={onLogout}>Logout</GradientButton>
            </div>
        </div>
    );
}

function UsersSection({ onSelectUser, selectedUser }: { onSelectUser: (user: any) => void, selectedUser: any }) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/users?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`);
            const data = await res.json();
            console.log('Users API response:', data);
            if (data.success) {
                setUsers(data.users);
                setTotalPages(data.pagination.totalPages || 1);
            } else {
                throw new Error(data.error || 'Failed to fetch users');
            }
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); /* eslint-disable-next-line */ }, [page, search]);

    return (
        <motion.div
            key="users"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
        >
            <motion.h2
                className="text-4xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Users
            </motion.h2>
            <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-cyan-400/20 p-8 min-h-[400px] shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="flex-1 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search by email, job title, or location..."
                            className="w-full px-4 py-2 rounded-xl bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                        <GradientButton onClick={fetchUsers} icon={Search} size="sm">Search</GradientButton>
                    </div>
                    <GradientButton onClick={fetchUsers} icon={RefreshCw} size="sm" variant="outline">Refresh</GradientButton>
                </div>
                {loading ? (
                    <div className="text-center text-gray-400 py-12">Loading users...</div>
                ) : error ? (
                    <div className="text-center text-red-400 py-12">{error}</div>
                ) : users.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">No users found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 text-cyan-300 font-semibold">Email</th>
                                    <th className="py-2 px-4 text-cyan-300 font-semibold">Job Title</th>
                                    <th className="py-2 px-4 text-cyan-300 font-semibold">Location</th>
                                    <th className="py-2 px-4 text-cyan-300 font-semibold">Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user: any) => (
                                    <tr key={user.email} className={selectedUser?.email === user.email ? 'bg-cyan-400/10' : ''}>
                                        <td className="py-2 px-4 font-mono text-white">{user.email}</td>
                                        <td className="py-2 px-4 text-white">{user.job_title}</td>
                                        <td className="py-2 px-4 text-white">{user.location}</td>
                                        <td className="py-2 px-4">
                                            <GradientButton
                                                size="sm"
                                                variant={selectedUser?.email === user.email ? 'primary' : 'outline'}
                                                onClick={() => onSelectUser(user)}
                                            >
                                                {selectedUser?.email === user.email ? 'Selected' : 'Select'}
                                            </GradientButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                <div className="flex justify-center mt-6 gap-2">
                    <GradientButton size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</GradientButton>
                    <span className="px-4 py-2 text-cyan-200">Page {page} of {totalPages}</span>
                    <GradientButton size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</GradientButton>
                </div>
            </div>
        </motion.div>
    );
}

// Create User Section Component
function CreateUserSection({ onUserCreated }: { onUserCreated: () => void }) {
    const [form, setForm] = useState({
        jobTitle: '',
        location: '',
        proxy: '',
        email: '',
        experience: '',
        remote: false,
        fresher: false,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setForm(prev => ({
                ...prev,
                [name]: checked,
                // If remote is checked, clear location
                ...(name === 'remote' && checked ? { location: 'Remote' } : {}),
                ...(name === 'remote' && !checked ? { location: '' } : {}),
                // If fresher is checked, clear experience
                ...(name === 'fresher' && checked ? { experience: '' } : {}),
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                jobTitle: form.jobTitle,
                location: form.remote ? 'Remote' : form.location,
                email: form.email,
                proxy: form.proxy,
                experience: form.fresher ? 0 : form.experience,
                keywords: form.remote ? 'remote' : '',
                notifyMethod: 'Mail',
                minSalary: '',
            };
            const res = await fetch('/api/submit-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to create user');
            toast.success('User created successfully!');
            setForm({ jobTitle: '', location: '', proxy: '', email: '', experience: '', remote: false, fresher: false });
            onUserCreated();
        } catch (err: any) {
            toast.error(err.message || 'Error creating user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            key="create"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
        >
            <motion.h2
                className="text-4xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Create User
            </motion.h2>
            <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-cyan-400/20 p-8 min-h-[400px] shadow-2xl max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1">Job Title</label>
                            <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" placeholder="e.g. Frontend Developer" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1">Location</label>
                            <LocationAutocomplete
                                value={form.location}
                                onChange={(value) => setForm(prev => ({ ...prev, location: value }))}
                                placeholder="e.g. Berlin"
                                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-60"
                                required={!form.remote}
                            />
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <input type="checkbox" name="remote" checked={form.remote} onChange={handleChange} id="remote-checkbox" className="accent-cyan-500 w-4 h-4" />
                            <label htmlFor="remote-checkbox" className="text-cyan-200 text-sm">Remote</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1">Email</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" placeholder="user@email.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1">Proxy (optional)</label>
                            <input name="proxy" value={form.proxy} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" placeholder="proxy.example.com:8080" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1">Experience</label>
                            <input name="experience" value={form.experience} onChange={handleChange} required={!form.fresher} disabled={form.fresher} className="w-full px-4 py-3 rounded-xl bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-60" placeholder="e.g. 2" />
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <input type="checkbox" name="fresher" checked={form.fresher} onChange={handleChange} id="fresher-checkbox" className="accent-cyan-500 w-4 h-4" />
                            <label htmlFor="fresher-checkbox" className="text-cyan-200 text-sm">Fresher</label>
                        </div>
                    </div>
                    <GradientButton type="submit" size="lg" icon={Plus} disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                    </GradientButton>
                </form>
            </div>
        </motion.div>
    );
}

// Tasks Section Component
function TasksSection({ selectedUser, userProfile }: { selectedUser: any, userProfile?: any }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMoreJobs, setHasMoreJobs] = useState(true);
    const [currentStart, setCurrentStart] = useState(5); // Start with 5 as requested
    const [hidingJobs, setHidingJobs] = useState<Set<number>>(new Set()); // Track jobs being hidden

    const fetchJobs = async () => {
        const userEmail = userProfile?.email || selectedUser?.email;
        if (!userEmail) {
            setError('Please select a user first');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                userId: userProfile?.user_id || selectedUser?.user_id || userEmail,
                page: page.toString(),
                limit: '12'
            });
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            console.log('🔄 Fetching jobs with params:', params.toString());
            const res = await fetch(`/api/jobs?${params}`);
            const data = await res.json();
            console.log('📄 Jobs API response:', data);

            if (data.success) {
                console.log(`✅ Fetched ${data.jobs.length} jobs for user ${userEmail}`);
                console.log('📋 Sample jobs:', data.jobs.slice(0, 3).map((job: any) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    created_at: job.created_at
                })));

                setJobs(data.jobs);
                setTotalPages(data.pagination.totalPages || 1);
                setHasMoreJobs(true);
            } else {
                throw new Error(data.error || 'Failed to fetch jobs');
            }
        } catch (err: any) {
            console.error('❌ Error fetching jobs:', err);
            setError(err.message || 'Error fetching jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userProfile?.email || selectedUser?.email) {
            // Reset currentStart when user changes or component mounts
            setCurrentStart(5); // Start with 5 as requested
            setHasMoreJobs(true);
            fetchJobs();
        } else {
            setJobs([]);
            // Reset load more state when no user is selected
            setCurrentStart(5); // Start with 5 as requested
            setHasMoreJobs(true);
        }
    }, [userProfile?.email, selectedUser?.email, page, statusFilter]);

    // Listen for refresh events from job search
    useEffect(() => {
        const handleRefresh = () => {
            console.log('🔄 Refreshing jobs due to job search completion');
            fetchJobs();
        };
        window.addEventListener('refreshTasks', handleRefresh);

        return () => {
            window.removeEventListener('refreshTasks', handleRefresh);
        };
    }, []);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-500/20 text-yellow-300', icon: Clock },
            processing: { color: 'bg-blue-500/20 text-blue-300', icon: Loader2 },
            completed: { color: 'bg-green-500/20 text-green-300', icon: CheckCircle },
            failed: { color: 'bg-red-500/20 text-red-300', icon: XCircle }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
                {status}
            </span>
        );
    };

    const loadMoreJobs = async () => {
        const userEmail = userProfile?.email || selectedUser?.email;
        if (!userEmail || loadingMore) return;

        // Check if user can perform job search
        if (userProfile) {
            const canPerform = await UserProfileService.canPerformAction(userProfile.user_id, 'job_search');
            if (!canPerform) {
                const limits = await UserProfileService.getUserLimits(userProfile.user_id);
                if (limits) {
                    if (limits.credits_remaining <= 0) {
                        toast.error('❌ No credits remaining! Please upgrade your plan or wait for daily reset tomorrow.');
                    } else if (limits.daily_searches_used >= limits.daily_searches_limit) {
                        toast.error(`❌ Daily search limit reached! You've used ${limits.daily_searches_used}/${limits.daily_searches_limit} searches today. Come back tomorrow!`);
                    } else {
                        toast.error('❌ Cannot perform job search at this time. Please try again later.');
                    }
                } else {
                    toast.error('❌ Cannot perform job search. Please check your account status.');
                }
                return;
            }
        }

        setLoadingMore(true);
        try {
            const payload = {
                userId: userProfile?.user_id || selectedUser?.user_id || userEmail,
                keywords: userProfile?.job_title || 'developer',
                location: userProfile?.location || 'Remote',
                start: currentStart,
                f_WT: userProfile?.location?.toLowerCase().includes('remote') ? '2' : '',
                timespan: 'r86400'
            };

            console.log('🔄 Loading more jobs with payload:', payload);

            const res = await fetch('/api/load-more-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log('📄 Load more jobs response:', data);

            if (data.success) {
                // Update pagination state
                setCurrentStart(data.pagination.nextStart);
                setHasMoreJobs(data.pagination.hasMore);

                // If job was queued, wait for it to complete
                if (data.jobId && data.status === 'pending') {
                    console.log('⏳ Job queued, waiting for completion...');
                    toast.success('Job scraping in progress... Please wait.');

                    // Poll for job completion
                    let attempts = 0;
                    const maxAttempts = 30; // 30 seconds max

                    while (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                        attempts++;

                        try {
                            // Check job status
                            const statusRes = await fetch(`/api/scraping-status?jobId=${data.jobId}&userId=${userProfile?.user_id || selectedUser?.user_id || userEmail}`);
                            const statusData = await statusRes.json();

                            console.log(`📊 Job status check ${attempts}:`, statusData);

                            if (statusData.status === 'completed') {
                                console.log('✅ Job completed, refreshing jobs...');
                                await fetchJobs();
                                toast.success(`Successfully loaded new jobs! (${data.pagination.loadCount}/${data.pagination.maxLoads})`);
                                return;
                            } else if (statusData.status === 'failed') {
                                throw new Error(statusData.error || 'Job processing failed');
                            }
                        } catch (statusError) {
                            console.log('⚠️ Status check failed, continuing...');
                        }
                    }

                    // If we reach here, job took too long
                    console.log('⏰ Job taking too long, refreshing anyway...');
                    await fetchJobs();
                    toast.success(`Jobs should be available now (${data.pagination.loadCount}/${data.pagination.maxLoads})`);
                } else {
                    // Direct scraping completed, refresh immediately
                    console.log('🔄 Direct scraping completed, refreshing jobs...');
                    await fetchJobs();

                    if (data.pagination.newJobsCount > 0) {
                        toast.success(`Loaded ${data.pagination.newJobsCount} new jobs! (${data.pagination.loadCount}/${data.pagination.maxLoads})`);
                    } else {
                        toast.success(`No new jobs found in this range (${data.pagination.loadCount}/${data.pagination.maxLoads})`);
                    }
                }
            } else {
                throw new Error(data.error || 'Failed to load more jobs');
            }
        } catch (err: any) {
            console.error('❌ Error loading more jobs:', err);
            toast.error(err.message || 'Error loading more jobs');
        } finally {
            setLoadingMore(false);
        }
    };

    const updateJobStatus = async (jobId: number, action: string) => {
        try {
            const userId = userProfile?.user_id || selectedUser?.user_id;
            if (!userId) {
                toast.error('User ID not found');
                return;
            }

            // If hiding a job, add it to the hiding set for animation
            if (action === 'hidden') {
                setHidingJobs(prev => new Set(prev).add(jobId));
            }

            const res = await fetch(`/api/jobs?jobId=${jobId}&userId=${userId}&action=${action}`, {
                method: 'PUT'
            });
            const data = await res.json();
            console.log('Update job response:', data);
            if (data.success) {
                toast.success(`Job marked as ${action}`);

                // Update local state instead of reloading all jobs
                setJobs(prevJobs => {
                    return prevJobs.map(job => {
                        if (job.id === jobId) {
                            // Reset all status flags first
                            const updatedJob = {
                                ...job,
                                applied: 0,
                                hidden: 0,
                                interview: 0,
                                rejected: 0
                            };
                            // Set the new status
                            updatedJob[action] = 1;
                            return updatedJob;
                        }
                        return job;
                    }).filter(job => {
                        // Remove hidden jobs from the UI immediately
                        if (action === 'hidden' && job.id === jobId) {
                            return false; // Remove this job from the list
                        }
                        return true;
                    });
                });

                // Remove from hiding set after animation
                if (action === 'hidden') {
                    setTimeout(() => {
                        setHidingJobs(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(jobId);
                            return newSet;
                        });
                    }, 300); // Match animation duration
                }
            } else {
                throw new Error(data.error || 'Failed to update job');
            }
        } catch (err: any) {
            console.error('Error updating job:', err);
            toast.error(err.message || 'Error updating job');
            // Remove from hiding set on error
            if (action === 'hidden') {
                setHidingJobs(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(jobId);
                    return newSet;
                });
            }
        }
    };

    return (
        <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
        >
            <motion.h2
                className="text-4xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Tasks
            </motion.h2>
            <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-cyan-400/20 p-8 min-h-[400px] shadow-2xl">
                {!userProfile?.email && !selectedUser?.email ? (
                    <div className="text-center text-gray-400 py-12">
                        <ListChecks className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                        <p className="text-lg">Please sign in to view your jobs</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-cyan-200 mb-1">My Jobs</h3>
                                <p className="text-sm text-gray-400">
                                    {userProfile?.job_title || 'Developer'} • {userProfile?.location || 'Remote'}
                                    {/* {jobs.length > 0 && (
                                        <span className="ml-2 text-cyan-300">
                                            • {jobs.length} jobs loaded
                                            {hasMoreJobs && (
                                                <span className="text-gray-400"> • Load {Math.floor((currentStart - 5) / 5) + 1}/10 (start: {currentStart})</span>
                                            )}
                                        </span>
                                    )} */}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="px-4 py-2 rounded-xl bg-black/30 border border-cyan-400/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                >
                                    <option value="all">All Jobs (Excluding Hidden)</option>
                                    <option value="applied">Applied</option>
                                    <option value="hidden">Hidden Jobs</option>
                                    <option value="interview">Interview</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <GradientButton onClick={fetchJobs} icon={RefreshCw} size="sm" variant="outline" disabled={loading}>
                                    Refresh
                                </GradientButton>
                                <GradientButton
                                    onClick={loadMoreJobs}
                                    icon={loadingMore ? RefreshCw : Plus}
                                    size="sm"
                                    variant={hasMoreJobs ? "primary" : "outline"}
                                    disabled={loadingMore || !hasMoreJobs}
                                >
                                    {loadingMore ? 'Loading...' : hasMoreJobs ? `Load More Jobs` : 'All Loads Complete'}
                                </GradientButton>
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-center text-gray-400 py-12">Loading jobs...</div>
                        ) : error ? (
                            <div className="text-center text-red-400 py-12">{error}</div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                <ListChecks className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                                <p className="text-lg">No jobs found for this user</p>
                                <p className="text-sm mt-2">Start a task to scrape jobs</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {jobs
                                        .filter((job: any) => job.hidden !== 1) // Filter out hidden jobs
                                        .map((job: any, index: number) => (
                                            <motion.div
                                                key={job.id}
                                                className="bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{
                                                    opacity: hidingJobs.has(job.id) ? 0 : 1,
                                                    y: hidingJobs.has(job.id) ? -20 : 0,
                                                    scale: hidingJobs.has(job.id) ? 0.95 : 1
                                                }}
                                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                                transition={{
                                                    duration: hidingJobs.has(job.id) ? 0.3 : 0.3,
                                                    delay: hidingJobs.has(job.id) ? 0 : index * 0.1
                                                }}
                                            >
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-cyan-300 font-medium">{job.company}</p>
                                                        <p className="text-gray-400 text-sm">{job.location}</p>
                                                        <p className="text-gray-500 text-xs">{job.date}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <a
                                                            href={job.job_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-[#0a182e] text-white px-3 py-1 rounded-full hover:bg-[#162a4d] transition-all"
                                                        >
                                                            View Job
                                                        </a>
                                                        <div className="flex gap-1 flex-wrap">
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'applied')}
                                                                className={`text-xs px-2 py-1 rounded ${job.applied === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-300'}`}
                                                            >
                                                                Applied
                                                            </button>
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'hidden')}
                                                                disabled={job.applied === 1} // Disable if already applied
                                                                title={job.applied === 1 ? "Cannot hide applied jobs" : "Hide this job"}
                                                                className={`text-xs px-2 py-1 rounded ${job.hidden === 1
                                                                    ? 'bg-yellow-500/20 text-yellow-300'
                                                                    : job.applied === 1
                                                                        ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                                                                        : 'bg-gray-500/20 text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-300'
                                                                    }`}
                                                            >
                                                                Hide
                                                            </button>
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'interview')}
                                                                className={`text-xs px-2 py-1 rounded ${job.interview === 1 ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300 hover:bg-purple-500/20 hover:text-purple-300'}`}
                                                            >
                                                                Interview
                                                            </button>
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'rejected')}
                                                                className={`text-xs px-2 py-1 rounded ${job.rejected === 1 ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300 hover:bg-red-500/20 hover:text-red-300'}`}
                                                            >
                                                                Rejected
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>

                                {/* Load More Jobs Section */}
                                {jobs.length > 0 && (
                                    <div className="mt-6 p-4 bg-[#0a182e] border border-cyan-400/20 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-lg font-semibold text-cyan-200 mb-1">Load More Jobs</h4>
                                                {/* <p className="text-sm text-gray-400">
                                                    {hasMoreJobs
                                                        ? `Currently loaded ${jobs.length} jobs. Load ${Math.floor((currentStart - 5) / 5) + 1}/10 - Next request will start from position ${currentStart}.`
                                                        : `All 10 loads completed (${jobs.length} total jobs).`
                                                    }
                                                </p> */}
                                            </div>
                                            <GradientButton
                                                onClick={loadMoreJobs}
                                                icon={loadingMore ? RefreshCw : Plus}
                                                size="md"
                                                variant={hasMoreJobs ? "primary" : "outline"}
                                                disabled={loadingMore || !hasMoreJobs}
                                            >
                                                {loadingMore ? 'Loading...' : hasMoreJobs ? `Load More Jobs` : 'All Loads Complete'}
                                            </GradientButton>
                                        </div>
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-6">
                                        <GradientButton size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</GradientButton>
                                        <span className="px-4 py-2 text-cyan-200">Page {page} of {totalPages}</span>
                                        <GradientButton size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</GradientButton>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}

// Scraped Jobs Section Component
function ScrapedJobsSection({ selectedUser }: { selectedUser: any }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMoreJobs, setHasMoreJobs] = useState(true);
    const [currentStart, setCurrentStart] = useState(5); // Start with 5 as requested
    const [hidingJobs, setHidingJobs] = useState<Set<number>>(new Set()); // Track jobs being hidden

    const fetchJobs = async () => {
        if (!selectedUser?.email) {
            setError('Please select a user first');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                userId: selectedUser.user_id || selectedUser.email,
                page: page.toString(),
                limit: '12'
            });
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            console.log('🔄 Fetching jobs with params:', params.toString());
            const res = await fetch(`/api/jobs?${params}`);
            const data = await res.json();
            console.log('📄 Jobs API response:', data);

            if (data.success) {
                console.log(`✅ Fetched ${data.jobs.length} jobs for user ${selectedUser.email}`);
                console.log('📋 Sample jobs:', data.jobs.slice(0, 3).map((job: any) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    created_at: job.created_at
                })));

                setJobs(data.jobs);
                setTotalPages(data.pagination.totalPages || 1);
                // Don't reset currentStart when fetching existing jobs
                // Only reset when user changes or component mounts
                setHasMoreJobs(true);
            } else {
                throw new Error(data.error || 'Failed to fetch jobs');
            }
        } catch (err: any) {
            console.error('❌ Error fetching jobs:', err);
            setError(err.message || 'Error fetching jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedUser?.email) {
            // Reset currentStart when user changes or component mounts
            setCurrentStart(5); // Start with 5 as requested
            setHasMoreJobs(true);
            fetchJobs();
        } else {
            setJobs([]);
            // Reset load more state when no user is selected
            setCurrentStart(5); // Start with 5 as requested
            setHasMoreJobs(true);
        }
    }, [selectedUser?.email, page, statusFilter]);

    const loadMoreJobs = async () => {
        if (!selectedUser?.email || loadingMore) return;

        setLoadingMore(true);
        try {
            const payload = {
                userId: selectedUser.user_id || selectedUser.email,
                keywords: selectedUser.job_title || 'developer',
                location: selectedUser.location || 'Remote',
                start: currentStart,
                f_WT: selectedUser.location?.toLowerCase().includes('remote') ? '2' : '',
                timespan: 'r86400'
            };

            console.log('🔄 Loading more jobs with payload:', payload);

            const res = await fetch('/api/load-more-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log('📄 Load more jobs response:', data);

            if (data.success) {
                // Update pagination state
                setCurrentStart(data.pagination.nextStart);
                setHasMoreJobs(data.pagination.hasMore);

                // If job was queued, wait for it to complete
                if (data.jobId && data.status === 'pending') {
                    console.log('⏳ Job queued, waiting for completion...');
                    toast.success('Job scraping in progress... Please wait.');

                    // Poll for job completion
                    let attempts = 0;
                    const maxAttempts = 30; // 30 seconds max

                    while (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                        attempts++;

                        try {
                            // Check job status
                            const statusRes = await fetch(`/api/scraping-status?jobId=${data.jobId}&userId=${selectedUser.user_id || selectedUser.email}`);
                            const statusData = await statusRes.json();

                            console.log(`📊 Job status check ${attempts}:`, statusData);

                            if (statusData.status === 'completed') {
                                console.log('✅ Job completed, refreshing jobs...');
                                await fetchJobs();
                                toast.success(`Successfully loaded new jobs! (${data.pagination.loadCount}/${data.pagination.maxLoads})`);
                                return;
                            } else if (statusData.status === 'failed') {
                                throw new Error(statusData.error || 'Job processing failed');
                            }
                        } catch (statusError) {
                            console.log('⚠️ Status check failed, continuing...');
                        }
                    }

                    // If we reach here, job took too long
                    console.log('⏰ Job taking too long, refreshing anyway...');
                    await fetchJobs();
                    toast.success(`Jobs should be available now (${data.pagination.loadCount}/${data.pagination.maxLoads})`);
                } else {
                    // Direct scraping completed, refresh immediately
                    console.log('🔄 Direct scraping completed, refreshing jobs...');
                    await fetchJobs();

                    if (data.pagination.newJobsCount > 0) {
                        toast.success(`Loaded ${data.pagination.newJobsCount} new jobs! (${data.pagination.loadCount}/${data.pagination.maxLoads})`);
                    } else {
                        toast.success(`No new jobs found in this range (${data.pagination.loadCount}/${data.pagination.maxLoads})`);
                    }
                }
            } else {
                throw new Error(data.error || 'Failed to load more jobs');
            }
        } catch (err: any) {
            console.error('❌ Error loading more jobs:', err);
            toast.error(err.message || 'Error loading more jobs');
        } finally {
            setLoadingMore(false);
        }
    };

    const updateJobStatus = async (jobId: number, action: string) => {
        try {
            const userId = selectedUser?.user_id;
            if (!userId) {
                toast.error('User ID not found');
                return;
            }

            // If hiding a job, add it to the hiding set for animation
            if (action === 'hidden') {
                setHidingJobs(prev => new Set(prev).add(jobId));
            }

            const res = await fetch(`/api/jobs?jobId=${jobId}&userId=${userId}&action=${action}`, {
                method: 'PUT'
            });
            const data = await res.json();
            console.log('Update job response:', data);
            if (data.success) {
                toast.success(`Job marked as ${action}`);

                // Update local state instead of reloading all jobs
                setJobs(prevJobs => {
                    return prevJobs.map(job => {
                        if (job.id === jobId) {
                            // Reset all status flags first
                            const updatedJob = {
                                ...job,
                                applied: 0,
                                hidden: 0,
                                interview: 0,
                                rejected: 0
                            };
                            // Set the new status
                            updatedJob[action] = 1;
                            return updatedJob;
                        }
                        return job;
                    }).filter(job => {
                        // Remove hidden jobs from the UI immediately
                        if (action === 'hidden' && job.id === jobId) {
                            return false; // Remove this job from the list
                        }
                        return true;
                    });
                });

                // Remove from hiding set after animation
                if (action === 'hidden') {
                    setTimeout(() => {
                        setHidingJobs(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(jobId);
                            return newSet;
                        });
                    }, 300); // Match animation duration
                }
            } else {
                throw new Error(data.error || 'Failed to update job');
            }
        } catch (err: any) {
            console.error('Error updating job:', err);
            toast.error(err.message || 'Error updating job');
            // Remove from hiding set on error
            if (action === 'hidden') {
                setHidingJobs(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(jobId);
                    return newSet;
                });
            }
        }
    };

    return (
        <motion.div
            key="jobs"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
        >
            <motion.h2
                className="text-4xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Scraped Jobs
            </motion.h2>
            <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-cyan-400/20 p-8 min-h-[400px] shadow-2xl">
                {!selectedUser ? (
                    <div className="text-center text-gray-400 py-12">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                        <p className="text-lg">Please select a user to view their scraped jobs</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-cyan-200 mb-1">Jobs for {selectedUser.email}</h3>
                                <p className="text-sm text-gray-400">
                                    {selectedUser.job_title} • {selectedUser.location}
                                    {jobs.length > 0 && (
                                        <span className="ml-2 text-cyan-300">
                                            • {jobs.length} jobs loaded
                                            {hasMoreJobs && (
                                                <span className="text-gray-400"> • Load {Math.floor((currentStart - 5) / 5) + 1}/10 (start: {currentStart})</span>
                                            )}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="px-4 py-2 rounded-xl bg-black/30 border border-cyan-400/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                >
                                    <option value="all">All Jobs (Excluding Hidden)</option>
                                    <option value="applied">Applied</option>
                                    <option value="hidden">Hidden Jobs</option>
                                    <option value="interview">Interview</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <GradientButton onClick={fetchJobs} icon={RefreshCw} size="sm" variant="outline" disabled={loading}>
                                    Refresh
                                </GradientButton>
                                <GradientButton
                                    onClick={loadMoreJobs}
                                    icon={loadingMore ? RefreshCw : Plus}
                                    size="sm"
                                    variant={hasMoreJobs ? "primary" : "outline"}
                                    disabled={loadingMore || !hasMoreJobs}
                                >
                                    {loadingMore ? 'Loading...' : hasMoreJobs ? `Load More Jobs ` : 'All Loads Complete'}
                                </GradientButton>
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-center text-gray-400 py-12">Loading jobs...</div>
                        ) : error ? (
                            <div className="text-center text-red-400 py-12">{error}</div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                <Brain className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                                <p className="text-lg">No jobs found for this user</p>
                                <p className="text-sm mt-2">Start a task to scrape jobs</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {jobs
                                        .filter((job: any) => job.hidden !== 1) // Filter out hidden jobs
                                        .map((job: any, index: number) => (
                                            <motion.div
                                                key={job.id}
                                                className="bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{
                                                    opacity: hidingJobs.has(job.id) ? 0 : 1,
                                                    y: hidingJobs.has(job.id) ? -20 : 0,
                                                    scale: hidingJobs.has(job.id) ? 0.95 : 1
                                                }}
                                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                                transition={{
                                                    duration: hidingJobs.has(job.id) ? 0.3 : 0.3,
                                                    delay: hidingJobs.has(job.id) ? 0 : index * 0.1
                                                }}
                                            >
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-cyan-300 font-medium">{job.company}</p>
                                                        <p className="text-gray-400 text-sm">{job.location}</p>
                                                        <p className="text-gray-500 text-xs">{job.date}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <a
                                                            href={job.job_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-[#0a182e] text-white px-3 py-1 rounded-full hover:bg-[#162a4d] transition-all"
                                                        >
                                                            View Job
                                                        </a>
                                                        <div className="flex gap-1 flex-wrap">
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'applied')}
                                                                className={`text-xs px-2 py-1 rounded ${job.applied === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-300'}`}
                                                            >
                                                                Applied
                                                            </button>
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'hidden')}
                                                                disabled={job.applied === 1} // Disable if already applied
                                                                title={job.applied === 1 ? "Cannot hide applied jobs" : "Hide this job"}
                                                                className={`text-xs px-2 py-1 rounded ${job.hidden === 1
                                                                    ? 'bg-yellow-500/20 text-yellow-300'
                                                                    : job.applied === 1
                                                                        ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                                                                        : 'bg-gray-500/20 text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-300'
                                                                    }`}
                                                            >
                                                                Hide
                                                            </button>
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'interview')}
                                                                className={`text-xs px-2 py-1 rounded ${job.interview === 1 ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300 hover:bg-purple-500/20 hover:text-purple-300'}`}
                                                            >
                                                                Interview
                                                            </button>
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'rejected')}
                                                                className={`text-xs px-2 py-1 rounded ${job.rejected === 1 ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300 hover:bg-red-500/20 hover:text-red-300'}`}
                                                            >
                                                                Rejected
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>

                                {/* Load More Jobs Section */}
                                {jobs.length > 0 && (
                                    <div className="mt-6 p-4 bg-[#0a182e] border border-cyan-400/20 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-lg font-semibold text-cyan-200 mb-1">Load More Jobs</h4>
                                                {/* <p className="text-sm text-gray-400">
                                                    {hasMoreJobs
                                                        ? `Currently loaded ${jobs.length} jobs. Load ${Math.floor((currentStart - 5) / 5) + 1}/10 - Next request will start from position ${currentStart}.`
                                                        : `All 10 loads completed (${jobs.length} total jobs).`
                                                    }
                                                </p> */}
                                            </div>
                                            <GradientButton
                                                onClick={loadMoreJobs}
                                                icon={loadingMore ? RefreshCw : Plus}
                                                size="md"
                                                variant={hasMoreJobs ? "primary" : "outline"}
                                                disabled={loadingMore || !hasMoreJobs}
                                            >
                                                {loadingMore ? 'Loading...' : hasMoreJobs ? `Load More Jobs ` : 'All Loads Complete'}
                                            </GradientButton>
                                        </div>
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-6">
                                        <GradientButton size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</GradientButton>
                                        <span className="px-4 py-2 text-cyan-200">Page {page} of {totalPages}</span>
                                        <GradientButton size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</GradientButton>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}

function AnalyticsSection({ userProfile }: { userProfile: UserProfile | null }) {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
    const [jobList, setJobList] = useState<any[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);

    const fetchAnalytics = async () => {
        if (!userProfile?.user_id) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/jobs?userId=${userProfile.user_id}&stats=true`);
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('❌ Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchJobsByStatus = async (status: string) => {
        if (!userProfile?.user_id) return;

        setIsLoadingJobs(true);
        try {
            const params = new URLSearchParams({
                userId: userProfile.user_id,
                limit: '50'
            });

            // Add status filter
            if (status === 'applied') {
                params.append('applied', 'true');
            } else if (status === 'hidden') {
                params.append('hidden', 'true');
            } else if (status === 'interview') {
                params.append('interview', 'true');
            } else if (status === 'rejected') {
                params.append('rejected', 'true');
            }

            const response = await fetch(`/api/jobs?${params}`);
            if (response.ok) {
                const data = await response.json();
                setJobList(data.jobs || []);
                setSelectedJobType(status);
            }
        } catch (error) {
            console.error('❌ Error fetching jobs by status:', error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const closeJobList = () => {
        setSelectedJobType(null);
        setJobList([]);
    };

    useEffect(() => {
        fetchAnalytics();
    }, [userProfile?.user_id]);

    const getStatCard = (title: string, value: number, icon: any, color: string, description?: string, status?: string) => (
        <motion.div
            className={`bg-gradient-to-br ${color} backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 ${value > 0 ? 'hover:shadow-lg' : 'opacity-60 cursor-not-allowed'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => {
                if (value > 0 && status) {
                    fetchJobsByStatus(status);
                }
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                    <icon.type {...icon.props} className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white">{value}</div>
                    <div className="text-sm text-white/70">{title}</div>
                </div>
            </div>
            {description && (
                <div className="text-xs text-white/60 mt-2">{description}</div>
            )}
            {value > 0 && status && (
                <div className="text-xs text-white/40 mt-2">Click to view jobs</div>
            )}
        </motion.div>
    );

    const getProgressBar = (current: number, total: number, color: string) => {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        return (
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                    className={`h-2 rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        );
    };

    if (!userProfile) {
        return (
            <motion.div
                className="flex items-center justify-center min-h-[400px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading analytics...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
                    <p className="text-white/70">Track your job search progress and performance</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Job List Modal */}
            {selectedJobType && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeJobList}
                >
                    <motion.div
                        className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {selectedJobType === 'applied' && 'Applied Jobs'}
                                    {selectedJobType === 'hidden' && 'Hidden Jobs'}
                                    {selectedJobType === 'interview' && 'Interview Jobs'}
                                    {selectedJobType === 'rejected' && 'Rejected Jobs'}
                                </h2>
                                <p className="text-white/70">
                                    {jobList.length} jobs found
                                </p>
                            </div>
                            <button
                                onClick={closeJobList}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {isLoadingJobs ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-white">Loading jobs...</span>
                            </div>
                        ) : jobList.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Database className="w-8 h-8 text-white/50" />
                                </div>
                                <p className="text-white/70">No jobs found for this category</p>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[60vh] space-y-4">
                                {jobList.map((job: any, index: number) => (
                                    <motion.div
                                        key={job.id}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                                                    {job.title}
                                                </h3>
                                                <p className="text-cyan-300 font-medium mb-1">{job.company}</p>
                                                <p className="text-gray-400 text-sm mb-2">{job.location}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{job.date}</span>
                                                    <span>•</span>
                                                    <span>Added {new Date(job.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <a
                                                    href={job.job_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs hover:bg-cyan-500/30 transition-colors"
                                                >
                                                    View Job
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {getStatCard(
                    'Total Jobs',
                    stats?.total || 0,
                    <Database className="w-6 h-6" />,
                    'from-blue-500/20 to-blue-600/20',
                    'Jobs fetched from searches'
                )}
                {getStatCard(
                    'Applied',
                    stats?.applied || 0,
                    <CheckCircle className="w-6 h-6" />,
                    'from-green-500/20 to-green-600/20',
                    'Jobs you\'ve applied to',
                    'applied'
                )}
                {getStatCard(
                    'Hidden',
                    stats?.hidden || 0,
                    <Eye className="w-6 h-6" />,
                    'from-yellow-500/20 to-yellow-600/20',
                    'Jobs you\'ve hidden',
                    'hidden'
                )}
                {getStatCard(
                    'Interviews',
                    stats?.interview || 0,
                    <Calendar className="w-6 h-6" />,
                    'from-purple-500/20 to-purple-600/20',
                    'Jobs with interviews',
                    'interview'
                )}
                {getStatCard(
                    'Rejected',
                    stats?.rejected || 0,
                    <XCircle className="w-6 h-6" />,
                    'from-red-500/20 to-red-600/20',
                    'Jobs you were rejected from',
                    'rejected'
                )}
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Application Rate */}
                <motion.div
                    className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-cyan-400" />
                        Application Rate
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm text-white/70 mb-1">
                                <span>Applied to {stats?.applied || 0} out of {stats?.total || 0} jobs</span>
                                <span>{stats?.total > 0 ? Math.round((stats.applied / stats.total) * 100) : 0}%</span>
                            </div>
                            {getProgressBar(stats?.applied || 0, stats?.total || 0, 'bg-green-500')}
                        </div>
                        <div className="text-xs text-white/50">
                            {stats?.total > 0 ?
                                `You've applied to ${Math.round((stats.applied / stats.total) * 100)}% of your fetched jobs` :
                                'Start searching for jobs to see your application rate'
                            }
                        </div>
                    </div>
                </motion.div>

                {/* Interview Success Rate */}
                <motion.div
                    className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        Interview Success Rate
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm text-white/70 mb-1">
                                <span>{stats?.interview || 0} interviews from {stats?.applied || 0} applications</span>
                                <span>{stats?.applied > 0 ? Math.round((stats.interview / stats.applied) * 100) : 0}%</span>
                            </div>
                            {getProgressBar(stats?.interview || 0, stats?.applied || 0, 'bg-purple-500')}
                        </div>
                        <div className="text-xs text-white/50">
                            {stats?.applied > 0 ?
                                `${Math.round((stats.interview / stats.applied) * 100)}% of your applications led to interviews` :
                                'Apply to jobs to start tracking interview success'
                            }
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Recent Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <div className="text-2xl font-bold text-white">{stats?.new || 0}</div>
                        <div className="text-sm text-white/70">New Jobs (24h)</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <div className="text-2xl font-bold text-white">{stats?.rejected || 0}</div>
                        <div className="text-sm text-white/70">Rejected</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <div className="text-2xl font-bold text-white">{stats?.total > 0 ? Math.round((stats.applied / stats.total) * 100) : 0}%</div>
                        <div className="text-sm text-white/70">Application Rate</div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function LinkedInProfileSection({ userProfile }: { userProfile: UserProfile | null }) {
    const [linkedinProfile, setLinkedinProfile] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        current_job_title: '',
        company: '',
        location: '',
        summary: '',
        skills: [] as string[],
        experience: [] as any[],
        education: [] as any[],
        certifications: [] as any[],
        languages: [] as string[]
    });
    const [newSkill, setNewSkill] = useState('');

    const fetchLinkedInProfile = async () => {
        if (!userProfile?.user_id) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/linkedin-profile?userId=${userProfile.user_id}`);
            if (response.ok) {
                const data = await response.json();
                setLinkedinProfile(data.profile);
                if (data.profile?.linkedin_url) {
                    setLinkedinUrl(data.profile.linkedin_url);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching LinkedIn profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveLinkedInProfile = async () => {
        if (!userProfile?.user_id || !linkedinUrl.trim()) {
            toast.error('Please enter a valid LinkedIn URL');
            return;
        }

        setIsSaving(true);
        try {
            // For now, we'll create a basic profile structure
            // In the future, this would be populated by LinkedIn API
            const profileData = {
                name: '', // Would be fetched from LinkedIn API
                current_job_title: '',
                company: '',
                location: '',
                summary: '',
                skills: [],
                experience: [],
                education: [],
                certifications: [],
                languages: []
            };

            const response = await fetch('/api/linkedin-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userProfile.user_id,
                    linkedinUrl: linkedinUrl.trim(),
                    profileData: profileData
                }),
            });

            const data = await response.json();
            if (data.success) {
                setLinkedinProfile(data.profile);
                setIsEditing(false);
                toast.success('LinkedIn profile saved successfully!');
                toast('Note: Profile data will be populated when LinkedIn API integration is complete.', {
                    icon: 'ℹ️',
                    duration: 4000
                });
            } else {
                toast.error(data.error || 'Failed to save LinkedIn profile');
            }
        } catch (error) {
            console.error('❌ Error saving LinkedIn profile:', error);
            toast.error('Failed to save LinkedIn profile');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteLinkedInProfile = async () => {
        if (!userProfile?.user_id) return;

        if (!confirm('Are you sure you want to delete your LinkedIn profile data?')) {
            return;
        }

        try {
            const response = await fetch(`/api/linkedin-profile?userId=${userProfile.user_id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                setLinkedinProfile(null);
                setLinkedinUrl('');
                setIsEditing(false);
                toast.success('LinkedIn profile deleted successfully!');
            } else {
                toast.error(data.error || 'Failed to delete LinkedIn profile');
            }
        } catch (error) {
            console.error('❌ Error deleting LinkedIn profile:', error);
            toast.error('Failed to delete LinkedIn profile');
        }
    };

    useEffect(() => {
        fetchLinkedInProfile();
    }, [userProfile?.user_id]);

    // Populate profile data when LinkedIn profile is loaded
    useEffect(() => {
        if (linkedinProfile) {
            setProfileData({
                name: linkedinProfile.name || '',
                current_job_title: linkedinProfile.current_job_title || '',
                company: linkedinProfile.company || '',
                location: linkedinProfile.location || '',
                summary: linkedinProfile.summary || '',
                skills: linkedinProfile.skills || [],
                experience: linkedinProfile.experience || [],
                education: linkedinProfile.education || [],
                certifications: linkedinProfile.certifications || [],
                languages: linkedinProfile.languages || []
            });
        }
    }, [linkedinProfile]);

    const updateProfileData = async () => {
        if (!userProfile?.user_id) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/linkedin-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userProfile.user_id,
                    updates: {
                        name: profileData.name,
                        current_job_title: profileData.current_job_title,
                        company: profileData.company,
                        location: profileData.location,
                        summary: profileData.summary,
                        skills: profileData.skills,
                        experience: profileData.experience,
                        education: profileData.education,
                        certifications: profileData.certifications,
                        languages: profileData.languages
                    }
                }),
            });

            const data = await response.json();
            if (data.success) {
                setLinkedinProfile(data.profile);
                setIsEditingProfile(false);
                toast.success('Profile data updated successfully!');
            } else {
                toast.error(data.error || 'Failed to update profile data');
            }
        } catch (error) {
            console.error('❌ Error updating profile data:', error);
            toast.error('Failed to update profile data');
        } finally {
            setIsSaving(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
            setProfileData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    if (!userProfile) {
        return (
            <motion.div
                className="flex items-center justify-center min-h-[400px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading profile...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">LinkedIn Profile</h1>
                    <p className="text-white/70">Connect your LinkedIn profile to enhance your job applications</p>
                </div>
                <button
                    onClick={fetchLinkedInProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* LinkedIn Profile Form */}
            <motion.div
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                        <Linkedin className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">LinkedIn Profile URL</h2>
                        <p className="text-white/70">Enter your LinkedIn profile URL to connect your professional data</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            LinkedIn Profile URL
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="url"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="https://www.linkedin.com/in/your-profile"
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/50 transition-all"
                                disabled={!isEditing && !!linkedinProfile}
                            />
                            {!linkedinProfile ? (
                                <button
                                    onClick={saveLinkedInProfile}
                                    disabled={isSaving || !linkedinUrl.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-400 hover:to-blue-500 transition-all duration-300 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Profile'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl font-semibold hover:from-cyan-400 hover:to-cyan-500 transition-all duration-300"
                                >
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-white/50 mt-2">
                            Example: https://www.linkedin.com/in/john-doe
                        </p>
                    </div>

                    {linkedinProfile && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                                        className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl text-sm hover:bg-cyan-500/30 transition-all"
                                    >
                                        {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            onClick={saveLinkedInProfile}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl text-sm hover:bg-green-500/30 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                    <button
                                        onClick={deleteLinkedInProfile}
                                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-sm hover:bg-red-500/30 transition-all"
                                    >
                                        Delete Profile
                                    </button>
                                </div>
                            </div>

                            {isEditingProfile ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/50"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Current Job Title</label>
                                            <input
                                                type="text"
                                                value={profileData.current_job_title}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, current_job_title: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/50"
                                                placeholder="Enter your job title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Company</label>
                                            <input
                                                type="text"
                                                value={profileData.company}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/50"
                                                placeholder="Enter your company"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={profileData.location}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/50"
                                                placeholder="Enter your location"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">Summary</label>
                                        <textarea
                                            value={profileData.summary}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, summary: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/50"
                                            placeholder="Enter your professional summary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Skills</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/50"
                                                placeholder="Add a skill"
                                            />
                                            <button
                                                onClick={addSkill}
                                                className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl text-sm hover:bg-cyan-500/30 transition-all"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.skills.map((skill: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs flex items-center gap-2"
                                                >
                                                    {skill}
                                                    <button
                                                        onClick={() => removeSkill(skill)}
                                                        className="text-blue-400 hover:text-blue-200"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={updateProfileData}
                                            disabled={isSaving}
                                            className="px-6 py-2 bg-green-500/20 text-green-300 rounded-xl text-sm hover:bg-green-500/30 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Profile Data'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingProfile(false)}
                                            className="px-6 py-2 bg-gray-500/20 text-gray-300 rounded-xl text-sm hover:bg-gray-500/30 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Name</label>
                                            <p className="text-white">{linkedinProfile.name || 'Not available'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Current Job Title</label>
                                            <p className="text-white">{linkedinProfile.current_job_title || 'Not available'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Company</label>
                                            <p className="text-white">{linkedinProfile.company || 'Not available'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                                            <p className="text-white">{linkedinProfile.location || 'Not available'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Skills</label>
                                            <div className="flex flex-wrap gap-2">
                                                {linkedinProfile.skills && linkedinProfile.skills.length > 0 ? (
                                                    linkedinProfile.skills.map((skill: string, index: number) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-white/50">No skills listed</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Summary</label>
                                            <p className="text-white text-sm line-clamp-3">
                                                {linkedinProfile.summary || 'No summary available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h3 className="text-xl font-semibold text-white mb-6">Benefits of Connecting Your LinkedIn Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500/20 rounded-xl">
                            <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Personalized Cover Letters</h4>
                            <p className="text-white/70 text-sm">Generate tailored cover letters using your professional experience</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Zap className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Skill Matching</h4>
                            <p className="text-white/70 text-sm">Match your skills with job requirements automatically</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Smart Applications</h4>
                            <p className="text-white/70 text-sm">Get recommendations for jobs that match your profile</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-xl">
                            <Shield className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Data Security</h4>
                            <p className="text-white/70 text-sm">Your data is encrypted and stored securely</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function ResumeUploadSection({ userProfile }: { userProfile: UserProfile | null }) {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedResume | null>(null);

    const fetchResumes = async () => {
        if (!userProfile?.user_id) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/resume?userId=${userProfile.user_id}`);
            if (response.ok) {
                const data = await response.json();
                setResumes(data.resumes || []);
            }
        } catch (error) {
            console.error('❌ Error fetching resumes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (file: File) => {
        if (!ProfileService.validateResumeFile(file)) {
            toast.error('Invalid file type or size. Please upload a PDF, DOCX, DOC, or TXT file under 10MB.');
            return;
        }
        setSelectedFile(file);
    };

    const handleFileUpload = async () => {
        if (!userProfile?.user_id || !selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('userId', userProfile.user_id);
            formData.append('file', selectedFile);

            const response = await fetch('/api/resume', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Resume uploaded successfully!');
                setSelectedFile(null);
                setUploadProgress(0);
                fetchResumes(); // Refresh the list
            } else {
                toast.error(data.error || 'Failed to upload resume');
            }
        } catch (error) {
            console.error('❌ Error uploading resume:', error);
            toast.error('Failed to upload resume');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const deleteResume = async (resumeId: string) => {
        if (!userProfile?.user_id) return;

        if (!confirm('Are you sure you want to delete this resume?')) {
            return;
        }

        try {
            const response = await fetch(`/api/resume?resumeId=${resumeId}&userId=${userProfile.user_id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Resume deleted successfully!');
                fetchResumes(); // Refresh the list
            } else {
                toast.error(data.error || 'Failed to delete resume');
            }
        } catch (error) {
            console.error('❌ Error deleting resume:', error);
            toast.error('Failed to delete resume');
        }
    };

    const parseResume = async (resumeId: string) => {
        setIsParsing(true);
        try {
            const response = await fetch('/api/resume/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resumeId }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Resume parsed successfully!');
                setParsedData(data.parsedData);
                fetchResumes(); // Refresh to get updated parsed data
            } else {
                toast.error(data.error || 'Failed to parse resume');
            }
        } catch (error) {
            console.error('❌ Error parsing resume:', error);
            toast.error('Failed to parse resume');
        } finally {
            setIsParsing(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, [userProfile?.user_id]);

    if (!userProfile) {
        return (
            <motion.div
                className="flex items-center justify-center min-h-[400px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading profile...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Resume Upload & Parsing</h1>
                    <p className="text-white/70">Upload resumes and extract information for personalized cover letters</p>
                </div>
                <button
                    onClick={fetchResumes}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Upload Section */}
            <motion.div
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-500/20 rounded-2xl">
                        <Upload className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Upload Resume</h2>
                        <p className="text-white/70">Upload your resume in PDF, DOCX, DOC, or TXT format</p>
                    </div>
                </div>

                {/* File Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragActive
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-white/20 hover:border-white/40'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleFileSelect(e.target.files[0]);
                            }
                        }}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white/70" />
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {selectedFile ? selectedFile.name : 'Drop your resume here or click to browse'}
                                </p>
                                <p className="text-white/50 text-sm mt-2">
                                    Supports PDF, DOCX, DOC, TXT (Max 10MB)
                                </p>
                            </div>
                        </div>
                    </label>
                </div>

                {selectedFile && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-cyan-400" />
                                <div>
                                    <p className="text-white font-medium">{selectedFile.name}</p>
                                    <p className="text-white/50 text-sm">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-2 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={handleFileUpload}
                            disabled={isUploading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:from-green-400 hover:to-green-500 transition-all duration-300 disabled:opacity-50"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Resume'}
                        </button>

                        {uploadProgress > 0 && (
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Resumes List */}
            <motion.div
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Your Resumes</h2>
                        <p className="text-white/70">Manage and parse your uploaded resumes</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <p className="text-white/50">No resumes uploaded yet</p>
                        <p className="text-white/30 text-sm">Upload your first resume to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {resumes.map((resume) => (
                            <div
                                key={resume.id}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{resume.file_name}</p>
                                        <p className="text-white/50 text-sm">
                                            {(resume.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded{' '}
                                            {new Date(resume.upload_date).toLocaleDateString()}
                                        </p>
                                        {resume.parsed_data && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs mt-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Parsed
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedResume(resume)}
                                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    {!resume.parsed_data && (
                                        <button
                                            onClick={() => parseResume(resume.id)}
                                            disabled={isParsing}
                                            className="p-2 text-green-400 hover:text-green-300 transition-colors"
                                            title="Parse Resume"
                                        >
                                            <Code className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
                                        </button>
                                    )}
                                    <a
                                        href={resume.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-white/50 hover:text-white transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => deleteResume(resume.id)}
                                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Parsed Data Display */}
            {selectedResume && (selectedResume.parsed_data || parsedData) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <ResumeDisplay
                        parsedResume={selectedResume.parsed_data || parsedData!}
                        className="mb-8"
                    />
                </motion.div>
            )}

            {/* Cover Letter Generation */}
            {selectedResume && (selectedResume.parsed_data || parsedData) && (
                <motion.div
                    className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/20 rounded-2xl">
                            <FileText className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Cover Letter Generator</h2>
                            <p className="text-white/70">Generate personalized cover letters based on your resume</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Company Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter company name"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Job Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter job title"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">Job Description</label>
                            <textarea
                                placeholder="Paste the job description here..."
                                rows={6}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-purple-400 hover:to-purple-500 transition-all duration-300">
                            Generate Cover Letter
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Benefits Section */}
            <motion.div
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <h3 className="text-xl font-semibold text-white mb-6">Benefits of Resume Parsing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500/20 rounded-xl">
                            <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Smart Extraction</h4>
                            <p className="text-white/70 text-sm">Automatically extract skills, experience, and education from your resume</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Zap className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Personalized Cover Letters</h4>
                            <p className="text-white/70 text-sm">Generate tailored cover letters using your extracted information</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">AI-Powered Parsing</h4>
                            <p className="text-white/70 text-sm">Advanced AI algorithms ensure accurate information extraction</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-xl">
                            <Target className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Job Matching</h4>
                            <p className="text-white/70 text-sm">Match your skills with job requirements for better applications</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function DashboardMain({ selected, selectedUser, onSelectUser, onUserCreated, userProfile, setUserProfile, onUpgrade, onRefresh, isLoadingProfile }: {
    selected: string,
    selectedUser: any,
    onSelectUser: (user: any) => void,
    onUserCreated: () => void,
    userProfile: UserProfile | null,
    setUserProfile: (profile: UserProfile | null) => void,
    onUpgrade: (plan: 'weekly' | 'monthly') => Promise<void>,
    onRefresh: () => Promise<void>,
    isLoadingProfile: boolean
}) {
    return (
        <section className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {selected === 'job-search' && (
                        <JobSearchSection userProfile={userProfile} setUserProfile={setUserProfile} />
                    )}
                    {selected === 'tasks' && (
                        <TasksSection selectedUser={selectedUser} userProfile={userProfile} />
                    )}
                    {selected === 'analytics' && (
                        <AnalyticsSection userProfile={userProfile} />
                    )}
                    {selected === 'pricing' && (
                        <PricingSection userProfile={userProfile} onUpgrade={onUpgrade} onRefresh={onRefresh} isLoadingProfile={isLoadingProfile} />
                    )}
                    {selected === 'resume-upload' && (
                        <ResumeUploadSection userProfile={userProfile} />
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}

export default function DashboardPage() {
    const { isSignedIn, user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [selected, setSelected] = useState('job-search');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [usersRefreshKey, setUsersRefreshKey] = useState(0);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [paymentPlan, setPaymentPlan] = useState<string>('');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Single, simplified profile loading effect
    useEffect(() => {
        const loadProfile = async () => {
            // Wait for Clerk to be fully loaded
            if (!isLoaded || !user?.id) {
                return;
            }

            setIsLoadingProfile(true);
            try {
                console.log('🔍 Loading user profile for user:', user.id);
                const email = user.emailAddresses[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;

                if (!email) {
                    console.error('❌ No email found for user');
                    return;
                }

                const profile = await UserProfileService.getOrCreateUserProfile(user.id, email);
                console.log('✅ User profile loaded successfully:', profile);
                setUserProfile(profile);
            } catch (error) {
                console.error('❌ Error loading user profile:', error);
                setUserProfile(null);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        loadProfile();
    }, [isLoaded, user?.id]);

    // Check for payment success in URL (simplified)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const plan = urlParams.get('plan');

        if (paymentStatus === 'success' && plan) {
            setShowPaymentSuccess(true);
            setPaymentPlan(plan);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Reload profile after successful payment
            setTimeout(() => {
                if (user?.id) {
                    const reloadProfile = async () => {
                        try {
                            const email = user.emailAddresses[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
                            if (email) {
                                const profile = await UserProfileService.getOrCreateUserProfile(user.id, email);
                                setUserProfile(profile);
                            }
                        } catch (error) {
                            console.error('❌ Error reloading profile after payment:', error);
                        }
                    };
                    reloadProfile();
                }
            }, 2000);
        }
    }, [user?.id]);

    const handleTabSelect = (tab: string) => {
        setSelected(tab);
    };

    const handleUserCreated = () => {
        setUsersRefreshKey(k => k + 1);
    };

    const handleRefresh = () => setUsersRefreshKey(k => k + 1);

    const handleLogout = () => {
        signOut(() => router.push('/sign-in'));
    };

    const handleUpgrade = async (plan: 'weekly' | 'monthly') => {
        if (!userProfile || !user?.id) return;

        try {
            const success = await UserProfileService.upgradePlan(user.id, plan, 'manual');
            if (success) {
                // Reload user profile to get updated data
                const email = user.emailAddresses[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
                if (email) {
                    const profile = await UserProfileService.getOrCreateUserProfile(user.id, email);
                    setUserProfile(profile);
                }
            }
        } catch (error) {
            console.error('Error upgrading plan:', error);
        }
    };

    const refreshUserProfile = async () => {
        if (!user?.id) return;

        console.log('🔍 Manually refreshing user profile in dashboard...');
        setIsLoadingProfile(true);

        try {
            const email = user.emailAddresses[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
            if (email) {
                const profile = await UserProfileService.getOrCreateUserProfile(user.id, email);
                console.log('🔍 Refreshed profile in dashboard:', profile);
                setUserProfile(profile);
            }
        } catch (error) {
            console.error('❌ Error refreshing profile in dashboard:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    // Test function to debug Supabase connection
    const testSupabaseConnection = async () => {
        try {
            console.log('🔍 Testing Supabase connection...');
            const response = await fetch('/api/test-supabase');
            const result = await response.json();
            console.log('🔍 Supabase test result:', result);
        } catch (error) {
            console.error('❌ Supabase test error:', error);
        }
    };

    // Test function to reset credits
    const testCreditReset = async () => {
        try {
            console.log('🔄 Testing credit reset...');

            const response = await fetch('/api/reset-credits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Credit reset successful:', result);
                toast.success('✅ Credit reset successful');

                // Reload user profile to see updated credits
                await refreshUserProfile();
            } else {
                console.error('❌ Credit reset failed:', result);
                toast.error('❌ Credit reset failed: ' + result.error);
            }
        } catch (error: any) {
            console.error('❌ Error testing credit reset:', error);
            toast.error('❌ Error testing credit reset: ' + error.message);
        }
    };

    // Test function to check credit status
    const testCreditStatus = async () => {
        try {
            console.log('💳 Checking credit status...');

            const response = await fetch('/api/reset-credits', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Credit status:', result);
                toast.success('✅ Credit status retrieved. Check console for details.');
            } else {
                console.error('❌ Credit status check failed:', result);
                toast.error('❌ Credit status check failed: ' + result.error);
            }
        } catch (error: any) {
            console.error('❌ Error checking credit status:', error);
            toast.error('❌ Error checking credit status: ' + error.message);
        }
    };

    // Test function to test user profile
    const testUserProfile = async () => {
        try {
            if (!user?.id) {
                toast.error('❌ No user ID available');
                return;
            }

            const email = user.emailAddresses[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
            if (!email) {
                toast.error('❌ No email available');
                return;
            }

            console.log('👤 Testing user profile for:', user.id, email);
            console.log('👤 Current userProfile state:', userProfile);

            const response = await fetch('/api/test-user-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    email: email
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ User profile test result:', result);
                toast.success('✅ User profile test completed. Check console for details.');

                // Reload user profile if test was successful
                if (result.finalProfile === 'Success') {
                    await refreshUserProfile();
                }
            } else {
                console.error('❌ User profile test failed:', result);
                toast.error('❌ User profile test failed: ' + result.error);
            }
        } catch (error: any) {
            console.error('❌ Error testing user profile:', error);
            toast.error('❌ Error testing user profile: ' + error.message);
        }
    };

    // Redirect if not signed in
    useEffect(() => {
        if (isSignedIn && !user) {
            router.push('/sign-in');
        }
    }, [isSignedIn, user, router]);

    // Load saved tab and user profile
    useEffect(() => {
        if (isSignedIn) {
            const savedTab = localStorage.getItem('dashboard-tab');
            if (savedTab && SIDEBAR_ITEMS.some(item => item.key === savedTab)) {
                setSelected(savedTab);
            }
            refreshUserProfile();
        }
    }, [isSignedIn, user?.id]);

    // Show loading while Clerk is loading
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a182e] to-[#1a2a3d]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <div className="text-cyan-400 text-lg font-medium">Loading...</div>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a182e] to-[#1a2a3d]">
            <Navbar currentPage="dashboard" userProfile={userProfile} />
            <FloatingParticles />
            <main className="flex flex-1">
                <Sidebar
                    selected={selected}
                    onSelect={setSelected}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />
                <div className="flex-1 flex flex-col">
                    {/* Removed UserProfileSection from here */}
                    <DashboardMain
                        selected={selected}
                        selectedUser={selectedUser}
                        onSelectUser={setSelectedUser}
                        onUserCreated={handleUserCreated}
                        userProfile={userProfile}
                        setUserProfile={setUserProfile}
                        onUpgrade={handleUpgrade}
                        onRefresh={refreshUserProfile}
                        isLoadingProfile={isLoadingProfile}
                    />
                </div>
            </main>
            <Footer />
            <Toaster position="top-center" />

            {/* Payment Success Toast */}
            {showPaymentSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500/95 to-emerald-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400/30">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                        <div>
                            <div className="font-bold text-sm">Payment Successful!</div>
                            <div className="text-xs opacity-90">Your {paymentPlan} plan has been activated</div>
                        </div>
                        <button
                            onClick={() => setShowPaymentSuccess(false)}
                            className="ml-4 text-white/70 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 