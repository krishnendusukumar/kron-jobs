"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Trash2, Play, Pause, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { UserProfileService, CronJob, CronExecution, UserProfile } from '../../lib/user-profile-service';

interface CronManagerProps {
    userProfile: UserProfile;
    className?: string;
}

const CronManager: React.FC<CronManagerProps> = ({ userProfile, className = "" }) => {
    const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
    const [executions, setExecutions] = useState<CronExecution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingJob, setIsAddingJob] = useState(false);
    const [selectedTime, setSelectedTime] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const availableTimeSlots = UserProfileService.getAvailableCronSlots(userProfile.plan);
    const maxCronJobs = UserProfileService.getMaxCronJobs(userProfile.plan);

    useEffect(() => {
        loadCronData();
    }, [userProfile.user_id]);

    const loadCronData = async () => {
        setIsLoading(true);
        try {
            const [jobs, execs] = await Promise.all([
                UserProfileService.getCronJobs(userProfile.user_id),
                UserProfileService.getCronExecutions(userProfile.user_id, 10)
            ]);
            setCronJobs(jobs);
            setExecutions(execs);
        } catch (error) {
            console.error('Error loading cron data:', error);
            setError('Failed to load cron jobs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCronJob = async () => {
        if (!selectedTime) {
            setError('Please select a time slot');
            return;
        }

        setIsAddingJob(true);
        setError(null);
        setSuccess(null);

        try {
            const newJob = await UserProfileService.createCronJob(userProfile.user_id, selectedTime);
            if (newJob) {
                setCronJobs(prev => [...prev, newJob]);
                setSelectedTime('');
                setSuccess(`Cron job scheduled for ${selectedTime}`);
                setIsAddingJob(false);
            } else {
                setError('Failed to create cron job');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create cron job';
            setError(errorMessage);
        } finally {
            setIsAddingJob(false);
        }
    };

    const handleDeleteCronJob = async (jobId: number) => {
        try {
            const success = await UserProfileService.deleteCronJob(userProfile.user_id, jobId);
            if (success) {
                setCronJobs(prev => prev.filter(job => job.id !== jobId));
                setSuccess('Cron job deleted successfully');
            } else {
                setError('Failed to delete cron job');
            }
        } catch (error) {
            setError('Failed to delete cron job');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-400" />;
            case 'running':
                return <Play className="w-4 h-4 text-blue-400" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'failed':
                return 'Failed';
            case 'running':
                return 'Running';
            case 'pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getAvailableSlots = () => {
        const usedSlots = cronJobs.map(job => job.cron_time);
        return availableTimeSlots.filter(slot => !usedSlots.includes(slot));
    };

    if (userProfile.plan === 'free') {
        return (
            <div className={`p-6 ${className}`}>
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-6 text-center">
                    <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Automation Not Available
                    </h3>
                    <p className="text-gray-300 mb-4">
                        Upgrade to Lifetime or Pro plan to schedule automated job searches.
                    </p>
                    <div className="text-sm text-amber-300">
                        <p>Free plan: Manual searches only</p>
                        <p>Lifetime plan: Up to 2 automated searches daily</p>
                        <p>Pro plan: Up to 5 automated searches daily</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-6 ${className}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Automated Job Search
                        </h2>
                        <p className="text-gray-300">
                            Schedule automatic job searches at your preferred times
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">
                            {cronJobs.length} / {maxCronJobs} slots used
                        </div>
                        <div className="text-sm text-cyan-400">
                            {userProfile.credits_remaining} credits remaining
                        </div>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            {success}
                        </div>
                    </motion.div>
                )}

                {/* Add New Cron Job */}
                {cronJobs.length < maxCronJobs && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Add New Schedule
                        </h3>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {getAvailableSlots().map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`px-4 py-2 rounded-lg border transition-all ${selectedTime === time
                                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                                            : 'border-white/20 text-gray-300 hover:border-white/40 hover:text-white'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        {selectedTime && (
                            <button
                                onClick={handleAddCronJob}
                                disabled={isAddingJob}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isAddingJob ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Schedule for {selectedTime}
                                    </>
                                )}
                            </button>
                        )}
                    </motion.div>
                )}

                {/* Current Cron Jobs */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Scheduled Jobs ({cronJobs.length})
                    </h3>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Loading cron jobs...</p>
                        </div>
                    ) : cronJobs.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400">No scheduled jobs yet</p>
                            <p className="text-gray-500 text-sm">Add a schedule above to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cronJobs.map((job) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-white">
                                                {job.cron_time}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Daily
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            <div>Runs: {job.run_count}</div>
                                            <div>Errors: {job.error_count}</div>
                                            {job.last_run && (
                                                <div>Last: {formatDate(job.last_run)}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${job.is_active ? 'bg-green-400' : 'bg-gray-400'
                                            }`} />
                                        <button
                                            onClick={() => handleDeleteCronJob(job.id)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                                            title="Delete cron job"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Executions */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Recent Executions
                    </h3>

                    {executions.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400">No executions yet</p>
                            <p className="text-gray-500 text-sm">Executions will appear here once your scheduled jobs run</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {executions.map((execution) => (
                                <motion.div
                                    key={execution.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                                >
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(execution.status)}
                                        <div>
                                            <div className="text-sm font-medium text-white">
                                                {getStatusText(execution.status)}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {formatDate(execution.execution_time)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-300">
                                        <div>Jobs found: {execution.jobs_found}</div>
                                        <div>Jobs added: {execution.jobs_added}</div>
                                        {execution.execution_duration_ms && (
                                            <div>Duration: {execution.execution_duration_ms}ms</div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">
                        How it works
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Jobs are automatically searched at your scheduled times</li>
                        <li>• Each execution consumes 1 credit from your daily allowance</li>
                        <li>• Credits reset daily at midnight UTC</li>
                        <li>• New jobs are automatically added to your dashboard</li>
                        <li>• Failed executions are logged and can be retried</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CronManager; 