"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface JobTask {
    id: string;
    user_id: string;
    keywords: string;
    location: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    completed_at?: string;
    error?: string;
    results?: any;
}

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    job_url: string;
    job_description?: string;
    created_at: string;
}

export default function JobScraper() {
    const [currentUser, setCurrentUser] = useState<string>("");
    const [isScraping, setIsScraping] = useState(false);
    const [currentTask, setCurrentTask] = useState<JobTask | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [tasks, setTasks] = useState<JobTask[]>([]);
    const [status, setStatus] = useState("");
    const [isTestingProxy, setIsTestingProxy] = useState(false);
    const [manualUser, setManualUser] = useState<string>("");
    const [scrapedJobs, setScrapedJobs] = useState<any[]>([]);

    // Get current user from preferences
    useEffect(() => {
        const getUser = async () => {
            try {
                console.log('🔍 Looking for user preferences...');
                console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
                console.log('🔧 Current user context:', currentUser);

                // First, let's test if we can access the table at all
                const { data: tableTest, error: tableError } = await supabase
                    .from('job_preferences')
                    .select('count(*)')
                    .limit(1);

                console.log('🔍 Table access test:', { data: tableTest, error: tableError });

                const { data: prefs, error } = await supabase
                    .from('job_preferences')
                    .select('email')
                    .limit(1);

                console.log('📊 Raw Supabase response:', { data: prefs, error });

                if (error) {
                    console.error('❌ Error fetching user preferences:', {
                        error,
                        errorMessage: error.message,
                        errorDetails: error.details,
                        errorHint: error.hint,
                        errorCode: error.code
                    });
                    return;
                }

                console.log('📋 Found preferences:', prefs);

                if (prefs && prefs.length > 0) {
                    setCurrentUser(prefs[0].email);
                    console.log('✅ User set to:', prefs[0].email);
                } else {
                    console.log('⚠️  No user preferences found - table might be empty or RLS blocking access');
                }
            } catch (error) {
                console.error('❌ Error in getUser:', error);
            }
        };
        getUser();
    }, []);

    // Poll for task status updates
    useEffect(() => {
        if (!currentTask || currentTask.status === 'completed' || currentTask.status === 'failed') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/start-scraping?taskId=${currentTask.id}`);
                const data = await response.json();

                if (data.task) {
                    setCurrentTask(data.task);

                    if (data.task.status === 'completed') {
                        setIsScraping(false);
                        setStatus("✅ Job scraping completed!");
                        loadJobs();
                    } else if (data.task.status === 'failed') {
                        setIsScraping(false);
                        setStatus(`❌ Job scraping failed: ${data.task.error}`);
                    }
                }
            } catch (error) {
                console.error('Error checking task status:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [currentTask]);

    const testProxy = async () => {
        setIsTestingProxy(true);
        setStatus("🧪 Testing proxy connection...");

        try {
            const response = await fetch('/api/test-proxy');
            const data = await response.json();

            if (data.success) {
                setStatus("✅ Proxy connection successful!");
            } else {
                setStatus(`❌ Proxy test failed: ${data.message}`);
            }
        } catch (error: any) {
            setStatus(`❌ Proxy test error: ${error.message}`);
        } finally {
            setIsTestingProxy(false);
        }
    };

    const startScraping = async () => {
        if (!currentUser) {
            setStatus("❌ Please set up your job preferences first");
            return;
        }

        setIsScraping(true);
        setStatus("🚀 Starting job scraping...");
        setScrapedJobs([]);

        try {
            const response = await fetch('/api/start-scraping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser })
            });

            const data = await response.json();

            console.log('Data returned from scraping:', data);

            if (data.success && data.jobs) {
                setScrapedJobs(data.jobs);
                console.log('Jobs returned from scraping:', data.jobs);
            }

            if (data.success) {
                setCurrentTask({
                    id: data.taskId,
                    user_id: currentUser,
                    keywords: '',
                    location: '',
                    status: 'pending',
                    created_at: new Date().toISOString()
                });
                setStatus("⏳ Job scraping queued. Processing...");
            } else {
                setIsScraping(false);
                setStatus(`❌ Error: ${data.error}`);
            }
        } catch (error: any) {
            setIsScraping(false);
            setStatus(`❌ Network error: ${error.message}`);
        }
    };

    const loadJobs = async () => {
        if (!currentUser) return;

        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('user_id', currentUser)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error loading jobs:', error);
                return;
            }

            setJobs(data || []);
        } catch (error) {
            console.error('Error loading jobs:', error);
        }
    };

    const loadTasks = async () => {
        if (!currentUser) return;

        try {
            const response = await fetch(`/api/start-scraping?userId=${currentUser}`);
            const data = await response.json();

            if (data.tasks) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    useEffect(() => {
        loadJobs();
        loadTasks();
    }, [currentUser]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-500';
            case 'processing': return 'text-blue-500';
            case 'completed': return 'text-green-500';
            case 'failed': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'processing': return '🔄';
            case 'completed': return '✅';
            case 'failed': return '❌';
            default: return '❓';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Job Scraper</h2>

                <div className="mb-4">
                    <p className="text-gray-600 mb-2">
                        Current User: <span className="font-semibold">{currentUser || 'Not set'}</span>
                    </p>

                    {/* Manual User Input */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                            If no user is detected, enter your email manually:
                        </p>
                        <div className="flex space-x-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={manualUser}
                                onChange={(e) => setManualUser(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => {
                                    if (manualUser) {
                                        setCurrentUser(manualUser);
                                        setStatus(`✅ User set to: ${manualUser}`);
                                    }
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                            >
                                Set User
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={testProxy}
                            disabled={isTestingProxy}
                            className={`px-4 py-3 rounded-lg font-semibold ${isTestingProxy
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                } text-white transition-colors`}
                        >
                            {isTestingProxy ? '🧪 Testing...' : '🧪 Test Proxy'}
                        </button>

                        <button
                            onClick={startScraping}
                            disabled={isScraping || !currentUser}
                            className={`px-6 py-3 rounded-lg font-semibold ${isScraping || !currentUser
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } text-white transition-colors`}
                        >
                            {isScraping ? '🔄 Scraping Jobs...' : '🚀 Start Job Scraping'}
                        </button>
                    </div>
                </div>

                {status && (
                    <div className="mb-4 p-3 rounded-lg bg-gray-100">
                        <p className="text-sm">{status}</p>
                    </div>
                )}

                {currentTask && (
                    <div className="mb-4 p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Current Task</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Task ID:</span> {currentTask.id}
                            </div>
                            <div>
                                <span className="font-medium">Status:</span>
                                <span className={`ml-2 ${getStatusColor(currentTask.status)}`}>
                                    {getStatusIcon(currentTask.status)} {currentTask.status}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">Created:</span> {new Date(currentTask.created_at).toLocaleString()}
                            </div>
                            {currentTask.completed_at && (
                                <div>
                                    <span className="font-medium">Completed:</span> {new Date(currentTask.completed_at).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Recent Tasks</h3>
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{task.keywords}</p>
                                    <p className="text-sm text-gray-600">{task.location}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`${getStatusColor(task.status)}`}>
                                        {getStatusIcon(task.status)} {task.status}
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        {new Date(task.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No tasks found</p>
                    )}
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Scraped Jobs ({jobs.length})</h3>
                    <button
                        onClick={loadJobs}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                    >
                        🔄 Refresh
                    </button>
                </div>

                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-lg mb-1">
                                        <a
                                            href={job.job_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            {job.title}
                                        </a>
                                    </h4>
                                    <p className="text-gray-700 mb-1">{job.company}</p>
                                    <p className="text-gray-600 text-sm mb-2">{job.location}</p>
                                    {job.job_description && (
                                        <p className="text-gray-600 text-sm line-clamp-3">
                                            {job.job_description.substring(0, 200)}...
                                        </p>
                                    )}
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {jobs.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No jobs found. Start scraping to see results!</p>
                    )}
                </div>
            </div>

            {/* Debug: Show jobs returned from scraping (not from DB) */}
            {scrapedJobs.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 my-4">
                    <h4 className="font-bold text-yellow-700 mb-2">Jobs returned from scraping (debug):</h4>
                    <ul className="list-disc pl-6">
                        {scrapedJobs.map((job, idx) => (
                            <li key={idx} className="mb-1">
                                <span className="font-semibold">{job.title}</span> at <span>{job.company}</span> ({job.location})
                                {job.job_url && (
                                    <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">View</a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
} 