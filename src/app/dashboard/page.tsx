"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, PlusCircle, ListChecks, Brain, Search, Menu, X, ArrowDown, Rocket, Eye, RefreshCw, ExternalLink } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import GradientButton from '@/components/shared/GradientButton';
import AnimatedBlob from '@/components/shared/AnimatedBlob';
import { toast, Toaster } from 'react-hot-toast';

const SIDEBAR_ITEMS = [
    { key: 'users', label: 'Users', icon: Users },
    { key: 'create', label: 'Create User', icon: PlusCircle },
    { key: 'tasks', label: 'Tasks', icon: ListChecks },
    { key: 'jobs', label: 'Scraped Jobs', icon: Brain },
];

const PAGE_SIZE = 10;

// Floating Particles Component
const FloatingParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 8,
        duration: Math.random() * 20 + 15,
    }));

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
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        KronJobs Admin
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">Manage users, tasks & jobs</p>
                </div>
                <nav className="flex flex-col gap-2">
                    {SIDEBAR_ITEMS.map((item, index) => (
                        <motion.button
                            key={item.key}
                            onClick={() => onSelect(item.key)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-left ${selected === item.key
                                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-200 shadow-lg border border-cyan-400/30'
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
                                <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
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
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-200 shadow-lg border border-cyan-400/30'
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
            if (!data.success) throw new Error(data.error || 'Failed to fetch users');
            setUsers(data.users);
            setTotalPages(data.pagination.totalPages || 1);
        } catch (err: any) {
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
                className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
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
                className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
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
                            <input name="location" value={form.location} onChange={handleChange} required={!form.remote} disabled={form.remote} className="w-full px-4 py-3 rounded-xl bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-60" placeholder="e.g. Remote, Berlin" />
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
                    <GradientButton type="submit" size="lg" icon={PlusCircle} disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                    </GradientButton>
                </form>
            </div>
        </motion.div>
    );
}

function DashboardMain({ selected, selectedUser, onSelectUser, onUserCreated }: { selected: string, selectedUser: any, onSelectUser: (user: any) => void, onUserCreated: () => void }) {
    return (
        <section className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {selected === 'users' && (
                        <UsersSection onSelectUser={onSelectUser} selectedUser={selectedUser} />
                    )}
                    {selected === 'create' && (
                        <CreateUserSection onUserCreated={onUserCreated} />
                    )}
                    {selected === 'tasks' && (
                        <motion.div
                            key="tasks"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.h2
                                className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                Tasks
                            </motion.h2>
                            <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-cyan-400/20 p-8 min-h-[400px] shadow-2xl">
                                <div className="text-center text-gray-400 py-12">
                                    <ListChecks className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                                    <p className="text-lg">Task management coming soon...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {selected === 'jobs' && (
                        <motion.div
                            key="jobs"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.h2
                                className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                Scraped Jobs
                            </motion.h2>
                            <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-cyan-400/20 p-8 min-h-[400px] shadow-2xl">
                                <div className="text-center text-gray-400 py-12">
                                    <Brain className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                                    <p className="text-lg">Job results coming soon...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}

export default function DashboardPage() {
    const [selected, setSelected] = useState('users');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [usersRefreshKey, setUsersRefreshKey] = useState(0);

    useEffect(() => {
        const savedTab = localStorage.getItem('dashboard-tab');
        if (savedTab && SIDEBAR_ITEMS.some(item => item.key === savedTab)) {
            setSelected(savedTab);
        }
    }, []);

    const handleTabSelect = (tab: string) => {
        setSelected(tab);
        localStorage.setItem('dashboard-tab', tab);
    };

    const handleUserCreated = () => {
        setUsersRefreshKey(k => k + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a182e] via-[#0e223a] to-[#1a2a3d] text-white overflow-x-hidden">
            <Toaster position="top-right" />
            {/* Animated Background Elements */}
            <FloatingParticles />
            <AnimatedBlob className="w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 top-1/4 left-1/4 max-w-[90vw] max-h-[90vh]" color="blue" />
            <AnimatedBlob className="w-56 h-56 md:w-80 md:h-80 bg-purple-500/20 top-3/4 right-1/4 max-w-[90vw] max-h-[90vh]" color="purple" />
            <AnimatedBlob className="w-48 h-48 md:w-72 md:h-72 bg-emerald-500/20 bottom-1/4 left-1/3 max-w-[90vw] max-h-[90vh]" color="emerald" />

            <Navbar currentPage="dashboard" />

            <div className="flex pt-16">
                <Sidebar
                    selected={selected}
                    onSelect={handleTabSelect}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />
                <DashboardMain
                    selected={selected}
                    selectedUser={selectedUser}
                    onSelectUser={setSelectedUser}
                    onUserCreated={handleUserCreated}
                    key={usersRefreshKey}
                />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
                className="md:hidden fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileOpen(true)}
            >
                <Menu className="w-6 h-6 text-white" />
            </motion.button>

            <Footer />
        </div>
    );
} 