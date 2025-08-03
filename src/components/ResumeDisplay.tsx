import React from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap,
    Award, Globe, Code, Calendar, Building, ExternalLink,
    Star, CheckCircle, ArrowRight
} from 'lucide-react';
import { ParsedResume, ResumeExperience, ResumeEducation, ResumeCertification, ResumeProject } from '../lib/resume-parser';

interface ResumeDisplayProps {
    parsedData: ParsedResume;
    className?: string;
}

export default function ResumeDisplay({ parsedData, className = '' }: ResumeDisplayProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Present';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
            });
        } catch {
            return dateString;
        }
    };

    const getDuration = (startDate: string, endDate?: string) => {
        if (!startDate) return '';
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
        const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

        if (diffYears > 0) {
            return `${diffYears} year${diffYears > 1 ? 's' : ''}${diffMonths > 0 ? ` ${diffMonths} month${diffMonths > 1 ? 's' : ''}` : ''}`;
        }
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    };

    return (
        <motion.div
            className={`bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl">
                        <User className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {parsedData.name || 'Resume Information'}
                        </h1>
                        {parsedData.summary && (
                            <p className="text-white/70 mt-2 max-w-2xl">
                                {parsedData.summary}
                            </p>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {parsedData.email && (
                        <div className="flex items-center gap-2 text-white/80">
                            <Mail className="w-4 h-4 text-cyan-400" />
                            <span>{parsedData.email}</span>
                        </div>
                    )}
                    {parsedData.phone && (
                        <div className="flex items-center gap-2 text-white/80">
                            <Phone className="w-4 h-4 text-cyan-400" />
                            <span>{parsedData.phone}</span>
                        </div>
                    )}
                    {parsedData.location && (
                        <div className="flex items-center gap-2 text-white/80">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            <span>{parsedData.location}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Experience */}
                    {parsedData.experience && parsedData.experience.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <Briefcase className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Work Experience</h2>
                            </div>
                            <div className="space-y-6">
                                {parsedData.experience.map((exp, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{exp.title}</h3>
                                                <p className="text-cyan-400 font-medium">{exp.company}</p>
                                                {exp.location && (
                                                    <p className="text-white/60 text-sm">{exp.location}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/80 text-sm">
                                                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate || '')}
                                                </p>
                                                <p className="text-white/60 text-xs">
                                                    {getDuration(exp.startDate, exp.endDate)}
                                                </p>
                                            </div>
                                        </div>
                                        {exp.description && exp.description.length > 0 && (
                                            <ul className="space-y-2">
                                                {exp.description.map((desc, descIndex) => (
                                                    <li key={descIndex} className="flex items-start gap-2 text-white/80">
                                                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                                        <span>{desc}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Projects */}
                    {parsedData.projects && parsedData.projects.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500/20 rounded-xl">
                                    <Code className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Projects</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parsedData.projects.map((project, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                                            {project.url && (
                                                <a
                                                    href={project.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-white/80 mb-3">{project.description}</p>
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {project.technologies.map((tech, techIndex) => (
                                                    <span
                                                        key={techIndex}
                                                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Skills */}
                    {parsedData.skills && parsedData.skills.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500/20 rounded-xl">
                                    <Star className="w-5 h-5 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {parsedData.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Education */}
                    {parsedData.education && parsedData.education.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-500/20 rounded-xl">
                                    <GraduationCap className="w-5 h-5 text-orange-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Education</h3>
                            </div>
                            <div className="space-y-4">
                                {parsedData.education.map((edu, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <h4 className="text-white font-semibold">{edu.degree}</h4>
                                        <p className="text-cyan-400 text-sm">{edu.institution}</p>
                                        {edu.location && (
                                            <p className="text-white/60 text-xs">{edu.location}</p>
                                        )}
                                        <p className="text-white/80 text-xs mt-1">
                                            {formatDate(edu.startDate)} - {formatDate(edu.endDate || '')}
                                        </p>
                                        {edu.gpa && (
                                            <p className="text-white/60 text-xs">GPA: {edu.gpa}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Certifications */}
                    {parsedData.certifications && parsedData.certifications.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-500/20 rounded-xl">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Certifications</h3>
                            </div>
                            <div className="space-y-3">
                                {parsedData.certifications.map((cert, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <h4 className="text-white font-semibold text-sm">{cert.name}</h4>
                                        <p className="text-cyan-400 text-xs">{cert.issuer}</p>
                                        {cert.date && (
                                            <p className="text-white/60 text-xs mt-1">
                                                {formatDate(cert.date)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Languages */}
                    {parsedData.languages && parsedData.languages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <Globe className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Languages</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {parsedData.languages.map((language, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
                                    >
                                        {language}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
} 