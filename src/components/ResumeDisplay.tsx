import React from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Linkedin, Globe,
    Briefcase, GraduationCap, Award, Code,
    Languages, Star, Heart, Calendar, Building,
    ExternalLink, Github, FileText, CheckCircle
} from 'lucide-react';
import { ParsedResume } from '../lib/resume-parser';

interface ResumeDisplayProps {
    parsedResume: ParsedResume;
    className?: string;
}

export default function ResumeDisplay({ parsedResume, className = '' }: ResumeDisplayProps) {
    const {
        name, email, phone, location, linkedin, portfolio,
        summary, skills, technologies, programming_languages, frameworks, tools,
        experience, education, projects, certifications, languages, achievements, interests
    } = parsedResume;

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    const getDuration = (startDate: string, endDate?: string, current?: boolean) => {
        if (current) return 'Present';
        if (!endDate) return formatDate(startDate);
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Parsed Resume Data</h2>
                        <p className="text-white/70">Extracted information from your resume</p>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-cyan-400" />
                            <div>
                                <p className="text-white/50 text-sm">Name</p>
                                <p className="text-white font-medium">{name || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-green-400" />
                            <div>
                                <p className="text-white/50 text-sm">Email</p>
                                <p className="text-white font-medium">{email || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-purple-400" />
                            <div>
                                <p className="text-white/50 text-sm">Phone</p>
                                <p className="text-white font-medium">{phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-orange-400" />
                            <div>
                                <p className="text-white/50 text-sm">Location</p>
                                <p className="text-white font-medium">{location || 'Not provided'}</p>
                            </div>
                        </div>
                        {linkedin && (
                            <div className="flex items-center gap-3">
                                <Linkedin className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-white/50 text-sm">LinkedIn</p>
                                    <a
                                        href={linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        View Profile <ExternalLink className="w-3 h-3 inline ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}
                        {portfolio && (
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-green-400" />
                                <div>
                                    <p className="text-white/50 text-sm">Portfolio</p>
                                    <a
                                        href={portfolio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-400 hover:text-green-300 transition-colors"
                                    >
                                        Visit Site <ExternalLink className="w-3 h-3 inline ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Professional Summary */}
                {summary && (
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Professional Summary</h3>
                        </div>
                        <p className="text-white/80 leading-relaxed">{summary}</p>
                    </div>
                )}
            </div>

            {/* Skills & Technologies */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Code className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Skills & Technologies</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skills && skills.length > 0 && (
                        <div>
                            <h4 className="text-white/70 font-medium mb-3">General Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {programming_languages && programming_languages.length > 0 && (
                        <div>
                            <h4 className="text-white/70 font-medium mb-3">Programming Languages</h4>
                            <div className="flex flex-wrap gap-2">
                                {programming_languages.map((lang, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                                    >
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {frameworks && frameworks.length > 0 && (
                        <div>
                            <h4 className="text-white/70 font-medium mb-3">Frameworks</h4>
                            <div className="flex flex-wrap gap-2">
                                {frameworks.map((framework, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                                    >
                                        {framework}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {tools && tools.length > 0 && (
                        <div>
                            <h4 className="text-white/70 font-medium mb-3">Tools & Platforms</h4>
                            <div className="flex flex-wrap gap-2">
                                {tools.map((tool, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs"
                                    >
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Work Experience */}
            {experience && experience.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Work Experience</h3>
                    </div>

                    <div className="space-y-6">
                        {experience.map((exp, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/5 border border-white/10 rounded-xl p-6"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-white font-semibold text-lg">{exp.position}</h4>
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Building className="w-4 h-4" />
                                            <span>{exp.company}</span>
                                        </div>
                                        {exp.location && (
                                            <div className="flex items-center gap-2 text-white/50 text-sm">
                                                <MapPin className="w-3 h-3" />
                                                <span>{exp.location}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-white/70 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>{getDuration(exp.start_date, exp.end_date, exp.current)}</span>
                                        </div>
                                        {exp.current && (
                                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {exp.description && exp.description.length > 0 && (
                                    <div className="mb-4">
                                        <ul className="space-y-2">
                                            {exp.description.map((desc, descIndex) => (
                                                <li key={descIndex} className="text-white/80 text-sm flex items-start gap-2">
                                                    <span className="text-blue-400 mt-1">•</span>
                                                    <span>{desc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {exp.technologies && exp.technologies.length > 0 && (
                                    <div>
                                        <h5 className="text-white/70 font-medium mb-2">Technologies Used</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {exp.technologies.map((tech, techIndex) => (
                                                <span
                                                    key={techIndex}
                                                    className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <GraduationCap className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Education</h3>
                    </div>

                    <div className="space-y-4">
                        {education.map((edu, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/5 border border-white/10 rounded-xl p-6"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-white font-semibold">{edu.degree}</h4>
                                        <p className="text-white/70">{edu.institution}</p>
                                        {edu.field_of_study && (
                                            <p className="text-white/50 text-sm">{edu.field_of_study}</p>
                                        )}
                                        {edu.gpa && (
                                            <p className="text-white/50 text-sm">GPA: {edu.gpa}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-white/70 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>{getDuration(edu.start_date, edu.end_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {edu.relevant_courses && edu.relevant_courses.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-white/70 font-medium mb-2">Relevant Courses</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {edu.relevant_courses.map((course, courseIndex) => (
                                                <span
                                                    key={courseIndex}
                                                    className="px-2 py-1 bg-green-500/10 text-green-300 rounded text-xs"
                                                >
                                                    {course}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Code className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Projects</h3>
                    </div>

                    <div className="space-y-4">
                        {projects.map((project, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/5 border border-white/10 rounded-xl p-6"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-white font-semibold">{project.name}</h4>
                                    <div className="flex gap-2">
                                        {project.github && (
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-white/50 hover:text-white transition-colors"
                                                title="View on GitHub"
                                            >
                                                <Github className="w-4 h-4" />
                                            </a>
                                        )}
                                        {project.url && (
                                            <a
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-white/50 hover:text-white transition-colors"
                                                title="View Live"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <p className="text-white/80 text-sm mb-4">{project.description}</p>

                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="mb-3">
                                        <h5 className="text-white/70 font-medium mb-2">Technologies</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies.map((tech, techIndex) => (
                                                <span
                                                    key={techIndex}
                                                    className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {project.highlights && project.highlights.length > 0 && (
                                    <div>
                                        <h5 className="text-white/70 font-medium mb-2">Key Features</h5>
                                        <ul className="space-y-1">
                                            {project.highlights.map((highlight, highlightIndex) => (
                                                <li key={highlightIndex} className="text-white/60 text-sm flex items-start gap-2">
                                                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                                    <span>{highlight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-white">Certifications</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certifications.map((cert, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/5 border border-white/10 rounded-xl p-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <h4 className="text-white font-semibold mb-2">{cert.name}</h4>
                                <p className="text-white/70 text-sm mb-2">{cert.issuer}</p>
                                <div className="flex items-center gap-2 text-white/50 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(cert.date)}</span>
                                    {cert.expiry_date && (
                                        <>
                                            <span>•</span>
                                            <span>Expires: {formatDate(cert.expiry_date)}</span>
                                        </>
                                    )}
                                </div>
                                {cert.url && (
                                    <a
                                        href={cert.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2"
                                    >
                                        Verify <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Languages */}
                {languages && languages.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Languages className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Languages</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {languages.map((language, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                                >
                                    {language}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                {achievements && achievements.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">Achievements</h3>
                        </div>
                        <ul className="space-y-2">
                            {achievements.map((achievement, index) => (
                                <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                                    <span className="text-yellow-400 mt-1">•</span>
                                    <span>{achievement}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Interests */}
                {interests && interests.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="w-5 h-5 text-red-400" />
                            <h3 className="text-lg font-semibold text-white">Interests</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {interests.map((interest, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Parsing Metadata */}
            <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-white/50 text-sm">
                    <span>Parsed on: {parsedResume.parsed_at ? formatDate(parsedResume.parsed_at) : 'Unknown'}</span>
                    {parsedResume.confidence_score && (
                        <span>Confidence: {(parsedResume.confidence_score * 100).toFixed(0)}%</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
} 